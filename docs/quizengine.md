# QuizEngine — Technical Deep Dive

> **Status**: Production-ready algorithm-powered quiz platform
> **Last Updated**: 2026-10-15

---

## Overview

QuizEngine is a **full-stack algorithm-powered quiz platform** featuring:
- **DAG-based topic progression** with prerequisite unlocking
- **Simple scoring** (Correct: +4, Wrong: 0, Timeout: 0)
- **Real-time leaderboards** (global + per-topic)
- **SVG graph visualization** with pan/zoom
- **Timed MCQ sessions** with per-question limits
- **Session persistence** via localStorage + MongoDB

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  features/quiz/                                                 │
│  ├── pages/                                                     │
│  │   ├── TopicsPage.jsx      # Topic browser (cards + graph)   │
│  │   ├── QuizPage.jsx        # Active quiz session (timed)      │
│  │   ├── ResultsPage.jsx     # Post-quiz breakdown + PDF export │
│  │   ├── HistoryPage.jsx     # Past attempts with stats         │
│  │   ├── LeaderboardPage.jsx # Global + topic rankings          │
│  │   ├── LoginPage.jsx       # Quiz-specific auth               │
│  │   └── RegisterPage.jsx                                                       │
│  ├── components/Graph/                                        │
│  │   ├── TopicGraph.jsx      # SVG pan/zoom DAG visualization  │
│  │   └── TopicCard.jsx       # Topic card with status pills     │
│  ├── utils/                                                    │
│  │   ├── api.js              # Axios instance (auto-auth)      │
│  │   ├── algorithms.js       # Client-side scoring, shuffle    │
│  │   └── topicIcons.jsx      # Lucide icon mapping             │
│  └── styles/                                                   │
│      ├── quizEngine.css      # Main quiz styles                 │
│      └── global.css          # Quiz-specific theme vars        │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTPS (JWT Bearer)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (Express)                        │
│  ├── routes/quiz.js           # /api/quiz/start, /submit, /history│
│  ├── controllers/quizController.js                                │
│  │   ├── startQuiz()         # Prereq check + random pick       │
│  │   ├── submitQuiz()        # Grading + ScoreEngine + persist  │
│  │   └── getHistory()        # User's last 20 attempts          │
│  ├── models/                                                            │
│  │   ├── Topic.js            # Prerequisites, position, color   │
│  │   ├── Question.js         # MCQ with difficulty, timeLimit   │
│  │   ├── QuizAttempt.js      # Full history with per-answer data│
│  │   └── User.js             # progress Map<topicId, {...}>     │
│  └── algorithms/                                                        │
│      ├── graph.js            # topologicalSort, isTopicUnlocked │
│      ├── scoring.js          # ScoreEngine (+4/-1/0, streaks)   │
│      ├── shuffle.js          # Fisher-Yates, pickRandom         │
│      └── sorting.js          # sortQuestionsByDifficulty        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### Topic (`backend/models/Topic.js`)
```javascript
{
  name: String,           // unique, required
  description: String,
  icon: String,           // emoji default "📚"
  color: String,          // default "#6366f1"
  prerequisites: [ObjectId],  // ref: Topic (DAG edges)
  position: { x, y },     // for graph layout
  passingScore: Number,   // default 60
  order: Number           // fallback sort
}
```

### Question (`backend/models/Question.js`)
```javascript
{
  topicId: ObjectId,      // ref: Topic
  text: String,
  options: [String],      // 2-5 options
  correctAnswer: Number,  // 0-4 index
  difficulty: "easy"|"medium"|"hard",
  explanation: String,
  tags: [String],
  timeLimitSeconds: Number  // default 30
}
```

### QuizAttempt (`backend/models/QuizAttempt.js`)
```javascript
{
  userId: ObjectId,
  topicId: ObjectId,
  score: Number,
  maxPossibleScore: Number,
  percentage: Number,
  passed: Boolean,
  timeTakenSeconds: Number,
  answers: [{
    questionId: ObjectId,
    selectedOption: Number,
    isCorrect: Boolean,
    timeTakenSeconds: Number,
    scoreChange: Number   // +4, -1, 0, or +bonus
  }],
  streakBonus: Number
}
```

### User Progress (embedded in `User.js`)
```javascript
progress: Map<topicId, {
  completed: Boolean,
  bestScore: Number,
  attempts: Number
}>
totalScore: Number  // cumulative across all quizzes
```

---

## Core Algorithms

### 1. Topological Sort (Kahn's Algorithm) — `backend/algorithms/graph.js`

```javascript
function topologicalSort(topics) {
  // Build adjacency list from prerequisites
  const adj = buildAdjacencyList(topics)
  const inDegree = new Map()
  topics.forEach(t => inDegree.set(t._id, t.prerequisites.length))
  
  // Queue nodes with 0 in-degree
  const queue = [...inDegree.entries()].filter(([_, d]) => d === 0).map(([id]) => id)
  
  while (queue.length) {
    const current = queue.shift()
    sorted.push(current)
    adj.get(current).forEach(neighbor => {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1)
      if (inDegree.get(neighbor) === 0) queue.push(neighbor)
    })
  }
  
  if (sorted.length < topics.length) 
    console.warn("⚠️ Cycle detected in topic graph")
  return sorted
}
```

**Used in**: `topicController.getTopics()` → returns ordered topics with unlock status

### 2. Prerequisite Unlock Check — `backend/algorithms/graph.js`

```javascript
function isTopicUnlocked(topicId, prereqIds, userProgress) {
  if (!prereqIds || prereqIds.length === 0) return true
  return prereqIds.every(pid => {
    const progress = userProgress.get(pid.toString())
    return progress?.completed === true
  })
}
```

**Used in**: 
- `quizController.startQuiz()` — blocks quiz start if locked
- `topicController.getTopics()` — annotates each topic with `unlocked` boolean

### 3. Fisher-Yates Shuffle — `backend/algorithms/shuffle.js`

```javascript
function fisherYatesShuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function pickRandom(array, count) {
  return fisherYatesShuffle(array).slice(0, Math.min(count, array.length))
}
```

**Used in**: `quizController.startQuiz()` — selects random questions per session

### 4. Scoring Engine — `backend/algorithms/scoring.js`

```javascript
const POINTS = { CORRECT: 4, WRONG: 0, TIMEOUT: 0 }

class ScoreEngine {
  constructor() { this.totalScore = 0; this.history = [] }
  
  recordAnswer(result, questionId) {
    let change = POINTS.TIMEOUT
    if (result === "correct") change = POINTS.CORRECT
    else if (result === "wrong") change = POINTS.WRONG
    
    // No negative scoring - floor at 0
    this.totalScore = Math.max(0, this.totalScore + change)
    this.history.push({ questionId, result, scoreChange: change, totalScore: this.totalScore })
    return this.history[this.history.length - 1]
  }
  
  getSummary(totalQuestions) {
    const correctCount = this.history.filter(h => h.result === "correct").length
    return {
      totalScore: this.totalScore,
      maxPossibleScore: totalQuestions * POINTS.CORRECT,
      percentage: Math.round((correctCount / totalQuestions) * 100),
      correctCount,
      wrongCount: this.history.filter(h => h.result === "wrong").length,
      timeoutCount: this.history.filter(h => h.result === "timeout").length,
      history: this.history
    }
  }
}
```

### 5. Difficulty Sorting — `backend/algorithms/sorting.js`

```javascript
const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 }

function sortQuestionsByDifficulty(questions) {
  return [...questions].sort((a, b) => {
    const diff = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]
    if (diff !== 0) return diff
    return new Date(a.createdAt) - new Date(b.createdAt)
  })
}
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/quiz/start` | ✅ | Start quiz session |
| `POST` | `/api/quiz/submit` | ✅ | Submit answers, get results |
| `GET` | `/api/quiz/history` | ✅ | Last 20 attempts |
| `GET` | `/api/topics` | ✅ | All topics (ordered + unlock status) |
| `GET` | `/api/topics/:id` | ✅ | Single topic with prerequisites |
| `GET` | `/api/leaderboard` | ✅ | Global leaderboard (top 20) |
| `GET` | `/api/leaderboard/:topicId` | ✅ | Topic-specific leaderboard |

---

## Request/Response Examples

### Start Quiz
```bash
POST /api/quiz/start
Authorization: Bearer <jwt>
Content-Type: application/json

{ "topicId": "64a...", "count": 10, "sortByDifficulty": false }
```

```json
// Response
{
  "topic": { "id": "64a...", "name": "JavaScript Basics", "icon": "📚" },
  "questions": [
    {
      "_id": "64b...",
      "text": "What is closure?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 2,
      "difficulty": "medium",
      "explanation": "A closure is...",
      "timeLimitSeconds": 30
    }
  ],
  "totalQuestions": 10,
  "sessionId": "userId_topicId_timestamp"
}
```

### Submit Quiz
```bash
POST /api/quiz/submit
Authorization: Bearer <jwt>

{
  "topicId": "64a...",
  "answers": [
    { "questionId": "64b...", "selectedOption": 2, "timedOut": false, "timeTakenSeconds": 12 }
  ],
  "timeTakenSeconds": 185
}
```

```json
// Response
{
  "attemptId": "64c...",
  "score": 32,
  "maxPossibleScore": 40,
  "percentage": 80,
  "passed": true,
  "correctCount": 8,
  "wrongCount": 2,
  "history": [
    {
      "questionId": "64b...",
      "result": "correct",
      "scoreChange": 4,
      "totalScore": 4,
      "correctAnswer": 2,
      "explanation": "A closure is...",
      "questionText": "What is closure?"
    }
  ],
  "newTotalScore": 1247
}
```

---

## Frontend State Machines

### QuizPage Phases (`features/quiz/pages/QuizPage.jsx`)

```
┌──────────────┐
│   loading    │ → fetch /api/quiz/start
└──────┬───────┘
       │ success
       ▼
┌──────────────┐
│    ready     │ → Show topic card, "Start Quiz" button
└──────┬───────┘
       │ click
       ▼
┌──────────────┐     ┌──────────────┐
│   question   │ ──► │   revealed   │ (after answer or timeout)
│  (timer on)  │     │  (show ans)  │
└──────┬───────┘     └──────┬───────┘
       │                    │ "Next"
       │ timeout            ▼
       │             ┌──────────────┐
       └────────────►│  question+1  │ (or submit if last)
                     └──────────────┘
                              │
                              │ last question
                              ▼
                     ┌──────────────┐
                     │  submitting  │ → POST /api/quiz/submit
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   results    │ → navigate to /quizzes/results
                     └──────────────┘
```

### Timer Logic
- Per-question `timeLimitSeconds` (default 30, from question doc)
- `setInterval` decrements `timeLeft` every second
- On `timeLeft <= 1`: auto-submit as timeout
- Timer pauses during `revealed` phase

---

## Graph Visualization (TopicGraph)

**File**: `features/quiz/components/Graph/TopicGraph.jsx`

### Features
- **SVG-based** with `viewBox` for crisp scaling
- **Pan**: mouse drag / single-finger touch
- **Zoom**: mouse wheel / pinch gesture (0.3x – 3x)
- **Edges**: Curved paths with arrow markers
- **Nodes**: Color-coded by topic, status-indicated borders

### Layout Algorithm
```javascript
// Normalize positions to positive quadrant
const rawMinX = Math.min(...topics.map(t => t.position.x))
const rawMinY = Math.min(...topics.map(t => t.position.y))
const layoutTopics = topics.map(t => ({
  ...t,
  position: {
    x: (t.position.x - rawMinX) * 1.2 + 50,
    y: (t.position.y - rawMinY) * 0.55 + 35
  }
}))

// Edge routing: straight or orthogonal with midpoint
const getEdgePath = (from, to) => {
  const leftToRight = toCenterX >= fromCenterX
  const x1 = leftToRight ? fromRight + 10 : fromLeft - 10
  const x2 = leftToRight ? toLeft - 14 : toRight + 14
  if (Math.abs(y1 - y2) < 8) return `M ${x1} ${y1} L ${x2} ${y2}`
  const midX = x1 + (x2 - x1) / 2
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
}
```

### Visual States
| Class | Condition | Style |
|-------|-----------|-------|
| `.is-unlocked` | All prereqs met | Full opacity, blue stroke |
| `.is-locked` | Prereqs incomplete | 0.58 opacity, muted |
| `.is-complete` | User completed | Green stroke |
| `:hover` | Interactive | Glow filter, brighter stroke |

---

## Leaderboard Algorithm

**Global** (`leaderboardController.getGlobalLeaderboard`):
```javascript
// Sort by totalScore desc, then name asc
const sorted = users.sort((a, b) => 
  b.totalScore - a.totalScore || a.name.localeCompare(b.name)
).slice(0, limit)
```

**Per-Topic** (`leaderboardController.getTopicLeaderboard`):
```javascript
// Aggregate best attempt per user for topic
QuizAttempt.aggregate([
  { $match: { topicId: ObjectId(topicId) } },
  { $sort: { score: -1 } },
  { $group: {
      _id: "$userId",
      bestScore: { $max: "$score" },
      attempts: { $sum: 1 },
      bestPercentage: { $max: "$percentage" }
  }},
  { $sort: { bestScore: -1 } },
  { $limit: limit },
  { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" }},
  { $unwind: "$user" },
  { $project: { name: "$user.name", score: "$bestScore", ... }}
])
```

---

## Seeding Data (`backend/data/seed.js`)

```javascript
const topicData = [
  { name: "Big Data",            color: "#06b6d4", order: 0, prerequisites: [] },
  { name: "Cyber Security",      color: "#ef4444", order: 1, prerequisites: [] },
  { name: "HTML Fundamentals",   color: "#e34c26", order: 2, prerequisites: [] },
  { name: "CSS Styling",         color: "#264de4", order: 3, prerequisites: [] },
  { name: "JavaScript Basics",   color: "#f7df1e", order: 4, prerequisites: [] },
  { name: "React",               color: "#61dafb", order: 5, prerequisites: [] },
  { name: "Java Programming",    color: "#f97316", order: 6, prerequisites: [] },
  { name: "DAA (Algorithms)",    color: "#22c55e", order: 7, prerequisites: [] },
  { name: "Mobile App Development", color: "#8b5cf6", order: 8, prerequisites: [] },
  { name: "Blockchain",          color: "#a855f7", order: 9, prerequisites: [] }
]
```

Questions loaded from JSON files in `backend/data/questions/`:
- `html.json`, `css.json`, `js.json`, `react.json`
- `java.json`, `daa.json`, `mad.json`
- `blockchain.json`, `bigdata.json`, `cybersecurity.json`

Each question mapped to topic via `topicId` after topic creation.

---

## Client-Side Scoring (Optimistic UI)

**File**: `features/quiz/utils/algorithms.js`

```javascript
export class ScoreEngine {
  constructor() {
    this.totalScore = 0;
    this.history = [];
  }

  record(isCorrect, timedOut = false) {
    let change = 0;

    if (timedOut) {
      change = 0;
    } else if (isCorrect) {
      change = 4;
    } else {
      // Wrong answer: 0 points (no negative scoring)
      change = 0;
    }

    this.totalScore = Math.max(0, this.totalScore + change);

    const record = {
      isCorrect,
      timedOut,
      scoreChange: change,
      totalScore: this.totalScore,
    };

    this.history.push(record);
    return record;
  }

  getState() {
    return {
      totalScore: this.totalScore,
      history: this.history,
    };
  }
}
```

> ✅ **Consistent**: Both client and server now use `+4/0/0` with no negative scoring and no streaks.

---

## Quiz-Specific Theme (`features/quiz/styles/global.css`)

```css
:root {
  --bg: #0a0a0f;
  --bg-2: #13131a;
  --bg-3: #1c1c28;
  --accent: #7c5cfc;        /* Purple (vs main app's blue #4a90e2) */
  --accent-2: #a78bfa;
  --accent-glow: rgba(124,92,252,0.25);
  --font-display: 'Syne', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}
```

Distinct from main app — QuizEngine has its own purple accent color.

---

## Duplicate Quiz UI

The quiz feature has **its own isolated UI set** under `features/quiz/`:
- `LoginPage.jsx` / `RegisterPage.jsx` — separate from main `src/pages/`
- `Navbar.jsx` — quiz-only nav (Topics, Leaderboard, History, score display)
- `HomePage.jsx` — quiz landing page

Main app routes (`/login`, `/register`) redirect to `/` if authenticated; quiz routes use their own auth pages at `/quizzes` → quiz login.

---

## Performance Optimizations

1. **Lazy Routes** — All quiz pages loaded via `React.lazy()` in `App.jsx`
2. **PDF Vendor Chunk** — `html2pdf`, `html2canvas`, `jspdf` split to separate chunk (loaded only on ResultsPage)
3. **Question Lean Queries** — `.lean()` on MongoDB queries for read-only data
4. **Indexes** — `QuizAttempt` indexed on `{ topicId: 1, score: -1 }` and `{ userId: 1, createdAt: -1 }`
5. **Question Sampling** — `pickRandom()` avoids fetching all questions for large banks

---

## Extending QuizEngine

### Add New Topic
```bash
# Option 1: Via API (admin)
POST /api/topics
{ "name": "TypeScript", "color": "#3178c6", "prerequisites": ["64a..."], "passingScore": 70 }

# Option 2: Add to seed.js and re-run
npm run seed:quiz
```

### Add Questions
```bash
# Bulk insert (admin)
POST /api/questions/bulk
{ "questions": [{ "topicId": "...", "text": "...", "options": [...], "correctAnswer": 0, "difficulty": "medium" }] }
```

### Customize Scoring
Modify `backend/algorithms/scoring.js`:
```javascript
const POINTS = { CORRECT: 10, WRONG: -2, TIMEOUT: 0 }  // Change values
# Add time-based bonuses, difficulty multipliers, etc.
```

### Add New Difficulty
1. Update `Question.js` enum: `enum: ["easy", "medium", "hard", "expert"]`
2. Add to `DIFFICULTY_ORDER` in `sorting.js`
3. Add color in `global.css`: `--expert: #ff0066;`
4. Update frontend `DIFFICULTY_COLORS` in `algorithms.js`

---

## Testing Checklist

- [ ] Prerequisite chain: A → B → C (complete A, unlock B, complete B, unlock C)
- [ ] Cycle detection: A→B, B→A shows warning in console
- [ ] Quiz start blocked when prereqs incomplete (403)
- [ ] Random question selection: no duplicates in session
- [ ] Timer auto-submits on timeout
- [ ] **Scoring: Correct = +4, Wrong = 0, Timeout = 0**
- [ ] **No negative scoring (score never decreases)**
- [ ] **No streak bonuses**
- [ ] Score persists to User.totalScore and progress Map
- [ ] Leaderboard updates after quiz submit
- [ ] History shows last 20 attempts with correct stats
- [ ] Graph pan/zoom works on desktop + mobile
- [ ] Results page shows per-question breakdown with explanations

---

## Key Files Quick Reference

| Purpose | File |
|---------|------|
| Quiz session start | `backend/controllers/quizController.js:10` |
| Quiz submit & grading | `backend/controllers/quizController.js:47` |
| Topic unlock logic | `backend/algorithms/graph.js:1` |
| Scoring engine | `backend/algorithms/scoring.js:1` |
| Question shuffle | `backend/algorithms/shuffle.js:1` |
| Topic ordering | `backend/algorithms/sorting.js:1` |
| Frontend quiz flow | `frontend/features/quiz/pages/QuizPage.jsx` |
| Topic graph (SVG) | `frontend/features/quiz/components/Graph/TopicGraph.jsx` |
| Topic cards | `frontend/features/quiz/components/Graph/TopicCard.jsx` |
| Client scoring preview | `frontend/features/quiz/utils/algorithms.js` |
| Quiz styles | `frontend/features/quiz/styles/quizEngine.css` |
| Quiz theme | `frontend/features/quiz/styles/global.css` |
| Seed data | `backend/data/seed.js` |

---

## Current Work Focus

We are now working on QuizEngine. Key areas for enhancement:

1. **Adaptive difficulty** — Adjust question difficulty based on user performance
2. **Spaced repetition** — Schedule review questions based on forgetting curve
3. **Question analytics** — Track question discrimination index, difficulty calibration
4. **Multiplayer/Challenge mode** — Real-time quiz battles via WebSockets
5. **AI-generated explanations** — Integrate LLM for dynamic explanations
6. **Export/Import** — Quiz packs as portable JSON for sharing

---

*This document serves as the single source of truth for QuizEngine architecture. Update it when making structural changes.*
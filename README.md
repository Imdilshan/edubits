# Edubits

A student-built workspace for making engineering feel less confusing. Edubits provides tools for grades, internals, resources, tasks, viva prep, and reflecting on the engineering journey.

---

## 📁 Project Structure

```
edubits/
├── backend/                     # Express 5 + Mongoose 9 (CommonJS)
│   ├── server.js               # Entry point - Express setup, CORS, rate limiting, routes
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   ├── cloudinary.js       # Cloudinary configuration
│   │   └── passport.js         # Google OAuth strategy
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   ├── upload.js           # Cloudinary multer storage (multi-type)
│   │   ├── avatarUpload.js     # Local disk storage for avatars
│   │   └── uploadMiddleware.js # Legacy PYQ upload middleware
│   ├── models/                 # Mongoose models
│   │   ├── User.js             # User with progress Map, totalScore, role
│   │   ├── Topic.js            # Quiz topics with prerequisites, position, color
│   │   ├── Question.js         # MCQ questions with difficulty, timeLimit
│   │   ├── QuizAttempt.js      # Quiz history with scoring details
│   │   ├── Task.js             # Kanban tasks
│   │   ├── Resource.js         # Cloudinary resources (PYQs, notes, etc.)
│   │   ├── Pyq.js              # Re-exports Resource
│   │   └── UserPYQProgress.js  # Local PYQ progress tracking
│   ├── controllers/            # REST controllers
│   │   ├── authController.js   # Register, login, profile, avatar
│   │   ├── quizController.js   # Quiz start/submit/history with scoring
│   │   ├── questionController.js # CRUD + bulk for questions
│   │   ├── topicController.js  # Topics with topological sort & unlock logic
│   │   ├── taskController.js   # Task CRUD with filters/pagination
│   │   ├── resourceController.js # Resource upload/list/delete (Cloudinary)
│   │   └── leaderboardController.js # Global & topic leaderboards
│   ├── routes/                 # Express routers
│   │   ├── authRoutes.js       # /api/auth + Google OAuth callback
│   │   ├── quiz.js             # /api/quiz
│   │   ├── questions.js        # /api/questions (admin)
│   │   ├── topics.js           # /api/topics
│   │   ├── taskRoutes.js       # /api/tasks
│   │   ├── resourceRoutes.js   # /api/resources
│   │   ├── pyqRoutes.js        # /api/pyqs (Resource type=pyqs)
│   │   └── leaderboard.js      # /api/leaderboard
│   ├── algorithms/             # Pure algorithm modules
│   │   ├── shuffle.js          # Fisher-Yates, pickRandom
│   │   ├── sorting.js          # Difficulty sort, leaderboard sort, dynamic sort
│   │   ├── graph.js            # Topological sort, prerequisite unlock check
│   │   └── scoring.js          # ScoreEngine class (+4/-1/0 scoring)
│   ├── features/programming/   # Self-contained programming module
│   │   ├── models/
│   │   │   ├── ProgrammingTopic.js    # Hierarchical topics (parentTopic)
│   │   │   ├── ProgrammingProblem.js  # Problems with fixCode/proCode (Java/C++)
│   │   │   └── ProgrammingProgress.js # User progress (todo/in-progress/done + starred)
│   │   ├── controllers/programmingController.js
│   │   └── routes/programmingRoutes.js
│   ├── data/
│   │   ├── seed.js             # Seeds topics, questions, admin user
│   │   └── questions/          # JSON question banks per topic
│   └── scripts/migratePyqs.js
│
├── frontend/                    # React 18 + Vite 8 (ESM)
│   ├── src/
│   │   ├── main.jsx            # Providers: AuthContext, ToastContext, BrowserRouter
│   │   ├── app/
│   │   │   ├── App.jsx         # Lazy-loaded routes, auth-gated layout
│   │   │   ├── routes.jsx      # Empty stub (intentional)
│   │   │   └── VercelMetrics.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # Token/user in localStorage, auto-refresh /api/auth/me
│   │   │   └── ToastContext.jsx # Toast notifications
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx  # Desktop + mobile nav, avatar upload, profile modal
│   │   │   │   └── EditProfileModal.jsx
│   │   │   ├── ui/             # Button, Input, Card (CSS Modules)
│   │   │   ├── calculator/     # Row, Semester (shared)
│   │   │   ├── upload/ResourceUploader.jsx
│   │   │   └── ToolPreview.jsx
│   │   ├── features/
│   │   │   ├── homepage/HomePage.jsx      # Landing with tool cards
│   │   │   ├── quiz/                      # QuizEngine feature
│   │   │   │   ├── pages/                 # TopicsPage, QuizPage, ResultsPage, HistoryPage, LeaderboardPage
│   │   │   │   ├── components/Graph/      # TopicGraph (SVG pan/zoom), TopicCard
│   │   │   │   └── utils/                 # api.js (axios), algorithms.js, topicIcons.jsx
│   │   │   ├── programming/               # Programming roadmap + problems
│   │   │   │   ├── pages/                 # ProgrammingPage, TopicProblemsPage, ProgrammingAdmin
│   │   │   │   ├── components/            # ProgrammingGraph, ProblemModal, SolutionModal
│   │   │   │   └── services/programmingService.js
│   │   │   ├── ug-life-tracker/           # Semester calendar tracker (localStorage)
│   │   │   │   ├── UGLifeTrackerPage.jsx
│   │   │   │   ├── hooks/useTrackerState.js
│   │   │   │   ├── storage/trackerStorage.js
│   │   │   │   ├── utils/ (calendarBuilder, statsUtils, dateUtils, constants)
│   │   │   │   └── components/ (11 components)
│   │   │   ├── tasks/                     # Kanban task tracker (backend)
│   │   │   │   ├── pages/TaskPage.jsx
│   │   │   │   ├── components/ (TaskColumn, TaskModal, Stats, Filters, TaskCard)
│   │   │   │   ├── services/taskService.js
│   │   │   │   └── hooks/useTasks.js
│   │   │   ├── sgpa/                      # SGPA + CGPA calculator (localStorage)
│   │   │   ├── internalMarks/             # Internal marks calculator
│   │   │   ├── pyqs/                      # PYQs + Playlists browser (localStorage progress)
│   │   │   ├── cgpa/                      # CGPA component
│   │   │   └── about/                     # AboutPage
│   │   ├── pages/                         # Top-level pages (Login, Register, AuthCallback, AdminUpload)
│   │   ├── services/resourceService.js    # Axios wrapper for resource uploads
│   │   ├── utils/                         # analytics, marksUtils, helpers
│   │   └── styles/
│   │       ├── variables.css              # CSS custom properties (dark/light themes)
│   │       ├── global.css                 # Base styles, utilities
│   │       ├── quizEngine.css             # Quiz-specific styles
│   │       ├── programming.css
│   │       ├── taskTracker.css
│   │       ├── internalMarks.css
│   │       ├── ugLifeTracker.css
│   │       ├── pyqs.css
│   │       ├── calculator-base.css
│   │       └── homepage.css
│   ├── vite.config.js            # Manual chunks: pdf-vendor, icons-vendor, react-vendor, vercel-vendor
│   ├── vercel.json               # SPA rewrite + caching headers
│   ├── .env.example              # VITE_API_URL
│   └── package.json
```

---

## 🚀 Features

| Feature | Description | Storage |
|---------|-------------|---------|
| **QuizEngine** | Topic-graph based MCQ quiz with prerequisite unlocking, timer, scoring, history, leaderboards | MongoDB |
| **Programming Roadmap** | Hierarchical topic graph (SVG pan/zoom) → problem table with Monaco editor modals (fixCode/proCode) | MongoDB |
| **SGPA + CGPA Calculator** | Semester-wise grade calculator with PDF export | localStorage |
| **Internal Marks Calculator** | Theory, Hybrid, Practical, Aptitude, Soft Skill calculators per year | localStorage |
| **Task Tracker** | Kanban board (Todo/In Progress/Done) with filters, priorities, deadlines | MongoDB |
| **UG Life Tracker** | Visual semester calendar with scores, notes, reflections, date overrides | localStorage (TODO: MongoDB) |
| **PYQs & Playlists** | Hierarchical browser (Year → Subject → Paper) with Drive embeds, progress tracking, notes | localStorage + Cloudinary |
| **Resources** | Admin upload (PDF/images) to Cloudinary, public listing with filters | Cloudinary + MongoDB |
| **Auth** | Email/password + Google OAuth, JWT (7d), avatar upload | MongoDB |

---

## ⚙️ Tech Stack

**Backend**
- Express 5, Mongoose 9
- MongoDB (Atlas/local)
- Cloudinary (file storage)
- Passport.js (Google OAuth)
- bcryptjs, jsonwebtoken
- express-rate-limit, cors

**Frontend**
- React 18, Vite 8
- React Router 7 (lazy routes)
- Axios (API client)
- Lucide React, React Icons
- Monaco Editor (@monaco-editor/react)
- html2pdf.js, html2canvas, jsPDF (PDF export)
- date-fns, react-select
- Vercel Analytics & Speed Insights

**DevOps**
- Vercel (frontend)
- Render/Railway (backend)
- GitHub Actions ready

---

## 🔧 Environment Variables

### Backend (`backend/.env`)
```env
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/Edubits
# Generate with: openssl rand -base64 32
JWT_SECRET=REPLACE_WITH_GENERATED_RANDOM_SECRET
FRONTEND_URL=http://localhost:5173
PORT=5001
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BACKEND_URL=https://your-backend-url.com
# Optional, only to create the initial admin with `npm run seed:quiz`
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=use-a-unique-random-password-at-least-12-characters
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5001/api
```

For the Vercel deployment, set `BACKEND_URL` as a project environment
variable. Production frontend code automatically uses the same-origin `/api`
proxy, and Vercel forwards those requests to this backend:

```env
BACKEND_URL=https://your-backend-host
```

Set the backend's `FRONTEND_URL` to the deployed frontend origin. In production,
OAuth callbacks default to this origin; `OAUTH_CALLBACK_BASE_URL` can override
it if needed. Register these callback URLs with Google and GitHub, replacing
the origin with your deployed frontend URL:
`https://your-frontend-domain/api/auth/google/callback` and
`https://your-frontend-domain/api/auth/github/callback`. The backend's
`FRONTEND_URL` should use that same frontend origin.

> Copy `.env.example` → `.env` in both folders. Both are gitignored — **never commit secrets**.

> **Credential rotation:** the quiz seed previously included a default admin credential in source control. Treat it as compromised: rotate or disable any account created with that older seed, and rotate any real secrets that were ever committed. Git history can retain removed values.

---

## ▶️ Commands

### Backend
```bash
cd backend
npm run dev      # Nodemon dev server (port 5001)
npm start        # Production server
npm run seed:quiz # Seed topics/questions; optionally bootstrap an admin using SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD
```

### Frontend
```bash
cd frontend
npm run dev      # Vite dev server (port 5173)
npm run build    # Production build (outputs to dist/)
npm run lint     # ESLint (run before committing)
npm run preview  # Preview production build
```

---

## 🔐 Authentication Flow

1. **Register/Login** → `/api/auth/register` or `/api/auth/login` → returns JWT + user object
2. **Token stored** in `localStorage` (key: `token`)
3. **Axios interceptor** attaches `Authorization: Bearer <token>` to all requests
4. **Auth middleware** verifies JWT, attaches `req.user` (excludes password)
5. **401 response** → clears localStorage, redirects to `/login`
6. **Google OAuth** → `/api/auth/google` → callback → redirects to `/auth/callback` with token in URL params

---

## 📊 Quiz Scoring Algorithm

```
Correct answer:  +4 points
Wrong answer:    0 point
Timeout:          0 points
Score floor:      0 (never negative)

Streak Bonuses:
  Every 3 correct:  +2 bonus
  Every 5 correct:  +5 bonus
```

Percentage = `(correctCount / totalQuestions) * 100`
Pass threshold = Topic's `passingScore` (default 60%)

---

## 🔓 Topic Unlocking Logic

- Topics form a **DAG** via `prerequisites` array
- **Topological sort** (Kahn's algorithm) determines display order
- A topic is **unlocked** when ALL prerequisites have `progress.completed === true`
- User progress stored as `Map<topicId, { completed, bestScore, attempts }>` on User document

---

## ☁️ File Upload System

Two parallel systems exist — check which middleware a route uses:

| Middleware | Location | Storage | Use Case |
|------------|----------|---------|----------|
| `upload.js` | `middleware/upload.js` | Cloudinary | Resources, PYQs, notes, images, thumbnails |
| `avatarUpload.js` | `middleware/avatarUpload.js` | Local disk (`uploads/avatars/`) | User avatars |
| `uploadMiddleware.js` | `middleware/uploadMiddleware.js` | Cloudinary (legacy) | Legacy PYQ uploads |

**Cloudinary folders**: `edubits/pdfs`, `edubits/images`, `edubits/thumbnails`, `edubits/notes`, `edubits/pyqs`, `edubits/resources`, `edubits/avatars`

---

## 🎨 Theming

CSS custom properties in `src/styles/variables.css`:

```css
:root { /* Dark (default) */ }
body.light { /* Light mode */ }
```

Colors: `--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--muted`, `--primary`, `--accent`, `--success`, `--danger`, `--warning`, `--radius`

---

## 📦 Build Optimization (Vite)

`vite.config.js` manual chunks:
- `pdf-vendor` — html2pdf, html2canvas, jspdf (lazy-loaded)
- `icons-vendor` — lucide-react, react-icons
- `react-vendor` — react, react-dom, react-router-dom
- `vercel-vendor` — @vercel/analytics, @vercel/speed-insights

Keep heavy imports behind lazy routes (`React.lazy`).

---

## 🌐 Deployment

### Frontend (Vercel)
- `vercel.json` has SPA rewrite: all paths → `/`
- Cache headers for `/assets/*` (1yr), `/images/*` (1wk)
- Set `VITE_API_URL` to production backend URL

### Backend (Render/Railway/any Node host)
- Needs MongoDB reachable at boot (`connectDB()` runs immediately)
- Health check: `GET /health` → `{ status: "ok", ts: Date.now() }` (for UptimeRobot)
- CORS allows `localhost:5173` + all `*.vercel.app` origins
- Rate limit: 150 req / 15 min / IP

---

## 🧪 Testing

No test suite exists. Run `npm run lint` in `frontend/` before committing.

---

## 📝 Known Gotchas

1. **Duplicate Quiz UI** — Quiz feature has its own Login/Register/Navbar under `features/quiz/`; main ones in `src/pages/` and `src/components/layout/`
2. **Three upload middlewares** — Check which a route uses before changing upload code
3. **CORS allows all `*.vercel.app`** — Changing `FRONTEND_URL` alone won't restrict preview deploys
4. **`frontend/dist/` is gitignored** — Don't hand-edit build artifacts
5. **Quiz PDF deps** split into `pdf-vendor` chunk — Keep behind lazy routes
6. **Vercel SPA rewrite** in `vercel.json` — Keep when adding routes
7. **UG Life Tracker** persists to localStorage only — TODO: move to MongoDB
8. **`src/app/routes.jsx` is an intentional empty stub** — Routing defined in `App.jsx`

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Run `npm run lint` (frontend) before committing
4. Open a PR with clear description

---

## 📄 License

ISC — See `backend/package.json`

---

## 🙏 Acknowledgments

Built by a student, for students. Every tool exists because I needed it first.

> "First make it work. Then improve it."

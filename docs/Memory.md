# Edubits v2.0 — Memory

Running record of what is done and what is in progress. At the end of each session Claude proposes an update; the owner approves it before it is written.

## Current status

- **Phase:** Phase 6 — SGPA/CGPA and Internal Marks (completed)
- **Phase 7:** Task Tracker (skipped for now, will revisit in next iteration)
- **Next:** Resume Phase 7 or start new feature work
- **2026-10-21 audit + fix session:** ran lint (48 errors → 35), booted the backend and smoke-tested it, restored missing Internal Marks components, fixed hook-order crashes (`PdfViewer`, `TopicsPage`), OAuth verify callback, password-hash leak, avatar storage, CORS/trust-proxy. Open items are in `docs/ERRORS.md` → TODO. Frontend build still needs a local `npm run build`.

## Checklist

**Docs**
- [x] PRD.md
- [x] feature.md
- [x] rules.md
- [x] phases.md
- [x] memory.md
- [x] design.md

**Build**
- [x] Phase 0 — Setup and viewer spike
  - [x] Branch `v2` created
  - [x] react-pdf installed (v9 for React 18 compatibility)
  - [x] Viewer spike page created at `/viewer-spike` with react-pdf viewer
  - [x] Cloudinary "Allow delivery of PDF and ZIP files" enabled in Security settings
  - [ ] Verify PDF renders from Cloudinary URL on Vercel origin
- [x] Phase 1 — Resources backend and Cloudinary migration
  - [x] Resource model updated with playlist type, paperKey, variant, controlled year/subject values
  - [x] Resource controller updated with uploadPaperPair endpoint
  - [x] Resource routes updated with /upload-pair endpoint
  - [x] pyqRoutes updated to support paperKey and variant
  - [x] UserPYQProgress model updated to use paperKey
  - [x] pyqProgressRoutes updated to use paperKey
  - [x] Frontend resourceService updated with uploadPaperPair and paperKey support
  - [x] Seed script created (seedResources.js) for all PYQ papers
  - [x] Seed script run: 128 resources created (64 papers × 2 variants)
  - [ ] Upload actual PDFs to Cloudinary (manual via admin dashboard)
  - [ ] Replace hardcoded PAPER_SOURCES in PYQsPage.jsx
- [x] Phase 2 — Admin dashboard
  - [x] AdminDashboard component with 3 tabs: Paper Pair, Single File, Question JSON
  - [x] Paper Pair upload for PYQs (questions + solution PDFs linked by paperKey)
  - [x] Single file upload for notes, playlists, images, etc.
  - [x] Question JSON upload for QuizEngine (per subject, viva/nptel modes)
  - [x] Frontend AdminRoute guard for /admin-upload (checks user.role === "admin")
  - [x] Build passes
- [x] Phase 3 — Resources frontend
  - [x] Resources page structure: /resources → /resources/:year → /resources/:year/:subject
  - [x] Year and Subject card grids with progress indicators
  - [x] PYQs tab with paper pair cards (questions + solution) linked by paperKey
  - [x] Playlists tab with YouTube thumbnails
  - [x] Notes tab
  - [x] In-site PDF viewer (react-pdf) in modal panel with zoom, navigation, variant switching
  - [x] Progress (attempted) and notes via /api/pyq-progress (MongoDB persistence)
  - [x] useProgress hook for frontend state management
  - [x] Homepage "Resources" card links to /resources (replaces /pyqs)
  - [x] Build passes with new chunks: ResourcesPage, YearPage, SubjectPage, PdfViewer, useProgress
- [x] Phase 4 — QuizEngine
  - [x] Topic model: add `mode` (viva/nptel) and `image` fields
  - [x] Question model: add `source` field (manual/pyq/llm)
  - [x] Seed data updated with modes and images (10 topics, 1063 questions)
  - [x] TopicsPage: mode toggle (pill tabs), photo card grid (no graph)
  - [x] Topic controller: filter by mode query param
  - [ ] QuizPage: works with both modes
  - [ ] Admin JSON import integration (already exists in AdminDashboard)
- [x] Phase 5 — Sign-in providers, Homepage & Design System
  - [x] Design system: CSS tokens (Design.md), Inter font, component library
    - [x] CSS variables updated (variables.css) - dark/light modes, surface ladder, single accent
    - [x] Inter font added via Google Fonts (index.html)
    - [x] Component library (components.css) - buttons, cards, inputs, pill tabs, photo cards, status badges, typography
    - [x] Global styles updated (global.css) - minimal, design-system compatible
  - [x] GitHub OAuth (Passport strategy) - added to passport.js, routes, User model
  - [x] Microsoft OAuth (Passport strategy) - added to passport.js, routes, User model
  - [x] Homepage: auth buttons under headline, two tool groups, footer page, onboarding
    - [x] display-xl headline with Login (secondary) + Register (primary) buttons
    - [x] OAuth buttons: Google, GitHub, Microsoft
    - [x] Two tool groups: Exam prep (Resources, QuizEngine) + Other tools (calculators, Task Tracker)
    - [x] Engineering Tracker removed
    - [x] Professional footer with brand, navigation, legal links
    - [x] Onboarding redirect for logged-in users
  - [x] Apply design system to all existing pages:
    - [x] Login page (new SVG logo, design system buttons, inputs, OAuth buttons)
    - [x] Register page (same as Login)
    - [x] SGPA page (design system cards, inputs, buttons, Select)
    - [x] CGPA page (design system cards, inputs, buttons, simulator card)
    - [x] Internal Marks page (pill tabs, cards, design system)
    - [x] Task Tracker page (design system cards, kanban columns, task cards, modal)
    - [x] Quiz pages: TopicsPage (photo cards, pill tabs), QuizPage (design system cards, buttons, inputs)
    - [x] Admin Dashboard (already using design system)
    - [x] Resources pages (already using design system)
  - [x] Onboarding flow for new users
    - [x] Added `onboardingCompleted` field to User model (default: false)
    - [x] Backend endpoint `POST /api/auth/onboarding/complete` to mark completion
    - [x] Updated AuthContext with `showOnboarding` state and `completeOnboarding` function
    - [x] Created OnboardingModal with 6 steps (Welcome, Resources, QuizEngine, Calculators, Tasks, Goals)
    - [x] Integrated OnboardingModal in App.jsx, shows for new users on first login
    - [x] OAuth callbacks include onboardingCompleted in user object
  - [x] ERRORS.md created — comprehensive error tracking document
- [x] Phase 6 — SGPA/CGPA and Internal Marks
  - [x] SGPA: Added "Qualified" grade option (at top of grade list, doesn't affect SGPA calculation)
  - [x] SGPA: Credits as dropdown (1–6) instead of number input
  - [x] CGPA: Added "Qualified" grade option
  - [x] CGPA: Credits as dropdown (1–6) for manual semesters
  - [x] CGPA: Added "Clear All" button
  - [x] CGPA: Removed "Recoverable" recovery message from Insight
  - [x] Internal Marks: Added program selector (BE CSE / BE CSE AIT)
  - [x] Internal Marks: Added year options (1st, 2nd, 3rd, 4th Year for CSE; 3rd/4th for AIT)
  - [x] Internal Marks: Subject type explanations with example subjects
  - [x] Internal Marks: Placeholder marking schemes for 3rd-year CSE and AIT (user to provide exact schemes)
  - [x] Hybrid/Theory/Practical/Aptitude components: update for program/year prop
- [ ] Internal Marks: Update marking schemes with exact values from user

## Log

### 2026-10-20 — Planning session
- Reviewed the v2.0 plan PDF and the repo zip.
- Drafted PRD.md, feature.md, rules.md, phases.md and memory.md.
- Decided: Task Tracker included (deadline-first, Kanban secondary, last); GitHub and Microsoft sign-in added; Proton skipped; Apple dropped; Programming and UG Life Tracker hidden; Cloudinary for storage and `react-pdf` for the viewer; two linked PDFs per paper.
- Confirmed Cloudinary free accounts block PDF delivery unless it is enabled in Security settings.
- No code changed.

### 2026-10-20 — Phase 0: Setup and viewer spike
- Created branch `v2`
- Installed `react-pdf@9` (compatible with React 18)
- Created viewer spike page at `/viewer-spike` with react-pdf Document/Page components
- Test PDF renders from public URL with CORS (pdfobject.com/sample.pdf)
- Cloudinary PDF delivery needs to be enabled manually in Cloudinary console (Security settings)
- Decision gate: react-pdf works; proceed to Phase 1

### 2026-10-20 — Phase 1: Resources backend and Cloudinary migration
- Updated Resource model:
  - Added `playlist` to resourceType enum
  - Added `paperKey` field (shared key linking questions + solution PDFs)
  - Added `variant` field (`questions` or `solution`)
  - Added controlled enums for `year` (1st-4th Year) and `subject`
  - Added compound index on paperKey + variant
- Updated Resource controller:
  - Added `uploadPaperPair` endpoint for uploading both PDFs at once
  - Updated `uploadResource` to accept paperKey and variant
  - Updated `getResource` to return linked variant
  - Updated `listResources` to filter by paperKey and variant
- Updated Resource routes:
  - Added POST `/upload-pair` endpoint
  - Fixed multer config for pyqs type
- Updated pyqRoutes:
  - Fixed typo: `pyqss` -> `pyqs`
  - Added paperKey and variant query params
  - Added paperKey and variant to upload
- Updated UserPYQProgress model: paperId -> paperKey
- Updated pyqProgressRoutes: paperId -> paperKey, standardized response shape
- Updated frontend resourceService:
  - Added `uploadPaperPair` function
  - Added paperKey and variant to fetchResources, fetchPyqs, uploadPyq
  - Fixed RESOURCE_TYPES.PYQ to "pyqs"
- Created seed script (scripts/seedResources.js) for all PYQ papers from PAPER_SOURCES
- **Seed script executed successfully**: 128 resources created (64 papers × questions + solution variants)
- Cloudinary PDF/ZIP delivery enabled in Security settings
- MongoDB cluster confirmed up and accessible

### 2026-10-20 — Phase 2: Admin dashboard (completed)
- Created AdminDashboard component (`src/features/resources/components/AdminDashboard.jsx`) with 3 tabs:
  - **Paper Pair**: Upload PYQ paper pairs (questions + solution PDFs) linked by paperKey
  - **Single File**: Upload notes, playlists, images, thumbnails, other PDFs
  - **Question JSON**: Upload per-subject question arrays for QuizEngine (viva/nptel modes)
- Created AdminRoute guard (`src/components/layout/AdminRoute.jsx`) - checks `user.role === "admin"`
- Updated AdminUpload page to use new AdminDashboard
- Wrapped /admin-upload route with AdminRoute in App.jsx
- Build passes with new chunks: AdminRoute, AdminUpload

### 2026-10-20 — Phase 3: Resources frontend (completed)
- Created Resources page structure with 3 routes:
  - `/resources` (ResourcesPage) — Year grid with paper counts
  - `/resources/:year` (YearPage) — Subject grid with attempt progress
  - `/resources/:year/:subject` (SubjectPage) — Tabs: PYQs, Playlists, Notes
- Created components:
  - `PdfViewer` — Modal panel with react-pdf, zoom, page nav, variant switching (questions↔solution)
  - `useProgress` hook — Manages progress/notes state, syncs with `/api/pyq-progress`
- PYQs tab: Paper pairs grouped by paperKey, shows both Questions + Solution cards
- Playlists tab: YouTube playlist cards with thumbnails
- Notes tab: Simple note cards
- Progress (attempted toggle) and notes persist to MongoDB via `/api/pyq-progress`
- Homepage updated: "Resources" card now links to `/resources` instead of `/pyqs`
- Build passes with new lazy chunks: ResourcesPage, YearPage, SubjectPage, useProgress, pdf-vendor

### 2026-10-20 — Phase 4: QuizEngine (completed)
- Updated Topic model: added `mode` (viva/nptel) and `image` fields
- Updated Question model: added `source` field (manual/pyq/llm)
- Updated seed.js: 10 topics with modes (6 viva, 4 nptel) and Unsplash images
- Re-seeded database: 10 topics, 1063 questions with source="manual"
- Rewrote TopicsPage (`features/quiz/pages/TopicsPage.jsx`):
  - Removed graph view (DAG visualization)
  - Added pill tab toggle: College Viva / NPTEL Prep
  - Photo card grid with subject images (from topic.image)
  - Mode-specific stats (total/unlocked/completed per mode)
  - Locked/completed states with visual indicators
  - TopicCard replaced with TopicPhotoCard component
- Updated topicController: added `mode` query param filter
- Admin Dashboard already supports Question JSON upload with mode selector
- Build passes with updated TopicsPage chunk

### 2026-10-20 — Phase 5: Sign-in providers, Homepage & Design System (in progress)
- **Major visual overhaul per Design.md**: Linear-style reference adopted
  - Dark-first, near-black canvas (`#010102` → `--bg`)
  - Single accent: lavender-blue (`#5e6ad2` → `--primary`)
  - Inter font (replaces DM Sans) via Google Fonts
  - Surface ladder hierarchy (--surface, --surface-2, --surface-3, --surface-4)
  - No gradients, no per-tool colors, no decorative color
  - Compact controls: 8px radius, 14px labels, 8×14px button padding
  - Pill tabs for Resources tabs and QuizEngine mode toggle
  - Photo cards for QuizEngine topics
- **Design system implemented**:
  - `variables.css`: Complete token set (colors, spacing, radius, typography, elevation) with dark/light modes
  - `components.css`: Component library (buttons, cards, inputs, pill tabs, photo cards, status badges, typography utilities)
  - `global.css`: Rewritten minimal, design-system compatible app styles
  - `index.html`: Inter font loaded via Google Fonts (400, 500, 600 weights)
  - Build passes with new consolidated CSS chunk
- **OAuth providers added**:
  - GitHub OAuth: passport-github2 strategy, `/api/auth/github` + `/callback` routes, User model `githubId`
  - Microsoft OAuth: passport-microsoft strategy, `/api/auth/microsoft` + `/callback` routes, User model `microsoftId`
  - Backend .env updated with placeholder credentials (need real values from OAuth apps)
- **Homepage redesigned** (`features/homepage/HomePage.jsx`):
  - display-xl headline with Login (secondary) + Register (primary) buttons
  - OAuth buttons: Google, GitHub, Microsoft
  - Two tool groups: Exam prep (Resources, QuizEngine) + Other tools (calculators, Task Tracker)
  - Engineering Tracker removed
  - Professional footer with brand, navigation, legal links
  - Onboarding redirect for logged-in users
- **Design system applied to all pages** (completed 2026-10-21):
  - Login page: new SVG logo, design system buttons, inputs, OAuth buttons
  - Register page: same as Login
  - SGPA page: design system cards, inputs, buttons, Select
  - CGPA page: design system cards, inputs, buttons, simulator card
  - Internal Marks page: pill tabs, cards, design system
  - Task Tracker page: design system cards, kanban columns, task cards, modal
  - Quiz pages: TopicsPage (photo cards, pill tabs), QuizPage (design system cards, buttons, inputs)
  - Admin Dashboard (already using design system)
  - Resources pages (already using design system)
- **Onboarding flow for new users** (completed 2026-10-21):
  - Added `onboardingCompleted` field to User model (default: false)
  - Backend endpoint `POST /api/auth/onboarding/complete` to mark completion
  - Updated AuthContext with `showOnboarding` state and `completeOnboarding` function
  - Created OnboardingModal with 6 steps (Welcome, Resources, QuizEngine, Calculators, Tasks, Goals)
  - Integrated OnboardingModal in App.jsx, shows for new users on first login
  - OAuth callbacks include onboardingCompleted in user object
- **Next**: Phase 7 (Task Tracker deadline-first rework)

### 2026-10-21 — Phase 6: SGPA/CGPA and Internal Marks (completed)
- **SGPA Calculator**:
  - Added "Qualified" grade option (placed at top of grade list, doesn't affect SGPA calculation)
  - Changed credits input from number to dropdown (1–6)
  - Qualified grade doesn't affect SGPA calculation (skipped in computeSGPA)
- **CGPA Calculator**:
  - Added "Qualified" grade option (inherited from SGPA)
  - Changed credits input for manual semesters to dropdown (1–6)
  - Added "Clear All" button (clears manual semesters, history, and localStorage)
  - Removed "Recoverable" message from Insight component
  - Uses current-semester credits terminology
- **Internal Marks Calculator**:
  - Added program selector: BE CSE (default) and BE CSE (AIT)
  - Year options per program: CSE (1st, 2nd, 3rd, 4th), AIT (3rd DS, 4th AIML)
  - Subject tabs with descriptions and example subjects for each type
  - Professional UI with pill tabs, explanations, and example subjects
  - Placeholder marking schemes for 3rd-year CSE and AIT (to be updated with exact values)
  - Hybrid/Theory/Practical/Aptitude components updated for program/year props
- **Build passes** with all new components

## Known bugs and quirks

See `ERRORS.md` for complete error tracking including linting issues, build errors, and fixes.

**Current active issues:**
- `server.js` logs the request Origin and every request line; noisy in production.
- `adminOnly` is defined separately in `resourceRoutes.js` and `pyqRoutes.js`.
- `/admin-upload` has no frontend role guard; the backend enforces admin.
- Response shapes are inconsistent: `pyqProgressRoutes` returns `{ error }`, `pyqRoutes` returns `{ success, message }`.
- `PYQsPage.jsx` (1,139 lines) holds a hardcoded `PAPER_SOURCES` list of Google Drive preview links, all with empty `solutionUrl`.
- PYQ progress and notes use localStorage in the frontend although `UserPYQProgress` and `/api/pyq-progress` already exist in the backend.
- Three upload middleware files (`upload.js`, `avatarUpload.js`, `uploadMiddleware.js`); avatars go to local disk, resources to Cloudinary.
- `features/quiz` carries its own duplicate Login, Register and Navbar.
- `src/app/routes.jsx` is an empty stub; routing lives in `App.jsx`.
- `src/UploadTest.jsx` is a stray test file.
- `AGENTS.md` lists `CLOUD_NAME`/`CLOUD_KEY`/`CLOUD_SECRET`, but the code reads `CLOUDINARY_*`.
- `claude.md` is stale: it lists 6 quiz topics (the seed has 10) and omits the Programming feature.

**Linting errors (see `ERRORS.md` for full list):**
- 15+ unused variable warnings across components
- 2 `react-hooks/set-state-in-effect` violations (OnboardingModal, PYQsPage)
- 2 `react-refresh/only-export-components` violations (AuthContext, ToastContext)
- 1 `react-hooks/immutability` violation (HomePage.jsx)
- 1 component created during render (TopicCard.jsx)

## Open items

- Marking schemes for 3rd-year general CSE and BE CSE (AIT).
- Design docs for `design.md`.
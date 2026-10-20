# Edubits v2.0 — Memory

Running record of what is done and what is in progress. At the end of each session Claude proposes an update; the owner approves it before it is written.

## Current status

- **Phase:** pre-build (planning)
- **Working on:** documentation and tool exploration. No implementation yet.
- **Next:** Phase 0 — setup and viewer spike (see `phases.md`)

## Checklist

**Docs**
- [x] PRD.md
- [x] feature.md
- [x] rules.md
- [x] phases.md
- [x] memory.md
- [x] design.md

**Build**
- [ ] Phase 0 — Setup and viewer spike
- [ ] Phase 1 — Resources backend and Cloudinary migration
- [ ] Phase 2 — Admin dashboard
- [ ] Phase 3 — Resources frontend
- [ ] Phase 4 — QuizEngine
- [ ] Phase 5 — Sign-in providers and homepage
- [ ] Phase 6 — SGPA/CGPA and Internal Marks
- [ ] Phase 7 — Task Tracker

## Log

### 2026-10-20 — Planning session
- Reviewed the v2.0 plan PDF and the repo zip.
- Drafted PRD.md, feature.md, rules.md, phases.md and memory.md.
- Decided: Task Tracker included (deadline-first, Kanban secondary, last); GitHub and Microsoft sign-in added; Proton skipped; Apple dropped; Programming and UG Life Tracker hidden; Cloudinary for storage and `react-pdf` for the viewer; two linked PDFs per paper.
- Confirmed Cloudinary free accounts block PDF delivery unless it is enabled in Security settings.
- No code changed.

## Known bugs and quirks

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

## Open items

- Admin dashboard route.
- Field names for the shared paper key and the cross-link between a paper's two PDFs.
- Marking schemes for 3rd-year general CSE and BE CSE (AIT).
- Design docs for `design.md`.
# Edubits v2.0 — Known Errors & Fixes

This document tracks all known errors, linting issues, and bugs in the codebase. Each entry includes the error description, location, severity, and how it was fixed (or TODO for unfixed items).

---

## 🔴 Critical Errors (Build-blocking)

*None currently* (build not verified by the last audit - see TODO #1)

---

## 🟡 Linting Errors (ESLint)

Last full run: 2026-10-21 - **35 errors, 6 warnings** (was 48 / 6). Re-run `npm run lint` before trusting line numbers.

### 1. Unused Variables

| File | Line | Variable | Fix Status |
|------|------|----------|------------|
| `src/components/layout/EditProfileModal.jsx` | 90 | `err` | **TODO** - use `catch {` |
| `src/components/layout/Navbar.jsx` | 90 | `isProgActive` | **TODO** - remove or use |
| `src/context/AuthContext.jsx` | 15, 85 | `err` | **TODO** - use `catch {` |
| `src/features/cgpa/CGPA.jsx` | 29, 30, 31, 66 | `maxVal`, `barW`, `gap` | **TODO** - remove unused consts in `BarChart` |
| `src/features/onboarding/OnboardingModal.jsx` | 52 | `user` | **TODO** - remove |
| `src/features/programming/pages/TopicProblemsPage.jsx` | 59, 79 | `err` | **TODO** - use `catch {` |
| `src/features/quiz/pages/QuizPage.jsx` | 281, 341 | `isMulti`, `isMultiSelect` | **TODO** - remove |
| `src/features/quiz/pages/ResultsPage.jsx` | 174 | `isMultiSelect` | **TODO** - remove |
| `src/features/resources/components/PdfViewer.jsx` | 13 | `paperKey` (prop) | **TODO** - remove from props or use |
| `src/features/resources/pages/ResourcesPage.jsx` | 1, 44 | `useCallback`, `progressMap`, `progressLoading` | **TODO** - remove (or wire up progress UI) |
| `src/features/sgpa/SGPA.jsx` | 138, 217 | `loadExample`, `isEmpty` | **TODO** - remove or use |
| `src/features/tasks/components/TaskCard.jsx` | 1 | `formatDate` | **TODO** - remove import |
| `src/features/ug-life-tracker/components/DateOverridePanel.jsx` | 3 | `overrides` (prop) | **TODO** - remove or use |
| `src/features/ug-life-tracker/components/ReflectionEditor.jsx` | 27 | `activePrompt` | **TODO** - remove or use |
| `src/features/ug-life-tracker/components/WeekDetailsDrawer.jsx` | 4 | `isBeforeWeek` | **TODO** - remove import |
| `src/features/sgpa/SGPA.jsx` | 118 | empty `catch {}` block (`no-empty`) | **TODO** - add a comment or handle the error |

### 2. React Hooks Issues

| File | Line | Issue | Fix Status |
|------|------|-------|------------|
| `src/features/onboarding/OnboardingModal.jsx` | 58 | `setState` called synchronously in `useEffect` | **TODO** |
| `src/features/pyqs/PYQsPage.jsx` | 675 | `setNotes`/`setAttempted` in `useEffect` | **TODO** - use lazy state initialiser |
| `src/features/quiz/pages/RegisterPage.jsx` | 16 | `setState` in `useEffect` | **TODO** |
| `src/features/sgpa/SGPA.jsx` | 58, 131 | `setState` in `useEffect` | **TODO** |
| `src/features/ug-life-tracker/components/DateOverridePanel.jsx` | 17 | `setState` in `useEffect` | **TODO** |
| `src/features/tasks/components/TaskModal.jsx` | 32 | `resetForm` used before it is declared | **TODO** - move declaration above the effect |
| `src/features/quiz/components/Graph/TopicCard.jsx` | 30 | component created during render | **TODO** - move `TopicIcon` outside the component |

Warnings (`react-hooks/exhaustive-deps`): `QuizPage.jsx:100`, `useProgress.js:10`, `YearPage.jsx:41`, `SGPA.jsx:136`, `useTasks.js:32`, `AuthCallback.jsx:26`.

### 3. React Refresh Issues

| File | Line | Issue | Fix Status |
|------|------|-------|------------|
| `src/context/AuthContext.jsx` | 100 | `useAuth` exported alongside `AuthProvider` | **TODO** - move hook to its own file |
| `src/context/ToastContext.jsx` | 35 | Same issue | **TODO** |

---

## 🟢 Fixed Errors (Documented for Reference)

### Fixed: HomePage footer crashed the landing page
**Files:** `frontend/src/features/homepage/HomePage.jsx`  
**Error:** `ReferenceError: Github is not defined` (also `Chrome`) - the page went blank for logged-out users after mount  
**Fix:** Footer icons now use the imported `GitBranch` / `Globe` / `Mail`. Also removed the `mounted` state (client-only app, no hydration) which fixes `set-state-in-effect`, replaced `window.location.href` with `window.location.assign()`, and OAuth links now use `VITE_API_URL` so they work on Vercel  
**Date:** 2026-10-21

### Fixed: PdfViewer crashed when a PDF was opened
**Files:** `frontend/src/features/resources/components/PdfViewer.jsx`  
**Error:** `useEffect is not defined`; the effect was also declared after `if (!isOpen) return null`, breaking the Rules of Hooks  
**Fix:** Import `useEffect`, move the effect above the early return, and define `handleKeyDown` inside it  
**Date:** 2026-10-21

### Fixed: Internal Marks Theory/Practical crashed for most years
**Files:** `frontend/src/features/internalMarks/Practical.jsx`, `Theory.jsx`, `InternalMarksPage.jsx`  
**Error:** `PracticalFirstYear / PracticalSenior / TheoryFirstYear / TheorySenior is not defined`; `validateAll is not defined` on Calculate (3rd-year CSE)  
**Fix:** Restored the four components from commit `d74f7a8`, imported `validateAll`, removed dead variables. `switchProgram` also set the year to an array index (`"0"`) instead of a year key, leaving no tabs after switching program  
**Verified:** server-rendered all 18 year/program/tab combinations (10 failed before, 0 after)  
**Date:** 2026-10-21

### Fixed: QuizEngine topics page hook order
**Files:** `frontend/src/features/quiz/pages/TopicsPage.jsx`  
**Error:** `React Hook "useMemo" is called conditionally` (`modeStats` came after `if (loading) return ...`)  
**Fix:** Moved `modeStats` above the early return  
**Date:** 2026-10-21

### Fixed: OAuth login could never complete, and the server crashed without OAuth keys
**Files:** `backend/config/passport.js`, `backend/routes/authRoutes.js`  
**Error:** `findOrCreateUser(profile, provider)` returned `async (done)`, but Passport calls verify as `(accessToken, refreshToken, profile, done)`; startup threw `OAuth2Strategy requires a clientID option` when a provider had no credentials  
**Fix:** Corrected the signature; each provider registers only when its credentials and `BACKEND_URL` exist; unconfigured providers redirect to `/login?error=<provider>_unavailable`  
**Date:** 2026-10-21

### Fixed: PUT /api/users/me returned the password hash
**Files:** `backend/routes/users.js`  
**Error:** the full updated user document (including `password`) was sent to the client  
**Fix:** `.select("-password")`, only `name`/`avatar` are updated, and the response uses the same safe shape as the auth endpoints  
**Date:** 2026-10-21

### Fixed: Avatar uploads saved a server file path
**Files:** `backend/routes/authRoutes.js`, `backend/controllers/authController.js`  
**Error:** `req.file.path` (a local disk path) was stored as the avatar URL; Render's disk is wiped on deploy  
**Fix:** multer `memoryStorage` + Cloudinary `upload_stream` into `edubits/avatars`; the stored value is the `secure_url`  
**Date:** 2026-10-21

### Fixed: Rate limiter shared one IP, CORS accepted any *.vercel.app, error handler masked 4xx
**Files:** `backend/server.js`, `backend/.env.example`, `.gitignore`  
**Fix:** `app.set("trust proxy", 1)`; explicit CORS allow-list (`FRONTEND_URL`, `CORS_ORIGINS`); required env vars checked at startup; malformed JSON and multer errors return 400 and 5xx messages are hidden in production; `.env.example` now matches the variable names the code reads; `backend/uploads/` added to `.gitignore`  
**Date:** 2026-10-21

### Fixed: ESLint reported used components as unused
**Files:** `frontend/eslint.config.js`  
**Error:** `'Icon' is defined but never used` for `({ icon: Icon }) => <Icon />`  
**Fix:** added `argsIgnorePattern: '^[A-Z_]'`. **Do not "fix" these by deleting the destructured `Icon`** - the component is used in JSX and removing it crashes the page  
**Date:** 2026-10-21

### Fixed: "Github" not exported by lucide-react
**Files:** `Login.jsx`, `Register.jsx`, `HomePage.jsx`  
**Error:** `Github` is not exported by lucide-react  
**Fix:** Changed to `GitBranch` icon  
**Date:** 2026-10-21  
**Commit:** Phase 5 design system rollout  
**Note (2026-10-21):** this fix was incomplete. The `HomePage.jsx` footer still rendered `<Github />` and `<Chrome />`, which blanked the landing page. See "Fixed: HomePage footer" below.

### Fixed: AuthContext Syntax Error
**File:** `frontend/src/context/AuthContext.jsx`  
**Error:** Missing closing brace for `AuthProvider`  
**Fix:** Added missing `}` before `export const useAuth`  
**Date:** 2026-10-21

### Fixed: OAuth Icon Imports
**Files:** `Login.jsx`, `Register.jsx`  
**Error:** `Github` and `Chrome` not exported by lucide-react  
**Fix:** Used `GitBranch` for GitHub, `Globe` for Microsoft  
**Date:** 2026-10-21

### Fixed: Import Path Issues
**File:** `TaskColumn.jsx`  
**Error:** Could not resolve `'../../../../styles/taskTracker.css'`  
**Fix:** Removed incorrect import, kept local `TaskComponents.css`  
**Date:** 2026-10-21

### Fixed: MongoDB Connection
**Issue:** DNS resolution failed for `edubits.ilqo3wy.mongodb.net`  
**Fix:** Cluster was paused; resumed in MongoDB Atlas dashboard  
**Date:** 2026-10-20

### Fixed: react-pdf Version Incompatibility
**Issue:** `react-pdf@11` requires React 19, but project uses React 18  
**Fix:** Installed `react-pdf@9` with `--legacy-peer-deps`  
**Date:** 2026-10-20

### Fixed: Cloudinary PDF Delivery
**Issue:** Free Cloudinary accounts block PDF delivery by default  
**Fix:** Enabled "Allow delivery of PDF and ZIP files" in Cloudinary Console → Security settings  
**Date:** 2026-10-20 (manual step by user)

### Fixed: pyqRoutes Typo
**File:** `backend/routes/pyqRoutes.js`  
**Error:** `uploadFor("pyqss")` - typo in resource type  
**Fix:** Changed to `uploadFor("pyqs")`  
**Date:** 2026-10-20

### Fixed: User Model OAuth Fields
**File:** `backend/models/User.js`  
**Error:** Missing `githubId` and `microsoftId` fields for new OAuth providers  
**Fix:** Added both fields with `default: null`  
**Date:** 2026-10-21

### Fixed: Missing OAuth Fields in Auth Response
**Files:** `backend/controllers/authController.js`, `backend/routes/authRoutes.js`  
**Error:** OAuth callbacks didn't include `role` and `onboardingCompleted`  
**Fix:** Added both fields to user object in all OAuth callbacks  
**Date:** 2026-10-21

---

## 📋 TODO: Remaining Issues to Fix

### High Priority
1. **Run `npm run build` locally.** The 2026-10-21 audit could not build (the `node_modules` in the zip came from macOS arm64 and Rolldown's native binding is platform-specific). Never zip or commit `node_modules`.
2. **Retest OAuth end-to-end** (Google, GitHub, Microsoft) on the deployed backend - the verify-callback bug meant it had likely never succeeded.
3. **Set production env vars** on Render: `BACKEND_URL`, `FRONTEND_URL`, `NODE_ENV=production`, `CORS_ORIGINS` (for any Vercel preview URLs you need), and on Vercel: `VITE_API_URL` (must end in `/api`).
4. Run `git rm -r --cached backend/uploads` so the 22 already-tracked images leave the repo (`.gitignore` only stops new ones).

### Medium Priority
5. Fix the remaining `set-state-in-effect` errors and `TopicCard` / `TaskModal` hook errors (tables above).
6. Remove unused variables (about 25 instances).
7. Add a `/about` route (`AboutPage.jsx` exists; the footer links to it) or remove the link. Wrap `/programming/admin` in `AdminRoute`.
8. Move `useAuth` / `useToast` out of the provider files (react-refresh).

### Low Priority
9. Clean up stray files - `src/UploadTest.jsx`, `src/app/routes.jsx`, unused `HomeFooter.jsx`, empty `backend/middleware/avatarUpload.js`.
10. Consolidate `adminOnly` middleware - defined in both `resourceRoutes.js` and `pyqRoutes.js`.
11. Standardise response shapes - `pyqProgressRoutes` returns `{ error }`, others return `{ success, message }`.
12. Update `claude.md` - stale (lists 6 quiz topics, seed has 10).
13. Replace the JWT-in-URL OAuth redirect with a one-time code exchange.

---

## 📝 Fix Template

When fixing an error, update this document with:

```markdown
### Fixed: [Brief Description]
**Files:** [List of files]
**Error:** [Exact error message]
**Fix:** [What was changed]
**Date:** [YYYY-MM-DD]
**Commit/PR:** [Reference if applicable]
```

---

## 🔍 How to Check for Errors

```bash
# Frontend linting
cd frontend && npm run lint

# Frontend build (run on your own machine - the build tool ships platform-specific binaries)
cd frontend && npm run build

# Backend syntax check (every file)
cd backend && for f in $(find . -name '*.js' -not -path './node_modules/*'); do node --check "$f" || echo "FAIL $f"; done

# Backend boots without OAuth keys (should print "OAuth disabled" warnings, not crash)
cd backend && MONGO_URI=mongodb://x/y JWT_SECRET=t FRONTEND_URL=http://localhost:5173 node server.js
```

**Lint gotcha:** a passing lint does not prove a component is imported. ESLint's `no-undef` does not check JSX tags, so `<Github />` with no import passes lint and crashes at runtime. Open every page you touched in the browser before committing.

---

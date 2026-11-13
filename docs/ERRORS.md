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

## 🟠 Known Bugs (Runtime, Open)

Found in the 2026-10-22 review of the Resources feature and the homepage. Lint and build catch none of these. Fixes are proposed, not applied. The IDs (R1, P1, D1, H1) are referenced from `Memory.md`, `Phases.md`, `Rules.md` and `Feature.md` section 8.

### Resources bugs

#### R1. A failed PDF load breaks the viewer until the page is refreshed
**Files:** `frontend/src/features/resources/components/PdfViewer.jsx`  
**Severity:** High  
**Problem:** `<Document>` renders only while `error` is empty (`{!error && ...}`), and only that same `<Document>`'s `onLoadSuccess` clears `error`. After one failed load it never mounts again, so every later paper shows "Failed to load PDF" until the page is refreshed.  
**Proposed fix:** reset `error`, `numPages`, `pageNumber` and `scale` whenever `url` changes or the viewer opens (for example `key={url}` on the inner content, or an effect on `url`).  
**Status:** TODO

#### R2. The viewer keeps its state between papers
**Files:** `frontend/src/features/resources/components/PdfViewer.jsx`  
**Severity:** High  
**Problem:** the component stays mounted and returns `null` when closed, so `pageNumber`, `scale` and `numPages` persist. Opening a second paper after reading page 5 of the first can start on page 5, or past the last page (blank page). Switching Questions to Solution keeps the page number too.  
**Proposed fix:** same reset as R1, and set the page back to 1 when `url` changes.  
**Status:** TODO

#### R3. Year page always shows "0/N attempted" on first load
**Files:** `frontend/src/features/resources/pages/YearPage.jsx`  
**Severity:** Medium  
**Problem:** `loadSubjects` reads `progressMap` while `useProgress` is still loading, and the effect re-runs only when the year changes. The `react-hooks/exhaustive-deps` warning at `YearPage.jsx:41` points at this.  
**Proposed fix:** compute attempted counts in render (`useMemo` over the fetched resources and `progressMap`) instead of inside the fetch.  
**Status:** TODO

#### R4. Notes save on every keystroke, and failures are silent
**Files:** `frontend/src/features/resources/pages/SubjectPage.jsx`  
**Severity:** Medium  
**Problem:** `handleNotesChange` sends one `PUT /pyq-progress/:paperKey` per character with no debounce, so requests can finish out of order. Failures (and failed attempted toggles, which are optimistic and never rolled back) are only logged with `console.error`, so the student assumes it saved.  
**Proposed fix:** debounce notes (about 500 ms per paper), flush on blur and unmount, show a saved / failed state, and roll back or notify when a write fails.  
**Status:** TODO

#### R5. The frontend overrides the admin's ordering
**Files:** `frontend/src/features/resources/pages/SubjectPage.jsx`, `backend/controllers/resourceController.js`  
**Severity:** Low  
**Problem:** the backend sorts by `sortOrder` (descending), then `createdAt`. `SubjectPage` re-sorts papers by `paperTag` with `localeCompare`, so `sortOrder` has no effect, and alphabetical tags (for example EST before MST) rarely match exam order.  
**Decision:** papers must display in exam sequence: MST 1, MST 2, then EST (see `PRD.md` section 8 and `decisions/7.md`).  
**Proposed fix:** provide a stable exam-order value in the returned data and sort by it; remove the alphabetical `paperTag` re-sort.  
**Status:** TODO (ordering rule settled; implementation pending)

#### R6. The Download button does not download
**Files:** `frontend/src/features/resources/components/PdfViewer.jsx`  
**Severity:** Low  
**Problem:** the `download` attribute is ignored for cross-origin URLs (Cloudinary), so the button only opens a new tab.  
**Proposed fix:** build the download URL with Cloudinary's attachment delivery flag (`fl_attachment`).  
**Status:** TODO

#### R7. Every student receives the uploader's name and email
**Files:** `backend/controllers/resourceController.js` (lines 160 and 176)  
**Severity:** High (personal data)  
**Problem:** `listResources` and `getResource` call `.populate("uploadedBy", "name email")`, so every logged-in user gets the uploader's name and email on every response. No frontend code reads `uploadedBy`, and each call pays for an extra lookup.  
**Proposed fix:** remove the populate, or keep it for admin callers only.  
**Status:** TODO

### Resources performance

| ID | Problem | Proposed fix |
|----|---------|--------------|
| P1 | `ResourcesPage` and `YearPage` download every PYQ document (both variants, each with the populated `uploadedBy`) only to count papers per year and subject | `GET /resources/summary` returning grouped counts; the existing index on `resourceType, year, subject, isActive` fits |
| P2 | Progress is fetched up to three times per visit: `ResourcesPage` calls `useProgress()` and never uses it, `YearPage` fetches it again, and `SubjectPage` fetches and manages its own copy instead of using the hook | One shared progress source for all Resources pages; delete the unused call |
| P3 | `SubjectPage` makes three list calls (PYQs, playlist, notes) plus progress on every visit, even if the other tabs are never opened | One call for the subject, or load each tab lazily |
| P4 | Loading shows only a spinner and errors show a raw `err.message`; the backend is on Render's free tier and cold-starts | Skeleton cards and a friendly error with a retry button |

### Resources dead code and hygiene

| ID | Problem | Proposed fix |
|----|---------|--------------|
| D1 | `features/pyqs/PYQsPage.jsx` (1,139 lines) is not imported anywhere; `/pyqs` redirects to `/resources`. It also carries the `PAPER_SOURCES` list, its own `useProgress` copy and a `set-state-in-effect` lint error | Delete the file |
| D2 | `/viewer-spike` (`ViewerSpike.jsx`, Phase 0) is still routed for every logged-in user | Remove the route and the files |
| D3 | `fetchPyqs` and `uploadPyq` in `services/resourceService.js` appear to have no callers | Confirm with a search, then remove |
| D4 | Unused imports and constants: `FolderOpen` (all three pages), `Eye`, `ChevronLeft`, `ChevronRight` (`SubjectPage`), and `SUBJECT_IMAGES` in `ResourcesPage`. Lint's capitalised-name ignore pattern (`varsIgnorePattern: '^[A-Z_]'`) hides them | Remove |
| D5 | `SUBJECT_IMAGES` is duplicated in `ResourcesPage` and `YearPage`; several subjects reuse unrelated art (Computer Networks uses `coa.svg`, Ethical Hacking `java.svg`, Web Development Fundamentals `daa.svg`), unknown subjects fall back to `daa.svg`, and `PBL_Java` is shown with its underscore | One subject-metadata map (label plus image), or a backend field |
| A1 | The viewer modal has no `role="dialog"`, `aria-modal` or focus handling; the tabs have `role="tab"` but no `tabpanel` or `aria-controls` | Add the roles and focus management |

### Homepage open items

| ID | Problem | Proposed fix |
|----|---------|--------------|
| H1 | Privacy, Terms and Cookies in the footer link to `#`; no pages exist (Google's OAuth consent screen expects privacy and terms URLs) | Deferred by owner for now; revisit before relying on those links or OAuth consent requirements |
| H2 | For logged-out visitors every footer link except the homepage lands on `/login`, because all other routes are gated | Hide or repoint those links when logged out |
| H3 | The landing page needs three screenshots in `frontend/public/images/landing/`: `pyqs.png`, `resources.png`, `quizengine.png`. Until they exist the preview frames show broken images | Add the files |
| H4 | `proofStats` in `homeData.js` is static (725+ students, 5.5K+ page views as of 2026-10-22) and will go stale | Update by hand, or serve live counts from the backend |
| H5 | `TODO.md` asks for a "Most used" label on Resources; it was not carried over when the unused `tag` data was removed | Re-add if wanted |

---

## 🟢 Fixed Errors (Documented for Reference)

### Fixed: Homepage review findings
**Files:** `frontend/src/features/homepage/HomePage.jsx`, `homepage.css`, `HomeFooter.jsx`, `PeoplePage.jsx`, new `homeData.js` and `peopleData.js`  
**Error:** found in review, not reported by lint: Log in and Sign up were `<a href>` (full page reload); the WhatsApp button used a hardcoded `#25d366` and the OAuth buttons used brand-colored borders (off the single-accent palette); every tool card had a `--primary` border; `tag` data and `.hp-tool-tag` styles were never rendered; the tools section and footer were copied in both the logged-in and logged-out returns; `HomeFooter.jsx` was unused and unstyled; `CONTRIBUTORS` was duplicated in `HomeFooter.jsx` and `PeoplePage.jsx`; copy typos ("Pyq's", "Sgpa & Cgpa")  
**Fix:** internal links use `<Link>`; neutral borders (accent only on hover and the primary CTA); one shared `HomeFooter`; tool and feature data in `homeData.js`; founders and contributors in `peopleData.js`; the logged-out page rebuilt as a long-scroll landing page (see `decisions/5.md`)  
**Date:** 2026-10-22

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
9. Clean up stray files - `src/UploadTest.jsx`, `src/app/routes.jsx`, empty `backend/middleware/avatarUpload.js` (`HomeFooter.jsx` is now the shared homepage footer, no longer stray).
10. Consolidate `adminOnly` middleware - defined in both `resourceRoutes.js` and `pyqRoutes.js`.
11. Standardise response shapes - `pyqProgressRoutes` returns `{ error }`, others return `{ success, message }`.
12. Update `claude.md` - stale (lists 6 quiz topics, seed has 10).
13. Replace the JWT-in-URL OAuth redirect with a one-time code exchange.

### From the 2026-10-22 review (see Known Bugs above)

**High**
14. Fix the Resources viewer and notes bugs R1, R2, R4, and the personal-data leak R7.

**Medium**
15. Fix R3 (year progress) and implement the settled R5 order (MST 1, MST 2, EST); fix R6 (download).
16. Resources performance P1 to P4: summary endpoint, one shared progress source, fewer calls, skeletons and retry.
17. Homepage: add the three landing screenshots (H3), fix footer links for logged-out visitors (H2). Legal pages are deferred (H1).

**Low**
18. Delete dead code D1 to D4; consolidate subject metadata (D5); viewer accessibility (A1).
19. Re-add the "Most used" label (H5) and decide how proof stats are kept current (H4).

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
cd backend && node server.js  # Uses the values configured in backend/.env
```

**Lint gotcha:** a passing lint does not prove a component is imported. ESLint's `no-undef` does not check JSX tags, so `<Github />` with no import passes lint and crashes at runtime. Open every page you touched in the browser before committing.

---

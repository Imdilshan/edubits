# Edubits v2.0 — Rules

Working rules for anyone (human or AI agent) changing this codebase. Each rule exists because breaking it has already caused a bug; see `ERRORS.md` for the history.

## Before every commit
- Run `cd frontend && npm run lint && npm run build`. Both must pass on your own machine.
- Open every page you touched in the browser, logged out and logged in. Lint cannot catch a missing import of a JSX component (`<Github />` with no import passes lint and blanks the page).
- Backend: `node --check` every file you touched, and make sure `node server.js` still boots with only the required env vars.

## React
- Call hooks at the top of the component, before any `return`. Never put `useState`, `useMemo`, `useEffect` after `if (loading) return ...`.
- Import everything you use: hooks (`useEffect`), icons, and helper functions (`validateAll`).
- Do not delete a destructured `Icon` because it "looks unused" - it is used as `<Icon />`.
- Do not call `setState` synchronously in an effect; derive the value, use a lazy initialiser, or set it in an event handler.
- Icons come from `lucide-react` (check the name exists in the installed version) or `react-icons/fa`. Brand icons such as `Github` are not in `lucide-react`.
- Build API and OAuth URLs from `import.meta.env.VITE_API_URL` (it ends in `/api`). Never hardcode `localhost` or a relative `/api/...` path for OAuth.
- A component that returns `null` when closed keeps its state. Reset page, zoom and error state when its input changes (`key={url}` or an effect on `url`), and never put the element that clears an error behind that same error (`ERRORS.md` R1, R2).
- Do not read async data inside a function that runs once on mount. Compute derived values in render (`useMemo`) so they update when the data arrives (R3).
- Debounce writes triggered by typing (about 500 ms), flush on blur, and show a saved or failed state. Never send one request per keystroke, and never swallow a failed write with only `console.error` (R4).
- Use `<Link>` for internal navigation, not `<a href>`, which reloads the whole app.
- Colors, shadows and sizes come from tokens (`Design.md` §12). No drop shadows, no raw `rgba` fills.

## Backend
- Read config from `process.env` only; add every new variable to `backend/.env.example` in the same commit.
- Never return a whole Mongoose document from an auth or user route. Return `{ id, name, email, avatar, role, ... }` or `.select("-password")`.
- User uploads go to Cloudinary, never to local disk (Render's disk is wiped on every deploy). `backend/uploads/` is git-ignored.
- Every write route needs `authMiddleware`; admin-only routes also need `adminOnly`.
- CORS is an allow-list (`FRONTEND_URL`, `CORS_ORIGINS`). Do not add wildcard or `*.vercel.app` patterns.
- Passport verify callbacks have the signature `(accessToken, refreshToken, profile, done)`.
- Endpoints that serve students must not return other users' personal data. Do not `.populate()` a user's name or email into a list response; select only what the UI renders (R7).

## Data fetching
- Fetch shared data (for example PYQ progress) once and share it through a hook instance or context, not once per page, and do not call a hook whose result you never use (`ERRORS.md` P2).
- Do not download full document lists to compute counts. Add an aggregate endpoint (P1).
- Show a skeleton while loading and a friendly error with retry on failure; the backend cold-starts on Render's free tier (P4).

## Repo hygiene
- Never commit or zip `node_modules`, `dist`, `.env`, or `backend/uploads`.
- Record every fixed bug in `ERRORS.md` using the template, and every non-obvious design choice in `docs/decisions/`.
- Delete dead code instead of leaving it routed or imported nowhere (`ERRORS.md` D1, D2); it hides the real code and carries its own lint errors.
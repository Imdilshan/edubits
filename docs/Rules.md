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

## Backend
- Read config from `process.env` only; add every new variable to `backend/.env.example` in the same commit.
- Never return a whole Mongoose document from an auth or user route. Return `{ id, name, email, avatar, role, ... }` or `.select("-password")`.
- User uploads go to Cloudinary, never to local disk (Render's disk is wiped on every deploy). `backend/uploads/` is git-ignored.
- Every write route needs `authMiddleware`; admin-only routes also need `adminOnly`.
- CORS is an allow-list (`FRONTEND_URL`, `CORS_ORIGINS`). Do not add wildcard or `*.vercel.app` patterns.
- Passport verify callbacks have the signature `(accessToken, refreshToken, profile, done)`.

## Repo hygiene
- Never commit or zip `node_modules`, `dist`, `.env`, or `backend/uploads`.
- Record every fixed bug in `ERRORS.md` using the template, and every non-obvious design choice in `docs/decisions/`.

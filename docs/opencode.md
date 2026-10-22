The homepage goes blank for logged-out users. In
frontend/src/features/homepage/HomePage.jsx the footer uses <Github /> and
<Chrome /> icons that are not imported, which throws a ReferenceError after the
component mounts.

Please:
1. Replace those two icons in the footer with already-imported ones
   (GitBranch for GitHub, Globe for Twitter), or import proper brand icons from
   react-icons/fa. Do not change anything else in that file.
2. In frontend/vercel.json, add a rewrite so /api/(.*) goes to my backend URL
   BEFORE the catch-all "/(.*)" -> "/" rewrite. Ask me for the backend URL.
3. Check that src/features/quiz/components/UI/Navbar.jsx imports
   ../../../context/AuthContext, which doesn't resolve. Fix the path to
   ../../../../context/AuthContext if that file is used, or tell me if it is unused.
4. Run `cd frontend && npm run build` and `npm run lint`, and report any errors.
Show me the diff before finishing.
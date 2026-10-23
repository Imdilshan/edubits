// Production requests stay on the frontend origin so browsers treat the auth
// cookie as first-party. Vercel proxies /api/* to the backend.
export const API_URL = import.meta.env.PROD
  ? "/api"
  : import.meta.env.VITE_API_URL || "http://localhost:5001/api";

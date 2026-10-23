import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";

export default function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("Authentication failed")))
      .then((data) => {
        if (!active || !data.user) return;
        login(data);
        navigate("/tasks", { replace: true });
      })
      .catch(() => { if (active) navigate("/login?error=oauth_failed", { replace: true }); });
    return () => { active = false; };
  }, [login, navigate]);

  return <div className="route-loader" aria-label="Completing sign in" />;
}

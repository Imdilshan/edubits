import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const userRaw = params.get("user");

    if (!token || !userRaw) {
      navigate("/login?error=google_failed");
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      login({ token, user });
      navigate("/tasks");
    } catch {
      navigate("/login?error=google_failed");
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020617",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#94a3b8",
      fontSize: "15px",
      gap: "10px",
    }}>
      <div className="spin-icon" style={{ width: 20, height: 20, border: "2px solid #334155", borderTopColor: "#38bdf8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      Signing you in...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
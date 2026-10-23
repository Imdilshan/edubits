import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_URL } from "../config/api";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const login = useCallback((data) => {
    setUser(data.user);
    setShowOnboarding(Boolean(data.user && !data.user.onboardingCompleted));
  }, []);

  const logout = useCallback(() => {
    fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowOnboarding(false);
  }, []);

  const updateScore = useCallback((totalScore) => {
    setUser((currentUser) => currentUser ? { ...currentUser, totalScore } : currentUser);
  }, []);

  const completeOnboarding = useCallback(() => {
    setUser((currentUser) => currentUser ? { ...currentUser, onboardingCompleted: true } : currentUser);
    setShowOnboarding(false);
  }, []);

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    let active = true;
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!active) return;
        const currentUser = data?.user || null;
        setUser(currentUser);
        setShowOnboarding(Boolean(currentUser && !currentUser.onboardingCompleted));
      })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setAuthReady(true); });
    return () => { active = false; };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, updateScore, completeOnboarding, showOnboarding, setShowOnboarding, authReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

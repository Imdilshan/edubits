
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [showOnboarding, setShowOnboarding] = useState(false);

  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored && stored !== "undefined" ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("Invalid user in localStorage");
      return null;
    }
  };

  const [user, setUser] = useState(getStoredUser());

  const login = useCallback((data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
    
    // Show onboarding for new users
    if (data.user && !data.user.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setShowOnboarding(false);
  }, []);

  const updateScore = useCallback((totalScore) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      return { ...currentUser, totalScore };
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      return { ...currentUser, onboardingCompleted: true };
    });
    setShowOnboarding(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          // Show onboarding if not completed
          if (!data.user.onboardingCompleted) {
            setShowOnboarding(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user");
      }
    };

    fetchUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, setUser, login, logout, updateScore, completeOnboarding, showOnboarding, setShowOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

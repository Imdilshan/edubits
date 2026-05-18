import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import styles from "./Navbar.module.css";
import { Menu, X, Zap } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const navLinks = [
    { to: "/quizzes",      label: "Topics" },
    { to: "/quizzes/leaderboard", label: "Leaderboard" },
    { to: "/quizzes/history",     label: "History" },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}><Zap size={18} /></span>
          <span>QuizEngine</span>
        </Link>

        {user && (
          <div className={styles.links}>
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}

        <div className={styles.right}>
          {user ? (
            <>
              <div className={styles.score}>
                <span className={styles.scorePts}>{user.totalScore ?? 0}</span>
                <span className={styles.scoreLbl}>pts</span>
              </div>
              <div className={styles.avatar}>{user.name?.[0]?.toUpperCase()}</div>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}

          {user && (
            <button
              className={styles.hamburger}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {mobileOpen && user && (
        <div className={styles.mobileMenu}>
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={styles.mobileLink}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <button className={`btn btn-danger ${styles.mobileLogout}`} onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

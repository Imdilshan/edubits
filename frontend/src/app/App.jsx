import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HomePage from "../features/homepage/HomePage";

const Navbar = lazy(() => import("../components/layout/Navbar"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const AuthCallback = lazy(() => import("../pages/AuthCallback"));
const TaskPage = lazy(() => import("../features/tasks/pages/TaskPage"));
const SGPAPage = lazy(() => import("../features/sgpa/pages/SGPAPage"));
const InternalMarksPage = lazy(() => import("../features/internalMarks/InternalMarksPage"));
const PYQsPage = lazy(() => import("../features/pyqs/PYQsPage"));
const UGLifeTrackerPage = lazy(() => import("../features/ug-life-tracker/UGLifeTrackerPage"));
const AboutPage = lazy(() => import("../features/about/AboutPage"));

const TopicsPage = lazy(() => import("../features/quiz/pages/TopicsPage"));
const QuizPage = lazy(() => import("../features/quiz/pages/QuizPage"));
const ResultsPage = lazy(() => import("../features/quiz/pages/ResultsPage"));
const LeaderboardPage = lazy(() => import("../features/quiz/pages/LeaderboardPage"));
const HistoryPage = lazy(() => import("../features/quiz/pages/HistoryPage"));



function PublicNavbar() {
  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      height: "60px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 800,
        fontSize: "1.4rem",
        background: "linear-gradient(135deg, var(--primary), var(--success))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>Edubits</span>
      <div style={{ display: "flex", gap: "8px" }}>
        <a href="/login" style={{
          padding: "8px 20px",
          borderRadius: "8px",
          border: "1px solid var(--border)",
          background: "transparent",
          color: "var(--text)",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none",
          transition: "0.15s",
        }}>Login</a>
        <a href="/register" style={{
          padding: "8px 20px",
          borderRadius: "999px",
          border: "none",
          background: "linear-gradient(135deg, #22d3ee, #3b82f6)",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 4px 14px rgba(59,130,246,0.25)",
        }}>Get Started</a>
      </div>
    </nav>
  );
}

function AppInner() {
  const { token } = useAuth();
  const location  = useLocation();
  const isHome    = location.pathname === "/";

  if (token) {
    return (
      <div>
        <Suspense fallback={<div className="navbar-placeholder" />}>
          <Navbar />
        </Suspense>
          <div className={`app-content ${isHome ? "" : "page"}`}>
          <Suspense fallback={<div className="route-loader" aria-label="Loading page" />}>
            <Routes>
              <Route path="/"         element={<HomePage />} />
              <Route path="/tasks"    element={<TaskPage />} />
              <Route path="/sgpa"     element={<SGPAPage />} />
              <Route path="/internal" element={<InternalMarksPage />} />
              <Route path="/pyqs"     element={<PYQsPage />} />

              <Route path="/tracker" element={<UGLifeTrackerPage />} />
              <Route path="/about"   element={<AboutPage />} />

              <Route path="/quizzes" element={<TopicsPage />} />
              <Route path="/quizzes/:topicId" element={<QuizPage />} />
              <Route path="/quizzes/results" element={<ResultsPage />} />
              <Route path="/quizzes/leaderboard" element={<LeaderboardPage />} />
              <Route path="/quizzes/history" element={<HistoryPage />} />

              <Route path="/login"    element={<Navigate to="/" />} />
              <Route path="/register" element={<Navigate to="/" />} />
              <Route path="*"         element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    );
  }
  
  return (
    <Suspense fallback={<div className="route-loader" aria-label="Loading page" />}>
      <Routes>
        <Route path="/" element={
          <>
            <PublicNavbar />
            <HomePage />
          </>
        } />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* Any protected route -> redirect to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
}

export default AppInner;

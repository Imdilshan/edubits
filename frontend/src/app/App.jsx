import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Login    from "../pages/Login";
import Register from "../pages/Register";
import AuthCallback from "../pages/AuthCallback";
import Navbar   from "../components/layout/Navbar";

import HomePage          from "../features/homepage/HomePage";
import TaskPage          from "../features/tasks/pages/TaskPage";
import SGPAPage          from "../features/sgpa/pages/SGPAPage";
import InternalMarksPage from "../features/internalMarks/InternalMarksPage";
import PYQsPage          from "../features/pyqs/PYQsPage";

import TopicsPage from "../features/quiz/pages/TopicsPage";
import QuizPage from "../features/quiz/pages/QuizPage";
import ResultsPage from "../features/quiz/pages/ResultsPage";
import LeaderboardPage from "../features/quiz/pages/LeaderboardPage";
import HistoryPage from "../features/quiz/pages/HistoryPage";


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
        <Navbar />
        {/* <div className={isHome ? "" : "page"}> */}
          <div className={`app-content ${isHome ? "" : "page"}`}>
          <Routes>
            <Route path="/"         element={<HomePage />} />
            <Route path="/tasks"    element={<TaskPage />} />
            <Route path="/sgpa"     element={<SGPAPage />} />
            <Route path="/internal" element={<InternalMarksPage />} />
            <Route path="/pyqs"     element={<PYQsPage />} />

            <Route path="/quizzes" element={<TopicsPage />} />
            <Route path="/quizzes/:topicId" element={<QuizPage />} />
            <Route path="/quizzes/results" element={<ResultsPage />} />
            <Route path="/quizzes/leaderboard" element={<LeaderboardPage />} />
            <Route path="/quizzes/history" element={<HistoryPage />} />

            <Route path="/login"    element={<Navigate to="/" />} />
            <Route path="/register" element={<Navigate to="/" />} />
            <Route path="*"         element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    );
  }
  
  return (
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
      {/* Any protected route → redirect to login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default AppInner;

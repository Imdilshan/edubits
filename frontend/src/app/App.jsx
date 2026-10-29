import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HomePage from "../features/homepage/HomePage";
import OnboardingModal from "../features/onboarding/OnboardingModal";

const Navbar = lazy(() => import("../components/layout/Navbar"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const AuthCallback = lazy(() => import("../pages/AuthCallback"));
const TaskPage = lazy(() => import("../features/tasks/pages/TaskPage"));
const SGPAPage = lazy(() => import("../features/sgpa/pages/SGPAPage"));
const InternalMarksPage = lazy(() => import("../features/internalMarks/InternalMarksPage"));
const UGLifeTrackerPage = lazy(() => import("../features/ug-life-tracker/UGLifeTrackerPage"));
const AdminUpload = lazy(() => import("../pages/AdminUpload"));
const AdminRoute = lazy(() => import("../components/layout/AdminRoute"));

// Phase 3: Resources pages
const ResourcesPage = lazy(() => import("../features/resources/pages/ResourcesPage"));
const YearPage = lazy(() => import("../features/resources/pages/YearPage"));
const SubjectPage = lazy(() => import("../features/resources/pages/SubjectPage"));
const ResourcesLayout = lazy(() => import("../features/resources/ResourcesLayout"));

const TopicsPage = lazy(() => import("../features/quiz/pages/TopicsPage"));
const QuizPage = lazy(() => import("../features/quiz/pages/QuizPage"));
const ResultsPage = lazy(() => import("../features/quiz/pages/ResultsPage"));
const LeaderboardPage = lazy(() => import("../features/quiz/pages/LeaderboardPage"));
const HistoryPage = lazy(() => import("../features/quiz/pages/HistoryPage"));

// Phase 0: Viewer spike

const ProgrammingPage = lazy(() => import("../features/programming/pages/ProgrammingPage"));
const TopicProblemsPage = lazy(() => import("../features/programming/pages/TopicProblemsPage"));
const ProgrammingAdmin = lazy(() => import("../features/programming/pages/ProgrammingAdmin"));
const PeoplePage = lazy(() => import("../features/homepage/PeoplePage"));
const AboutPage = lazy(() => import("../features/about/AboutPage"));

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
      <Link to="/" aria-label="Edubits home" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontFamily: "var(--font-sans)",
        fontWeight: 800,
        fontSize: "1.4rem",
        color: "#78c99a",
        textDecoration: "none",
      }}>
        <img
          src="/images/favicon.png"
          alt="Edubits logo"
          width="28"
          height="28"
          style={{ objectFit: "contain" }}
        />
        Edubits
      </Link>
    </nav>
  );
}

function AppInner() {
  const { user, authReady, showOnboarding, setShowOnboarding } = useAuth();
  const location  = useLocation();
  const isHome    = location.pathname === "/";

  if (!authReady) return <div className="route-loader" aria-label="Loading session" />;

  if (user) {
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
              <Route path="/pyqs" element={<Navigate to="/resources" replace />} />

              {/* Phase 3: Resources */}
              <Route path="/resources" element={<ResourcesLayout />}>
                <Route index element={<ResourcesPage />} />
                <Route path=":year" element={<YearPage />} />
                <Route path=":year/:subject" element={<SubjectPage />} />
              </Route>

              <Route path="/admin-upload" element={<AdminRoute><AdminUpload /></AdminRoute>} />

              <Route path="/tracker" element={<UGLifeTrackerPage />} />
            

              <Route path="/quizzes" element={<TopicsPage />} />
              <Route path="/quizzes/:topicId" element={<QuizPage />} />
              <Route path="/quizzes/results" element={<ResultsPage />} />
              <Route path="/quizzes/leaderboard" element={<LeaderboardPage />} />
              <Route path="/quizzes/history" element={<HistoryPage />} />

              <Route path="/programming" element={<ProgrammingPage />} /> 
              <Route path="/programming/admin" element={<ProgrammingAdmin />} />
              <Route path="/programming/:topicId" element={<TopicProblemsPage />} />

              <Route path="/people" element={<PeoplePage />} />
              <Route path="/about" element={<AboutPage />} />

              <Route path="/login"    element={<Navigate to="/" />} />
              <Route path="/register" element={<Navigate to="/" />} />
              <Route path="*"         element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </div>
        {showOnboarding && <OnboardingModal isOpen={showOnboarding} onClose={setShowOnboarding} />}
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
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
}

export default AppInner;

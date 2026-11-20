import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authValue";
import HomePage from "../features/homepage/HomePage";
import OnboardingModal from "../features/onboarding/OnboardingModal";
import SiteFooterLogo from "../components/layout/SiteFooterLogo";

const Sidebar = lazy(() => import("../components/layout/Sidebar"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const AuthCallback = lazy(() => import("../pages/AuthCallback"));
const ToolDeck = lazy(() => import("../features/tool-deck/ToolDeck"));
const InternalMarksPage = lazy(() => import("../features/internalMarks/InternalMarksPage"));
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
const HistoryPage = lazy(() => import("../features/quiz/pages/HistoryPage"));

function AppInner() {
  const { user, authReady, showOnboarding, setShowOnboarding } = useAuth();
  const location  = useLocation();
  const isHome    = location.pathname === "/";
  const isAuthPage = ["/login", "/register", "/auth/callback"].includes(location.pathname);

  if (!authReady) return <div className="route-loader" aria-label="Loading session" />;

  if (user) {
    return (
      <div>
        <Suspense fallback={null}>
          <Sidebar />
        </Suspense>
        <div className={`app-content ${isHome || isAuthPage ? "" : "page"}`}>
          <Suspense fallback={<div className="route-loader" aria-label="Loading page" />}>
            <Routes>
              <Route path="/"         element={<HomePage />} />
              <Route path="/tasks"    element={<ToolDeck initialTab="todos" />} />
              <Route path="/deck"     element={<ToolDeck initialTab="todos" />} />
              <Route path="/sgpa"     element={<Navigate to="/tasks?tab=sgpa" replace />} />
              <Route path="/cgpa"     element={<Navigate to="/tasks?tab=cgpa" replace />} />
              <Route path="/internal" element={<Navigate to="/tasks?tab=internals" replace />} />
              <Route path="/internals" element={<Navigate to="/tasks?tab=internals" replace />} />
              <Route path="/pyqs" element={<Navigate to="/resources" replace />} />

              {/* Phase 3: Resources */}
              <Route path="/resources" element={<ResourcesLayout />}>
                <Route index element={<ResourcesPage />} />
                <Route path=":year" element={<YearPage />} />
                <Route path=":year/:subject" element={<SubjectPage />} />
              </Route>

              <Route path="/admin-upload" element={<AdminRoute><AdminUpload /></AdminRoute>} />

              <Route path="/tracker" element={<Navigate to="/tasks" replace />} />

              <Route path="/quizzes" element={<TopicsPage />} />
              <Route path="/quizzes/:topicId" element={<QuizPage />} />
              <Route path="/quizzes/results" element={<ResultsPage />} />
              <Route path="/quizzes/history" element={<HistoryPage />} />

              <Route path="/about" element={<Navigate to="/" replace />} />

              <Route path="/login"    element={<Navigate to="/" />} />
              <Route path="/register" element={<Navigate to="/" />} />
              <Route path="*"         element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
          {!isHome && <SiteFooterLogo />}
        </div>
        {showOnboarding && <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />}
      </div>
    );
  }
  
  return (
    <div>
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>
      <div className={`app-content ${isHome || isAuthPage ? "" : "page"}`}>
        <Suspense fallback={<div className="route-loader" aria-label="Loading page" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Suspense>
        {!isHome && !isAuthPage && <SiteFooterLogo />}
      </div>
    </div>
  );
}

export default AppInner;

import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authValue";
import DesignedAtSymbol from "./DesignedAtSymbol";
import SmoothDrawer from "./SmoothDrawer";
import { WarmTooltip } from "../ui/WarmTooltip";
import {
  Home,
  BookOpen,
  Brain,
  Calculator,
  Info,
  ListTodo,
  Monitor,
  Settings,
  LogOut,
  Moon as MoonIcon,
  Sun as SunIcon,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import "./sidebar.css";

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("preferences");

  const [isMobileHidden, setIsMobileHidden] = useState(() => {
    return typeof window !== "undefined" && window.innerWidth < 768;
  });

  const prevWidthRef = useRef(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  // Sync and protect sidebar state across viewport / screen size changes
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const wasMobile = prevWidthRef.current < 768;
      const isMobile = currentWidth < 768;
      prevWidthRef.current = currentWidth;

      if (!isMobile) {
        // Desktop always shows sidebar
        setIsMobileHidden(false);
        setIsExpanded(false);
      } else if (!wasMobile && isMobile) {
        // Transitioning from desktop to mobile: hide sidebar by default so it doesn't block content
        setIsMobileHidden(true);
        setIsExpanded(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Always keep body in dark mode (light mode disabled, coming soon)
  useEffect(() => {
    document.body.classList.remove("light");
    try {
      localStorage.setItem("theme", JSON.stringify(true));
    } catch (e) {
      console.warn("Could not save theme preference:", e);
    }
  }, []);

  // Swipe to show / hide sidebar on mobile only
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (window.innerWidth < 768) {
          if (deltaX > 0) {
            setIsMobileHidden(false); // Swipe Right -> Show
          } else {
            setIsMobileHidden(true); // Swipe Left -> Hide
          }
        }
      }
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const handleMouseEnter = () => {
    if (!isSettingsOpen) setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
  };

  const [activeLandingSection, setActiveLandingSection] = useState("top");

  const menuItems = user
    ? [
        { id: "home", path: "/", icon: Home, label: "Home" },
        { id: "resources", path: "/resources", icon: BookOpen, label: "Resources" },
        { id: "quizzes", path: "/quizzes", icon: Brain, label: "QuizEngine" },
        { id: "tasks", path: "/tasks", icon: ListTodo, label: "Tool Deck" },
        ...(user?.role === "admin"
          ? [{ id: "admin", path: "/admin-upload", icon: Monitor, label: "Admin" }]
          : []),
      ]
    : [
        { id: "home", path: "/", scrollTo: "top", icon: Home, label: "Home" },
        { id: "resources", path: "/", scrollTo: "resources", icon: BookOpen, label: "Resources" },
        { id: "quiz", path: "/", scrollTo: "quiz", icon: Brain, label: "QuizEngine" },
        { id: "calculators", path: "/", scrollTo: "calculators", icon: Calculator, label: "Calculators" },
        { id: "about", path: "/", scrollTo: "about", icon: Info, label: "About" },
      ];

  const handleMenuClick = (item) => {
    if (item.scrollTo) {
      setActiveLandingSection(item.scrollTo);
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          if (item.scrollTo === "top") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            document.getElementById(item.scrollTo)?.scrollIntoView({ behavior: "smooth" });
          }
        }, 120);
      } else if (item.scrollTo === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.getElementById(item.scrollTo)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(item.path);
    }
    if (window.innerWidth < 768) setIsMobileHidden(true);
  };

  const isItemActive = (item) => {
    if (!user && item.scrollTo) {
      return location.pathname === "/" && activeLandingSection === item.scrollTo;
    }
    if (item.path === "/") return location.pathname === "/";
    return location.pathname.startsWith(item.path);
  };

  const userInitial = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();
  const userRole = (user?.role || "student").charAt(0).toUpperCase();
  const userName = user?.name || user?.email?.split("@")[0] || "User";

  return (
    <>
      <aside
        className={`sidebar ${isExpanded ? "expanded" : ""} ${isMobileHidden ? "is-mobile-hidden" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Sidebar Navigation"
      >
        {/* THEME TOGGLE (DISABLED - LIGHT MODE COMING SOON) */}
        <div className="sidebar-toggle-wrapper">
          <span className="sidebar-toggle-label">THEME</span>
          <div>
            <WarmTooltip content="Light mode coming soon" side="right" delay={100}>
              <div className="sidebar-theme-switch-wrapper">
                <button
                  type="button"
                  disabled
                  className="sidebar-theme-switch dark disabled"
                  aria-label="Light mode coming soon"
                  title="Light mode coming soon"
                >
                  <span className="sidebar-theme-slider" />
                  <div className="sidebar-theme-icon-container">
                    <MoonIcon
                      size={14}
                      className="sidebar-theme-icon moon-active"
                    />
                  </div>
                  <div className="sidebar-theme-icon-container">
                    <SunIcon
                      size={14}
                      className="sidebar-theme-icon sun-inactive"
                    />
                  </div>
                </button>
              </div>
            </WarmTooltip>
          </div>
        </div>

        {/* NAV MENU ITEMS */}
        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const active = isItemActive(item);
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className={`sidebar-icon ${active ? "active" : ""}`}
                onClick={() => handleMenuClick(item)}
                title={!isExpanded ? item.label : undefined}
                role="button"
                tabIndex={0}
              >
                <IconComponent size={21} style={{ minWidth: 21 }} />
                <span className="sidebar-text">{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* BOTTOM SECTION */}
        <div className="sidebar-bottom">
          {user && (
            <div
              className="sidebar-icon"
              onClick={() => {
                setSettingsTab("preferences");
                setIsSettingsOpen(true);
                setIsExpanded(false);
                if (window.innerWidth < 768) setIsMobileHidden(true);
              }}
              title={!isExpanded ? "Settings" : undefined}
              role="button"
              tabIndex={0}
            >
              <Settings size={21} style={{ minWidth: 21 }} />
              <span className="sidebar-text">Settings</span>
            </div>
          )}

          {user ? (
            <div
              className="sidebar-icon pfp-icon"
              onClick={() => {
                setSettingsTab("account");
                setIsSettingsOpen(true);
                setIsExpanded(false);
                if (window.innerWidth < 768) setIsMobileHidden(true);
              }}
              title={!isExpanded ? `${userName} (${user.email})` : undefined}
              role="button"
              tabIndex={0}
            >
              <div className="sidebar-avatar-wrapper">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={userName}
                    className="sidebar-avatar-img"
                  />
                ) : (
                  <div className="sidebar-avatar-fallback">
                    {userInitial}
                  </div>
                )}
                <div className="sidebar-role-badge">{userRole}</div>
              </div>

              <div className="sidebar-text sidebar-profile-info">
                <span className="sidebar-profile-name">
                  <span className="sidebar-profile-role-tag">{userRole}</span>
                  <DesignedAtSymbol size={13} />
                  {userName}
                </span>
                <span className="sidebar-profile-email">{user.email}</span>
              </div>
            </div>
          ) : (
            <div
              className="sidebar-icon sidebar-add-account"
              onClick={() => navigate("/login")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate("/login");
                }
              }}
              title={!isExpanded ? "Log in to Edubits" : undefined}
              role="button"
              tabIndex={0}
            >
              <img
                src="/images/favicon.png"
                alt="Edubits"
                className="sidebar-brand-logo-img"
              />
              <span className="sidebar-text">Log in</span>
            </div>
          )}

          {user && (
            <div
              className="sidebar-icon sidebar-signout-btn"
              onClick={() => {
                setSettingsTab("account");
                setIsSettingsOpen(true);
                setIsExpanded(false);
                if (window.innerWidth < 768) setIsMobileHidden(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSettingsTab("account");
                  setIsSettingsOpen(true);
                  setIsExpanded(false);
                  if (window.innerWidth < 768) setIsMobileHidden(true);
                }
              }}
              title={!isExpanded ? "Log out (Settings)" : undefined}
              role="button"
              tabIndex={0}
            >
              <LogOut size={20} style={{ minWidth: 20 }} />
              <span className="sidebar-text">Sign out</span>
            </div>
          )}

          {/* Mobile Hide Button */}
          <div className="sidebar-mobile-hide-btn close-sidebar-button">
            <button
              type="button"
              onClick={() => setIsMobileHidden(true)}
              className="sidebar-icon close-sidebar-button"
              style={{
                justifyContent: "center",
                paddingLeft: 0,
                height: 38,
                width: "100%",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              title="Hide Sidebar"
              aria-label="Hide Sidebar"
            >
              <ChevronsLeft size={21} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Floating Show Button */}
      {isMobileHidden && (
        <button
          type="button"
          onClick={() => setIsMobileHidden(false)}
          className="sidebar-mobile-show-btn"
          aria-label="Open Navigation Sidebar"
        >
          <ChevronsRight size={22} strokeWidth={2.3} />
        </button>
      )}

      {/* Bottom Settings & Feature Management Drawer */}
      <SmoothDrawer
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        activeTab={settingsTab}
        onTabChange={setSettingsTab}
      />
    </>
  );
}

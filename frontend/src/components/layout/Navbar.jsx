import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import "./navbar.css";

import EditProfileModal from "./EditProfileModal";

import {
  LogOut, Pencil, Image,
  Calculator, ClipboardList, CheckSquare, BookOpen, Brain, BookMarked, Info,
} from "lucide-react";

export default function Navbar() {
  const { user, setUser, logout, token } = useAuth();

  const [preview,         setPreview]         = useState(null);
  const [uploading,       setUploading]       = useState(false);
  const [open,            setOpen]            = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const navigate    = useNavigate();
  const location    = useLocation();
  const dropdownRef = useRef();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogout = () => { logout(); navigate("/"); };

  // ── Avatar upload ────────────────────────────────────────────────────────────
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert("Only JPG/PNG images allowed"); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB"); return;
    }

    // Optimistic preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      const res  = await fetch(`${API_URL}/auth/upload-avatar`, {
        method: "POST",
        body:   formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Upload failed");
        setPreview(null);
        return;
      }

      const data = await res.json();
      // Update context + localStorage so avatar persists on refresh
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setPreview(null); // switch to real URL from server

    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  // ── Close dropdown on outside click ─────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const isActive     = (path) => location.pathname === path;
  const isQuizActive = ()     => location.pathname.startsWith("/quizzes");

  const avatarSrc = preview || user?.avatar || "/images/default-avatar.jpg";

  return (
    <>
      {/* ── TOP BAR: always visible — logo (left) + profile (right) ── */}
      <nav className="navbar">

        {/* Logo */}
        <div className="nav-left">
          <Link to="/" className="logo">
            <img src="/images/logo.webp" alt="logo" className="logo-icon" width="28" height="28" />
            <span>Edubits</span>
          </Link>
        </div>

        {/* Desktop nav links — hidden on mobile */}
        <div className="nav-center desktop-nav">
          <Link to="/sgpa"     className={`nav-link ${isActive("/sgpa")     ? "active" : ""}`}>SGPA</Link>
          <Link to="/internal" className={`nav-link ${isActive("/internal") ? "active" : ""}`}>Internals</Link>
          <Link to="/tasks"    className={`nav-link ${isActive("/tasks")    ? "active" : ""}`}>Tasks</Link>
          <Link to="/pyqs"     className={`nav-link ${isActive("/pyqs")     ? "active" : ""}`}>Resources</Link>
          <Link to="/quizzes"  className={`nav-link ${isQuizActive()        ? "active" : ""}`}>QuizEngine</Link>
          <Link to="/tracker"  className={`nav-link ${isActive("/tracker") ? "active" : ""}`}>Tracker</Link>
          <Link to="/about"    className={`nav-link ${isActive("/about")   ? "active" : ""}`}>About</Link>
        </div>

        {/* Profile avatar + dropdown */}
        <div className="nav-right" ref={dropdownRef}>
          <div className="profile" onClick={() => setOpen(!open)}>
            <img key={avatarSrc} src={avatarSrc} alt="avatar" className="nav-avatar" />
          </div>

          {open && (
            <div className="dropdown">
              {/* User info */}
              <div className="dropdown-user">
                <img src={avatarSrc} alt="avatar" className="avatar" />
                <div>
                  <p className="name">{user?.name  || "User"}</p>
                  <p className="email">{user?.email || "No email"}</p>
                </div>
              </div>

              <div className="dropdown-divider" />

              {/* Edit Profile — opens modal */}
              <button
                className="dropdown-item"
                onClick={() => { setOpen(false); setShowEditProfile(true); }}
              >
                <Pencil size={14} /> Edit Profile
              </button>

              {/* Change Avatar */}
              <label className="dropdown-item" style={{ cursor: "pointer" }}>
                <Image size={14} />
                {uploading ? "Uploading..." : "Change Avatar"}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  hidden
                  disabled={uploading}
                  onChange={(e) => { setOpen(false); handleImageChange(e); }}
                />
              </label>

              {/* Logout */}
              <button className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── BOTTOM NAV: mobile only ── */}
      <nav className="mobile-bottom-nav">
        <Link to="/sgpa"     className={`mobile-nav-item ${isActive("/sgpa")     ? "active" : ""}`}>
          <Calculator size={20} /><span>SGPA</span>
        </Link>
        <Link to="/internal" className={`mobile-nav-item ${isActive("/internal") ? "active" : ""}`}>
          <ClipboardList size={20} /><span>Internals</span>
        </Link>
        <Link to="/tasks"    className={`mobile-nav-item ${isActive("/tasks")    ? "active" : ""}`}>
          <CheckSquare size={20} /><span>Tasks</span>
        </Link>
        <Link to="/pyqs"     className={`mobile-nav-item ${isActive("/pyqs")     ? "active" : ""}`}>
          <BookOpen size={20} /><span>Resources</span>
        </Link>
        <Link to="/quizzes"  className={`mobile-nav-item ${isQuizActive()        ? "active" : ""}`}>
          <Brain size={20} /><span>Quiz</span>
        </Link>
        <Link to="/tracker" className={`mobile-nav-item ${isActive("/tracker") ? "active" : ""}`}>
          <BookMarked size={20} /> <span>Tracker</span>
        </Link>
        <Link to="/about" className={`mobile-nav-item ${isActive("/about") ? "active" : ""}`}>
          <Info size={20} /> <span>About</span>
        </Link>
      </nav>

      {/* ── Edit Profile Modal ── */}
      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}
    </>
  );
}

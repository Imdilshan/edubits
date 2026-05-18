import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import "./navbar.css";

import {
  LogOut,
  Pencil,
  Image,
  Calculator,
  ClipboardList,
  CheckSquare,
  BookOpen,
  Brain,
} from "lucide-react";
import {
  House,
} from "lucide-react";

export default function Navbar() {
  const { user, setUser, logout, token } = useAuth();

  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG/PNG images allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);

      const res = await fetch(`${API_URL}/auth/upload-avatar`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      setPreview(null);

    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const isActive = (path) => location.pathname === path;

  const avatarSrc =
    preview ||
    user?.avatar ||
    "/images/default-avatar.jpg";

  return (
    <nav className="navbar">

      <div className="nav-left">
        <Link to="/" className="logo">
          <img src="/images/logo.png" alt="logo" className="logo-icon" />
          <span>Edubits</span>
        </Link>
      </div>

      {/* <div className="nav-center"> */}
      <div className="nav-center desktop-nav">
        <Link to="/sgpa" className={`nav-link ${isActive("/sgpa") ? "active" : ""}`}>
          SGPA
        </Link>
        <Link to="/internal" className={`nav-link ${isActive("/internal") ? "active" : ""}`}>
          Internals
        </Link>
        <Link to="/tasks" className={`nav-link ${isActive("/tasks") ? "active" : ""}`}>
          Tasks
        </Link>
        <Link to="/pyqs" className={`nav-link ${isActive("/pyqs") ? "active" : ""}`}>
          Resources
        </Link>

        <Link
          to="/quizzes"
          className={`nav-link ${location.pathname.startsWith("/quizzes") ? "active" : ""}`}
        >
          QuizEngine
        </Link>
      </div>

      <div className="nav-right" ref={dropdownRef}>

        <div className="profile" onClick={() => setOpen(!open)}>
          <img
            key={avatarSrc}
            src={avatarSrc}
            alt="avatar"
            className="nav-avatar"
          />
        </div>

        {open && (
          <div className="dropdown">

            <div className="dropdown-user">
              <img src={avatarSrc} alt="avatar" className="avatar" />
              <div>
                <p className="name">{user?.name || "User"}</p>
                <p className="email">{user?.email || "No email"}</p>
              </div>
            </div>

            <div className="dropdown-divider" />

            <button className="dropdown-item">
              <Pencil size={14} />
              Edit Profile
            </button>

            <label className="dropdown-item">
              <Image size={14} />
              {uploading ? "Uploading..." : "Change Avatar"}
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                hidden
                disabled={uploading}
                onChange={handleImageChange}
              />
            </label>

            <button className="dropdown-item logout" onClick={handleLogout}>
              <LogOut size={14} />
              Logout
            </button>

          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">

        <Link to="/sgpa" className={`mobile-nav-item ${isActive("/sgpa") ? "active" : ""}`}>
          <Calculator size={20} />
          <span>SGPA</span>
        </Link>

        <Link to="/internal" className={`mobile-nav-item ${isActive("/internal") ? "active" : ""}`}>
          <ClipboardList size={20} />
          <span>Internals</span>
        </Link>

        <Link to="/tasks" className={`mobile-nav-item ${isActive("/tasks") ? "active" : ""}`}>
          <CheckSquare size={20} />
          <span>Tasks</span>
        </Link>

        <Link to="/pyqs" className={`mobile-nav-item ${isActive("/pyqs") ? "active" : ""}`}>
          <BookOpen size={20} />
          <span>Resources</span>
        </Link>

        <Link
          to="/quizzes"
          className={`mobile-nav-item ${
            location.pathname.startsWith("/quizzes") ? "active" : ""
          }`}
        >
          <Brain size={20} />
          <span>Quiz</span>
        </Link>

      </div>
    </nav>
  );
}

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Pencil, Image } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import "./navbar.css";

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

  // 🔥 Upload avatar
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

    // Preview instantly
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

      // Update user globally
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Remove preview → use real Cloudinary URL
      setPreview(null);

    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  // 🔥 Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 🔥 Clean preview memory (important)
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const isActive = (path) => location.pathname === path;

  // 🔥 Single source of truth
  const avatarSrc =
    preview ||
    user?.avatar ||
    "/images/default-avatar.jpg";

  return (
    <nav className="navbar">

      {/* LEFT */}
      <div className="nav-left">
        <Link to="/" className="logo">
          <img src="/images/logo.png" alt="logo" className="logo-icon" />
          <span>Edubits</span>
        </Link>
      </div>

      {/* CENTER */}
      <div className="nav-center">
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
      </div>

      {/* RIGHT */}
      <div className="nav-right" ref={dropdownRef}>

        {/* Profile Avatar */}
        <div className="profile" onClick={() => setOpen(!open)}>
          <img
            key={avatarSrc}
            src={avatarSrc}
            alt="avatar"
            className="nav-avatar"
          />
        </div>

        {/* Dropdown */}
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
    </nav>
  );
}

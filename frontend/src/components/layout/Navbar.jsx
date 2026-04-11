import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const handleLogout = () => { logout(); navigate("/"); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="logo" style={{ textDecoration: "none" }}>Edubits</Link>
      <div className="nav-actions">
        <Link to="/tasks"    className={`nav-btn ${isActive("/tasks")    ? "active" : ""}`}>Tasks</Link>
        <Link to="/sgpa"     className={`nav-btn ${isActive("/sgpa")     ? "active" : ""}`}>GPA</Link>
        <Link to="/internal" className={`nav-btn ${isActive("/internal") ? "active" : ""}`}>IMC</Link>
        <Link to="/pyqs"     className={`nav-btn ${isActive("/pyqs")     ? "active" : ""}`}>PYQs</Link>
        <button
          className="nav-btn"
          onClick={handleLogout}
          style={{ "--hover-color": "var(--danger)", "--hover-bg": "rgba(239,68,68,0.08)" }}
          onMouseEnter={e => { e.target.style.color = "var(--danger)"; e.target.style.background = "rgba(239,68,68,0.08)"; e.target.style.borderColor = "rgba(239,68,68,0.2)"; }}
          onMouseLeave={e => { e.target.style.color = ""; e.target.style.background = ""; e.target.style.borderColor = ""; }}
        >Logout</button>
      </div>
    </nav>
  );
}

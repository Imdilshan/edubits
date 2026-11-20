import React, { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/authValue";
import { API_URL } from "../../config/api";
import {
  Settings,
  X,
  Moon,
  Sun,
  User,
  LogOut,
  GraduationCap,
  BookOpen,
  Brain,
  Calendar as CalendarIcon,
  ListTodo,
  Sparkles,
  Camera,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Download,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import "./smoothDrawer.css";

export default function SmoothDrawer({
  open,
  onOpenChange,
  activeTab = "preferences",
  onTabChange,
}) {
  const { user, setUser, logout, setShowOnboarding } = useAuth();
  const navigate = useNavigate();

  // Active sub-tab
  const [tab, setTab] = useState(activeTab);

  useEffect(() => {
    if (activeTab) setTab(activeTab);
  }, [activeTab]);

  // Account form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Deletion state
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Local feature stats
  const [sgpaCount, setSgpaCount] = useState(0);
  const [hasUgTrackerData, setHasUgTrackerData] = useState(false);
  const [toolDeckPref, setToolDeckPref] = useState(() => {
    try {
      return localStorage.getItem("edubits_tool_deck_preference") || "todos";
    } catch {
      return "todos";
    }
  });

  const handleToolDeckPrefChange = (val) => {
    setToolDeckPref(val);
    try {
      localStorage.setItem("edubits_tool_deck_preference", val);
      const labels = { todos: "Todos", notes: "Notes", sgpa: "SGPA", cgpa: "CGPA" };
      showToast("success", `Default Tool Deck tab set to ${labels[val] || val}`);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
    try {
      const savedSgpa = localStorage.getItem("sgpaList");
      setSgpaCount(savedSgpa ? JSON.parse(savedSgpa).length : 0);

      const savedTracker = localStorage.getItem("edubits_ugTracker_v1");
      setHasUgTrackerData(Boolean(savedTracker));
    } catch {
      setSgpaCount(0);
      setHasUgTrackerData(false);
    }
  }, [user, open]);

  const showToast = (type, msg) => {
    if (type === "success") toast.success(msg);
    else if (type === "error") toast.error(msg);
    else toast.info(msg);
  };

  const handleUpdateProfile = async (e) => {
    e?.preventDefault();
    if (name.trim().length < 2) return showToast("error", "Name must be at least 2 characters");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast("error", "Enter a valid email address");

    if (newPassword) {
      if (newPassword.length < 12) return showToast("error", "New password must be at least 12 characters");
      if (newPassword !== confirmPassword) return showToast("error", "New passwords do not match");
      if (!currentPassword) return showToast("error", "Enter your current password to set a new one");
    }

    try {
      setLoading(true);
      const body = { name: name.trim(), email: email.trim() };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Update failed");
        return;
      }

      setUser(data.user);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("success", "Profile updated successfully!");
    } catch {
      showToast("error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      return showToast("error", "Only JPG/PNG images allowed");
    }
    if (file.size > 2 * 1024 * 1024) {
      return showToast("error", "Image size should be less than 2MB");
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setAvatarUploading(true);
      const res = await fetch(`${API_URL}/auth/upload-avatar`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        return showToast("error", err.message || "Upload failed");
      }

      const data = await res.json();
      setUser(data.user);
      showToast("success", "Avatar updated successfully!");
    } catch {
      showToast("error", "Avatar upload failed. Please try again.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmEmail.trim() !== user?.email) {
      return showToast("error", "Type your exact email to confirm deletion");
    }

    try {
      setDeleting(true);
      const res = await fetch(`${API_URL}/auth/account`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail: confirmEmail.trim(), currentPassword: deletePassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Could not delete account");
        return;
      }

      ["edubits_ugTracker_v1", "sgpaList"].forEach((k) => localStorage.removeItem(k));
      logout();
      onOpenChange(false);
      navigate("/");
    } catch {
      showToast("error", "Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleClearSgpa = () => {
    if (window.confirm("Are you sure you want to clear your saved SGPA semesters?")) {
      localStorage.removeItem("sgpaList");
      setSgpaCount(0);
      showToast("success", "Saved SGPA/CGPA semesters cleared.");
    }
  };

  const handleClearUgTracker = () => {
    if (window.confirm("Are you sure you want to reset your UG Life Tracker journal?")) {
      localStorage.removeItem("edubits_ugTracker_v1");
      setHasUgTrackerData(false);
      showToast("success", "UG Life Tracker data reset.");
    }
  };

  const handleExportUgTracker = () => {
    try {
      const data = localStorage.getItem("edubits_ugTracker_v1");
      if (!data) return showToast("error", "No UG Life Tracker data to export.");

      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edubits-ug-life-tracker-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("success", "Export downloaded!");
    } catch {
      showToast("error", "Could not export data.");
    }
  };

  const handleRestartOnboarding = () => {
    onOpenChange(false);
    setShowOnboarding(true);
  };

  const handleLogout = () => {
    logout();
    onOpenChange(false);
    showToast("success", "Logged out successfully");
    navigate("/");
  };

  const tabs = [
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "account", label: "Account", icon: User },
    { id: "academics", label: "Academics & GPA", icon: GraduationCap },
    { id: "resources", label: "Study Resources", icon: BookOpen },
    { id: "quizzes", label: "QuizEngine", icon: Brain },
    { id: "tracker", label: "Life & Tasks", icon: CalendarIcon },
  ];

  const handleTabSelect = (tabId) => {
    setTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  return (
    <Drawer.Root shouldScaleBackground open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="smooth-drawer-overlay" />
        <Drawer.Content className="smooth-drawer-content">
          <div className="sr-only">
            <Drawer.Title>Settings & Feature Controls</Drawer.Title>
            <Drawer.Description>Manage your Edubits account, grades, and preferences</Drawer.Description>
          </div>

          <div className="smooth-drawer-handle" />

          <div className="smooth-drawer-body">
            {/* LEFT TABS NAV */}
            <nav className="smooth-drawer-nav" aria-label="Settings Categories">
              <h2 className="smooth-drawer-nav-title">Management</h2>
              {tabs.map((t) => {
                const IconComponent = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTabSelect(t.id)}
                    className={`smooth-drawer-tab-btn ${tab === t.id ? "active" : ""}`}
                    aria-label={t.label}
                    title={t.label}
                  >
                    <IconComponent size={17} />
                    <span>{t.label}</span>
                  </button>
                );
              })}

              <div className="smooth-drawer-nav-footer">
                {user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="smooth-drawer-logout-btn"
                    aria-label="Log Out"
                    title="Log Out"
                  >
                    <LogOut size={17} />
                    <span>Log Out</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      navigate("/login");
                    }}
                    className="smooth-drawer-tab-btn"
                    style={{ color: "var(--primary)" }}
                    aria-label="Sign In"
                    title="Sign In"
                  >
                    <User size={17} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </nav>

            {/* RIGHT CONTENT PANEL */}
            <main className="smooth-drawer-main">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="smooth-drawer-close"
                aria-label="Close settings drawer"
              >
                <X size={20} />
              </button>

              {/* 1. PREFERENCES */}
              {tab === "preferences" && (
                <div>
                  <header className="smooth-drawer-header">
                    <h3 className="smooth-drawer-title">Preferences</h3>
                    <p className="smooth-drawer-subtitle">Manage appearance and tutorial settings.</p>
                  </header>

                  <div className="smooth-drawer-card">
                    <div className="smooth-drawer-card-info">
                      <div className="smooth-drawer-card-icon">
                        <Moon size={18} />
                      </div>
                      <div className="smooth-drawer-card-text">
                        <h4>Theme Mode</h4>
                        <p>Dark Mode (Default)</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled
                      title="Light mode coming soon"
                      className="smooth-drawer-btn"
                      style={{ opacity: 0.6, cursor: "not-allowed" }}
                    >
                      Light mode coming soon
                    </button>
                  </div>

                  <div className="smooth-drawer-card">
                    <div className="smooth-drawer-card-info">
                      <div className="smooth-drawer-card-icon">
                        <ListTodo size={18} />
                      </div>
                      <div className="smooth-drawer-card-text">
                        <h4>Tool Deck Default</h4>
                        <p>Default view when opening the unified Tool Deck.</p>
                      </div>
                    </div>
                    <select
                      value={toolDeckPref}
                      onChange={(e) => handleToolDeckPrefChange(e.target.value)}
                      className="smooth-drawer-input"
                      style={{ maxWidth: 140, padding: "8px 12px", fontSize: 13, cursor: "pointer" }}
                    >
                      <option value="todos">Todos</option>
                      <option value="notes">Notes</option>
                      <option value="sgpa">SGPA Calculator</option>
                      <option value="cgpa">CGPA Calculator</option>
                    </select>
                  </div>

                  <div className="smooth-drawer-card">
                    <div className="smooth-drawer-card-info">
                      <div className="smooth-drawer-card-icon">
                        <Sparkles size={18} />
                      </div>
                      <div className="smooth-drawer-card-text">
                        <h4>Restart Onboarding</h4>
                        <p>Launch the interactive guide to explore all academic tools.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRestartOnboarding}
                      className="smooth-drawer-btn primary"
                    >
                      Restart Guide
                    </button>
                  </div>
                </div>
              )}

              {/* 2. ACCOUNT */}
              {tab === "account" && (
                <div>
                  <header className="smooth-drawer-header">
                    <h3 className="smooth-drawer-title">Account & Security</h3>
                    <p className="smooth-drawer-subtitle">Manage your personal profile, credentials, and avatar.</p>
                  </header>

                  {user && (
                    <div className="smooth-drawer-card smooth-drawer-session-card" style={{ marginBottom: 20 }}>
                      <div className="smooth-drawer-card-info">
                        <div
                          className="smooth-drawer-card-icon"
                          style={{
                            color: "var(--danger, #ef4444)",
                            background: "rgba(239, 68, 68, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                          }}
                        >
                          <LogOut size={18} />
                        </div>
                        <div className="smooth-drawer-card-text">
                          <h4>Active Session</h4>
                          <p>Signed in as <strong>{user.email}</strong></p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="smooth-drawer-btn"
                        style={{
                          color: "#ef4444",
                          borderColor: "rgba(239, 68, 68, 0.35)",
                          background: "rgba(239, 68, 68, 0.08)",
                          fontWeight: 600,
                          gap: 7,
                          padding: "8px 16px",
                          cursor: "pointer",
                        }}
                      >
                        <LogOut size={14} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}

                  {user ? (
                    <form onSubmit={handleUpdateProfile}>
                      {/* Avatar Row */}
                      <div className="smooth-drawer-card" style={{ marginBottom: 20 }}>
                        <div className="smooth-drawer-card-info">
                          <img
                            src={user.avatar || "/images/default-avatar.jpg"}
                            alt={user.name || "Avatar"}
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid var(--border)",
                            }}
                          />
                          <div className="smooth-drawer-card-text">
                            <h4>Profile Avatar</h4>
                            <p>Upload a PNG or JPG photo under 2MB.</p>
                          </div>
                        </div>
                        <label className="smooth-drawer-btn" style={{ cursor: "pointer" }}>
                          <Camera size={14} />
                          <span>{avatarUploading ? "Uploading..." : "Change Photo"}</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            hidden
                            disabled={avatarUploading}
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </div>

                      <div className="smooth-drawer-group">
                        <label className="smooth-drawer-label">Display Name</label>
                        <input
                          className="smooth-drawer-input"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name"
                          required
                        />
                      </div>

                      <div className="smooth-drawer-group">
                        <label className="smooth-drawer-label">Email Address</label>
                        <input
                          className="smooth-drawer-input"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                        />
                      </div>

                      <div style={{ margin: "24px 0 14px", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 10px", color: "var(--text)" }}>
                          Change Password <span style={{ fontWeight: 400, color: "var(--muted)" }}>(Optional)</span>
                        </h4>

                        <div className="smooth-drawer-group">
                          <label className="smooth-drawer-label">Current Password</label>
                          <div style={{ position: "relative" }}>
                            <input
                              className="smooth-drawer-input"
                              type={showCurrent ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Required only to set new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrent(!showCurrent)}
                              style={{ position: "absolute", right: 10, top: 10, background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
                            >
                              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>

                        <div className="smooth-drawer-group">
                          <label className="smooth-drawer-label">New Password</label>
                          <div style={{ position: "relative" }}>
                            <input
                              className="smooth-drawer-input"
                              type={showNew ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Minimum 12 characters"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNew(!showNew)}
                              style={{ position: "absolute", right: 10, top: 10, background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
                            >
                              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>

                        <div className="smooth-drawer-group">
                          <label className="smooth-drawer-label">Confirm New Password</label>
                          <div style={{ position: "relative" }}>
                            <input
                              className="smooth-drawer-input"
                              type={showConfirm ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Repeat new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm(!showConfirm)}
                              style={{ position: "absolute", right: 10, top: 10, background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
                            >
                              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                        <button type="submit" disabled={loading} className="smooth-drawer-btn primary">
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>

                      {/* Delete Account */}
                      <div style={{ marginTop: 32, borderTop: "1px solid rgba(229, 72, 77, 0.2)", paddingTop: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--danger)", marginBottom: 6 }}>
                          <ShieldAlert size={18} />
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Danger Zone</h4>
                        </div>
                        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 14px" }}>
                          Permanently delete your account, quiz attempts, and saved preferences.
                        </p>

                        <div className="smooth-drawer-group">
                          <label className="smooth-drawer-label">Type your email to confirm</label>
                          <input
                            className="smooth-drawer-input"
                            type="email"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            placeholder={user.email}
                          />
                        </div>

                        <div className="smooth-drawer-group">
                          <label className="smooth-drawer-label">Current password</label>
                          <input
                            className="smooth-drawer-input"
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleDeleteAccount}
                          disabled={deleting || confirmEmail !== user.email}
                          className="smooth-drawer-btn danger"
                        >
                          {deleting ? "Deleting..." : "Permanently Delete Account"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="smooth-drawer-card" style={{ justifyContent: "center", padding: 30, textAlign: "center" }}>
                      <div>
                        <p style={{ margin: "0 0 14px", color: "var(--muted)" }}>Sign in to manage your account and profile settings.</p>
                        <button
                          type="button"
                          onClick={() => {
                            onOpenChange(false);
                            navigate("/login");
                          }}
                          className="smooth-drawer-btn primary"
                        >
                          Sign In / Register
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. ACADEMICS & GPA */}
              {tab === "academics" && (
                <div>
                  <header className="smooth-drawer-header">
                    <h3 className="smooth-drawer-title">Academics & Grade Tools</h3>
                    <p className="smooth-drawer-subtitle">Manage saved SGPA semesters and university evaluation settings.</p>
                  </header>

                  <div className="smooth-drawer-card">
                    <div className="smooth-drawer-card-info">
                      <div className="smooth-drawer-card-icon">
                        <GraduationCap size={18} />
                      </div>
                      <div className="smooth-drawer-card-text">
                        <h4>Saved Semesters</h4>
                        <p>{sgpaCount > 0 ? `${sgpaCount} semester(s) saved in local storage.` : "No semesters recorded yet."}</p>
                      </div>
                    </div>
                    {sgpaCount > 0 ? (
                      <button type="button" onClick={handleClearSgpa} className="smooth-drawer-btn danger">
                        <Trash2 size={14} /> Clear Semesters
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenChange(false);
                          navigate("/sgpa");
                        }}
                        className="smooth-drawer-btn"
                      >
                        Calculate Now
                      </button>
                    )}
                  </div>

                  <div className="smooth-drawer-card">
                    <div className="smooth-drawer-card-info">
                      <div className="smooth-drawer-card-icon">
                        <ExternalLink size={18} />
                      </div>
                      <div className="smooth-drawer-card-text">
                        <h4>Internal Marks Calculator</h4>
                        <p>Calculate internal marks for BE CSE & AIT with mid-term and lab splits.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        navigate("/tasks?tab=internals");
                      }}
                      className="smooth-drawer-btn primary"
                    >
                      Open Internals
                    </button>
                  </div>
                </div>
              )}

              {/* 4. STUDY RESOURCES */}
              {tab === "resources" && (
                <div>
                  <header className="smooth-drawer-header">
                    <h3 className="smooth-drawer-title">Study Resources</h3>
                    <p className="smooth-drawer-subtitle">Access previous year papers, playlists, and notes.</p>
                  </header>

                  <div className="smooth-drawer-card">
                    <div className="smooth-drawer-card-info">
                      <div className="smooth-drawer-card-icon">
                        <BookOpen size={18} />
                      </div>
                      <div className="smooth-drawer-card-text">
                        <h4>Resources Directory</h4>
                        <p>Explore question papers and solution pairs from 1st to 4th year.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        navigate("/resources");
                      }}
                      className="smooth-drawer-btn primary"
                    >
                      Browse All
                    </button>
                  </div>

                  {user?.role === "admin" && (
                    <div className="smooth-drawer-card" style={{ borderColor: "rgba(62, 155, 143, 0.4)" }}>
                      <div className="smooth-drawer-card-info">
                        <div className="smooth-drawer-card-icon" style={{ color: "var(--primary)" }}>
                          <ExternalLink size={18} />
                        </div>
                        <div className="smooth-drawer-card-text">
                          <h4>Admin Upload Portal</h4>
                          <p>Upload PYQ pairs, syllabus notes, and video playlists to Cloudinary.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onOpenChange(false);
                          navigate("/admin-upload");
                        }}
                        className="smooth-drawer-btn primary"
                      >
                        Admin Portal
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 5. QUIZENGINE */}
              {tab === "quizzes" && (
                <div>
                  <header className="smooth-drawer-header">
                    <h3 className="smooth-drawer-title">QuizEngine</h3>
                    <p className="smooth-drawer-subtitle">Practice for college viva, NPTEL, and review performance stats.</p>
                  </header>

                  <div className="smooth-drawer-card">
                    <div className="smooth-drawer-card-info">
                      <div className="smooth-drawer-card-icon">
                        <Brain size={18} />
                      </div>
                      <div className="smooth-drawer-card-text">
                        <h4>Total Practice Score</h4>
                        <p>{user?.totalScore ?? 0} points earned across all completed quizzes.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        navigate("/quizzes/leaderboard");
                      }}
                      className="smooth-drawer-btn"
                    >
                      Leaderboard
                    </button>
                  </div>

                  <div className="smooth-drawer-card">
                    <div className="smooth-drawer-card-info">
                      <div className="smooth-drawer-card-icon">
                        <ExternalLink size={18} />
                      </div>
                      <div className="smooth-drawer-card-text">
                        <h4>Quiz History & Records</h4>
                        <p>Review past attempts, pass/fail results, and answer breakdowns.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        navigate("/quizzes/history");
                      }}
                      className="smooth-drawer-btn primary"
                    >
                      View History
                    </button>
                  </div>
                </div>
              )}

              {/* 6. LIFE TRACKER & TASKS */}
              {tab === "tracker" && (
                <div>
                  <header className="smooth-drawer-header">
                    <h3 className="smooth-drawer-title">UG Life & Task Management</h3>
                    <p className="smooth-drawer-subtitle">Manage your 4-year undergraduate weekly journal and Kanban board.</p>
                  </header>

                  <div className="smooth-drawer-card">
                    <div className="smooth-drawer-card-info">
                      <div className="smooth-drawer-card-icon">
                        <CalendarIcon size={18} />
                      </div>
                      <div className="smooth-drawer-card-text">
                        <h4>UG Life Tracker Data</h4>
                        <p>{hasUgTrackerData ? "192-week calendar configured with weekly entries." : "No UG tracker records found."}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {hasUgTrackerData && (
                        <button type="button" onClick={handleExportUgTracker} className="smooth-drawer-btn" title="Export JSON">
                          <Download size={14} /> Export
                        </button>
                      )}
                      {hasUgTrackerData && (
                        <button type="button" onClick={handleClearUgTracker} className="smooth-drawer-btn danger" title="Clear">
                          <Trash2 size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          onOpenChange(false);
                          navigate("/tracker");
                        }}
                        className="smooth-drawer-btn primary"
                      >
                        Open Tracker
                      </button>
                    </div>
                  </div>

                  <div className="smooth-drawer-card">
                    <div className="smooth-drawer-card-info">
                      <div className="smooth-drawer-card-icon">
                        <ExternalLink size={18} />
                      </div>
                      <div className="smooth-drawer-card-text">
                        <h4>Task Tracker</h4>
                        <p>Keep track of college deadlines, assignments, and exam targets.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        navigate("/tasks");
                      }}
                      className="smooth-drawer-btn primary"
                    >
                      Open Tasks
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

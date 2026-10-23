import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";
import { X, User, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import "./editProfile.css";

export default function EditProfileModal({ onClose }) {
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState({
    name:            user?.name  || "",
    email:           user?.email || "",
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading,  setLoading]  = useState(false);
  const [toast,    setToast]    = useState(null);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (form.name.trim().length < 2)
      return showToast("error", "Name must be at least 2 characters");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return showToast("error", "Enter a valid email address");

    if (form.newPassword && form.newPassword !== form.confirmPassword)
      return showToast("error", "New passwords do not match");

    if (form.newPassword && form.newPassword.length < 6)
      return showToast("error", "New password must be at least 6 characters");

    if (form.newPassword && !form.currentPassword)
      return showToast("error", "Enter your current password to set a new one");

    try {
      setLoading(true);

      const body = {
        name:  form.name.trim(),
        email: form.email.trim(),
      };

      if (form.newPassword) {
        body.currentPassword = form.currentPassword;
        body.newPassword     = form.newPassword;
      }

      const res  = await fetch(`${API_URL}/auth/profile`, {
        method:  "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.error || "Something went wrong");
        return;
      }

      setUser(data.user);

      showToast("success", "Profile updated successfully!");

      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword:     "",
        confirmPassword: "",
      }));

    } catch (err) {
      showToast("error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmEmail.trim() !== user?.email) {
      return showToast("error", "Enter your account email to confirm deletion");
    }

    try {
      setDeleting(true);
      const res = await fetch(`${API_URL}/auth/account`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmEmail: confirmEmail.trim(), currentPassword: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Could not delete account");
        return;
      }

      ["edubits_ugTracker_v1", "edubits_pyq_progress", "edubits_local_pyqs"].forEach((key) => localStorage.removeItem(key));
      logout();
      onClose();
    } catch {
      showToast("error", "Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ep-overlay" onClick={onClose}>
      <div className="ep-modal" onClick={(e) => e.stopPropagation()}>

        <div className="ep-header">
          <h2 className="ep-title">Edit Profile</h2>
          <button className="ep-close" onClick={onClose}><X size={18} /></button>
        </div>

        {toast && (
          <div className={`ep-toast ep-toast-${toast.type}`}>
            {toast.type === "success"
              ? <CheckCircle size={15} />
              : <AlertCircle size={15} />}
            {toast.msg}
          </div>
        )}

        <div className="ep-group">
          <label className="ep-label"><User size={12} /> NAME</label>
          <input
            className="ep-input"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="ep-group">
          <label className="ep-label"><Mail size={12} /> EMAIL</label>
          <input
            className="ep-input"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="ep-divider">
          <span>Change Password <span className="ep-optional">(optional)</span></span>
        </div>

        <div className="ep-group">
          <label className="ep-label"><Lock size={12} /> CURRENT PASSWORD</label>
          <div className="ep-input-wrap">
            <input
              className="ep-input"
              type={showCurrent ? "text" : "password"}
              value={form.currentPassword}
              onChange={(e) => handleChange("currentPassword", e.target.value)}
              placeholder="Required only if changing password"
            />
            <button className="ep-eye" onClick={() => setShowCurrent(!showCurrent)}>
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="ep-group">
          <label className="ep-label"><Lock size={12} /> NEW PASSWORD</label>
          <div className="ep-input-wrap">
            <input
              className="ep-input"
              type={showNew ? "text" : "password"}
              value={form.newPassword}
              onChange={(e) => handleChange("newPassword", e.target.value)}
              placeholder="Min 6 characters"
            />
            <button className="ep-eye" onClick={() => setShowNew(!showNew)}>
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="ep-group">
          <label className="ep-label"><Lock size={12} /> CONFIRM NEW PASSWORD</label>
          <div className="ep-input-wrap">
            <input
              className="ep-input"
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="Repeat new password"
            />
            <button className="ep-eye" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="ep-divider"><span>Delete Account</span></div>
        <p style={{ color: "#b91c1c", fontSize: 13 }}>
          This permanently deletes your account, quiz history, tasks, and saved progress.
        </p>
        <div className="ep-group">
          <label className="ep-label">TYPE YOUR EMAIL TO CONFIRM</label>
          <input
            className="ep-input"
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="ep-group">
          <label className="ep-label">CURRENT PASSWORD (IF SET)</label>
          <input
            className="ep-input"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button
          onClick={handleDeleteAccount}
          disabled={deleting || loading}
          style={{ background: "#b91c1c", color: "white", border: 0, borderRadius: 8, padding: "10px 14px", cursor: "pointer" }}
        >
          {deleting ? "Deleting Account..." : "Delete Account Permanently"}
        </button>

        <div className="ep-actions">
          <button className="ep-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="ep-btn-save" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}

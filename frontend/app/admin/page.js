"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

// When NEXT_PUBLIC_API_URL is set (Vercel production), the browser calls the
// Render backend DIRECTLY — skipping the Vercel proxy completely.
// Locally, it falls back to '' so relative /api/... paths use the Next.js proxy.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function AdminPage() {
  const [token, setToken] = useState(null);

  // Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [viewState, setViewState] = useState("login"); // 'login', 'forgot', 'reset'
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [authMsgType, setAuthMsgType] = useState("error"); // error, success

  const [activeTab, setActiveTab] = useState("profile");

  // Data states
  const [profile, setProfile] = useState({
    name: "", title: "", current_employer: "", years_experience: "",
    location: "", languages: [], specialization: [], core_philosophies: [],
    meta: { uptime: "", preferred_communication: "", available: true }, photo: "", bio_summary: ""
  });

  const [skills, setSkills] = useState({
    manual_testing: [], api_testing: [], tools_and_ecosystem: []
  });

  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState("success"); // success or error

  // Experience Form state (for creating/editing)
  const [editingExp, setEditingExp] = useState(null); // null means not editing/creating, otherwise the experience object
  const [newBullet, setNewBullet] = useState("");

  // Projects Form state
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    // Check if token exists in localStorage (Client-side only)
    const storedToken = localStorage.getItem("admin_token");
    if (storedToken) {
      setToken(storedToken);
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const rt = params.get('resetToken');
      if (rt) {
        setResetToken(rt);
        setViewState('reset');
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      const [profileRes, skillsRes, expRes, projRes] = await Promise.all([
        fetch(`${API_BASE}/api/profile?include_details=true`),
        fetch(`${API_BASE}/api/skills?include_details=true`),
        fetch(`${API_BASE}/api/experience`),
        fetch(`${API_BASE}/api/projects?include_photos=true`)
      ]);

      if (profileRes.status === 401 || skillsRes.status === 401) {
        handleLogout();
        return;
      }

      const profileData = await profileRes.json();
      const skillsData = await skillsRes.json();
      const expData = await expRes.json();
      const projData = await projRes.json();

      setProfile(profileData);
      setSkills(skillsData.raw || {
        manual_testing: [], api_testing: [], tools_and_ecosystem: []
      });
      setExperiences(expData);
      setProjects(projData);
    } catch (error) {
      console.error("Failed to load portfolio data:", error);
      showStatus("Error loading portfolio data.", "error");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("admin_token", data.token);
        setToken(data.token);
      } else {
        setAuthMsgType("error");
        setAuthMsg(data.error || "Authentication failed.");
      }
    } catch (error) {
      setAuthMsgType("error");
      setAuthMsg("Failed to connect to the server.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthMsgType("success");
        setAuthMsg("If an account exists, a reset link was sent to your email.");
      } else {
        setAuthMsgType("error");
        setAuthMsg(data.error || "Failed to send reset link.");
      }
    } catch (error) {
      setAuthMsgType("error");
      setAuthMsg("Failed to connect to the server.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setAuthMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthMsgType("success");
        setAuthMsg("Password successfully reset! You can now log in.");
        setTimeout(() => setViewState("login"), 2000);
      } else {
        setAuthMsgType("error");
        setAuthMsg(data.error || "Failed to reset password. Link might be expired.");
      }
    } catch (error) {
      setAuthMsgType("error");
      setAuthMsg("Failed to connect to the server.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setPassword("");
    setViewState("login");
  };

  const showStatus = (msg, type = "success") => {
    setStatusMsg(msg);
    setStatusType(type);
    setTimeout(() => setStatusMsg(""), 4000);
  };

  // Image Upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(prev => ({
          ...prev,
          photo: data.url
        }));
        showStatus("Image uploaded successfully! Remember to save profile changes.", "success");
      } else {
        showStatus(data.error || "Image upload failed.", "error");
      }
    } catch (error) {
      showStatus("Network error uploading image.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Profile Save
  const saveProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showStatus("Profile updated successfully on database!", "success");
      } else {
        showStatus(data.message || "Failed to update profile.", "error");
      }
    } catch (error) {
      showStatus("Network error saving profile details.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Skills Save
  const saveSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(skills)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showStatus("Skills matrix updated successfully on database!", "success");
      } else {
        showStatus(data.message || "Failed to update skills.", "error");
      }
    } catch (error) {
      showStatus("Network error saving skills details.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Experience management helpers
  const startAddExperience = () => {
    setEditingExp({
      date: "", role: "", company: "", description: "", bullets: []
    });
  };

  const startEditExperience = (exp) => {
    setEditingExp({ ...exp });
  };

  const saveExperienceItem = async () => {
    if (!editingExp.role || !editingExp.company || !editingExp.date) {
      showStatus("Role, Company, and Dates are required.", "error");
      return;
    }

    setLoading(true);
    try {
      const isNew = !editingExp.id;
      const url = `${API_BASE}/api/experience`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editingExp)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (isNew) {
          setExperiences(prev => [...prev, data.item]);
          showStatus("New Experience timeline item added!", "success");
        } else {
          setExperiences(prev => prev.map(item => item.id === data.item.id ? data.item : item));
          showStatus("Experience item updated successfully!", "success");
        }
        setEditingExp(null);
      } else {
        showStatus(data.error || "Failed to save experience item.", "error");
      }
    } catch (error) {
      showStatus("Network error saving experience timeline item.", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteExperienceItem = async (id) => {
    if (!confirm("Are you sure you want to delete this experience timeline item?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/experience?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setExperiences(prev => prev.filter(item => item.id !== id));
        showStatus("Experience item removed successfully from timeline.", "success");
      } else {
        showStatus(data.error || "Failed to delete item.", "error");
      }
    } catch (error) {
      showStatus("Network error deleting experience item.", "error");
    } finally {
      setLoading(false);
    }
  };

  const addExpBullet = () => {
    if (!newBullet.trim()) return;
    setEditingExp(prev => ({
      ...prev,
      bullets: [...(prev.bullets || []), newBullet.trim()]
    }));
    setNewBullet("");
  };

  const removeExpBullet = (idx) => {
    setEditingExp(prev => ({
      ...prev,
      bullets: prev.bullets.filter((_, i) => i !== idx)
    }));
  };

  // Projects management helpers
  const startAddProject = () => {
    setEditingProject({
      name: "", description: "", photo: "", featured: false
    });
  };

  const startEditProject = (proj) => {
    setEditingProject({ ...proj });
  };

  const saveProjectItem = async () => {
    if (!editingProject.name) {
      showStatus("Project Name is required.", "error");
      return;
    }

    setLoading(true);
    try {
      const isNew = !editingProject.id;
      const url = `${API_BASE}/api/projects`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editingProject)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (isNew) {
          setProjects(prev => [...prev, data.item]);
          showStatus("New project added!", "success");
        } else {
          setProjects(prev => prev.map(item => item.id === data.item.id ? data.item : item));
          showStatus("Project updated successfully!", "success");
        }
        setEditingProject(null);
      } else {
        showStatus(data.error || "Failed to save project.", "error");
      }
    } catch (error) {
      showStatus("Network error saving project.", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteProjectItem = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/projects?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setProjects(prev => prev.filter(item => item.id !== id));
        showStatus("Project removed successfully.", "success");
      } else {
        showStatus(data.error || "Failed to delete project.", "error");
      }
    } catch (error) {
      showStatus("Network error deleting project.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEditingProject(prev => ({
          ...prev,
          photo: data.url
        }));
        showStatus("Project image uploaded successfully!", "success");
      } else {
        showStatus(data.error || "Image upload failed.", "error");
      }
    } catch (error) {
      showStatus("Network error uploading image.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="admin-login-container">
        <style>{`
          .admin-login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #08090d;
            font-family: var(--font-sans);
            padding: 24px;
          }
          .login-card {
            width: 100%;
            max-width: 420px;
            background: rgba(18, 22, 33, 0.75);
            backdrop-filter: blur(12px);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            padding: 40px 32px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5), var(--glow-purple);
          }
          .login-header {
            text-align: center;
            margin-bottom: 32px;
          }
          .login-header h2 {
            font-size: 1.8rem;
            font-weight: 800;
            margin-bottom: 8px;
          }
          .login-header p {
            color: var(--text-dim);
            font-size: 0.9rem;
          }
          .form-group {
            margin-bottom: 24px;
          }
          .form-label {
            display: block;
            margin-bottom: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-dim);
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }
          .form-input {
            width: 100%;
            padding: 14px 16px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--card-border);
            border-radius: 8px;
            color: var(--text-main);
            font-size: 1rem;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .form-input:focus {
            border-color: var(--accent-teal);
            box-shadow: 0 0 10px rgba(0, 242, 254, 0.2);
            outline: none;
          }
          .error-msg {
            color: var(--accent-red);
            font-size: 0.85rem;
            margin-top: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .btn-login {
            width: 100%;
            padding: 14px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 1rem;
            border: none;
            background: linear-gradient(135deg, var(--accent-teal), var(--accent-purple));
            color: #000;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: var(--glow-teal);
          }
        `}</style>

        <div className="login-card">
          <div className="login-header">
            <h2><span className="gradient-text">CMS ADMIN</span></h2>
            <p>Access Kishan's Portfolio Database Control Deck</p>
          </div>
          {viewState === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Passphrase</label>
                <input type="password" className="form-input" placeholder="Enter admin password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {authMsg && (
                  <div className="error-msg" style={{ color: authMsgType === 'success' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    <span>{authMsgType === 'success' ? '✅' : '⚠️'}</span> {authMsg}
                  </div>
                )}
              </div>
              <button type="submit" className="btn-login">DECRYPT ACCESS DECK</button>
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button type="button" onClick={() => { setViewState('forgot'); setAuthMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>Forgot Passphrase?</button>
              </div>
            </form>
          )}

          {viewState === 'forgot' && (
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label className="form-label">Account Email</label>
                <input type="email" className="form-input" placeholder="Enter registered email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                {authMsg && (
                  <div className="error-msg" style={{ color: authMsgType === 'success' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    <span>{authMsgType === 'success' ? '✅' : '⚠️'}</span> {authMsg}
                  </div>
                )}
              </div>
              <button type="submit" className="btn-login">SEND RESET THREAD</button>
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button type="button" onClick={() => { setViewState('login'); setAuthMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>Return</button>
              </div>
            </form>
          )}

          {viewState === 'reset' && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">New Passphrase</label>
                <input type="password" className="form-input" placeholder="Define new secure key" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                {authMsg && (
                  <div className="error-msg" style={{ color: authMsgType === 'success' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    <span>{authMsgType === 'success' ? '✅' : '⚠️'}</span> {authMsg}
                  </div>
                )}
              </div>
              <button type="submit" className="btn-login">STORE NEW KEY</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <style>{`
        .admin-container {
          min-height: 100vh;
          background-color: #08090d;
          font-family: var(--font-sans);
          color: var(--text-main);
          display: flex;
          flex-direction: column;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background: rgba(13, 15, 23, 0.95);
          border-bottom: 1px solid var(--card-border);
          backdrop-filter: blur(12px);
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 73px;
          z-index: 1000;
        }
        .admin-brand h1 {
          font-size: 1.4rem;
          font-weight: 800;
        }
        .admin-user {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .status-pill {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent-green);
          background: rgba(5, 213, 135, 0.1);
          border: 1px solid rgba(5, 213, 135, 0.2);
          padding: 6px 12px;
          border-radius: 30px;
        }
        .btn-logout {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-dim);
          border: 1px solid var(--card-border);
          padding: 6px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .btn-logout:hover {
          color: #fff;
          background: rgba(255, 59, 48, 0.1);
          border-color: var(--accent-red);
        }
        .admin-layout {
          display: block;
          margin-top: 73px;
          min-height: calc(100vh - 73px);
          flex: 1;
          position: relative;
        }
        .admin-sidebar {
          background: #0d0f17;
          border-right: 1px solid var(--card-border);
          padding: 32px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: fixed;
          top: 73px;
          left: 0;
          width: 240px;
          height: calc(100vh - 73px);
          overflow-y: auto;
          z-index: 100;
        }
        .sidebar-btn {
          width: 100%;
          text-align: left;
          padding: 14px 20px;
          background: none;
          border: none;
          color: var(--text-dim);
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sidebar-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.02);
        }
        .sidebar-btn.active {
          color: var(--accent-teal);
          background: rgba(0, 242, 254, 0.06);
          border-left: 3px solid var(--accent-teal);
          border-radius: 0 8px 8px 0;
          padding-left: 17px;
        }
        .admin-content {
          margin-left: 240px;
          padding: 40px;
          min-height: calc(100vh - 73px);
          box-sizing: border-box;
        }
        .dashboard-card {
          background: rgba(18, 22, 33, 0.65);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 24px;
        }
        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          border-bottom: 1px solid var(--card-border);
          padding-bottom: 16px;
        }
        .card-header-row h2 {
          font-size: 1.6rem;
          font-weight: 700;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .form-grid-full {
          grid-column: span 2;
        }
        .form-row {
          margin-bottom: 20px;
        }
        .form-control-label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-dim);
        }
        .form-control-input {
          width: 100%;
          padding: 12px 14px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--card-border);
          border-radius: 8px;
          color: var(--text-main);
          font-size: 0.95rem;
        }
        .form-control-input:focus {
          border-color: var(--accent-teal);
          outline: none;
        }
        .image-upload-wrapper {
          display: flex;
          align-items: center;
          gap: 24px;
          background: rgba(0, 0, 0, 0.15);
          padding: 20px;
          border-radius: 12px;
          border: 1px dashed var(--card-border);
          margin-bottom: 20px;
        }
        .image-preview-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          background: #0d0f17;
          border: 2px solid var(--accent-teal);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .image-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .no-preview {
          font-size: 0.75rem;
          color: var(--text-dim);
          text-align: center;
        }
        .btn-upload-label {
          padding: 10px 18px;
          background: rgba(0, 242, 254, 0.1);
          color: var(--accent-teal);
          border: 1px solid rgba(0, 242, 254, 0.2);
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .btn-upload-label:hover {
          background: rgba(0, 242, 254, 0.2);
        }
        .btn-save-row {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 32px;
        }
        .btn-save {
          padding: 12px 32px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          background: linear-gradient(135deg, var(--accent-teal), var(--accent-purple));
          color: #000;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-save:hover {
          transform: translateY(-2px);
          box-shadow: var(--glow-teal);
        }
        .btn-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .list-manager-section {
          margin-top: 32px;
          border-top: 1px solid var(--card-border);
          padding-top: 24px;
        }
        .list-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .list-manager-header h3 {
          font-size: 1.2rem;
          color: var(--text-main);
        }
        .list-items-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .list-item-edit-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .btn-add-item {
          padding: 6px 12px;
          background: rgba(155, 81, 224, 0.1);
          color: var(--accent-purple);
          border: 1px solid rgba(155, 81, 224, 0.2);
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-add-item:hover {
          background: rgba(155, 81, 224, 0.2);
        }
        .btn-remove-item {
          background: rgba(255, 59, 48, 0.1);
          color: var(--accent-red);
          border: 1px solid rgba(255, 59, 48, 0.2);
          padding: 10px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-remove-item:hover {
          background: rgba(255, 59, 48, 0.2);
        }
        .badge-list-input-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--card-border);
          border-radius: 8px;
          padding: 12px;
        }
        .badge-pill-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--card-border);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
        }
        .badge-pill-remove {
          color: var(--accent-red);
          cursor: pointer;
          font-weight: 800;
        }
        .badge-input-box {
          border: none;
          background: none;
          color: #fff;
          font-size: 0.85rem;
          outline: none;
          flex: 1;
          min-width: 120px;
        }
        /* Experience List dashboard styling */
        .exp-timeline-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .exp-item-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .exp-item-info h4 {
          font-size: 1.15rem;
          margin-bottom: 4px;
        }
        .exp-item-meta {
          font-size: 0.85rem;
          color: var(--accent-teal);
          font-weight: 600;
          margin-bottom: 8px;
        }
        .exp-item-desc {
          font-size: 0.9rem;
          color: var(--text-dim);
          line-height: 1.5;
        }
        .exp-item-actions {
          display: flex;
          gap: 8px;
        }
        .btn-action-edit {
          padding: 8px 14px;
          background: rgba(0, 242, 254, 0.1);
          color: var(--accent-teal);
          border: 1px solid rgba(0, 242, 254, 0.2);
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .btn-action-edit:hover {
          background: rgba(0, 242, 254, 0.2);
        }
        .btn-action-delete {
          padding: 8px 14px;
          background: rgba(255, 59, 48, 0.1);
          color: var(--accent-red);
          border: 1px solid rgba(255, 59, 48, 0.2);
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .btn-action-delete:hover {
          background: rgba(255, 59, 48, 0.2);
        }
        /* Experience Form Styling */
        .exp-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--card-border);
          padding-bottom: 12px;
        }
        .bullet-point-input-row {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        .bullet-points-list {
          list-style: none;
          margin-bottom: 16px;
        }
        .bullet-point-li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: rgba(0,0,0,0.15);
          border: 1px solid var(--card-border);
          border-radius: 6px;
          margin-bottom: 8px;
          font-size: 0.88rem;
        }
        .btn-bullet-remove {
          background: none;
          border: none;
          color: var(--accent-red);
          cursor: pointer;
          font-weight: bold;
        }
        .status-toast {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 16px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          z-index: 1000;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Global Status Toast */}
      {statusMsg && (
        <div
          className="status-toast"
          style={{
            background: statusType === "success" ? "rgba(5, 213, 135, 0.9)" : "rgba(255, 59, 48, 0.9)",
            color: statusType === "success" ? "#000" : "#fff",
            border: statusType === "success" ? "1px solid var(--accent-green)" : "1px solid var(--accent-red)"
          }}
        >
          {statusType === "success" ? "✓" : "⚠️"} {statusMsg}
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div className="admin-brand">
          <h1>Kishan's <span className="gradient-text">Portfolio Deck</span></h1>
        </div>
        <div className="admin-user">
          <span className="status-pill">● SECURE BACKEND DB CONNECTED</span>
          <button className="btn-logout" onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      {/* Sidebar Layout */}
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <button
            className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); setEditingExp(null); }}
          >
            <span></span> Profile Details
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => { setActiveTab('skills'); setEditingExp(null); }}
          >
            <span></span> Strategy & Skills
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'experience' ? 'active' : ''}`}
            onClick={() => { setActiveTab('experience'); setEditingExp(null); setEditingProject(null); }}
          >
            <span></span> Work Pipeline
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => { setActiveTab('projects'); setEditingExp(null); setEditingProject(null); }}
          >
            <span></span> Projects Showcase
          </button>
        </aside>

        {/* Content area */}
        <main className="admin-content">

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="dashboard-card">
              <div className="card-header-row">
                <h2>Profile Configurations</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Updates GET /api/profile</span>
              </div>

              {/* Photo Upload Area */}
              <div className="form-row">
                <label className="form-control-label">Portfolio Image Avatar</label>
                <div className="image-upload-wrapper">
                  <div className="image-preview-circle">
                    {profile.photo ? (
                      <Image src={profile.photo} alt="Avatar Preview" className="image-preview-img" width={100} height={100} style={{ objectFit: 'cover' }} />
                    ) : (
                      <span className="no-preview">No Photo</span>
                    )}
                  </div>
                  <div>
                    <label htmlFor="photo-file" className="btn-upload-label">
                      {loading ? "Processing..." : "Upload Portfolio Photo"}
                    </label>
                    <input
                      type="file"
                      id="photo-file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={loading}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                      PNG, JPG, or GIF up to 5MB. Upload edits are written directly to public disk.
                    </p>
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-row form-grid-full">
                  <label className="form-control-label">Profile Availability (Available / Unavailable)</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={profile.meta?.available ?? true}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        meta: { ...prev.meta, available: e.target.checked }
                      }))}
                      style={{ width: '20px', height: '20px', appearance: 'auto', WebkitAppearance: 'auto' }}
                    />
                    <span style={{ color: profile.meta?.available ? 'var(--accent-green)' : 'var(--text-dim)' }}>
                      {profile.meta?.available ? 'Available (Online)' : 'Unavailable (Busy)'}
                    </span>
                  </label>
                </div>
                <div className="form-row form-grid-full">
                  <label className="form-control-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control-input"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label className="form-control-label">Job Title</label>
                  <input
                    type="text"
                    className="form-control-input"
                    value={profile.title}
                    onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label className="form-control-label">Current Employer</label>
                  <input
                    type="text"
                    className="form-control-input"
                    value={profile.current_employer}
                    onChange={(e) => setProfile(prev => ({ ...prev, current_employer: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label className="form-control-label">Years of Experience</label>
                  <input
                    type="text"
                    className="form-control-input"
                    value={profile.years_experience}
                    onChange={(e) => setProfile(prev => ({ ...prev, years_experience: e.target.value || 0 }))}
                  />
                </div>
                <div className="form-row">
                  <label className="form-control-label">Location</label>
                  <input
                    type="text"
                    className="form-control-input"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label className="form-control-label">Preferred Communication</label>
                  <input
                    type="text"
                    className="form-control-input"
                    value={profile.meta?.preferred_communication || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, meta: { ...prev.meta, preferred_communication: e.target.value } }))}
                  />
                </div>

                <div className="form-row form-grid-full">
                  <label className="form-control-label">Professional Bio Summary</label>
                  <textarea
                    rows={4}
                    className="form-control-input"
                    style={{ resize: 'vertical' }}
                    value={profile.bio_summary}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio_summary: e.target.value }))}
                  />
                </div>

                <div className="form-row form-grid-full">
                  <label className="form-control-label">QA Core Philosophies (One per line)</label>
                  <textarea
                    rows={2}
                    className="form-control-input"
                    placeholder="Enter philosophies, one per line"
                    value={profile.core_philosophies.join("\n")}
                    onChange={(e) => setProfile(prev => ({ ...prev, core_philosophies: e.target.value.split("\n") }))}
                  />
                </div>
              </div>

              <div className="btn-save-row">
                <button
                  className="btn-save"
                  onClick={saveProfile}
                  disabled={loading}
                >
                  {loading ? "Synchronising..." : "DEPLOY PROFILE SETTINGS"}
                </button>
              </div>
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="dashboard-card">
              <div className="card-header-row">
                <h2>Strategy & Skills Configurations</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Updates GET /api/skills</span>
              </div>

              {/* Manual Testing Skills list */}
              <div className="list-manager-section" style={{ marginTop: 0, border: 'none', paddingTop: 0 }}>
                <div className="list-manager-header">
                  <h3>Manual Testing Matrix</h3>
                  <button
                    className="btn-add-item"
                    onClick={() => setSkills(prev => ({
                      ...prev,
                      manual_testing: [...prev.manual_testing, { name: "", level: "90%" }]
                    }))}
                  >
                    + ADD MANUAL STRATEGY
                  </button>
                </div>
                <div className="list-items-container">
                  {skills.manual_testing.map((skill, idx) => (
                    <div key={idx} className="list-item-edit-row">
                      <input
                        type="text"
                        className="form-control-input"
                        placeholder="Strategy name (e.g. Exploratory Testing)"
                        value={skill.name}
                        onChange={(e) => {
                          const updated = [...skills.manual_testing];
                          updated[idx].name = e.target.value;
                          setSkills(prev => ({ ...prev, manual_testing: updated }));
                        }}
                        style={{ flex: 2 }}
                      />
                      <input
                        type="text"
                        className="form-control-input"
                        placeholder="Proficiency Level (e.g. 95%)"
                        value={skill.level}
                        onChange={(e) => {
                          const updated = [...skills.manual_testing];
                          updated[idx].level = e.target.value;
                          setSkills(prev => ({ ...prev, manual_testing: updated }));
                        }}
                        style={{ flex: 1 }}
                      />
                      <button
                        className="btn-remove-item"
                        onClick={() => {
                          setSkills(prev => ({
                            ...prev,
                            manual_testing: prev.manual_testing.filter((_, i) => i !== idx)
                          }));
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Testing Skills list */}
              <div className="list-manager-section">
                <div className="list-manager-header">
                  <h3>API Testing Matrix</h3>
                  <button
                    className="btn-add-item"
                    onClick={() => setSkills(prev => ({
                      ...prev,
                      api_testing: [...prev.api_testing, { name: "", level: "90%" }]
                    }))}
                  >
                    + ADD API STRATEGY
                  </button>
                </div>
                <div className="list-items-container">
                  {skills.api_testing.map((skill, idx) => (
                    <div key={idx} className="list-item-edit-row">
                      <input
                        type="text"
                        className="form-control-input"
                        placeholder="API verification focus (e.g. Response Validation)"
                        value={skill.name}
                        onChange={(e) => {
                          const updated = [...skills.api_testing];
                          updated[idx].name = e.target.value;
                          setSkills(prev => ({ ...prev, api_testing: updated }));
                        }}
                        style={{ flex: 2 }}
                      />
                      <input
                        type="text"
                        className="form-control-input"
                        placeholder="Proficiency Level (e.g. 95%)"
                        value={skill.level}
                        onChange={(e) => {
                          const updated = [...skills.api_testing];
                          updated[idx].level = e.target.value;
                          setSkills(prev => ({ ...prev, api_testing: updated }));
                        }}
                        style={{ flex: 1 }}
                      />
                      <button
                        className="btn-remove-item"
                        onClick={() => {
                          setSkills(prev => ({
                            ...prev,
                            api_testing: prev.api_testing.filter((_, i) => i !== idx)
                          }));
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Badges List */}
              <div className="list-manager-section">
                <div className="list-manager-header">
                  <h3>Ecosystem Tool Badges</h3>
                </div>
                <div className="badge-list-input-wrapper">
                  {skills.tools_and_ecosystem.map((badge, idx) => (
                    <div key={idx} className="badge-pill-item">
                      <span>{badge}</span>
                      <span
                        className="badge-pill-remove"
                        onClick={() => {
                          setSkills(prev => ({
                            ...prev,
                            tools_and_ecosystem: prev.tools_and_ecosystem.filter((_, i) => i !== idx)
                          }));
                        }}
                      >
                        ×
                      </span>
                    </div>
                  ))}
                  <input
                    type="text"
                    className="badge-input-box"
                    placeholder="+ Add badge & press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !skills.tools_and_ecosystem.includes(val)) {
                          setSkills(prev => ({
                            ...prev,
                            tools_and_ecosystem: [...prev.tools_and_ecosystem, val]
                          }));
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="btn-save-row">
                <button
                  className="btn-save"
                  onClick={saveSkills}
                  disabled={loading}
                >
                  {loading ? "Synchronising..." : "DEPLOY SKILLS MATRIX"}
                </button>
              </div>
            </div>
          )}

          {/* EXPERIENCE TAB */}
          {activeTab === 'experience' && (
            <div className="dashboard-card">
              {editingExp === null ? (
                // Timeline List Mode
                <>
                  <div className="card-header-row">
                    <h2>Work Pipeline Timeline</h2>
                    <button className="btn-save" onClick={startAddExperience}>
                      + ADD TIMELINE RECORD
                    </button>
                  </div>

                  <div className="exp-timeline-list">
                    {experiences.length === 0 ? (
                      <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px' }}>
                        No experience pipeline records found. Add one above!
                      </p>
                    ) : (
                      experiences.map((exp) => (
                        <div key={exp.id} className="exp-item-card">
                          <div className="exp-item-info">
                            <h4>{exp.role}</h4>
                            <div className="exp-item-meta">{exp.company} | {exp.date}</div>
                            <p className="exp-item-desc">{exp.description}</p>
                            {exp.bullets && exp.bullets.length > 0 && (
                              <ul style={{ paddingLeft: '20px', marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                {exp.bullets.map((b, i) => <li key={i}>{b}</li>)}
                              </ul>
                            )}
                          </div>
                          <div className="exp-item-actions">
                            <button className="btn-action-edit" onClick={() => startEditExperience(exp)}>EDIT</button>
                            <button className="btn-action-delete" onClick={() => deleteExperienceItem(exp.id)}>DELETE</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                // Timeline Form Editor Mode (Edit or Add)
                <div>
                  <div className="exp-form-header">
                    <h2>{!editingExp.id ? "Add Timeline Item" : `Edit timeline item for: ${editingExp.company}`}</h2>
                    <button className="btn-logout" onClick={() => setEditingExp(null)}>CANCEL</button>
                  </div>

                  <div className="form-grid">
                    <div className="form-row">
                      <label className="form-control-label">Dates / Duration (e.g. 2024 - Present)</label>
                      <input
                        type="text"
                        className="form-control-input"
                        value={editingExp.date}
                        onChange={(e) => setEditingExp(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="form-row">
                      <label className="form-control-label">Role Title (e.g. Senior QA Engineer)</label>
                      <input
                        type="text"
                        className="form-control-input"
                        value={editingExp.role}
                        onChange={(e) => setEditingExp(prev => ({ ...prev, role: e.target.value }))}
                      />
                    </div>
                    <div className="form-row">
                      <label className="form-control-label">Company Name</label>
                      <input
                        type="text"
                        className="form-control-input"
                        value={editingExp.company}
                        onChange={(e) => setEditingExp(prev => ({ ...prev, company: e.target.value }))}
                      />
                    </div>

                    <div className="form-row form-grid-full">
                      <label className="form-control-label">Job Narrative / Description</label>
                      <textarea
                        rows={3}
                        className="form-control-input"
                        value={editingExp.description}
                        onChange={(e) => setEditingExp(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Bullet Points Manager */}
                  <div className="list-manager-section">
                    <div className="list-manager-header">
                      <h3>Timeline Achievements (Bullet Points)</h3>
                    </div>

                    <ul className="bullet-points-list">
                      {(editingExp.bullets || []).map((bullet, idx) => (
                        <li key={idx} className="bullet-point-li">
                          <span>{bullet}</span>
                          <button className="btn-bullet-remove" onClick={() => removeExpBullet(idx)}>×</button>
                        </li>
                      ))}
                    </ul>

                    <div className="bullet-point-input-row">
                      <input
                        type="text"
                        className="form-control-input"
                        placeholder="Add a timeline accomplishment bullet point"
                        value={newBullet}
                        onChange={(e) => setNewBullet(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addExpBullet();
                          }
                        }}
                      />
                      <button className="btn-save" style={{ padding: '8px 20px' }} onClick={addExpBullet}>+ ADD BULLET</button>
                    </div>
                  </div>

                  <div className="btn-save-row" style={{ marginTop: '24px' }}>
                    <button className="btn-logout" onClick={() => setEditingExp(null)}>CANCEL</button>
                    <button className="btn-save" onClick={saveExperienceItem} disabled={loading}>
                      {loading ? "Deploying..." : "COMMIT TIMELINE RECORD"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="dashboard-card">
              {editingProject === null ? (
                // Projects List Mode
                <>
                  <div className="card-header-row">
                    <h2>Projects Showcase Portfolio</h2>
                    <button className="btn-save" onClick={startAddProject}>
                      + ADD PROJECT
                    </button>
                  </div>

                  <div className="exp-timeline-list">
                    {projects.length === 0 ? (
                      <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px' }}>
                        No projects found. Add one above!
                      </p>
                    ) : (
                      projects.map((proj) => (
                        <div key={proj.id} className="exp-item-card">
                          <div className="exp-item-info">
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {proj.name}
                              {proj.featured && <span className="status-pill" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>⭐ FEATURED</span>}
                            </h4>
                            <p className="exp-item-desc" style={{ marginTop: '8px' }}>{proj.description}</p>
                            {proj.photo && (
                              <Image src={proj.photo} alt={proj.name || "Preview"} width={100} height={60} style={{ marginTop: '12px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                            )}
                          </div>
                          <div className="exp-item-actions">
                            <button className="btn-action-edit" onClick={() => startEditProject(proj)}>EDIT</button>
                            <button className="btn-action-delete" onClick={() => deleteProjectItem(proj.id)}>DELETE</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                // Project Form Editor Mode
                <div>
                  <div className="exp-form-header">
                    <h2>{!editingProject.id ? "Add Project" : `Edit Project: ${editingProject.name}`}</h2>
                    <button className="btn-logout" onClick={() => setEditingProject(null)}>CANCEL</button>
                  </div>

                  {/* Project Image Upload Area */}
                  <div className="form-row form-grid-full" style={{ marginBottom: '24px' }}>
                    <label className="form-control-label">Project Photo</label>
                    <div className="image-upload-wrapper">
                      <div className="image-preview-circle" style={{ borderRadius: '8px', width: '120px', height: '80px' }}>
                        {editingProject.photo ? (
                          <Image src={editingProject.photo} alt="Preview" className="image-preview-img" width={120} height={80} style={{ borderRadius: '8px', objectFit: 'cover', width: '100%', height: '100%' }} />
                        ) : (
                          <div className="no-preview">No<br />Photo</div>
                        )}
                      </div>
                      <div className="image-upload-controls">
                        <label className="btn-upload-label">
                          SELECT PHOTO
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleProjectImageUpload}
                            disabled={loading}
                          />
                        </label>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                          JPG, PNG, WEBP (Max 5MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-row form-grid-full">
                      <label className="form-control-label">Project Name</label>
                      <input
                        type="text"
                        className="form-control-input"
                        value={editingProject.name}
                        onChange={(e) => setEditingProject(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="form-row form-grid-full">
                      <label className="form-control-label">Project Description</label>
                      <textarea
                        rows={3}
                        className="form-control-input"
                        value={editingProject.description}
                        onChange={(e) => setEditingProject(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div className="form-row form-grid-full">
                      <label className="form-control-label">Feature on Home Page?</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={editingProject.featured}
                          onChange={(e) => setEditingProject(prev => ({ ...prev, featured: e.target.checked }))}
                          style={{ width: '20px', height: '20px' }}
                        />
                        <span style={{ color: editingProject.featured ? 'var(--accent-teal)' : 'var(--text-dim)' }}>
                          {editingProject.featured ? 'Yes, show on Home Page' : 'No, only show on All Projects page'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="btn-save-row" style={{ marginTop: '24px' }}>
                    <button className="btn-logout" onClick={() => setEditingProject(null)}>CANCEL</button>
                    <button className="btn-save" onClick={saveProjectItem} disabled={loading}>
                      {loading ? "Saving..." : "SAVE PROJECT"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

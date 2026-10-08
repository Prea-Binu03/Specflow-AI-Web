import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const userName = storedUser?.name || storedUser?.fullName || "User";
  const userEmail = storedUser?.email || "No email provided";
  const userRole = storedUser?.role || "Developer / Creator";
  const userCollege = storedUser?.college || storedUser?.organization || "Not Specified";

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [appearance, setAppearance] = useState(() => {
    return localStorage.getItem("specflow_appearance") || "dark";
  });

  const [projectUpdates, setProjectUpdates] = useState(() => {
    const saved = localStorage.getItem("specflow_project_updates");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [aiNotifications, setAiNotifications] = useState(() => {
    const saved = localStorage.getItem("specflow_ai_notifications");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [taskNotifications, setTaskNotifications] = useState(() => {
    const saved = localStorage.getItem("specflow_task_notifications");
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Projects state for sidebar history loaded from backend API
  const [projects, setProjects] = useState([]);
  
  const userId = storedUser?._id || storedUser?.id || storedUser?.userId;

  useEffect(() => {
    const loadProjects = async () => {
      try {
        if (!userId) {
          setProjects([]);
          return;
        }

        const response = await fetch(`${API_URL}/api/projects/user/${userId}`);
        const data = await response.json();

        if (!response.ok) {
          console.error(data.message || "Unable to load projects");
          setProjects([]);
          return;
        }

        const projectList = Array.isArray(data)
          ? data
          : (data.projects || data.data || data.result || []);

        setProjects(projectList);
      } catch (error) {
        console.error("Settings Project History Error:", error);
        setProjects([]);
      }
    };

    loadProjects();
  }, [userId, API_URL]);
  
  // Dropdown state for topbar user menu
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem("specflow_appearance", appearance);
    if (appearance === "light") {
      document.body.classList.add("light-mode");
      document.documentElement.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
      document.documentElement.classList.remove("light-mode");
    }
  }, [appearance]);

  useEffect(() => {
    localStorage.setItem("specflow_project_updates", JSON.stringify(projectUpdates));
  }, [projectUpdates]);

  useEffect(() => {
    localStorage.setItem("specflow_ai_notifications", JSON.stringify(aiNotifications));
  }, [aiNotifications]);

  useEffect(() => {
    localStorage.setItem("specflow_task_notifications", JSON.stringify(taskNotifications));
  }, [taskNotifications]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={`project-layout ${appearance === "light" ? "light-mode" : ""}`}>
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-star">✦</span>
          <span>SpecFlow <b>AI</b></span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="side-link">
            <span className="side-icon">⌂</span>
            <span>Home</span>
          </Link>
          <Link to="/project-idea" className="side-link">
            <span className="side-icon">＋</span>
            <span>New Project</span>
          </Link>
          <Link to="/my-projects" className="side-link">
            <span className="side-icon">▱</span>
            <span>My Projects</span>
          </Link>
          <Link to="/ai-assistant" className="side-link">
            <span className="side-icon">🤖</span>
            <span>AI Assistant</span>
          </Link>
          <Link to="/profile" className="side-link">
            <span className="side-icon">♙</span>
            <span>Profile</span>
          </Link>
          <Link to="/settings" className="side-link active">
            <span className="side-icon">⚙</span>
            <span>Settings</span>
          </Link>
        </nav>

        {/* PROJECT HISTORY */}
        <div className="history-section">
          <div className="history-title">
            <span>Project History</span>
            <span>⌕</span>
          </div>

          {projects.length === 0 ? (
            <div className="empty-history">
              <div className="empty-history-icon">＋</div>
              <strong>No projects yet</strong>
              <p>
                Your generated projects
                <br />
                will appear here.
              </p>
            </div>
          ) : (
            <div className="history-list">
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project._id || project.id}
                  to={`/project/${project._id || project.id}`}
                  className="history-project"
                >
                  <span className="history-project-icon">✦</span>
                  <span className="history-project-name">
                    {project.projectName || project.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-bottom">
          <span className="sidebar-bottom-icon">✦</span>
          <span>
            Turn Ideas into
            <br />
            Real Software
          </span>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">
        {/* ================= TOPBAR ================= */}
        <header className="topbar">
          <div className="topbar-title">Settings</div>
          <div className="topbar-right">
            <div className="notification">♧</div>
            <div className="user-menu-container" ref={dropdownRef}>
              <button
                type="button"
                className="user-button"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <div className="user-avatar">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="username">{userName}</span>
                <span className="dropdown-arrow">▾</span>
              </button>

              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    <span>♙</span> Profile
                  </Link>
                  <Link to="/settings" className="dropdown-item">
                    <span>⚙</span> Settings
                  </Link>
                  <button type="button" className="dropdown-item logout-item" onClick={handleLogout}>
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================= SETTINGS CONTENT ================= */}
        <section className="content-area settings-page">
          <div className="settings-intro">
            <div className="settings-label">
              <span>✦</span> APP CONFIGURATION
            </div>
            <h1>
              Account <span>Settings</span>
            </h1>
            <p>Manage your workspace preferences, appearance, and account security.</p>
          </div>

          <div className="settings-wrapper">
            {/* 1. ACCOUNT SETTINGS */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-title-group">
                  <div className="setting-icon">👤</div>
                  <div>
                    <h3>Account Settings</h3>
                    <p>Your personal user credentials and details</p>
                  </div>
                </div>
                <Link to="/profile" className="settings-action-btn">
                  Go to Profile →
                </Link>
              </div>

              <div className="settings-grid">
                <div className="setting-item-box">
                  <span>Full Name</span>
                  <strong>{userName}</strong>
                </div>
                <div className="setting-item-box">
                  <span>Email Address</span>
                  <strong>{userEmail}</strong>
                </div>
                <div className="setting-item-box">
                  <span>Role</span>
                  <strong>{userRole}</strong>
                </div>
                <div className="setting-item-box">
                  <span>College / Organization</span>
                  <strong>{userCollege}</strong>
                </div>
              </div>
            </div>

            {/* 2. APPEARANCE */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-title-group">
                  <div className="setting-icon">🎨</div>
                  <div>
                    <h3>Appearance</h3>
                    <p>Customize how SpecFlow AI looks on your display</p>
                  </div>
                </div>
                <span className="settings-badge">Theme</span>
              </div>

              <div className="appearance-options">
                <button
                  type="button"
                  className={`appearance-btn ${appearance === "dark" ? "active" : ""}`}
                  onClick={() => setAppearance("dark")}
                >
                  🌙 Dark Mode (Default)
                </button>
                <button
                  type="button"
                  className={`appearance-btn ${appearance === "light" ? "active" : ""}`}
                  onClick={() => setAppearance("light")}
                >
                  ☀️ Light Mode
                </button>
              </div>
            </div>

            {/* 3. NOTIFICATION PREFERENCES */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-title-group">
                  <div className="setting-icon">🔔</div>
                  <div>
                    <h3>Notification Preferences</h3>
                    <p>Choose what alerts you want to receive locally</p>
                  </div>
                </div>
                <span className="settings-badge">Alerts</span>
              </div>
              
              <div className="toggle-list">
                <div className="toggle-item">
                  <div className="toggle-text">
                    <strong>Project Updates</strong>
                    <p>Receive updates related to your projects.</p>
                  </div>
                  <button
                    type="button"
                    className={`toggle-switch ${projectUpdates ? "on" : "off"}`}
                    onClick={() => setProjectUpdates(prev => !prev)}
                  >
                    <span className="toggle-thumb"></span>
                  </button>
                </div>

                <div className="toggle-item">
                  <div className="toggle-text">
                    <strong>AI Generation Notifications</strong>
                    <p>Receive notifications when AI generation is completed.</p>
                  </div>
                  <button
                    type="button"
                    className={`toggle-switch ${aiNotifications ? "on" : "off"}`}
                    onClick={() => setAiNotifications(prev => !prev)}
                  >
                    <span className="toggle-thumb"></span>
                  </button>
                </div>

                <div className="toggle-item">
                  <div className="toggle-text">
                    <strong>Task Progress Notifications</strong>
                    <p>Receive notifications about development task progress.</p>
                  </div>
                  <button
                    type="button"
                    className={`toggle-switch ${taskNotifications ? "on" : "off"}`}
                    onClick={() => setTaskNotifications(prev => !prev)}
                  >
                    <span className="toggle-thumb"></span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4. SECURITY */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-title-group">
                  <div className="setting-icon">🔒</div>
                  <div>
                    <h3>Security</h3>
                    <p>Password and authorization control</p>
                  </div>
                </div>
                <span className="settings-badge">Protected</span>
              </div>
              <div className="security-box">
                <p>Password management is handled securely through the authentication system.</p>
              </div>
            </div>

            {/* 5. LOGOUT */}
            <div className="settings-card logout-card">
              <div className="settings-card-header">
                <div className="settings-card-title-group">
                  <div className="setting-icon logout-icon-box">🚪</div>
                  <div>
                    <h3>Session Control</h3>
                    <p>Safely log out of your current session</p>
                  </div>
                </div>
              </div>
              <div className="logout-content-row">
                <p className="setting-desc-text">Your MongoDB projects will remain safe and saved.</p>
                <button
                  type="button"
                  className="logout-action-button"
                  onClick={handleLogout}
                >
                  Log Out of SpecFlow AI
                </button>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}

export default Settings;
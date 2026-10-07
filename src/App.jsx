import { useEffect, useState, useMemo } from "react";
import "./App.css";

import {
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";

import Login from "./pages/login.jsx";
import Register from "./pages/Register.jsx";
import ProjectIdea from "./pages/ProjectIdea.jsx";
import MyProjects from "./pages/MyProjects.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import ForgotPassword from "./pages/ForgetPassword.jsx";
import ProjectWorkspace from "./pages/ProjectWorkspace.jsx";
import AIAssistant from "./pages/AIAssistant.jsx";

/* =====================================================
    REUSABLE SIDEBAR COMPONENT (Sabhi pages ke liye)
===================================================== */

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-star">✦</span>
        <span>SpecFlow <b>AI</b></span>
      </div>
      <nav className="sidebar-nav">
        <Link to="/dashboard" className="side-link">
          <span className="side-icon">⌂</span>
          <span>Dashboard</span>
        </Link>
        <Link to="/" className="side-link">
          <span className="side-icon">🌐</span>
          <span>Home / Website</span>
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
        <Link to="/settings" className="side-link">
          <span className="side-icon">⚙</span>
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
}

/* =====================================================
    PUBLIC HOME PAGE (Alag Landing Page) - UNTOUCHED
===================================================== */

function Home() {
  const [projectIdea, setProjectIdea] = useState("");

  return (
    <div className="app">
      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">✦</span>
          <span>SpecFlow<b> AI </b> </span>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <Link to="/login" className="login-btn">Login</Link>
          <Link to="/register" className="register-btn">Register</Link>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <main className="hero">
        <div className="badge">
          ✦ AI-Powered Software Planning
        </div>

        <h1>
          Turn Your Software Idea
          <span>Into a Development Plan</span>
        </h1>

        <p className="hero-text">
          Describe your software idea and let
          SpecFlow AI transform it into structured
          requirements, features, user stories,
          APIs and development tasks.
        </p>

        {/* ================= IDEA BOX ================= */}
        <div className="idea-box">
          <label>Describe your software idea</label>
          <textarea
            value={projectIdea}
            onChange={(e) => setProjectIdea(e.target.value)}
            placeholder="Example: I want to build an online food delivery website..."
          />
          <Link to="/login" className="generate-btn">
            Generate Project Plan →
          </Link>
        </div>
      </main>

      {/* ================= FEATURES ================= */}
      <section className="features" id="features">
        <h2>From Idea to Development</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="icon">01</div>
            <h3>Requirements</h3>
            <p>Generate functional and non-functional requirements from your project idea.</p>
          </div>
          <div className="feature-card">
            <div className="icon">02</div>
            <h3>Features & User Stories</h3>
            <p>Convert your idea into clear features and developer-friendly user stories.</p>
          </div>
          <div className="feature-card">
            <div className="icon">03</div>
            <h3>Technical Planning</h3>
            <p>Get database, API, architecture and development task suggestions.</p>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="how-it-works" id="how-it-works">
        <div className="how-heading">
          <div className="section-badge">✦ Simple & Structured</div>
          <h2>How It <span>Works</span></h2>
          <p>Turn your software idea into a clear development plan through a simple step-by-step process.</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-content">
              <h3>Describe Your Idea</h3>
              <p>Start by describing your software idea in simple words. You can explain what you want to build and who it is for.</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-content">
              <h3>Add More Context</h3>
              <p>Provide additional information using text, images or documents to give SpecFlow AI better understanding.</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-content">
              <h3>AI Analyzes Your Idea</h3>
              <p>SpecFlow AI analyzes your project idea and organizes the information into meaningful software planning sections.</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-number">04</div>
            <div className="step-content">
              <h3>Get a Structured Plan</h3>
              <p>Receive requirements, features, user stories, database suggestions, APIs, and development tasks.</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-number">05</div>
            <div className="step-content">
              <h3>Review & Edit</h3>
              <p>Review the generated project plan, make changes where required and customize it according to your project.</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-number">06</div>
            <div className="step-content">
              <h3>Start Development</h3>
              <p>Use the structured plan as a practical guide while building and developing your software project.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="final-cta">
        <div className="cta-icon">✦</div>
        <h2>Ready to Turn Your Idea <span>Into Real Software?</span></h2>
        <p>Start with your idea and let SpecFlow AI help you plan your software step by step.</p>
        <Link to="/login" className="cta-button">Start Planning →</Link>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <div>© 2026 SpecFlow AI</div>
        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
        <div>Turn Ideas into Real Software</div>
      </footer>
    </div>
  );
}

/* =====================================================
    USER DASHBOARD (Properly Aligned & Uniform Layout)
===================================================== */

function UserDashboard() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const userName = storedUser?.name || storedUser?.fullName || "User";
  const userId = storedUser?._id || storedUser?.id;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!userId) {
          setProjects([]);
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/projects/user/${userId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load dashboard data.");
        }

        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Dashboard Error:", err);
        setError("Unable to load dashboard data.");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId, API_URL]);

  const getProjectStatus = (project) => {
    const tasks = project?.aiPlan?.taskProgress || project?.taskProgress || [];
    if (!Array.isArray(tasks) || tasks.length === 0) return "Not Started";
    const completedCount = tasks.filter((t) => t.completed).length;
    if (completedCount === 0) return "Not Started";
    if (completedCount === tasks.length) return "Completed";
    return "In Progress";
  };

  const stats = useMemo(() => {
    let total = projects.length;
    let notStarted = 0;
    let inProgress = 0;
    let completed = 0;

    projects.forEach((p) => {
      const status = getProjectStatus(p);
      if (status === "Not Started") notStarted++;
      else if (status === "In Progress") inProgress++;
      else if (status === "Completed") completed++;
    });

    return { total, notStarted, inProgress, completed };
  }, [projects]);

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [projects]);

  const calculateProgress = (project) => {
    const tasks = project?.aiPlan?.taskProgress || project?.taskProgress || [];
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    const completed = tasks.filter((t) => t.completed).length;
    const total = tasks.length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowUserMenu(false);
    navigate("/");
  };

  const formatDate = (date) => {
    if (!date) return "Recently";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="project-layout">
      <Sidebar />

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-right">
            <div className="user-menu-container">
              <button
                type="button"
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
                <span className="username">{userName}</span>
                <span className="dropdown">{showUserMenu ? "⌃" : "⌄"}</span>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <Link to="/profile" onClick={() => setShowUserMenu(false)}>Profile</Link>
                  <Link to="/settings" onClick={() => setShowUserMenu(false)}>Settings</Link>
                  <button type="button" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PROPER CENTERED & CONSTRAINED CONTAINER WIDTH */}
        <div style={{ width: "100%", maxWidth: "1240px", margin: "0 auto", padding: "30px 24px", boxSizing: "border-box" }}>
          
          {/* HERO BANNER */}
          <div className="projects-hero" style={{ width: "100%", boxSizing: "border-box", marginBottom: "28px" }}>
            <div className="projects-hero-glow"></div>
            <div className="projects-hero-content">
              <div className="projects-eyebrow"><span>✦</span> WELCOME BACK, {userName.toUpperCase()}</div>
              <h1>Dashboard <span>Overview</span></h1>
              <p>Track your development progress, statistics, and recent software projects.</p>
            </div>
            <Link to="/project-idea" className="new-project-button">
              <span>＋</span> New Project
            </Link>
          </div>

          {error && (
            <div style={{ padding: "20px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "12px", marginBottom: "24px", color: "#f87171", textAlign: "center" }}>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} style={{ marginTop: "10px", padding: "8px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                Retry
              </button>
            </div>
          )}

          {loading && (
            <div className="projects-loading">
              <div className="loading-spinner"></div>
              <p>Loading dashboard statistics...</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* STATISTICS CARDS - Proper Equal Columns */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px", width: "100%", boxSizing: "border-box" }}>
                <div style={{ background: "#1e293b", padding: "24px", borderRadius: "16px", border: "1px solid #334155" }}>
                  <span style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "500" }}>Total Projects</span>
                  <h2 style={{ fontSize: "32px", color: "#fff", marginTop: "12px", fontWeight: "700" }}>{stats.total}</h2>
                </div>
                <div style={{ background: "#1e293b", padding: "24px", borderRadius: "16px", border: "1px solid #334155" }}>
                  <span style={{ color: "#3b82f6", fontSize: "14px", fontWeight: "500" }}>Not Started</span>
                  <h2 style={{ fontSize: "32px", color: "#fff", marginTop: "12px", fontWeight: "700" }}>{stats.notStarted}</h2>
                </div>
                <div style={{ background: "#1e293b", padding: "24px", borderRadius: "16px", border: "1px solid #334155" }}>
                  <span style={{ color: "#f59e0b", fontSize: "14px", fontWeight: "500" }}>In Progress</span>
                  <h2 style={{ fontSize: "32px", color: "#fff", marginTop: "12px", fontWeight: "700" }}>{stats.inProgress}</h2>
                </div>
                <div style={{ background: "#1e293b", padding: "24px", borderRadius: "16px", border: "1px solid #334155" }}>
                  <span style={{ color: "#10b981", fontSize: "14px", fontWeight: "500" }}>Completed</span>
                  <h2 style={{ fontSize: "32px", color: "#fff", marginTop: "12px", fontWeight: "700" }}>{stats.completed}</h2>
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div style={{ marginBottom: "32px", width: "100%" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#f8fafc" }}>Quick Actions</h3>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <Link to="/project-idea" style={{ padding: "10px 18px", background: "#3b82f6", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: "600" }}>
                    + New Project
                  </Link>
                  <Link to="/my-projects" style={{ padding: "10px 18px", background: "#334155", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: "600" }}>
                    My Projects
                  </Link>
                </div>
              </div>

              {/* RECENT PROJECTS */}
              <div style={{ width: "100%", boxSizing: "border-box" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#f8fafc" }}>Recent Projects</h3>

                {projects.length === 0 ? (
                  <div className="projects-empty">
                    <div className="empty-icon">✦</div>
                    <h3>No projects yet</h3>
                    <p>Start by creating your first software project with SpecFlow AI.</p>
                    <Link to="/project-idea" className="empty-create-button">
                      Create New Project →
                    </Link>
                  </div>
                ) : (
                  <div className="premium-project-list" style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
                    {recentProjects.map((project) => {
                      const currentStatus = getProjectStatus(project);
                      const progress = calculateProgress(project);
                      return (
                        <article className="premium-project-card" key={project._id} style={{ width: "100%", boxSizing: "border-box" }}>
                          <div className="project-card-accent"></div>
                          <div className="project-icon">✦</div>
                          <div className="project-card-content">
                            <div className="project-card-top">
                              <div>
                                <span className="project-status">
                                  <span className="status-dot" style={{
                                    background: currentStatus === "Completed" ? "#10b981" : currentStatus === "In Progress" ? "#f59e0b" : "#3b82f6"
                                  }}></span>
                                  {currentStatus.toUpperCase()}
                                </span>
                                <h3>{project.projectName}</h3>
                              </div>
                              <div className="project-date">
                                <span>Created</span>
                                <strong>{formatDate(project.createdAt)}</strong>
                              </div>
                            </div>

                            <p className="project-description">
                              {project.projectIdea || "No project description available."}
                            </p>

                            <div style={{ margin: "14px 0" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#94a3b8", marginBottom: "6px" }}>
                                <span>Development Progress</span>
                                <span>{progress.completed} / {progress.total} tasks completed ({progress.percentage}%)</span>
                              </div>
                              <div style={{ width: "100%", background: "#334155", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                                <div style={{ width: `${progress.percentage}%`, background: "#3b82f6", height: "100%", transition: "width 0.3s ease" }}></div>
                              </div>
                            </div>

                            <div className="project-card-footer">
                              <div className="project-meta">
                                <span><b>✦</b> AI Planning</span>
                              </div>
                              <div className="project-actions">
                                <button
                                  type="button"
                                  className="open-project-button"
                                  onClick={() => navigate(`/project/${project._id}`)}
                                >
                                  Open Project <span>→</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* =====================================================
    PROTECTED ROUTE FOR DASHBOARD
===================================================== */

function ProtectedDashboard() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <UserDashboard />;
}

/* =====================================================
    APP ROUTES
===================================================== */

function App() {
  return (
    <Routes>
      {/* PUBLIC LANDING PAGE (Root URL '/') */}
      <Route path="/" element={<Home />} />

      {/* PROTECTED DASHBOARD */}
      <Route path="/dashboard" element={<ProtectedDashboard />} />

      {/* AUTHENTICATION */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />

      {/* PROJECT & SIDEBAR PAGES */}
      <Route path="/project-idea" element={<ProjectIdea />} />
      <Route path="/my-projects" element={<MyProjects />} />
      <Route path="/ai-assistant" element={<AIAssistant />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/project/:projectId" element={<ProjectWorkspace />} />
    </Routes>
  );
}

export default App;
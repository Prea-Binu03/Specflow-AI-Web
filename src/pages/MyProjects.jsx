import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ProjectIdea.css";

function MyProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // =====================================================
  // EDIT PROJECT MODAL STATES
  // =====================================================
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editName, setEditName] = useState("");
  const [editIdea, setEditIdea] = useState("");
  const [editError, setEditError] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // =====================================================
  // SEARCH, FILTER, SORT STATES
  // =====================================================
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Projects");
  const [sortBy, setSortBy] = useState("Newest First");

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const userName =
    storedUser?.name ||
    storedUser?.fullName ||
    "User";

  const userId =
    storedUser?._id ||
    storedUser?.id;

  // =====================================================
  // LOAD PROJECTS
  // =====================================================

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!userId) {
          setProjects([]);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/projects/user/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load projects"
          );
        }

        setProjects(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Projects Error:",
          error
        );

        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId]);

  // =====================================================
  // HELPER: CALCULATE PROJECT STATUS
  // =====================================================
  const getProjectStatus = (project) => {
    const tasks = project?.aiPlan?.taskProgress || project?.taskProgress || [];
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return "Not Started";
    }
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
      return "Not Started";
    } else if (completedCount === tasks.length) {
      return "Completed";
    } else {
      return "In Progress";
    }
  };

  // =====================================================
  // FILTERED & SORTED PROJECTS
  // =====================================================
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.projectName && p.projectName.toLowerCase().includes(q)) ||
          (p.projectIdea && p.projectIdea.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "All Projects") {
      result = result.filter((p) => getProjectStatus(p) === statusFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "Newest First") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sortBy === "Oldest First") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      } else if (sortBy === "Recently Updated") {
        return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
      } else if (sortBy === "Project Name A-Z") {
        return (a.projectName || "").localeCompare(b.projectName || "");
      } else if (sortBy === "Project Name Z-A") {
        return (b.projectName || "").localeCompare(a.projectName || "");
      }
      return 0;
    });

    return result;
  }, [projects, searchQuery, statusFilter, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All Projects");
    setSortBy("Newest First");
  };

  // =====================================================
  // EDIT PROJECT HANDLERS
  // =====================================================
  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setEditName(project.projectName || "");
    setEditIdea(project.projectIdea || "");
    setEditError("");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditError("Project name is required.");
      return;
    }
    if (!editIdea.trim()) {
      setEditError("Project description is required.");
      return;
    }

    setIsSavingEdit(true);
    setEditError("");

    try {
      const response = await fetch(`http://localhost:5000/api/projects/${editingProject._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: editName.trim(),
          projectIdea: editIdea.trim(),
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned a non-JSON response. Please ensure backend route is set up and server is restarted.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update project");
      }

      setProjects((prev) =>
        prev.map((p) => (p._id === editingProject._id ? data.project : p))
      );

      setEditModalOpen(false);
      alert("Project updated successfully.");
    } catch (err) {
      console.error("Edit Error:", err);
      setEditError(err.message || "Unable to connect to backend.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowUserMenu(false);
    navigate("/login");
  };

  // =====================================================
  // DELETE PROJECT
  // =====================================================

  const handleDelete = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to delete project"
        );
        return;
      }

      setProjects(
        (previousProjects) =>
          previousProjects.filter(
            (project) =>
              project._id !== projectId
          )
      );

      alert(
        "Project deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete Error:",
        error
      );
      alert(
        "Cannot connect to backend."
      );
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Recently";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="project-layout">

      {/* SIDEBAR */}
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

          <Link to="/my-projects" className="side-link active">
            <span className="side-icon">▱</span>
            <span>My Projects</span>
          </Link>

          {/* Added AI Assistant Link */}
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

        <div className="history-section">
          <div className="history-title">
            <span>Project History</span>
            <span className="history-search">⌕</span>
          </div>

          {projects.length === 0 ? (
            <div className="empty-history">
              <div className="empty-history-icon">＋</div>
              <strong>No projects yet</strong>
              <p>Your generated projects<br />will appear here.</p>
            </div>
          ) : (
            <div className="history-list">
              {projects
                .slice(0, 5)
                .map((project) => (
                  <Link
                    key={project._id}
                    to={`/project/${project._id}`}
                    className="history-project"
                  >
                    <span className="history-project-icon">✦</span>
                    <span className="history-project-name">
                      {project.projectName}
                    </span>
                  </Link>
                ))}
            </div>
          )}
        </div>

        <div className="sidebar-bottom">
          <span className="sidebar-bottom-icon">✦</span>
          <span>Turn Ideas into<br />Real Software</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-title">
            My Projects
          </div>

          <div className="topbar-right">
            <div className="notification">♧</div>

            <div className="user-menu-container">
              <button
                type="button"
                className="user-button"
                onClick={() =>
                  setShowUserMenu(!showUserMenu)
                }
              >
                <div className="user-avatar">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="username">{userName}</span>
                <span className="dropdown">
                  {showUserMenu ? "⌃" : "⌄"}
                </span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span>♙</span> Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span>⚙</span> Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    <span>↪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <section className="content-area my-projects-page">

          <div className="projects-hero">
            <div className="projects-hero-glow"></div>
            <div className="projects-hero-content">
              <div className="projects-eyebrow">
                <span>✦</span> YOUR WORKSPACE
              </div>
              <h1>
                My <span>Projects</span>
              </h1>
              <p>Manage, review and continue working on your software projects.</p>
            </div>

            <Link to="/project-idea" className="new-project-button">
              <span>＋</span> New Project
            </Link>
          </div>

          <div className="projects-toolbar">
            <div>
              <h2>Your Projects</h2>
              <p>
                {projects.length === 0
                  ? "No projects created yet."
                  : `${filteredAndSortedProjects.length} of ${projects.length} ${
                      projects.length === 1 ? "project" : "projects"
                    } displayed`}
              </p>
            </div>
          </div>

          {!loading && projects.length > 0 && (
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "32px",
              alignItems: "center",
              background: "radial-gradient(circle at top left, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              padding: "20px 24px",
              borderRadius: "20px",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
            }}>
              <div style={{ position: "relative", flex: "1 1 260px" }}>
                <span style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#38bdf8",
                  fontSize: "15px",
                  pointerEvents: "none"
                }}>
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search by name or idea..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 44px",
                    borderRadius: "12px",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    background: "rgba(15, 23, 42, 0.6)",
                    color: "#f8fafc",
                    outline: "none",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                />
              </div>

              <div style={{ flex: "0 1 180px", position: "relative" }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    background: "rgba(15, 23, 42, 0.7)",
                    color: "#f8fafc",
                    fontSize: "14px",
                    fontWeight: "500",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="All Projects" style={{ background: "#0f172a" }}>All Status</option>
                  <option value="Not Started" style={{ background: "#0f172a" }}>Not Started</option>
                  <option value="In Progress" style={{ background: "#0f172a" }}>In Progress</option>
                  <option value="Completed" style={{ background: "#0f172a" }}>Completed</option>
                </select>
              </div>

              <div style={{ flex: "0 1 190px", position: "relative" }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    background: "rgba(15, 23, 42, 0.7)",
                    color: "#f8fafc",
                    fontSize: "14px",
                    fontWeight: "500",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="Newest First" style={{ background: "#0f172a" }}>Newest First</option>
                  <option value="Oldest First" style={{ background: "#0f172a" }}>Oldest First</option>
                  <option value="Recently Updated" style={{ background: "#0f172a" }}>Recently Updated</option>
                  <option value="Project Name A-Z" style={{ background: "#0f172a" }}>Project Name A-Z</option>
                  <option value="Project Name Z-A" style={{ background: "#0f172a" }}>Project Name Z-A</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleClearFilters}
                style={{
                  padding: "12px 20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  background: "rgba(244, 63, 94, 0.1)",
                  color: "#fb7185",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginLeft: "auto"
                }}
              >
                <span>✕</span> Clear Filters
              </button>
            </div>
          )}

          {loading && (
            <div className="projects-loading">
              <div className="loading-spinner"></div>
              <p>Loading your projects...</p>
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div className="projects-empty">
              <div className="empty-icon">✦</div>
              <h3>No projects yet</h3>
              <p>Start by creating your first software project with SpecFlow AI.</p>
              <Link to="/project-idea" className="empty-create-button">
                Create New Project →
              </Link>
            </div>
          )}

          {!loading &&
            projects.length > 0 &&
            filteredAndSortedProjects.length === 0 && (
              <div className="projects-empty">
                <div className="empty-icon">🔍</div>
                <h3>No matching projects found</h3>
                <p>Try adjusting your search terms or filters to find what you are looking for.</p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="empty-create-button"
                  style={{ border: "none", cursor: "pointer" }}
                >
                  Clear Filters
                </button>
              </div>
            )}

          {!loading &&
            filteredAndSortedProjects.length > 0 && (
              <div className="premium-project-list">
                {filteredAndSortedProjects.map((project) => {
                  const currentStatus = getProjectStatus(project);
                  return (
                    <article
                      className="premium-project-card"
                      key={project._id}
                    >
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

                        <div className="project-card-footer">
                          <div className="project-meta">
                            <span><b>✦</b> AI Planning</span>
                            <span><b>◆</b> Project Workspace</span>
                          </div>

                          <div className="project-actions">
                            <button
                              type="button"
                              className="open-project-button"
                              onClick={() => navigate(`/project/${project._id}`)}
                            >
                              Open Project <span>→</span>
                            </button>

                            <button
                              type="button"
                              className="open-project-button"
                              style={{
                                background: "rgba(56, 189, 248, 0.15)",
                                border: "1px solid rgba(56, 189, 248, 0.4)",
                                color: "#38bdf8"
                              }}
                              onClick={() => handleOpenEdit(project)}
                            >
                              Edit Project
                            </button>

                            <button
                              type="button"
                              className="delete-project-button"
                              onClick={() => handleDelete(project._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

        </section>
      </main>

      {/* =====================================================
          EDIT PROJECT MODAL (POLISHED UI)
      ===================================================== */}
      {editModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(10, 15, 30, 0.85)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            borderRadius: "24px",
            padding: "36px",
            width: "100%",
            maxWidth: "600px",
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ color: "#f8fafc", fontSize: "22px", fontWeight: "700", margin: 0 }}>
                Edit Project
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "20px",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>
            
            {editError && (
              <div style={{
                background: "rgba(244, 63, 94, 0.15)",
                border: "1px solid rgba(244, 63, 94, 0.4)",
                color: "#fb7185",
                padding: "12px 16px",
                borderRadius: "12px",
                marginBottom: "20px",
                fontSize: "14px",
                fontWeight: "500"
              }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>
                  Project Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter project name..."
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    background: "rgba(15, 23, 42, 0.75)",
                    color: "#f8fafc",
                    outline: "none",
                    fontSize: "15px",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
                  }}
                />
              </div>

              <div style={{ marginBottom: "28px" }}>
                <label style={{ display: "block", color: "#cbd5e1", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>
                  Project Idea / Description
                </label>
                <textarea
                  rows="5"
                  value={editIdea}
                  onChange={(e) => setEditIdea(e.target.value)}
                  placeholder="Describe your project idea..."
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    background: "rgba(15, 23, 42, 0.75)",
                    color: "#f8fafc",
                    outline: "none",
                    fontSize: "15px",
                    lineHeight: "1.6",
                    resize: "vertical",
                    minHeight: "140px",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "14px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                    background: "transparent",
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    transition: "all 0.2s"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                    transition: "all 0.2s"
                  }}
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyProjects;
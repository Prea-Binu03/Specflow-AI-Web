import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ProjectIdea.css";

function ProjectIdea() {
  // =====================================================
  // PROJECT FORM STATES
  // =====================================================

  const [projectName, setProjectName] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // =====================================================
  // AI IDEA GENERATOR STATES
  // =====================================================

  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [ideaTopic, setIdeaTopic] = useState("");
  const [generatedIdeas, setGeneratedIdeas] = useState([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  // =====================================================
  // PROJECT HISTORY
  // =====================================================

  const [projects, setProjects] = useState([]);

  // =====================================================
  // USER MENU
  // =====================================================

  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // LOGGED-IN USER
  // =====================================================

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const userName =
    storedUser?.name ||
    storedUser?.fullName ||
    "User";

  // =====================================================
  // LOAD PROJECT HISTORY
  // =====================================================

  const loadProjects = async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      const userId = user?._id || user?.id;

      if (!userId) {
        return [];
      }

      const response = await fetch(
        `http://localhost:5000/api/projects/user/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          data.message || "Unable to load projects"
        );
        return [];
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(
        "Project History Error:",
        error
      );
      return [];
    }
  };

  // =====================================================
  // LOAD PROJECTS WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const fetchInitialProjects = async () => {
      const result = await loadProjects();
      if (isMounted) {
        setProjects(result);
      }
    };

    fetchInitialProjects();

    return () => {
      isMounted = false;
    };
  }, []);

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
  // FETCH AI PROJECT IDEAS
  // =====================================================

  const handleFetchIdeas = async (e) => {
    e.preventDefault();
    if (!ideaTopic.trim()) return;

    setIsGeneratingIdeas(true);
    try {
      // Updated URL to point to the correct AI route endpoint
      const response = await fetch("http://localhost:5000/api/ai/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: ideaTopic }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate ideas");

      setGeneratedIdeas(data.ideas || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  // =====================================================
  // CREATE PROJECT + GENERATE AI PLAN
  // =====================================================

  const handleGenerate = async () => {
    try {
      // =================================================
      // VALIDATION
      // =================================================

      if (
        !projectName.trim() ||
        !projectIdea.trim()
      ) {
        alert(
          "Please fill Project Name and Software Idea."
        );
        return;
      }

      // =================================================
      // GET USER
      // =================================================

      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      const userId =
        user?._id || user?.id;

      if (!userId) {
        alert("Please login again.");
        navigate("/login");
        return;
      }

      // =================================================
      // START GENERATION
      // =================================================

      setIsGenerating(true);

      // =================================================
      // CREATE FORM DATA
      // =================================================

      const formData = new FormData();

      formData.append(
        "projectName",
        projectName.trim()
      );

      formData.append(
        "projectIdea",
        projectIdea.trim()
      );

      formData.append(
        "createdBy",
        userId
      );

      // =================================================
      // IMAGE
      // =================================================

      if (imageFile) {
        formData.append(
          "image",
          imageFile
        );
      }

      // =================================================
      // DOCUMENT
      // =================================================

      if (documentFile) {
        formData.append(
          "document",
          documentFile
        );
      }

      // =================================================
      // CREATE PROJECT IN DATABASE
      // =================================================

      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      // =================================================
      // CREATE PROJECT ERROR
      // =================================================

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to create project."
        );

        setIsGenerating(false);
        return;
      }

      // =================================================
      // GET CREATED PROJECT ID
      // =================================================

      const projectId =
        data.project?._id;

      if (!projectId) {
        alert(
          "Project was created, but project ID was not returned."
        );

        setIsGenerating(false);
        return;
      }

      // =================================================
      // GENERATE AI PROJECT PLAN
      // =================================================

      const aiResponse = await fetch(
        `http://localhost:5000/api/projects/${projectId}/generate-plan`,
        {
          method: "POST",
        }
      );

      const aiData =
        await aiResponse.json();

      // =================================================
      // AI GENERATION ERROR
      // =================================================

      if (!aiResponse.ok) {
        alert(
          aiData.message ||
            "AI project plan generation failed."
        );

        setIsGenerating(false);
        return;
      }

      // =================================================
      // SUCCESS
      // =================================================

      const updatedProjects = await loadProjects();
      setProjects(updatedProjects);

      // Open project workspace
      navigate(
        `/project/${projectId}`
      );

    } catch (error) {
      console.error(
        "Generate Project Error:",
        error
      );

      alert(
        "Unable to generate project plan. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="project-layout">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">

        {/* LOGO */}

        <div className="sidebar-logo">

          <span className="logo-star">
            ✦
          </span>

          <span>
            SpecFlow AI
          </span>

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="sidebar-nav">

          <Link
            to="/dashboard"
            className="side-link"
          >
            <span className="side-icon">
              ⌂
            </span>

            <span>
              Home
            </span>
          </Link>

          <Link
            to="/project-idea"
            className="side-link active"
          >
            <span className="side-icon">
              ＋
            </span>

            <span>
              New Project
            </span>
          </Link>

          <Link
            to="/my-projects"
            className="side-link"
          >
            <span className="side-icon">
              ▱
            </span>

            <span>
              My Projects
            </span>
          </Link>

          {/* Added AI Assistant Link */}
        <Link to="/ai-assistant" className="side-link">
          <span className="side-icon">🤖</span>
          <span>AI Assistant</span>
        </Link>

          <Link
            to="/profile"
            className="side-link"
          >
            <span className="side-icon">
              ♙
            </span>

            <span>
              Profile
            </span>
          </Link>

          <Link
            to="/settings"
            className="side-link"
          >
            <span className="side-icon">
              ⚙
            </span>

            <span>
              Settings
            </span>
          </Link>

        </nav>

        {/* =================================================
            PROJECT HISTORY
        ================================================= */}

        <div className="history-section">

          <div className="history-title">

            <span>
              Project History
            </span>

            <span className="history-search">
              ⌕
            </span>

          </div>

          {projects.length === 0 ? (

            <div className="empty-history">

              <div className="empty-history-icon">
                ＋
              </div>

              <strong>
                No projects yet
              </strong>

              <p>
                Your generated projects
                <br />
                will appear here.
              </p>

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

                    <span className="history-project-icon">
                      ✦
                    </span>

                    <span className="history-project-name">
                      {project.projectName}
                    </span>

                  </Link>

                ))}

            </div>

          )}

        </div>

        {/* =================================================
            SIDEBAR BOTTOM
        ================================================= */}

        <div className="sidebar-bottom">

          <span className="sidebar-bottom-icon">
            ✦
          </span>

          <span>
            Turn Ideas into
            <br />
            Real Software
          </span>

        </div>

      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main-content">

        {/* =================================================
            TOPBAR
        ================================================= */}

        <header className="topbar">

          <div className="topbar-title">
            New Project
          </div>

          <div className="topbar-right">

            <div className="notification">
              ♧
            </div>

            {/* USER MENU */}

            <div className="user-menu-container">

              <button
                type="button"
                className="user-button"
                onClick={() =>
                  setShowUserMenu(
                    !showUserMenu
                  )
                }
              >

                <div className="user-avatar">

                  {userName
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <span className="username">
                  {userName}
                </span>

                <span className="dropdown">

                  {showUserMenu
                    ? "⌃"
                    : "⌄"}

                </span>

              </button>

              {/* DROPDOWN */}

              {showUserMenu && (

                <div className="user-dropdown">

                  <Link
                    to="/profile"
                    onClick={() =>
                      setShowUserMenu(false)
                    }
                  >

                    <span>
                      ♙
                    </span>

                    Profile

                  </Link>

                  <Link
                    to="/settings"
                    onClick={() =>
                      setShowUserMenu(false)
                    }
                  >

                    <span>
                      ⚙
                    </span>

                    Settings

                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                  >

                    <span>
                      ↪
                    </span>

                    Logout

                  </button>

                </div>

              )}

            </div>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="content-area">

          {/* =================================================
              INTRO
          ================================================= */}

          <section className="intro">

            <div className="intro-label">
              ✦ Let's Build Something Amazing
            </div>

            <h1>

              Tell Us About

              <span>
                Your Project
              </span>

            </h1>

            <p>

              Describe your software idea and
              provide additional files if needed.
              SpecFlow AI will use this information
              to create your project plan.

            </p>

            {/* AI IDEA GENERATOR BUTTON */}
            <button
              type="button"
              onClick={() => setShowIdeaModal(true)}
              style={{
                marginTop: "15px",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#fff",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "600",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
              }}
            >
              ✦ Need Inspiration? Generate AI Ideas
            </button>

          </section>

          {/* =================================================
              PROJECT FORM
          ================================================= */}

          <div className="project-form-card">

            {/* PROJECT NAME */}

            <div className="form-group">

              <label>

                <span className="field-icon">

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >

                    <path
                      d="M4 7.5C4 6.67 4.67 6 5.5 6H10L12 8H18.5C19.33 8 20 8.67 20 9.5V17.5C20 18.33 19.33 19 18.5 19H5.5C4.67 19 4 18.33 4 17.5V7.5Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />

                  </svg>

                </span>

                Project Name

              </label>

              <input
                type="text"
                value={projectName}
                onChange={(e) =>
                  setProjectName(
                    e.target.value
                  )
                }
                placeholder="Enter your project name"
              />

            </div>

            {/* SOFTWARE IDEA */}

            <div className="form-group">

              <label>

                <span className="field-icon">
                  ✎
                </span>

                Describe Your Software Idea

              </label>

              <div className="textarea-wrapper">

                <textarea
                  value={projectIdea}
                  onChange={(e) =>
                    setProjectIdea(
                      e.target.value
                    )
                  }
                  maxLength={1000}
                  placeholder="Example: I want to build a platform where rural patients can consult doctors online..."
                />

                <span className="character-count">

                  {projectIdea.length}/1000

                </span>

              </div>

            </div>

            {/* =================================================
                UPLOADS
            ================================================= */}

            <div className="upload-row">

              {/* IMAGE */}

              <div className="upload-column">

                <label>

                  <span className="field-icon">
                    ▧
                  </span>

                  Upload Image

                </label>

                <label className="upload-box">

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) =>
                      setImageFile(
                        e.target.files?.[0] ||
                        null
                      )
                    }
                  />

                  <div className="upload-icon image-icon">

                    <svg
                      width="27"
                      height="27"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >

                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="16"
                        rx="3"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />

                      <circle
                        cx="8.5"
                        cy="9"
                        r="1.5"
                        fill="currentColor"
                      />

                      <path
                        d="M4.5 17L9 12.5L12 15.5L14.5 13L19.5 18"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                    </svg>

                  </div>

                  <div className="upload-title">

                    {imageFile
                      ? imageFile.name
                      : "Upload an image"}

                  </div>

                  <div className="upload-description">

                    PNG, JPG, JPEG or WEBP

                  </div>

                  <div className="upload-browse">

                    Browse File

                  </div>

                </label>

              </div>

              {/* DOCUMENT */}

              <div className="upload-column">

                <label>

                  <span className="field-icon">
                    ▤
                  </span>

                  Upload Document

                </label>

                <label className="upload-box">

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) =>
                      setDocumentFile(
                        e.target.files?.[0] ||
                        null
                      )
                    }
                  />

                  <div className="upload-icon document-icon">

                    <svg
                      width="27"
                      height="27"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >

                      <path
                        d="M6 3.5H14L19 8.5V20.5H6V3.5Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M14 3.5V8.5H19"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M9 12H16"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />

                      <path
                        d="M9 16H16"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />

                    </svg>

                  </div>

                  <div className="upload-title">

                    {documentFile
                      ? documentFile.name
                      : "Upload a document"}

                  </div>

                  <div className="upload-description">

                    PDF, DOCX or TXT

                  </div>

                  <div className="upload-browse">

                    Browse File

                  </div>

                </label>

              </div>

            </div>

            {/* =================================================
                GENERATE PROJECT PLAN
            ================================================= */}

            <button
              type="button"
              className="generate-project-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
            >

              <span>
                ✦
              </span>

              {isGenerating
                ? "Generating AI Project Plan..."
                : "Generate Project Plan"}

              <span>
                →
              </span>

            </button>

            <p className="generate-note">

              You can provide text, an image,
              a document, or a combination of them.

            </p>

          </div>

          {/* =================================================
              RIGHT MESSAGE
          ================================================= */}

          <div className="project-message">

            <div className="message-icon">
              ✦
            </div>

            <h3>

              Great projects start
              <br />
              with a simple idea.

            </h3>

            <p>

              Give SpecFlow AI enough context
              and we'll help you structure it.

            </p>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer className="project-footer">

            SpecFlow AI • Turn Ideas into Real Software

          </footer>

        </div>

      </main>

      {/* =================================================
          AI IDEA GENERATOR MODAL (PREMIUM & RECOMMENDED)
      ================================================= */}

      {showIdeaModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "#0f172a",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "32px",
            borderRadius: "16px",
            width: "720px",
            maxHeight: "85vh",
            overflowY: "auto",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            color: "#f8fafc"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#818cf8", textTransform: "uppercase", letterSpacing: "1px" }}>✦ SpecFlow AI Intelligence</span>
                <h3 style={{ fontSize: "22px", fontWeight: "700", marginTop: "4px", color: "#fff" }}>Generate AI Project Ideas</h3>
                <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "4px" }}>
                  Enter a domain or keyword to brainstorm brilliant, industry-ready project suggestions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIdeaModal(false)}
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

            <form onSubmit={handleFetchIdeas} style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <input
                type="text"
                placeholder="e.g., E-commerce, Healthcare, AI, FinTech..."
                value={ideaTopic}
                onChange={(e) => setIdeaTopic(e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: "12px 16px", 
                  background: "#1e293b", 
                  border: "1px solid #334155", 
                  borderRadius: "8px", 
                  fontSize: "14px",
                  color: "#fff",
                  outline: "none"
                }}
              />
              <button
                type="submit"
                disabled={isGeneratingIdeas}
                style={{
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                }}
              >
                {isGeneratingIdeas ? "Brainstorming..." : "Generate Ideas"}
              </button>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {generatedIdeas.map((item, index) => {
                const isBestChoice = index === 0;

                return (
                  <div key={index} style={{ 
                    background: isBestChoice ? "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(15, 23, 42, 0.6))" : "#1e293b", 
                    padding: "20px", 
                    borderRadius: "12px", 
                    border: isBestChoice ? "1px solid #6366f1" : "1px solid #334155",
                    position: "relative",
                    transition: "all 0.2s ease"
                  }}>
                    {isBestChoice && (
                      <span style={{
                        position: "absolute",
                        top: "-12px",
                        right: "20px",
                        background: "linear-gradient(135deg, #6366f1, #ec4899)",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        letterSpacing: "0.5px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                      }}>
                        🌟 BEST CHOICE & RECOMMENDED
                      </span>
                    )}

                    <h4 style={{ color: "#f8fafc", fontSize: "17px", fontWeight: "600", marginBottom: "8px" }}>{item.projectName}</h4>
                    <p style={{ fontSize: "14px", color: "#cbd5e1", marginBottom: "10px", lineHeight: "1.5" }}>{item.description}</p>
                    <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "14px" }}>
                      <strong style={{ color: "#e2e8f0" }}>Problem Solved:</strong> {item.problem}
                    </p>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setProjectName(item.projectName);
                        setProjectIdea(`${item.description}\n\nProblem Solved: ${item.problem}\n\nKey Features: ${item.features?.join(", ")}`);
                        setShowIdeaModal(false);
                      }}
                      style={{
                        padding: "8px 16px",
                        background: isBestChoice ? "#10b981" : "#3b82f6",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                      }}
                    >
                      Use This Idea →
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: "24px", textAlign: "right", borderTop: "1px solid #1e293b", paddingTop: "16px" }}>
              <button
                type="button"
                onClick={() => setShowIdeaModal(false)}
                style={{
                  padding: "8px 20px",
                  background: "#334155",
                  color: "#cbd5e1",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px"
                }}
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProjectIdea;
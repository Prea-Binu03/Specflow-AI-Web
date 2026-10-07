import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProjectWorkspace.css";
import API_URL from "../config";

/* =========================================================
USER HELPERS
========================================================= */

function getStoredUser() {
  const possibleKeys = [
    "user",
    "loggedInUser",
    "currentUser",
    "authUser",
  ];

  for (const key of possibleKeys) {
    try {
      const value = localStorage.getItem(key);

      if (value) {
        const parsed = JSON.parse(value);

        if (parsed) {
          return parsed;
        }
      }
    } catch (error) {
      console.error(`Unable to read ${key}`, error);
    }
  }

  return null;
}

function getUserId(user) {
  if (!user) return null;

  return (
    user._id ||
    user.id ||
    user.userId ||
    user.user?._id ||
    user.user?.id ||
    null
  );
}

function getUserName(user) {
  if (!user) return "User";

  return (
    user.name ||
    user.fullName ||
    user.username ||
    user.user?.name ||
    "User"
  );
}

function getInitial(name) {
  if (!name) return "U";

  return name.charAt(0).toUpperCase();
}

/* =========================================================
DATE HELPERS
========================================================= */

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/* =========================================================
STATUS HELPERS
========================================================= */

function getStatusClass(status) {
  if (status === "completed") return "completed";
  if (status === "generating") return "generating";
  if (status === "failed") return "failed";

  return "not-started";
}

function getStatusText(status) {
  if (status === "completed") return "Completed";
  if (status === "generating") return "Generating";
  if (status === "failed") return "Failed";

  return "Not Started";
}

function getProjectInitial(projectName) {
  if (!projectName) return "P";

  return projectName.charAt(0).toUpperCase();
}

/* =========================================================
NORMALIZATION HELPERS
========================================================= */

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  return [];
}

function normalizeText(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return String(value);
}

/* =========================================================
TECHNOLOGY CARD
========================================================= */

function TechnologyCard({
  icon,
  title,
  items,
}) {
  const values = normalizeArray(items);

  return (
    <div className="technology-card">
      <div className="technology-card-title">
        <span className="technology-card-icon">
          {icon}
        </span>

        <span>{title}</span>
      </div>

      <div className="technology-tags">
        {values.length > 0 ? (
          values.map((item, index) => (
            <span
              className="technology-tag"
              key={`${item}-${index}`}
            >
              {item}
            </span>
          ))
        ) : (
          <span className="technology-tag muted">
            Not required
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
ACCORDION SECTION
========================================================= */

function AccordionSection({
  icon,
  title,
  subtitle,
  count,
  children,
  open,
  onClick,
}) {
  return (
    <div
      className={`accordion-card ${
        open ? "open" : ""
      }`}
    >
      <button
        className="accordion-header"
        onClick={onClick}
        type="button"
      >
        <span className="accordion-icon">
          {icon}
        </span>

        <span className="accordion-heading">
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </span>

        {count !== undefined && (
          <span className="accordion-count">
            ({count})
          </span>
        )}

        <span className="accordion-arrow">
          {open ? "⌃" : "⌄"}
        </span>
      </button>

      {open && (
        <div className="accordion-content">
          {children}
        </div>
      )}
    </div>
  );
}

/* =========================================================
MAIN COMPONENT
========================================================= */

function ProjectWorkspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [editingSection, setEditingSection] = useState(null);
  const [savingSection, setSavingSection] = useState(false);
  /* eslint-disable no-unused-vars */
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const [editOverview, setEditOverview] = useState("");
  const [editTechStack, setEditTechStack] = useState({});
  const [editWhyTech, setEditWhyTech] = useState({});
  const [editAlternatives, setEditAlternatives] = useState([]);
  const [editRequirements, setEditRequirements] = useState([]);
  const [editFeatures, setEditFeatures] = useState([]);
  const [editUserStories, setEditUserStories] = useState([]);
  const [editDatabase, setEditDatabase] = useState({});
  const [editApi, setEditApi] = useState([]);
  const [editArchitecture, setEditArchitecture] = useState({});
  const [editTasks, setEditTasks] = useState([]);

  const startEditing = (sectionKey) => {
    setEditingSection(sectionKey);
    setSaveMessage("");
    setSaveError("");

    const plan = project?.aiPlan || {};
    if (sectionKey === "overview") setEditOverview(plan.overview || "");
    if (sectionKey === "technologyStack") setEditTechStack(JSON.parse(JSON.stringify(plan.technologyStack || {})));
    if (sectionKey === "whyTechnology") setEditWhyTech(JSON.parse(JSON.stringify(plan.whyTechnology || {})));
    if (sectionKey === "alternatives") setEditAlternatives(JSON.parse(JSON.stringify(plan.alternatives || [])));
    if (sectionKey === "requirements") setEditRequirements([...(plan.requirements || [])]);
    if (sectionKey === "features") setEditFeatures(JSON.parse(JSON.stringify(plan.features || [])));
    if (sectionKey === "userStories") setEditUserStories([...(plan.userStories || [])]);
    if (sectionKey === "database") setEditDatabase(JSON.parse(JSON.stringify(plan.database || {})));
    if (sectionKey === "api") setEditApi(JSON.parse(JSON.stringify(plan.api || [])));
    if (sectionKey === "architecture") setEditArchitecture(JSON.parse(JSON.stringify(plan.architecture || {})));
    if (sectionKey === "developmentTasks") setEditTasks([...(plan.developmentTasks || [])]);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setSaveMessage("");
    setSaveError("");
  };

  const saveSectionChanges = async (payloadKey, payloadData) => {
    if (!project?._id) return;
    try {
      setSavingSection(true);
      setSaveMessage("");
      setSaveError("");

      const response = await fetch(`${API_URL}/api/projects/${projectId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [payloadKey]: payloadData }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to save changes");
      }

      setProject(data.project);
      setSaveMessage("Changes saved successfully!");
      setTimeout(() => {
        setSaveMessage("");
        setEditingSection(null);
      }, 1000);
    } catch (err) {
      console.error("Save section error:", err);
      setSaveError("Unable to save changes");
    } finally {
      setSavingSection(false);
    }
  };

  /* =======================================================
  MAIN STATES
  ======================================================= */

  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [error, setError] = useState("");

  const [openSection, setOpenSection] = useState(null);

  const [deleting, setDeleting] = useState(false);

  // Profile Dropdown State Added Here
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  /* =======================================================
  DEVELOPMENT TASK STATES
  ======================================================= */

  const [taskSaving, setTaskSaving] = useState(false);

  const [resettingTasks, setResettingTasks] = useState(false);

  /* =======================================================
  AI CODE ASSISTANT STATES
  ======================================================= */

  const [
    generatingCodeIndex,
    setGeneratingCodeIndex,
  ] = useState(null);

  const [generatedCode, setGeneratedCode] = useState({});

  /* =======================================================
  CODE GENERATION HISTORY
  ======================================================= */

  const [
    codeGenerationHistory,
    setCodeGenerationHistory,
  ] = useState([]);

  /* =======================================================
  SHOW / HIDE GENERATED CODE
  ======================================================= */

  const [expandedCode, setExpandedCode] = useState({});

  /* =======================================================
  USER
  ======================================================= */

  const user = getStoredUser();

  const userId = getUserId(user);

  const userName = getUserName(user);

  /* =======================================================
  LOAD PROJECT
  ======================================================= */

  const loadProject = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/projects/${projectId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to load project"
        );
      }

      setProject(data.project);

      /* ---------------------------------------------------
      RESTORE SAVED CODE GENERATION HISTORY
      --------------------------------------------------- */

      const savedHistory = Array.isArray(
        data.project?.codeGenerationHistory
      )
        ? data.project.codeGenerationHistory
        : [];

      setCodeGenerationHistory(savedHistory);

      /* ---------------------------------------------------
      RESTORE LATEST GENERATED CODE FOR EACH TASK
      --------------------------------------------------- */

      const latestGeneratedCode = {};

      savedHistory.forEach((entry) => {
        const taskIndex = Number(
          entry.taskIndex
        );

        if (
          !Number.isNaN(taskIndex) &&
          entry.generatedCode
        ) {
          latestGeneratedCode[taskIndex] =
            entry.generatedCode;
        }
      });

      setGeneratedCode(
        latestGeneratedCode
      );

      /* ---------------------------------------------------
      KEEP SAVED CODE COLLAPSED
      --------------------------------------------------- */

      setExpandedCode({});

    } catch (err) {
      console.error(
        "Project loading error:",
        err
      );

      setError(
        err.message ||
        "Unable to load project"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
  EXPORT REPORT STATES & HANDLER
  ======================================================= */

  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  const handleExport = async (format) => {
    try {
      setExporting(true);
      setExportMessage(`Generating ${format.toUpperCase()} report...`);
      
      const response = await fetch(`${API_URL}/api/projects/${projectId}/export/${format}`);

      if (!response.ok) throw new Error('Failed to export report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.projectName || 'project'}_report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setExportMessage(`Report downloaded successfully as ${format.toUpperCase()}!`);
      setTimeout(() => setExportMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setExportMessage('Failed to export report. Please try again.');
      setTimeout(() => setExportMessage(''), 4000);
    } finally {
      setExporting(false);
    }
  };

  /* =======================================================
  LOAD USER PROJECTS
  ======================================================= */

  const loadProjects = async () => {
    if (!userId) {
      setProjects([]);
      setProjectsLoading(false);

      return;
    }

    try {
      setProjectsLoading(true);

      const response = await fetch(
        `${API_URL}/api/projects/user/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to load projects"
        );
      }

      setProjects(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {
      console.error(
        "Sidebar projects error:",
        err
      );

      setProjects([]);

    } finally {
      setProjectsLoading(false);
    }
  };

  /* =======================================================
     EFFECTS
  ======================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProject();
    }, 0);

    return () => {
      clearTimeout(timer);
    };

    // loadProject intentionally depends on projectId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects();
    }, 0);

    return () => {
      clearTimeout(timer);
    };

    // loadProjects intentionally depends on userId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  /* =======================================================
  DELETE PROJECT
  ======================================================= */

  const handleDeleteProject = async () => {
    if (!project?._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.projectName}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      const response = await fetch(
        `${API_URL}/api/projects/${project._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to delete project"
        );
      }

      navigate("/my-projects");

    } catch (err) {
      console.error(
        "Delete project error:",
        err
      );

      alert(
        err.message ||
        "Unable to delete project"
      );

    } finally {
      setDeleting(false);
    }
  };

  /* =======================================================
  ACCORDION
  ======================================================= */

  const toggleSection = (section) => {
    setOpenSection((current) =>
      current === section
        ? null
        : section
    );
  };

  /* =======================================================
  DEVELOPMENT TASKS
  ======================================================= */

  const getTaskProgress = () => {
    if (
      !project ||
      !Array.isArray(
        project.taskProgress
      )
    ) {
      return [];
    }

    return project.taskProgress;
  };

  const taskProgress = getTaskProgress();

  const totalTasks = taskProgress.length;

  /* =======================================================
  TASK TOGGLE (Fixed & Robust State Sync)
  ======================================================= */

  const handleTaskToggle = async (
    taskIndex,
    completed
  ) => {
    if (!project?._id) return;

    try {
      setTaskSaving(true);

      /* ---------------------------------------------------
      OPTIMISTIC UI UPDATE WITH INITIALIZATION
      --------------------------------------------------- */

      setProject(
        (currentProject) => {
          if (!currentProject) {
            return currentProject;
          }

          let updatedTasks =
            Array.isArray(
              currentProject.taskProgress
            ) && currentProject.taskProgress.length > 0
              ? [
                  ...currentProject.taskProgress,
                ]
              : (currentProject.aiPlan?.developmentTasks || []).map(
                  (t) => ({
                    task: typeof t === "string" ? t : t.task,
                    completed: false,
                  })
                );

          if (!updatedTasks[taskIndex]) {
            updatedTasks[taskIndex] = {
              task: "",
              completed: false,
            };
          }

          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            completed,
          };

          return {
            ...currentProject,
            taskProgress:
              updatedTasks,
          };
        }
      );

      /* ---------------------------------------------------
      SAVE TO BACKEND
      --------------------------------------------------- */

      const response = await fetch(
        `${API_URL}/api/projects/${project._id}/tasks/${taskIndex}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            completed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to update task"
        );
      }

      /* ---------------------------------------------------
      SERVER RESPONSE
      --------------------------------------------------- */

      if (data.taskProgress) {
        setProject(
          (currentProject) => ({
            ...currentProject,

            taskProgress:
              data.taskProgress,
          })
        );
      }

    } catch (err) {
      console.error(
        "Task update error:",
        err
      );

      alert(
        err.message ||
        "Unable to update task"
      );

      await loadProject();

    } finally {
      setTaskSaving(false);
    }
  };

  /* =======================================================
  RESET TASKS
  ======================================================= */

  const handleResetTasks = async () => {
    if (!project?._id) return;

    if (totalTasks === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to reset all development tasks?"
    );

    if (!confirmed) return;

    try {
      setResettingTasks(true);

      const response = await fetch(
        `${API_URL}/api/projects/${project._id}/tasks/reset`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to reset tasks"
        );
      }

      if (data.taskProgress) {
        setProject(
          (currentProject) => ({
            ...currentProject,

            taskProgress:
              data.taskProgress,
          })
        );
      } else {
        await loadProject();
      }

    } catch (err) {
      console.error(
        "Reset tasks error:",
        err
      );

      alert(
        err.message ||
        "Unable to reset tasks"
      );

    } finally {
      setResettingTasks(false);
    }
  };

  /* =======================================================
  AI CODE GENERATION
  ======================================================= */

  const handleGenerateCode = async (
    taskIndex
  ) => {
    if (!project?._id) return;

    try {
      setGeneratingCodeIndex(
        taskIndex
      );

      const response = await fetch(
        `${API_URL}/api/projects/${project._id}/tasks/${taskIndex}/generate-code`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to generate code"
        );
      }

      /* ---------------------------------------------------
      SAVE GENERATED CODE TO UI
      --------------------------------------------------- */

      setGeneratedCode(
        (current) => ({
          ...current,

          [taskIndex]:
            data.generatedCode,
        })
      );

      /* ---------------------------------------------------
      UPDATE HISTORY
      --------------------------------------------------- */

      if (
        Array.isArray(
          data.codeGenerationHistory
        )
      ) {
        setCodeGenerationHistory(
          data.codeGenerationHistory
        );

      } else if (
        data.historyEntry
      ) {
        setCodeGenerationHistory(
          (current) => [
            ...current,
            data.historyEntry,
          ]
        );
      }

      /* ---------------------------------------------------
      OPEN GENERATED CODE
      --------------------------------------------------- */

      setExpandedCode(
        (current) => ({
          ...current,

          [taskIndex]: true,
        })
      );

    } catch (err) {
      console.error(
        "AI code generation error:",
        err
      );

      alert(
        err.message ||
        "Unable to generate code"
      );

    } finally {
      setGeneratingCodeIndex(
        null
      );
    }
  };

  /* =======================================================
  VIEW PREVIOUS CODE GENERATION
  ======================================================= */

  const handleViewGeneratedCode = (
    historyEntry
  ) => {
    const taskIndex = Number(
      historyEntry.taskIndex
    );

    if (
      Number.isNaN(taskIndex) ||
      !historyEntry.generatedCode
    ) {
      return;
    }

    setGeneratedCode(
      (current) => ({
        ...current,

        [taskIndex]:
          historyEntry.generatedCode,
      })
    );

    setExpandedCode(
      (current) => ({
        ...current,

        [taskIndex]: true,
      })
    );
  };

  /* =======================================================
  LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="workspace-loading">
        <div className="loading-spinner"></div>

        <h3>
          Loading Project Workspace...
        </h3>

        <p>
          Preparing your AI-generated
          project plan.
        </p>
      </div>
    );
  }

  /* =======================================================
  ERROR
  ======================================================= */

  if (error || !project) {
    return (
      <div className="workspace-error">
        <div className="error-icon">
          !
        </div>

        <h2>
          Unable to load project
        </h2>

        <p>
          {error ||
            "Project was not found."}
        </p>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/my-projects")
          }
        >
          Back to My Projects
        </button>
      </div>
    );
  }

  /* =======================================================
  AI PLAN DATA
  ======================================================= */

  const aiPlan = project.aiPlan || {};

  const technologyStack = aiPlan.technologyStack || {};

  const whyTechnology = aiPlan.whyTechnology || {};

  const alternatives = normalizeArray(
    aiPlan.alternatives
  );

  const requirements = normalizeArray(
    aiPlan.requirements
  );

  const features = normalizeArray(
    aiPlan.features
  );

  const userStories = normalizeArray(
    aiPlan.userStories
  );

  const database = aiPlan.database || {};

  const api = normalizeArray(aiPlan.api);

  const architecture = aiPlan.architecture || {};

  const developmentTasks = normalizeArray(
    aiPlan.developmentTasks
  );

  /* =======================================================
  TASK DISPLAY DATA
  ======================================================= */

  const displayTasks =
    taskProgress.length > 0
      ? taskProgress
      : developmentTasks.map(
          (task) => ({
            task: normalizeText(task),
            completed: false,
          })
        );

  const displayTotalTasks = displayTasks.length;

  const displayCompletedTasks = displayTasks.filter(
    (item) =>
      item.completed === true || item.completed === 1 || item.completed === "true"
  ).length;

  const displayPercentage =
    displayTotalTasks > 0
      ? Math.round(
          (displayCompletedTasks /
            displayTotalTasks) *
            100
        )
      : 0;

  /* =======================================================
  RENDER
  ======================================================= */

  return (
    <div className="workspace-page">

      {/* ===================================================
      SIDEBAR
      =================================================== */}

      <aside className="workspace-sidebar">

        <div className="sidebar-logo">

          <span className="sidebar-logo-icon">
            ✦
          </span>

          <span>
            SpecFlow <b>AI</b>
          </span>

        </div>

        <nav className="sidebar-navigation">

          <button
            className="sidebar-link"
            onClick={() =>
              navigate("/dashboard")
            }
            type="button"
          >
            <span>⌂</span>
            <span>Home</span>
          </button>

          <button
            className="sidebar-link"
            onClick={() =>
              navigate(
                "/project-idea"
              )
            }
            type="button"
          >
            <span>＋</span>
            <span>New Project</span>
          </button>

          <button
            className="sidebar-link active"
            onClick={() =>
              navigate(
                "/my-projects"
              )
            }
            type="button"
          >
            <span>□</span>
            <span>My Projects</span>
          </button>

          <button
            className="sidebar-link"
            onClick={() =>
              navigate("/profile")
            }
            type="button"
          >
            <span>♟</span>
            <span>Profile</span>
          </button>

          <button
            className="sidebar-link"
            onClick={() =>
              navigate("/settings")
            }
            type="button"
          >
            <span>⚙</span>
            <span>Settings</span>
          </button>

        </nav>

        {/* =================================================
        REAL DATABASE PROJECTS
        ================================================== */}

        <div className="sidebar-projects">

          <div className="sidebar-projects-header">

            <span className="sidebar-projects-title">
              YOUR PROJECTS (
              {projects.length}
              )
            </span>

            <span className="sidebar-projects-count">
              ({projects.length})
            </span>

          </div>

          <div className="sidebar-project-list">

            {projectsLoading ? (

              <div className="sidebar-loading">
                Loading projects...
              </div>

            ) : projects.length ===
              0 ? (

              <div className="sidebar-empty">
                No projects created yet.
              </div>

            ) : (

              projects.map(
                (item) => (

                  <button
                    key={item._id}
                    className={`sidebar-project ${
                      item._id ===
                      project._id
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      navigate(
                        `/project/${item._id}`
                      )
                    }
                    type="button"
                  >

                    <span className="sidebar-project-icon">
                      {getProjectInitial(
                        item.projectName
                      )}
                    </span>

                    <span className="sidebar-project-info">

                      <span className="sidebar-project-name">
                        {item.projectName}
                      </span>

                      <span
                        className={`sidebar-project-status ${getStatusClass(
                          item.aiStatus
                        )}`}
                      >
                        {getStatusText(
                          item.aiStatus
                        )}
                      </span>

                    </span>

                  </button>

                )
              )

            )}

          </div>

          <button
            className="sidebar-projects-link"
            onClick={() =>
              navigate(
                "/my-projects"
              )
            }
            type="button"
          >
            View all projects →
          </button>

        </div>

        <div className="sidebar-footer">

          <span className="sidebar-footer-icon">
            ⚡
          </span>

          <div>
            Turn Ideas into

            <strong>
              Real Software
            </strong>
          </div>

        </div>

      </aside>

      {/* ===================================================
      MAIN
      =================================================== */}

      <main className="workspace-main">

        {/* =================================================
        TOP BAR
        ================================================== */}

        <header className="workspace-topbar">

          <div className="workspace-topbar-title">
            Project Workspace
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              type="button"
              onClick={() => navigate(`/ai-assistant?projectId=${project._id}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                color: "#fff",
                border: "none",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.4)"
              }}
            >
              <span>🤖</span> Ask AI About This Project
            </button>

            {/* Interactive User Profile & Dropdown Menu */}
            <div className="workspace-user user-menu-container" style={{ position: "relative" }}>
              <button
                type="button"
                className="user-button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                style={{
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "8px"
                }}
              >
                <span className="notification-icon">
                  ♧
                </span>

                <span className="user-avatar">
                  {getInitial(userName)}
                </span>

                <span className="user-name">
                  {userName}
                </span>

                <span className="user-arrow">
                  {userMenuOpen ? "⌃" : "⌄"}
                </span>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown-menu">
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/profile");
                    }}
                  >
                    <span>👤</span> Profile
                  </button>

                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/settings");
                    }}
                  >
                    <span>⚙️</span> Settings
                  </button>

                  <button
                    type="button"
                    className="dropdown-item logout-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      localStorage.clear();
                      navigate("/");
                    }}
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>

        </header>

        <div className="workspace-content">

          {/* =================================================
          BACK
          ================================================== */}

          <button
            className="back-project-button"
            onClick={() =>
              navigate(
                "/my-projects"
              )
            }
            type="button"
          >
            ← Back to My Projects
          </button>

          {/* =================================================
          EXPORT REPORT BAR
          ================================================== */}

          <div className="workspace-export-bar">
            <div className="export-bar-label">
              <span>📊</span>
              <span>Export Project Report:</span>
            </div>
            
            <div className="export-buttons-group">
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                disabled={exporting}
                className="export-btn export-pdf-btn"
              >
                {exporting ? (
                  <span className="export-spinner"></span>
                ) : (
                  <span>📥</span>
                )}
                <span>{exporting ? 'Exporting...' : 'Download PDF'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleExport('docx')}
                disabled={exporting}
                className="export-btn export-docx-btn"
              >
                {exporting ? (
                  <span className="export-spinner"></span>
                ) : (
                  <span>📄</span>
                )}
                <span>{exporting ? 'Exporting...' : 'Download DOCX'}</span>
              </button>
            </div>

            {exportMessage && (
              <div className="export-message">
                {exportMessage}
              </div>
            )}
          </div>

          {/* =================================================
          HERO + WHY STACK
          ================================================== */}

          <div className="dashboard-top-grid">

            {/* PROJECT HERO */}

            <section className="project-hero">

              <div className="project-hero-label">
                ✦ PROJECT WORKSPACE
              </div>

              <h1>
                {project.projectName}
              </h1>

              <p>
                {project.projectIdea}
              </p>

              <div className="hero-meta">

                <span
                  className={`status-pill ${getStatusClass(
                    project.aiStatus
                  )}`}
                >
                  ●{" "}
                  {getStatusText(
                    project.aiStatus
                  )}
                </span>

                <span>
                  ▣{" "}
                  {formatDate(
                    project.createdAt
                  )}
                </span>

                <span>
                  ▣ ID:{" "}
                  {project._id}
                </span>

              </div>

            </section>

            {/* WHY THIS STACK */}

            <section className="why-stack-card">

              <h2>
                🌟 Why This Stack?
              </h2>

              <div className="why-stack-list">

                {Object.entries(
                  whyTechnology
                ).filter(
                  ([, value]) =>
                    value &&
                    value !==
                    "Not required"
                ).length === 0 ? (

                  <div className="why-empty">
                    AI technology reasoning
                    is not available.
                  </div>

                ) : (

                  Object.entries(
                    whyTechnology
                  )
                    .filter(
                      ([, value]) =>
                        value &&
                        value !==
                        "Not required"
                    )
                    .slice(0, 5)
                    .map(
                      (
                        [
                          category,
                          reason,
                        ],
                        index
                      ) => (

                        <div
                          className="why-stack-item"
                          key={`${category}-${index}`}
                        >

                          <span className="why-stack-check">
                            ✓
                          </span>

                          <span>
                            {reason}
                          </span>

                        </div>

                      )
                    )

                )}

              </div>

            </section>

          </div>

          {/* =================================================
          TECHNOLOGY + ALTERNATIVES
          ================================================== */}

          <div className="dashboard-middle-grid">

            {/* TECHNOLOGY STACK */}

            <section className="technology-stack-card">

              <div className="technology-stack-header">

                <div className="technology-title-area">

                  <span className="technology-main-icon">
                    ⚡
                  </span>

                  <div>

                    <div className="technology-eyebrow">
                      AI RECOMMENDED
                    </div>

                    <h2>
                      AI Recommended
                      Technology Stack
                    </h2>

                    <p>
                      Technologies selected
                      specifically for this
                      project.
                    </p>

                  </div>

                </div>

                <div className="technology-stack-badge">
                  AI Selected
                </div>

              </div>

              <div className="technology-grid">

                <TechnologyCard
                  icon="🎨"
                  title="Frontend"
                  items={
                    technologyStack.frontend
                  }
                />

                <TechnologyCard
                  icon="⚙"
                  title="Backend"
                  items={
                    technologyStack.backend
                  }
                />

                <TechnologyCard
                  icon="🗄"
                  title="Database"
                  items={
                    technologyStack.database
                  }
                />

                <TechnologyCard
                  icon="🔐"
                  title="Authentication"
                  items={
                    technologyStack.authentication
                  }
                />

                <TechnologyCard
                  icon="🤖"
                  title="AI / AI Services"
                  items={
                    technologyStack.ai
                  }
                />

                <TechnologyCard
                  icon="☁"
                  title="File Storage"
                  items={
                    technologyStack.fileStorage
                  }
                />

                <TechnologyCard
                  icon="📡"
                  title="Real-time"
                  items={
                    technologyStack.realtime
                  }
                />

                <TechnologyCard
                  icon="🔗"
                  title="API"
                  items={
                    technologyStack.api
                  }
                />

                <TechnologyCard
                  icon="🚀"
                  title="Deployment"
                  items={
                    technologyStack.deployment
                  }
                />

                <TechnologyCard
                  icon="🛠"
                  title="Development Tools"
                  items={
                    technologyStack.developmentTools
                  }
                />

              </div>

            </section>

            {/* ALTERNATIVES */}

            <section className="alternatives-card">

              <div className="alternatives-header">

                <span className="alternatives-header-icon">
                  ↗️
                </span>

                <div>

                  <h2>
                    Alternative
                    Technology Options
                  </h2>

                  <p>
                    Other technology approaches
                    considered by AI.
                  </p>

                </div>

              </div>

              <div className="alternatives-list">

                {alternatives.length ===
                  0 ? (

                  <div className="alternative-empty">
                    No alternative technology
                    options generated.
                  </div>

                ) : (

                  alternatives.map(
                    (
                      alternative,
                      index
                    ) => (

                      <div
                        className="alternative-option"
                        key={index}
                      >

                        <span className="alternative-number">
                          {index + 1}
                        </span>

                        <div className="alternative-info">

                          <strong>
                            {
                              alternative.name
                            }
                          </strong>

                          <span>
                            {
                              alternative.description
                            }
                          </span>

                          <small>
                            <b>
                              Suitability:
                            </b>{" "}
                            {
                              alternative.suitability
                            }
                          </small>

                        </div>

                      </div>

                    )
                  )

                )}

              </div>

            </section>

          </div>

          {/* =================================================
          ACCORDIONS
          ================================================== */}

          <div className="accordion-grid">

            {/* =================================================
            PROJECT OVERVIEW
            ================================================== */}

            <AccordionSection
              icon="▤"
              title="Project Overview"
              subtitle="AI-generated understanding of your project."
              open={
                openSection ===
                "overview"
              }
              onClick={() =>
                toggleSection(
                  "overview"
                )
              }
            >

              <div className="overview-content">
                {/* Modern Edit Overview Button & Input */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                  {editingSection !== "overview" ? (
                    <button 
                      onClick={() => startEditing("overview")}
                      style={{
                        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                        color: "#ffffff",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      ✏️ Edit Overview
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        disabled={savingSection}
                        onClick={() => saveSectionChanges("overview", editOverview)}
                        style={{
                          background: "#10b981",
                          color: "#ffffff",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                      >
                        {savingSection ? "Saving..." : "💾 Save"}
                      </button>
                      <button 
                        onClick={cancelEditing} 
                        disabled={savingSection} 
                        style={{
                          background: "#4b5563",
                          color: "#ffffff",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Content View / Styled Textarea */}
                {editingSection !== "overview" ? (
                  <p style={{ lineHeight: "1.6", color: "#e2e8f0" }}>{project?.aiPlan?.overview}</p>
                ) : (
                  <textarea
                    value={editOverview}
                    onChange={(e) => setEditOverview(e.target.value)}
                    rows={6}
                    style={{ 
                      width: "100%", 
                      padding: "12px", 
                      fontSize: "14px", 
                      borderRadius: "8px", 
                      border: "1px solid #3b82f6", 
                      background: "#0f172a",
                      color: "#ffffff",
                      outline: "none",
                      lineHeight: "1.5"
                    }}
                  />
                )}

                {saveMessage && editingSection === "overview" && <p style={{ color: "#34d399", marginTop: "8px", fontSize: "13px" }}>{saveMessage}</p>}
                {saveError && editingSection === "overview" && <p style={{ color: "#f87171", marginTop: "8px", fontSize: "13px" }}>{saveError}</p>}
              </div>

            </AccordionSection>

            {/* =================================================
            REQUIREMENTS
            ================================================== */}

            <AccordionSection
              icon="✓"
              title="Requirements"
              subtitle="Functional and non-functional requirements."
              count={
                requirements.length
              }
              open={
                openSection ===
                "requirements"
              }
              onClick={() =>
                toggleSection(
                  "requirements"
                )
              }
            >

              <ol className="requirements-list">

                {requirements.map(
                  (
                    item,
                    index
                  ) => (

                    <li key={index}>
                      {item}
                    </li>

                  )
                )}

              </ol>

            </AccordionSection>

            {/* =================================================
            FEATURES
            ================================================== */}

            <AccordionSection
              icon="◇"
              title="Features & Modules"
              subtitle="Key features and modules for the system."
              count={
                features.length
              }
              open={
                openSection ===
                "features"
              }
              onClick={() =>
                toggleSection(
                  "features"
                )
              }
            >

              <div className="features-list">

                {features.map(
                  (
                    feature,
                    index
                  ) => (

                    <div
                      className="feature-item"
                      key={index}
                    >

                      <div className="feature-item-header">

                        <h3>
                          {
                            feature.name
                          }
                        </h3>

                        <span
                          className={`priority-badge priority-${String(
                            feature.priority ||
                            "medium"
                          ).toLowerCase()}`}
                        >
                          {
                            feature.priority ||
                            "Medium"
                          }
                        </span>

                      </div>

                      <p>
                        {
                          feature.description
                        }
                      </p>

                    </div>

                  )
                )}

              </div>

            </AccordionSection>

            {/* =================================================
            USER STORIES
            ================================================== */}

            <AccordionSection
              icon="♟"
              title="User Stories"
              subtitle="User stories from different user perspectives."
              count={
                userStories.length
              }
              open={
                openSection ===
                "userStories"
              }
              onClick={() =>
                toggleSection(
                  "userStories"
                )
              }
            >

              <div className="user-stories-list">

                {userStories.map(
                  (
                    story,
                    index
                  ) => (

                    <div
                      className="user-story"
                      key={index}
                    >

                      <span className="story-number">
                        {index + 1}
                      </span>

                      <p>
                        {story}
                      </p>

                    </div>

                  )
                )}

              </div>

            </AccordionSection>

            {/* =================================================
            DATABASE
            ================================================== */}

            <AccordionSection
              icon="▤"
              title="Database Design"
              subtitle="Database type, collections and schema details."
              open={
                openSection ===
                "database"
              }
              onClick={() =>
                toggleSection(
                  "database"
                )
              }
            >

              <div className="database-content">

                <div className="database-type">

                  <span>
                    Database Type
                  </span>

                  <strong>
                    {
                      database.databaseType ||
                      "Not specified"
                    }
                  </strong>

                </div>

                <h4>
                  Collections / Tables
                </h4>

                <div className="collection-tags">

                  {normalizeArray(
                    database.collections
                  ).map(
                    (
                      collection,
                      index
                    ) => (

                      <span
                        className="collection-tag"
                        key={index}
                      >
                        {collection}
                      </span>

                    )
                  )}

                </div>

                <div className="database-description">

                  <h4>
                    Description
                  </h4>

                  <p>
                    {
                      database.description ||
                      "No database description generated."
                    }
                  </p>

                </div>

              </div>

            </AccordionSection>

            {/* =================================================
            API
            ================================================== */}

            <AccordionSection
              icon="↗️"
              title="API Design"
              subtitle="API endpoints with methods and descriptions."
              open={
                openSection ===
                "api"
              }
              onClick={() =>
                toggleSection("api")
              }
            >

              <div className="api-list">

                {api.map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      className="api-item"
                      key={index}
                    >

                      <div className="api-top">

                        <span className="method-badge">
                          {
                            item.method
                          }
                        </span>

                        <code>
                          {
                            item.endpoint
                          }
                        </code>

                      </div>

                      <p>
                        {
                          item.purpose
                        }
                      </p>

                    </div>

                  )
                )}

              </div>

            </AccordionSection>

            {/* =================================================
            ARCHITECTURE
            ================================================== */}

            <AccordionSection
              icon="◇"
              title="Technical Architecture"
              subtitle="System architecture and data flow."
              open={
                openSection ===
                "architecture"
              }
              onClick={() =>
                toggleSection(
                  "architecture"
                )
              }
            >

              <div className="architecture-grid">

                <div className="architecture-item">

                  <span>
                    Frontend
                  </span>

                  <p>
                    {
                      architecture.frontend ||
                      "Not specified"
                    }
                  </p>

                </div>

                <div className="architecture-item">

                  <span>
                    Backend
                  </span>

                  <p>
                    {
                      architecture.backend ||
                      "Not specified"
                    }
                  </p>

                </div>

                <div className="architecture-item">

                  <span>
                    Database
                  </span>

                  <p>
                    {
                      architecture.database ||
                      "Not specified"
                    }
                  </p>

                </div>

                <div className="architecture-item">

                  <span>
                    Architecture Style
                  </span>

                  <p>
                    {
                      architecture.architectureStyle ||
                      "Not specified"
                    }
                  </p>

                </div>

                <div className="architecture-item architecture-flow">

                  <span>
                    Data Flow
                  </span>

                  <p>
                    {
                      architecture.dataFlow ||
                      "Not specified"
                    }
                  </p>

                </div>

              </div>

            </AccordionSection>

            {/* =================================================
            DEVELOPMENT TASKS
            ================================================== */}

            <AccordionSection
              icon="☑"
              title="Development Tasks"
              subtitle="Step-by-step implementation plan."
              count={
                displayTotalTasks
              }
              open={
                openSection ===
                "developmentTasks"
              }
              onClick={() =>
                toggleSection(
                  "developmentTasks"
                )
              }
            >

              <div className="development-tasks">

                {/* =================================================
                PROGRESS HEADER
                ================================================== */}

                <div className="task-progress-header">

                  <div className="task-progress-title">

                    <div>

                      <strong>
                        Development Progress
                      </strong>

                      <span>
                        {
                          displayCompletedTasks
                        }{" "}
                        of{" "}
                        {
                          displayTotalTasks
                        }{" "}
                        tasks completed
                      </span>

                    </div>

                    <strong className="task-progress-percentage">
                      {
                        displayPercentage
                      }%
                    </strong>

                  </div>

                  <div className="task-progress-bar">

                    <div
                      className="task-progress-fill"
                      style={{
                        width: `${displayPercentage}%`,
                      }}
                    ></div>

                  </div>

                </div>

                {/* =================================================
                TASK ACTIONS
                ================================================== */}

                <div className="task-actions">

                  <span className="task-saving-message">

                    {taskSaving
                      ? "Saving..."
                      : resettingTasks
                      ? "Resetting..."
                      : "Progress saved automatically"}

                  </span>

                  <button
                    type="button"
                    className="reset-tasks-button"
                    onClick={
                      handleResetTasks
                    }
                    disabled={
                      resettingTasks ||
                      taskSaving ||
                      displayTotalTasks ===
                      0
                    }
                  >
                    {resettingTasks
                      ? "Resetting..."
                      : "Reset All Tasks"}
                  </button>

                </div>

                {/* =================================================
                TASK LIST
                ================================================== */}

                {displayTotalTasks ===
                  0 ? (

                  <div className="development-task-empty">
                    No development tasks have
                    been generated yet.
                  </div>

                ) : (

                  <div className="development-task-list">

                    {displayTasks.map(
                      (
                        taskItem,
                        index
                      ) => {

                        const taskText =
                          typeof taskItem ===
                          "string"
                            ? taskItem
                            : taskItem.task;

                        const isCompleted =
                          typeof taskItem ===
                            "object" &&
                          taskItem !== null &&
                          (taskItem.completed === true ||
                           taskItem.completed === 1 ||
                           taskItem.completed === "true");

                        /* -----------------------------------------
                        HISTORY FOR THIS TASK
                        ------------------------------------------ */

                        const taskHistory =
                          codeGenerationHistory
                            .filter(
                              (entry) =>
                                Number(
                                  entry.taskIndex
                                ) === index
                            )
                            .sort(
                              (a, b) =>
                                new Date(
                                  b.generatedAt
                                ).getTime() -
                                new Date(
                                  a.generatedAt
                                ).getTime()
                            );

                        return (

                          <div
                            className={`development-task ${
                              isCompleted
                                ? "task-completed"
                                : ""
                            }`}
                            key={index}
                          >

                            {/* =================================================
                            CHECKBOX (Fully clickable & interactive)
                            ================================================== */}

                            <div
                              className="task-checkbox-wrapper"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleTaskToggle(index, !isCompleted);
                              }}
                              style={{
                                position: "relative",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "24px",
                                height: "24px",
                                background: isCompleted ? "#3b82f6" : "rgba(255, 255, 255, 0.08)",
                                border: "2px solid",
                                borderColor: isCompleted ? "#3b82f6" : "rgba(255, 255, 255, 0.4)",
                                borderRadius: "6px",
                                flexShrink: 0,
                                zIndex: 9999,
                                pointerEvents: "auto",
                                transition: "all 0.2s ease",
                                boxShadow: isCompleted ? "0 0 10px rgba(59, 130, 246, 0.5)" : "none"
                              }}
                            >
                              {isCompleted && (
                                <span style={{ 
                                  color: "#ffffff", 
                                  fontSize: "13px", 
                                  fontWeight: "bold",
                                  lineHeight: 1 
                                }}>
                                  ✓
                                </span>
                              )}
                            </div>

                            {/* =================================================
                            TASK NUMBER
                            ================================================== */}

                            <span className="task-number">
                              {index + 1}
                            </span>

                            {/* =================================================
                            TASK CONTENT
                            ================================================== */}

                            <div className="task-content">

                              <p>
                                {taskText}
                              </p>

                              <span className="task-status">
                                {isCompleted
                                  ? "Completed"
                                  : "Pending"}
                              </span>

                              {/* =================================================
                              GENERATE CODE BUTTON (Fixed compact size)
                              ================================================== */}

                              <button
                                type="button"
                                className="generate-code-button"
                                onClick={() =>
                                  handleGenerateCode(
                                    index
                                  )
                                }
                                disabled={
                                  generatingCodeIndex ===
                                  index ||
                                  taskSaving ||
                                  resettingTasks
                                }
                                style={{
                                  padding: "6px 12px",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  borderRadius: "6px",
                                  width: "auto",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  cursor: "pointer"
                                }}
                              >
                                {generatingCodeIndex ===
                                index
                                  ? "Generating..."
                                  : generatedCode[
                                      index
                                    ]
                                  ? "Regenerate Code"
                                  : "Generate Code"}
                              </button>

                              {/* =================================================
                              AI GENERATED CODE
                              ================================================== */}

                              {generatedCode[
                                index
                              ] && (

                                <div className="ai-code-result">

                                  <div className="ai-code-result-header">

                                    <div>

                                      <span className="ai-code-badge">
                                        AI CODE ASSISTANT
                                      </span>

                                      <h4>
                                        {
                                          generatedCode[
                                            index
                                          ].summary ||
                                          "Generated implementation"
                                        }
                                      </h4>

                                    </div>

                                    {/* SHOW / HIDE */}

                                    <button
                                      type="button"
                                      className="toggle-code-button"
                                      onClick={() =>
                                        setExpandedCode(
                                          (
                                            current
                                          ) => ({
                                            ...current,

                                            [index]:
                                              !current[
                                                index
                                              ],
                                          })
                                        )
                                      }
                                      aria-expanded={
                                        expandedCode[
                                          index
                                        ] ===
                                        true
                                      }
                                      title={
                                        expandedCode[
                                          index
                                        ]
                                          ? "Hide generated code"
                                          : "Show generated code"
                                      }
                                    >

                                      <span className="toggle-code-arrow">
                                        {expandedCode[
                                          index
                                        ]
                                          ? "⌃"
                                          : "⌄"}
                                      </span>

                                      {expandedCode[
                                        index
                                      ]
                                        ? "Hide"
                                        : "Show"}

                                    </button>

                                  </div>

                                  {/* =================================================
                                  CODE CONTENT
                                  ================================================== */}

                                  {expandedCode[
                                    index
                                  ] && (

                                    <div className="ai-code-result-content">

                                      {/* -----------------------------------------
                                      GENERATED FILES
                                      ------------------------------------------ */}

                                      {Array.isArray(
                                        generatedCode[
                                          index
                                        ].files
                                      ) &&
                                        generatedCode[
                                          index
                                        ].files.map(
                                          (
                                            file,
                                            fileIndex
                                          ) => (

                                            <div
                                              className="generated-file"
                                              key={`${file.path}-${fileIndex}`}
                                            >

                                              <div className="generated-file-header">

                                                <div>

                                                  <strong>
                                                    {
                                                      file.path
                                                    }
                                                  </strong>

                                                  <span>
                                                    {
                                                      file.language
                                                    }
                                                  </span>

                                                </div>

                                                {/* COPY */}

                                                <button
                                                  type="button"
                                                  className="copy-code-button"
                                                  onClick={async () => {

                                                    try {

                                                      await navigator.clipboard.writeText(
                                                        file.code ||
                                                        ""
                                                      );

                                                      alert(
                                                        "Code copied successfully."
                                                      );

                                                    } catch (
                                                      copyError
                                                    ) {

                                                      console.error(
                                                        "Copy code error:",
                                                        copyError
                                                      );

                                                      alert(
                                                        "Unable to copy code."
                                                      );

                                                    }

                                                  }}
                                                >
                                                  Copy Code
                                                </button>

                                              </div>

                                              <p className="generated-file-purpose">
                                                {
                                                  file.purpose
                                                }
                                              </p>

                                              <pre className="generated-code-block">

                                                <code>
                                                  {
                                                    file.code
                                                  }
                                                </code>

                                              </pre>

                                            </div>

                                          )
                                        )}

                                      {/* =================================================
                                      EXPLANATION
                                      ================================================== */}

                                      {generatedCode[
                                        index
                                      ].explanation && (

                                        <div className="ai-code-explanation">

                                          <h4>
                                            Explanation
                                          </h4>

                                          <p>
                                            {
                                              generatedCode[
                                                index
                                              ].explanation
                                            }
                                          </p>

                                        </div>

                                      )}

                                      {/* =================================================
                                      SETUP NOTES
                                      ================================================== */}

                                      {Array.isArray(
                                        generatedCode[
                                          index
                                        ].setupNotes
                                      ) &&
                                        generatedCode[
                                          index
                                        ].setupNotes
                                          .length >
                                        0 && (

                                        <div className="ai-code-setup">

                                          <h4>
                                            Setup Notes
                                          </h4>

                                          <ul>

                                            {generatedCode[
                                              index
                                            ].setupNotes.map(
                                              (
                                                note,
                                                noteIndex
                                              ) => (

                                                <li
                                                  key={
                                                    noteIndex
                                                  }
                                                >
                                                  {
                                                    note
                                                  }
                                                </li>

                                              )
                                            )}

                                          </ul>

                                        </div>

                                      )}

                                    </div>

                                  )}

                                </div>

                              )}

                              {/* =================================================
                              CODE GENERATION HISTORY
                              ================================================== */}

                              {taskHistory.length >
                                0 && (

                                <div className="code-generation-history">

                                  <div className="code-history-header">

                                    <div>

                                      <span className="code-history-badge">
                                        CODE HISTORY
                                      </span>

                                      <h5>
                                        Previous Generations
                                      </h5>

                                    </div>

                                    <span className="code-history-count">
                                      {
                                        taskHistory.length
                                      }
                                    </span>

                                  </div>

                                  <div className="code-history-list">

                                    {taskHistory.map(
                                      (
                                        historyItem,
                                        historyIndex
                                      ) => (

                                        <div
                                          className="code-history-item"
                                          key={
                                            historyItem._id ||
                                            `${historyItem.taskIndex}-${historyItem.generatedAt}-${historyIndex}`
                                          }
                                        >

                                          <div className="code-history-info">

                                            <strong>
                                              Generation{" "}
                                              {taskHistory.length -
                                                historyIndex}
                                            </strong>

                                            <span>
                                              {
                                                formatDateTime(
                                                  historyItem.generatedAt
                                                )
                                              }
                                            </span>

                                          </div>

                                          <button
                                            type="button"
                                            className="view-history-button"
                                            onClick={() =>
                                              handleViewGeneratedCode(
                                                historyItem
                                              )
                                            }
                                          >
                                            View Code
                                          </button>

                                        </div>

                                      )
                                    )}

                                  </div>

                                </div>

                              )}

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

              </div>

            </AccordionSection>

          </div>

          {/* ===================================================
          PROJECT DETAILS
          =================================================== */}

          <section className="project-details-card">

            <div className="project-details-title">

              <span className="project-details-title-icon">
                ⓘ
              </span>

              <h2>
                Project Details
              </h2>

            </div>

            <div className="project-detail-grid">

              <div className="project-detail-item">

                <span>
                  Project ID
                </span>

                <strong>
                  {project._id}
                </strong>

              </div>

              <div className="project-detail-item">

                <span>
                  Created
                </span>

                <strong>
                  {formatDate(
                    project.createdAt
                  )}
                </strong>

              </div>

              <div className="project-detail-item">

                <span>
                  AI Status
                </span>

                <strong
                  className={`status-${project.aiStatus}`}
                >
                  ✓{" "}
                  {getStatusText(
                    project.aiStatus
                  )}
                </strong>

              </div>

              <div className="project-detail-item">

                <span>
                  AI Generated
                </span>

                <strong>
                  {formatDateTime(
                    project.aiGeneratedAt
                  )}
                </strong>

              </div>

            </div>

            <div className="project-actions">

              <button
                className="delete-project-button"
                onClick={
                  handleDeleteProject
                }
                disabled={deleting}
                type="button"
              >
                🗑{" "}
                {deleting
                  ? "Deleting..."
                  : "Delete Project"}
              </button>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default ProjectWorkspace;
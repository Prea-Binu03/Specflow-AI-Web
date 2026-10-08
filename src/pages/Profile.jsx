import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ProjectIdea.css";
import "./Profile.css";

function Profile() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [projects, setProjects] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Get logged-in user from localStorage
  const savedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [name, setName] = useState(savedUser?.name || "");
  const [email, setEmail] = useState(savedUser?.email || "");
  const [phone, setPhone] = useState(savedUser?.phone || "");
  const [role, setRole] = useState(savedUser?.role || "");
  const [organization, setOrganization] = useState(
    savedUser?.organization || ""
  );
  const [bio, setBio] = useState(
    savedUser?.bio || ""
  );
  const [profileImage, setProfileImage] = useState(
    savedUser?.profileImage || ""
  );

  const userName = savedUser?.name || "User";
  const navigate = useNavigate();

  // ============================================================
  // LOAD PROJECT HISTORY
  // ============================================================

  const loadProjects = useCallback(async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      const userId = user?._id || user?.id;

      if (!userId) {
        setProjects([]);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/projects/user/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          data.message || "Unable to load projects"
        );
        setProjects([]);
        return;
      }

      setProjects(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Profile Project History Error:",
        error
      );
      setProjects([]);
    }
  }, [API_URL]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProjects();
  }, [loadProjects]);

  // ============================================================
  // HANDLE IMAGE UPLOAD (Convert to Base64)
  // ============================================================

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ============================================================
  // REMOVE PROFILE IMAGE
  // ============================================================

  const handleRemoveImage = () => {
    setProfileImage("");
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    setShowUserMenu(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!savedUser?._id) {
      alert(
        "User information not found. Please login again."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/profile/${savedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            role,
            organization,
            bio,
            profileImage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Profile update failed"
        );
        return;
      }

      // Save updated user details including image in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      alert("Profile updated successfully!");
    } catch (error) {
      console.error(
        "Profile Update Error:",
        error
      );
      alert(
        "Cannot connect to backend. Please make sure the backend server is running."
      );
    }
  };

  return (
    <div className="project-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-star">✦</span>
          <span>SpecFlow AI</span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="side-link">
            <span>⌂</span> Home
          </Link>
          <Link to="/project-idea" className="side-link">
            <span>＋</span> New Project
          </Link>
          <Link to="/my-projects" className="side-link">
            <span>▱</span> My Projects
          </Link>
          {/* Added AI Assistant Link */}
        <Link to="/ai-assistant" className="side-link">
          <span className="side-icon">🤖</span>
          <span>AI Assistant</span>
        </Link>
          <Link to="/profile" className="side-link active">
            <span>♟</span> Profile
          </Link>
          <Link to="/settings" className="side-link">
            <span>⚙</span> Settings
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
          ✦
          <span>
            Turn Ideas into
            <br />
            Real Software
          </span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">Profile</div>
          <div className="topbar-right">
            <div className="notification">♧</div>

            <div className="user-menu-container">
              <button
                type="button"
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Avatar"
                      style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    userName.charAt(0).toUpperCase()
                  )}
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

        {/* PROFILE CONTENT */}
        <div className="content-area profile-page">
          <section className="profile-intro">
            <div className="intro-label">✦ Account</div>
            <h1>
              Your <span>Profile</span>
            </h1>
            <p>
              Manage your personal information and account details.
            </p>
          </section>

          <form className="profile-card" onSubmit={handleUpdateProfile}>
            {/* Profile Picture Section */}
            <div className="profile-form-group" style={{ textAlign: "center", marginBottom: "20px" }}>
              <div 
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  margin: "0 auto 10px auto",
                  overflow: "hidden",
                  backgroundColor: "#ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#555",
                  border: "2px solid #ccc"
                }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "15px", alignItems: "center" }}>
                <label htmlFor="avatar-upload" style={{ cursor: "pointer", color: "#4f46e5", fontWeight: "600", fontSize: "14px" }}>
                  Change Picture
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />

                {profileImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="profile-form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="profile-form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="profile-form-group">
              <label>
                Phone Number{" "}
                <span className="optional-profile">(Optional)</span>
              </label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="profile-form-group">
              <label>Role / Profession</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Select your role</option>
                <option value="Student">Student</option>
                <option value="Software Developer">Software Developer</option>
                <option value="Web Developer">Web Developer</option>
                <option value="Business Analyst">Business Analyst</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Entrepreneur">Entrepreneur</option>
                <option value="Teacher / Educator">Teacher / Educator</option>
                <option value="Designer">Designer</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="profile-form-group">
              <label>College / Organization</label>
              <input
                type="text"
                placeholder="Enter your college or organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>

            <div className="profile-form-group">
              <label>About / Bio</label>
              <textarea
                placeholder="Tell us a little about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="4"
              />
            </div>

            <button type="submit" className="profile-update-btn">
              Update Profile
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Profile;
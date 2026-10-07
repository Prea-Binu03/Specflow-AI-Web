import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [otherRole, setOtherRole] = useState("");

  // Password values
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Show / Hide password states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!fullName.trim()) {
      alert("Full Name is missing");
      return;
    }

    if (!email.trim()) {
      alert("Email is missing");
      return;
    }

    if (!role) {
      alert("Role is missing");
      return;
    }

    if (!password) {
      alert("Password is missing");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      alert("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      alert("Password must contain at least one lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      alert("Password must contain at least one number.");
      return;
    }

    if (!/[@$!%*?&]/.test(password)) {
      alert("Password must contain at least one special character.");
      return;
    }

    if (!confirmPassword) {
      alert("Confirm Password is missing");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (role === "Other" && !otherRole.trim()) {
      alert("Please specify your role");
      return;
    }

    const selectedRole = role === "Other" ? otherRole : role;

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: fullName,
            email: email,
            phone: phone,
            role: selectedRole,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      console.error("Registration Error:", error);
      alert(
        "Cannot connect to backend. Please make sure the backend server is running."
      );
    }
  };

  // Robust Google Login/Register hook
  const handleGoogleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await profileRes.json();

        const backendRes = await fetch("http://localhost:5000/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            credential: tokenResponse.access_token,
            email: profile.email,
            name: profile.name,
            picture: profile.picture,
            googleId: profile.sub
          }),
        });

        const data = await backendRes.json();
        if (!backendRes.ok) throw new Error(data.message || "Google registration failed");

        // Agar user pehle se registered hai, toh login page par redirect karo
        if (data.isExistingUser) {
          alert("You are already registered! Please login to continue.");
          navigate("/login");
          return;
        }

        // Agar naya user hai toh dashboard par bhejo
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert(data.message || "Google registration successful!");
        navigate("/dashboard");
      } catch (err) {
        alert(err.message || "Unable to sign up with Google. Please try again.");
      }
    },
    onError: () => {
      alert("Google sign-up was cancelled or failed.");
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="back-home">
          ← Back to Home
        </Link>

        <h1>Create Your Account</h1>
        <p className="auth-subtitle">
          Start planning your software projects with SpecFlow AI.
        </p>

        <form onSubmit={handleRegister} autoComplete="on">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              Phone Number
              <span style={{ color: "#9eb3ce", fontSize: "12px", fontWeight: "400", marginLeft: "5px" }}>
                (Optional)
              </span>
            </label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Role / Profession</label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                if (e.target.value !== "Other") {
                  setOtherRole("");
                }
              }}
              style={{
                width: "100%",
                height: "50px",
                boxSizing: "border-box",
                padding: "0 16px",
                border: "1px solid rgba(190, 220, 250, 0.7)",
                borderRadius: "10px",
                background: "rgba(80, 135, 190, 0.35)",
                color: "#ffffff",
                fontSize: "15px",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="" style={{ background: "#12345d", color: "#ffffff" }}>
                Select your role
              </option>
              <option value="Student" style={{ background: "#12345d", color: "#ffffff" }}>
                Student
              </option>
              <option value="Software Developer" style={{ background: "#12345d", color: "#ffffff" }}>
                Software Developer
              </option>
              <option value="Web Developer" style={{ background: "#12345d", color: "#ffffff" }}>
                Web Developer
              </option>
              <option value="Business Analyst" style={{ background: "#12345d", color: "#ffffff" }}>
                Business Analyst
              </option>
              <option value="Project Manager" style={{ background: "#12345d", color: "#ffffff" }}>
                Project Manager
              </option>
              <option value="Entrepreneur" style={{ background: "#12345d", color: "#ffffff" }}>
                Entrepreneur
              </option>
              <option value="Teacher / Educator" style={{ background: "#12345d", color: "#ffffff" }}>
                Teacher / Educator
              </option>
              <option value="Designer" style={{ background: "#12345d", color: "#ffffff" }}>
                Designer
              </option>
              <option value="Freelancer" style={{ background: "#12345d", color: "#ffffff" }}>
                Freelancer
              </option>
              <option value="Other" style={{ background: "#12345d", color: "#ffffff" }}>
                Other
              </option>
            </select>
          </div>

          {role === "Other" && (
            <div className="form-group">
              <label>Specify Your Role</label>
              <input
                type="text"
                placeholder="Enter your role / profession"
                value={otherRole}
                onChange={(e) => setOtherRole(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", paddingRight: "50px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "18px",
                  padding: "5px",
                  lineHeight: "1"
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", paddingRight: "50px" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "18px",
                  padding: "5px",
                  lineHeight: "1"
                }}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button">
            Create Account
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="google-button"
          onClick={() => handleGoogleRegister()}
        >
          <span>G</span>
          Continue with Google
        </button>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
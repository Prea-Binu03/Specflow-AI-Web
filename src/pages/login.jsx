import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Invalid email or password.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful!");
      navigate("/dashboard");

    } catch (error) {
      console.error("Login Error:", error);
      alert(
        "Cannot connect to backend. Please make sure the backend server is running."
      );
    }
  };

  // Robust Google Login hook
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await profileRes.json();

        const backendRes = await fetch(`${API_URL}/api/auth/google`, {
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
        if (!backendRes.ok) throw new Error(data.message || "Google login failed");

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Google login successful!");
        navigate("/dashboard");
      } catch (err) {
        alert(err.message || "Unable to sign in with Google. Please try again.");
      }
    },
    onError: () => {
      alert("Google sign-in was cancelled or failed.");
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="back-home">
          ← Back to Home
        </Link>

        <h1>Welcome Back</h1>
        <p className="auth-subtitle">
          Login to continue using SpecFlow AI.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div className="password-label">
              <label>Password</label>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="google-button"
          onClick={() => handleGoogleLogin()}
        >
          <span className="google-icon">G</span>
          Continue with Google
        </button>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </div>

      <style>{`
        .password-input-wrapper {
          position: relative;
          width: 100%;
        }
        .password-input-wrapper input {
          width: 100%;
          box-sizing: border-box;
          padding-right: 50px;
        }
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
          line-height: 1;
          color: white;
        }
        .password-toggle:hover {
          opacity: 0.8;
        }
        .auth-switch {
          margin-top: 20px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default Login;
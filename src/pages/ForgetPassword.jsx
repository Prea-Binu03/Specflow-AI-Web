import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config";
function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!newPassword) {
      alert("Please enter your new password.");
      return;
    }

    if (!confirmPassword) {
      alert("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const PASSWORD_REGEX =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!PASSWORD_REGEX.test(newPassword)) {
      alert(
        "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, number, and special character."
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            newPassword: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Password reset failed.");
        return;
      }

      alert("Password reset successfully!");

      navigate("/login");

    } catch (error) {
      console.error("Reset Password Error:", error);

      alert(
        "Cannot connect to backend. Please make sure the backend server is running."
      );
    }
  };

  return (
    <>
      <style>{`

        .forgot-password-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #07101f;
          padding: 30px;
          box-sizing: border-box;
        }

        .forgot-password-card {
          width: 100%;
          max-width: 560px;
          padding: 42px;
          box-sizing: border-box;
          border-radius: 22px;

          background: linear-gradient(
            145deg,
            #10294a,
            #071b35
          );

          border: 1px solid rgba(255, 255, 255, 0.12);

          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.35);
        }

        .forgot-back {
          display: inline-block;
          margin-bottom: 28px;

          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
        }

        .forgot-back:hover {
          color: #18c8ff;
        }

        .forgot-password-card h1 {
          margin: 0 0 12px;
          color: white;
          font-size: 40px;
          font-weight: 800;
        }

        .forgot-subtitle {
          margin: 0 0 30px;
          color: #c7d5e8;
          line-height: 1.6;
          font-size: 16px;
        }

        .forgot-form-group {
          margin-bottom: 22px;
        }

        .forgot-form-group label {
          display: block;
          margin-bottom: 9px;
          color: white;
          font-weight: 600;
        }

        .forgot-form-group input {
          width: 100%;
          height: 54px;
          padding: 0 16px;
          box-sizing: border-box;

          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 10px;

          background: rgba(255, 255, 255, 0.08);
          color: white;

          outline: none;
          font-size: 15px;
        }

        .forgot-form-group input::placeholder {
          color: #b7c4d6;
        }

        .forgot-form-group input:focus {
          border-color: #18c8ff;
          box-shadow: 0 0 0 2px rgba(24, 200, 255, 0.15);
        }

        /* PASSWORD INPUT */

        .forgot-password-input {
          position: relative;
          width: 100%;
        }

        .forgot-password-input input {
          padding-right: 55px;
        }

        /* EYE BUTTON */

        .forgot-eye-button {
          position: absolute;

          right: 10px;
          top: 50%;

          transform: translateY(-50%);

          width: 38px;
          height: 38px;

          padding: 0;
          margin: 0;

          border: none;
          outline: none;

          background: transparent;

          display: flex;
          align-items: center;
          justify-content: center;

          color: white;
          font-size: 18px;

          cursor: pointer;

          z-index: 10;
        }

        .forgot-eye-button:hover {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 8px;
        }

        /* RESET BUTTON */

        .forgot-reset-button {
          width: 100%;
          height: 55px;

          margin-top: 8px;

          border: none;
          border-radius: 10px;

          background: #13bdf2;
          color: white;

          font-size: 16px;
          font-weight: 700;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .forgot-reset-button:hover {
          background: #08a9dc;
          transform: translateY(-1px);
        }

        .forgot-login {
          text-align: center;
          margin-top: 20px;

          color: #c7d5e8;
        }

        .forgot-login a {
          color: #18c8ff;
          font-weight: 600;
          text-decoration: none;
        }

        .forgot-login a:hover {
          text-decoration: underline;
        }

        @media (max-width: 600px) {

          .forgot-password-page {
            padding: 18px;
          }

          .forgot-password-card {
            padding: 28px 22px;
          }

          .forgot-password-card h1 {
            font-size: 32px;
          }

        }

      `}</style>

      <div className="forgot-password-page">

        <div className="forgot-password-card">

          <Link to="/login" className="forgot-back">
            ← Back to Login
          </Link>

          <h1>Reset Password</h1>

          <p className="forgot-subtitle">
            Enter your email and create a new password for your account.
          </p>

          <form onSubmit={handleResetPassword}>

            {/* Email */}

            <div className="forgot-form-group">

              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>


            {/* New Password */}

            <div className="forgot-form-group">

              <label>New Password</label>

              <div className="forgot-password-input">

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="forgot-eye-button"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                >
                  {showNewPassword ? "🙈" : "👁"}
                </button>

              </div>

            </div>


            {/* Confirm Password */}

            <div className="forgot-form-group">

              <label>Confirm New Password</label>

              <div className="forgot-password-input">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  required
                />

                <button
                  type="button"
                  className="forgot-eye-button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? "🙈" : "👁"}
                </button>

              </div>

            </div>


            {/* Reset Password */}

            <button
              type="submit"
              className="forgot-reset-button"
            >
              Reset Password
            </button>

          </form>


          <p className="forgot-login">
            Remember your password?{" "}
            <Link to="/login">
              Login
            </Link>
          </p>

        </div>

      </div>
    </>
  );
}

export default ForgotPassword;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/api";
import "./AuthPage.css";

const AuthPage = ({ setIsAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const data = await loginUser(formData);

        if (!data?.token) {
          throw new Error("No token returned from server");
        }

        localStorage.setItem("token", data.token);
        setIsAuthenticated(true);
        navigate("/calendar", { replace: true });
      } else {
        await registerUser(formData);
        alert("✅ Registration successful! You can login now.");
        setIsLogin(true);
        setFormData({ username: "", password: "" });
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left panel: login/register form */}
      <div className="auth-left">
        <div className="auth-card">
          <h2>{isLogin ? "Login" : "Register"}</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
            </button>
          </form>

          {error && <p className="error-text">{error}</p>}

          <p
            onClick={() => setIsLogin(!isLogin)}
            className="toggle-link"
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </p>
        </div>
      </div>

      {/* Right panel: illustration / marketing area */}
      <div className="auth-right">
        <div>
          <h1>Welcome to Appointment Planner!</h1>

          <h2>Do Register and Enjoy the Features!</h2>
          <p>
            Seamlessly manage your appointments and tasks in one intuitive dashboard.
            Stay organized, save time, and boost productivity with smart scheduling.
            Experience a modern, effortless way to plan your day.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

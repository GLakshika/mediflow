import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    () => localStorage.getItem("rememberedEmail") || ""
  );

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(() => Boolean(localStorage.getItem("rememberedEmail")));

  const [forgotMessage, setForgotMessage] =
    useState("");


  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setForgotMessage("");
    setLoading(true);

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    try {
      const response = await api.post(
  "/auth/login",
  {
    email,
    password,
  }
);

localStorage.setItem(
  "token",
  response.data.token
);

localStorage.setItem(
  "user",
  JSON.stringify(response.data.user)
);

if (response.data.user.role === "PATIENT") {
  navigate("/patient");
} else if (
  response.data.user.role === "DOCTOR"
) {
  navigate("/doctor");
} else if (
  response.data.user.role === "HOSPITAL_ADMIN"
) {
  navigate("/admin");
} else {
    navigate("/login");
}

    } catch (error: any) {

      setError(
        error.response?.data?.message ||
        "Login failed"
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="auth-container">
      <div className="auth-content">
        <div className="auth-brand">
          <img src="/logo.jpg" alt="MediFlow heart logo" />
          <h1>MediFlow</h1>
          <p>Smart Hospital Management</p>
        </div>

        <div className="auth-card">
          <h2>Welcome Back</h2>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
        >

          <label htmlFor="email">EMAIL ADDRESS</label>
          <div className="auth-input-wrap">
            
            <input
              id="email"
              type="email"
              placeholder="Enter Email Here"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label htmlFor="password">PASSWORD</label>
          <div className="auth-input-wrap">
            
            <input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-options">
            <label className="remember-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="forgot-link"
              onClick={() => {
                setError("");
                setForgotMessage(
                  "Please contact your hospital administrator to reset your password."
                );
              }}
            >
              Forgot password?
            </button>
          </div>

          {forgotMessage && (
            <div className="forgot-message" role="status">
              {forgotMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : <><span>Login</span><span aria-hidden="true">&#8594;</span></>}
          </button>

        </form>
        </div>
        <p className="register-prompt">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </main>
  );
}


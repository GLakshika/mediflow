import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response =
        await api.post(
          "/auth/login",
          {
            email,
            password,
          }
        );

      const {
        token,
        user,
      } = response.data;

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      if (
        user.role === "PATIENT"
      ) {
        navigate("/patient");
      } else {
        navigate("/hospital");
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
    <div className="auth-container">

      <div className="auth-card">

        <h1>MediFlow</h1>

        <p>
          Smart Hospital Management
        </p>

        <h2>Login</h2>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
        >

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        <p>
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}
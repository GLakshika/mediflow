import {
  useState,
} from "react";
import type { FormEvent } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

export default function Register() {

  const navigate = useNavigate();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("PATIENT");

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
          "/auth/register",
          {
            name,
            email,
            password,
            role,
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
        "Registration failed"
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
          Create your account
        </p>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />

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

          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
          >
            <option value="PATIENT">
              Patient
            </option>

            <option value="DOCTOR">
              Doctor
            </option>

            <option value="HOSPITAL_ADMIN">
              Hospital Admin
            </option>
          </select>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Register"}
          </button>

        </form>

        <p>
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}
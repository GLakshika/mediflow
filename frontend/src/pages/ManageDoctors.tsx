import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Doctor {
  id: string;
  user_id: string;
  hospital_id: string;
  department_id: string | null;
  specialization: string | null;
  available: boolean;

  name: string;
  email: string;
  department_name: string | null;
}

function ManageDoctors() {
  const navigate = useNavigate();

  const [doctors, setDoctors] =
    useState<Doctor[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");
  const [showForm, setShowForm] =
  useState(false);

    const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    department_id: "",
    });

    const [submitting, setSubmitting] =
    useState(false);

    const [success, setSuccess] =
    useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response =
          await api.get("/doctors/admin");

        console.log(
          "Doctors:",
          response.data.doctors
        );

        setDoctors(
          response.data.doctors
        );

      } catch (error: any) {
        console.error(
          "Doctors error:",
          error
        );

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login");

          return;
        }

        setError(
          error.response?.data?.message ||
          "Failed to load doctors"
        );

      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Loading doctors...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }
  const handleAddDoctor = async (
    e: React.FormEvent
    ) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
        await api.post(
        "/doctors/admin",
        {
            name: form.name,
            email: form.email,
            password: form.password,
            specialization:
            form.specialization,
            department_id:
            form.department_id || null,
        }
        );

        setSuccess(
        "Doctor added successfully"
        );

        setForm({
        name: "",
        email: "",
        password: "",
        specialization: "",
        department_id: "",
        });

        setShowForm(false);

        // Reload doctors
        const response =
        await api.get(
            "/doctors/admin"
        );

        setDoctors(
        response.data.doctors
        );

    } catch (error: any) {
        console.error(
        "Add doctor error:",
        error
        );

        setError(
        error.response?.data?.message ||
        "Failed to add doctor"
        );

    } finally {
        setSubmitting(false);
    }
    };
  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "30px",
      }}
    >
      <button
        onClick={() => navigate("/admin")}
      >
        ← Back to Dashboard
      </button>

      <h1>Manage Doctors</h1>

      <button
        onClick={() =>
            setShowForm(!showForm)
        }
        >
        + Add Doctor
      </button>
      {success && (
        <p
            style={{
            color: "green",
            marginTop: "15px",
            }}
        >
            {success}
        </p>
        )}
      {showForm && (
        <form
            onSubmit={handleAddDoctor}
            style={{
            border: "1px solid #ddd",
            padding: "20px",
            marginTop: "20px",
            borderRadius: "10px",
            }}
        >
            <h2>Add Doctor</h2>

            <input
            type="text"
            placeholder="Doctor name"
            value={form.name}
            onChange={(e) =>
                setForm({
                ...form,
                name: e.target.value,
                })
            }
            required
            />

            <br />
            <br />

            <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
                setForm({
                ...form,
                email: e.target.value,
                })
            }
            required
            />

            <br />
            <br />

            <input
            type="password"
            placeholder="Temporary password"
            value={form.password}
            onChange={(e) =>
                setForm({
                ...form,
                password: e.target.value,
                })
            }
            required
            />

            <br />
            <br />

            <input
            type="text"
            placeholder="Specialization"
            value={form.specialization}
            onChange={(e) =>
                setForm({
                ...form,
                specialization:
                    e.target.value,
                })
            }
            required
            />

            <br />
            <br />

            <button
            type="submit"
            disabled={submitting}
            >
            {submitting
                ? "Adding..."
                : "Add Doctor"}
            </button>

            <button
            type="button"
            onClick={() =>
                setShowForm(false)
            }
            style={{
                marginLeft: "10px",
            }}
            >
            Cancel
            </button>
        </form>
        )}

      {doctors.length === 0 ? (
        <p>No doctors found.</p>
      ) : (
        doctors.map((doctor) => (
          <div
            key={doctor.id}
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              marginTop: "20px",
              borderRadius: "10px",
            }}
          >
            <h2>
              {doctor.name}
            </h2>

            <p>
              📧 {doctor.email}
            </p>

            <p>
              🩺{" "}
              {doctor.specialization ||
                "Not specified"}
            </p>

            <p>
              🏥{" "}
              {doctor.department_name ||
                "No department"}
            </p>

            <p>
              Status:{" "}
              {doctor.available
                ? "Available"
                : "Unavailable"}
            </p>

            <button>
              Edit
            </button>

            <button>
              {doctor.available
                ? "Disable"
                : "Enable"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default ManageDoctors;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface EmergencyCapacity {
  available_beds: number;
  emergency_queue: number;
  doctors_available: number;
  status: string;
}

function ManageEmergency() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<EmergencyCapacity>({
      available_beds: 0,
      emergency_queue: 0,
      doctors_available: 0,
      status: "AVAILABLE",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // LOAD CURRENT CAPACITY
  // =====================================================

  const fetchEmergency = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/emergency/admin");

      const emergency =
        response.data.emergency;

      setForm({
        available_beds:
          emergency.available_beds ?? 0,

        emergency_queue:
          emergency.emergency_queue ?? 0,

        doctors_available:
          emergency.doctors_available ?? 0,

        status:
          emergency.status ?? "AVAILABLE",
      });

    } catch (error: any) {
      console.error(
        "Emergency load error:",
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
        "Failed to load emergency capacity"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergency();
  }, []);

  // =====================================================
  // UPDATE
  // =====================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.patch(
        "/emergency/admin",
        {
          available_beds:
            Number(form.available_beds),

          emergency_queue:
            Number(form.emergency_queue),

          doctors_available:
            Number(form.doctors_available),

          status:
            form.status,
        }
      );

      setSuccess(
        "Emergency capacity updated successfully"
      );

    } catch (error: any) {
      console.error(
        "Emergency update error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to update emergency capacity"
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>
          Loading emergency capacity...
        </h2>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "30px",
      }}
    >

      <button
        onClick={() =>
          navigate("/admin")
        }
      >
        ← Back to Dashboard
      </button>

      <h1>
        🚨 Emergency Capacity
      </h1>

      <p>
        Update the current emergency
        capacity of your hospital.
      </p>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {success && (
        <p style={{ color: "green" }}>
          {success}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "25px",
          marginTop: "20px",
        }}
      >

        <label>
          Available Beds
        </label>

        <input
          type="number"
          min="0"
          value={form.available_beds}
          onChange={(e) =>
            setForm({
              ...form,
              available_beds:
                Number(e.target.value),
            })
          }
          style={{
            display: "block",
            width: "100%",
            marginTop: "8px",
            marginBottom: "20px",
            padding: "10px",
          }}
        />

        <label>
          Emergency Queue
        </label>

        <input
          type="number"
          min="0"
          value={form.emergency_queue}
          onChange={(e) =>
            setForm({
              ...form,
              emergency_queue:
                Number(e.target.value),
            })
          }
          style={{
            display: "block",
            width: "100%",
            marginTop: "8px",
            marginBottom: "20px",
            padding: "10px",
          }}
        />

        <label>
          Doctors Available
        </label>

        <input
          type="number"
          min="0"
          value={form.doctors_available}
          onChange={(e) =>
            setForm({
              ...form,
              doctors_available:
                Number(e.target.value),
            })
          }
          style={{
            display: "block",
            width: "100%",
            marginTop: "8px",
            marginBottom: "20px",
            padding: "10px",
          }}
        />

        <label>
          Emergency Status
        </label>

        <select
          value={form.status}
          onChange={(e) =>
            setForm({
              ...form,
              status: e.target.value,
            })
          }
          style={{
            display: "block",
            width: "100%",
            marginTop: "8px",
            marginBottom: "25px",
            padding: "10px",
          }}
        >
          <option value="AVAILABLE">
            🟢 AVAILABLE
          </option>

          <option value="LIMITED">
            🟡 LIMITED
          </option>

          <option value="FULL">
            🔴 FULL
          </option>
        </select>

        <button
          type="submit"
          disabled={saving}
        >
          {saving
            ? "Updating..."
            : "Update Emergency Capacity"}
        </button>

      </form>

    </div>
  );
}

export default ManageEmergency;
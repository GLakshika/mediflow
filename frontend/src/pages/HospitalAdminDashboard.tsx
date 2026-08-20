import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: string;

  doctors_count: number;
  departments_count: number;

  available_beds: number;
  emergency_queue: number;
  doctors_available: number;

  emergency_status: string;
}

function HospitalAdminDashboard() {
  const navigate = useNavigate();

  const [hospital, setHospital] =
    useState<Hospital | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response =
          await api.get(
            "/hospital-admin/dashboard"
          );

        console.log(
          "Admin dashboard:",
          response.data.hospital
        );

        setHospital(
          response.data.hospital
        );

      } catch (error: any) {
        console.error(
          "Admin dashboard error:",
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
            "Failed to load dashboard"
        );

      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>
          Loading hospital dashboard...
        </h2>
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

  if (!hospital) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>
          Hospital not found
        </h2>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "30px",
      }}
    >
      <h1>
        Hospital Admin Dashboard
      </h1>

      <h2>
        {hospital.name}
      </h2>

      <p>
        📍 {hospital.address}
      </p>

      <p>
        ☎ {hospital.phone}
      </p>

      <hr />

      <h2>
        Hospital Overview
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>👨‍⚕ Doctors</h3>

          <p
            style={{
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            {hospital.doctors_count}
          </p>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>🏥 Departments</h3>

          <p
            style={{
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            {hospital.departments_count}
          </p>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>🛏 Available Beds</h3>

          <p
            style={{
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            {hospital.available_beds}
          </p>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>🚨 Emergency Queue</h3>

          <p
            style={{
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            {hospital.emergency_queue}
          </p>
        </div>
      </div>

      <h2
        style={{
          marginTop: "40px",
        }}
      >
        Management
      </h2>

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() =>
            navigate("/admin/doctors")
          }
        >
          👨‍⚕ Manage Doctors
        </button>

        <button
          onClick={() =>
            navigate("/admin/departments")
          }
        >
          🏥 Manage Departments
        </button>

        <button
          onClick={() =>
            navigate("/admin/emergency")
          }
        >
          🚨 Emergency Capacity
        </button>

        <button
          onClick={() =>
            navigate("/admin/appointments")
          }
        >
          📅 Appointments
        </button>
      </div>
    </div>
  );
}

export default HospitalAdminDashboard;
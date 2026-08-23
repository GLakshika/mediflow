import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { formatDisplayDate } from "../utils/date";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  doctor_id: string;
  doctor_name: string;
  specialization: string | null;
  hospital_name: string;
}

function HospitalAdminAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get("/hospital-admin/appointments");
        setAppointments(response.data.appointments || []);
      } catch (err: any) {
        console.error("Hospital admin appointments error:", err);

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        setError(err.response?.data?.message || "Failed to load hospital appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Loading appointments...</h2>
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

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px" }}>
      <button onClick={() => navigate("/admin")} style={{ marginBottom: "20px" }}>
        ← Back to Dashboard
      </button>

      <h1>Hospital Appointments</h1>
      <p>All appointments booked at your hospital.</p>

      {appointments.length === 0 ? (
        <div style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "30px", marginTop: "20px" }}>
          <h2>No appointments</h2>
          <p>No appointments have been booked for this hospital yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "20px",
                background: "#fff",
              }}
            >
              <h2 style={{ marginTop: 0 }}>{appointment.patient_name}</h2>

              <p>
                <strong>Patient Email:</strong> {appointment.patient_email}
              </p>

              <p>
                <strong>Doctor:</strong> {appointment.doctor_name} ({appointment.specialization || "General"})
              </p>

              <p>
                <strong>Hospital:</strong> {appointment.hospital_name}
              </p>

              <p>
                <strong>Date:</strong> {formatDisplayDate(appointment.appointment_date)}
              </p>

              <p>
                <strong>Time:</strong> {appointment.appointment_time}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color:
                      appointment.status === "BOOKED"
                        ? "#0a7b2e"
                        : appointment.status === "CANCELLED"
                          ? "#b42318"
                          : appointment.status === "COMPLETED"
                            ? "#1d4ed8"
                            : "#7a5c00",
                    fontWeight: "bold",
                  }}
                >
                  {appointment.status}
                </span>
              </p>

              <p>
                <strong>Booked On:</strong> {formatDisplayDate(appointment.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HospitalAdminAppointments;

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

  const normalizeStatus = (
    value: string
  ): "BOOKED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "OTHER" => {
    const normalized = value
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_")
      .replace(/-/g, "_");

    if (normalized === "BOOKED") {
      return "BOOKED";
    }

    if (normalized === "COMPLETED") {
      return "COMPLETED";
    }

    if (normalized === "CANCELLED" || normalized === "CANCELED") {
      return "CANCELLED";
    }

    if (normalized === "NO_SHOW") {
      return "NO_SHOW";
    }

    return "OTHER";
  };

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

  const groupedAppointments: Record<
    "BOOKED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "OTHER",
    Appointment[]
  > = {
    BOOKED: [],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: [],
    OTHER: [],
  };

  appointments.forEach((appointment) => {
    const normalized = normalizeStatus(appointment.status);
    groupedAppointments[normalized].push(appointment);
  });

  const statusSections: Array<{
    key: "BOOKED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "OTHER";
    title: string;
  }> = [
    { key: "BOOKED", title: "Booked" },
    { key: "COMPLETED", title: "Completed" },
    { key: "CANCELLED", title: "Cancelled" },
    { key: "NO_SHOW", title: "No Show" },
  ];

  if (groupedAppointments.OTHER.length > 0) {
    statusSections.push({ key: "OTHER", title: "Other" });
  }

  return (
    <div className="admin-appointments-page">
      <div className="admin-appointments-content">
      <button className="admin-appointments-back" onClick={() => navigate("/admin")}>
        ← Back to Dashboard
      </button>

      <h1>Hospital Appointments</h1>
      <p>All appointments booked at your hospital.</p>

      {appointments.length === 0 ? (
        <div className="admin-appointments-empty">
          <h2>No appointments</h2>
          <p>No appointments have been booked for this hospital yet.</p>
        </div>
      ) : (
        <div className="admin-appointments-sections">
          {statusSections.map((section) => {
            const sectionAppointments = groupedAppointments[section.key];

            return (
              <section key={section.key} className="admin-appointments-section">
                <div className="admin-appointments-section-head">
                  <h2>{section.title}</h2>
                  <span>{sectionAppointments.length}</span>
                </div>

                {sectionAppointments.length === 0 ? (
                  <p className="admin-appointments-empty-status">No appointments in this section.</p>
                ) : (
                  <div className="admin-appointments-grid">
                    {sectionAppointments.map((appointment) => {
                      const normalizedStatus = normalizeStatus(appointment.status);
                      const statusClass = normalizedStatus.toLowerCase();

                      return (
                        <div className={`admin-appointment-card status-${statusClass}`} key={appointment.id}>
                          <div className="admin-appointment-head">
                            <h3>{appointment.patient_name}</h3>
                            <span className={`admin-appointment-badge status-${statusClass}`}>
                              {section.title}
                            </span>
                          </div>

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
                            <strong>Booked On:</strong> {formatDisplayDate(appointment.created_at)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

export default HospitalAdminAppointments;

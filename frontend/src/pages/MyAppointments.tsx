import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { formatDisplayDate } from "../utils/date";

interface Appointment {
  id: string;

  appointment_date: string;
  appointment_time: string;
  status: string;

  hospital_id: string;
  hospital_name: string;
  hospital_address: string;

  doctor_id: string;
  doctor_name: string;
  specialization: string | null;
}

function MyAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response =
          await api.get(
            "/appointments/my"
          );

        console.log(
          "Appointments:",
          response.data.appointments
        );

        setAppointments(
          response.data.appointments || []
        );

      } catch (error: any) {
        console.error(
          "Appointments error:",
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
            "Failed to load appointments"
        );

      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);


  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>
          Loading appointments...
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

  const handleCancel = async (
  appointmentId: string
) => {
  const confirmed = window.confirm(
    "Are you sure you want to cancel this appointment?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await api.patch(
      `/appointments/${appointmentId}/cancel`
    );

    // Update the UI immediately
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              status: "CANCELLED",
            }
          : appointment
      )
    );

  } catch (error: any) {
    console.error(
      "Cancel appointment error:",
      error
    );

    alert(
      error.response?.data?.message ||
        "Failed to cancel appointment"
    );
  }
};

  return (
    <div className="patient-page appointments-page">
      <div className="patient-page-header">
        <div className="patient-brand">
          <img src="/logo.jpg" alt="MediFlow logo" />
          <span>MediFlow</span>
        </div>
        <button className="patient-back-button" onClick={() => navigate("/patient")}>Back to dashboard</button>
      </div>

      <div className="appointments-content">
        <button
          className="appointments-back-link"
          onClick={() =>
            navigate("/patient")
          }
        >
          ← Back to Dashboard
        </button>

        <div className="page-title-block">
          <h1>
            My Appointments
          </h1>

          <p>
            View your appointments by status.
          </p>
        </div>


      {appointments.length === 0 ? (

        <div className="appointments-empty-card">

          <h2>
            No appointments
          </h2>

          <p>
            You don't have any appointments
            yet.
          </p>

          <button
            onClick={() =>
              navigate("/hospitals")
            }
          >
            Find a Hospital
          </button>

        </div>

      ) : (

        <div className="appointments-sections">
          {statusSections.map((section) => {
            const sectionAppointments = groupedAppointments[section.key];

            return (
              <section key={section.key} className="appointment-status-section">
                <div className="appointment-status-head">
                  <h2>{section.title}</h2>
                  <span>{sectionAppointments.length}</span>
                </div>

                {sectionAppointments.length === 0 ? (
                  <p className="appointment-empty-status">No appointments in this section.</p>
                ) : (
                  <div className="appointment-status-grid">
                    {sectionAppointments.map((appointment) => {
                      const normalizedStatus = normalizeStatus(appointment.status);
                      const statusClass = normalizedStatus.toLowerCase();

                      return (
                        <div
                          className={`appointment-card status-${statusClass}`}
                          key={appointment.id}
                        >
                          <div className="appointment-card-head">
                            <h3>{appointment.doctor_name}</h3>
                            <span className={`appointment-badge status-${statusClass}`}>
                              {section.title}
                            </span>
                          </div>

                          <p>
                            <strong>Specialization:</strong>{" "}
                            {appointment.specialization || "Not specified"}
                          </p>

                          <h4>🏥 {appointment.hospital_name}</h4>

                          <p>📍 {appointment.hospital_address}</p>
                          <p>📅 {formatDisplayDate(appointment.appointment_date)}</p>
                          <p>🕐 {appointment.appointment_time}</p>

                          {normalizedStatus === "BOOKED" && (
                            <button
                              className="appointment-cancel-button"
                              onClick={() =>
                                handleCancel(appointment.id)
                              }
                            >
                              Cancel Appointment
                            </button>
                          )}
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

export default MyAppointments;
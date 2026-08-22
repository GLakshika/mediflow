import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { formatDisplayDate } from "../utils/date";

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  hospital_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  patient_name: string;
  patient_email: string;
}

interface QueueEntry {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  queue_number: number;
  status: string;
  joined_at: string;

  patient_name: string;
  patient_email: string;

  appointment_date?: string;
  appointment_time?: string;
}

function DoctorDashboard() {
  const navigate = useNavigate();

  // =====================================================
  // APPOINTMENTS
  // =====================================================

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  // =====================================================
  // QUEUE
  // =====================================================

  const [queue, setQueue] =
    useState<QueueEntry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [queueLoading, setQueueLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // FETCH APPOINTMENTS
  // =====================================================

  const fetchAppointments = async () => {
    try {
      const response =
        await api.get("/appointments/doctor");

      console.log(
        "Doctor appointments:",
        response.data.appointments
      );

      setAppointments(
        response.data.appointments
      );

    } catch (error: any) {
      console.error(
        "Doctor appointments error:",
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
    }
  };

  // =====================================================
  // FETCH QUEUE
  // =====================================================

  const fetchQueue = async () => {
    try {
      setQueueLoading(true);

      const response =
        await api.get("/queues/doctor");

      console.log(
        "Doctor queue:",
        response.data.queue
      );

      setQueue(
        response.data.queue
      );

    } catch (error: any) {
      console.error(
        "Doctor queue error:",
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
        "Failed to load queue"
      );

    } finally {
      setQueueLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const loadDashboard = async () => {
      await Promise.all([
        fetchAppointments(),
        fetchQueue(),
      ]);

      setLoading(false);
    };

    loadDashboard();
  }, [navigate]);

  // =====================================================
  // UPDATE APPOINTMENT STATUS
  // =====================================================

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: string
  ) => {
    try {
      setError("");

      await api.patch(
        `/appointments/doctor/${appointmentId}/status`,
        {
          status,
        }
      );

      await fetchAppointments();

    } catch (error: any) {
      console.error(
        "Status update error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to update appointment"
      );
    }
  };

  // =====================================================
  // CALL PATIENT
  // =====================================================

  const callPatient = async (
    queueId: string
  ) => {
    try {
      setError("");

      await api.patch(
        `/queues/doctor/${queueId}/call`
      );

      await fetchQueue();

    } catch (error: any) {
      console.error(
        "Call patient error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to call patient"
      );
    }
  };

  // =====================================================
  // COMPLETE QUEUE
  // =====================================================

  const completeQueue = async (
    queueId: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to mark this patient as completed?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.patch(
        `/queues/doctor/${queueId}/complete`
      );

      await fetchQueue();

    } catch (error: any) {
      console.error(
        "Complete queue error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to complete queue"
      );
    }
  };
  const nextWaitingPatient =
  queue.find(
    (entry) =>
      entry.status === "WAITING"
  );
  // =====================================================
  // SKIP PATIENT
  // =====================================================

  const skipPatient = async (
    queueId: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to skip this patient?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.patch(
        `/queues/doctor/${queueId}/skip`
      );

      await fetchQueue();

    } catch (error: any) {
      console.error(
        "Skip patient error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to skip patient"
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>
          Loading doctor dashboard...
        </h2>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Error</h2>

        <p>{error}</p>

        <button
          onClick={() => {
            setError("");
            fetchAppointments();
            fetchQueue();
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "30px",
      }}
    >

      <h1>
        Doctor Dashboard
      </h1>

      <p>
        Manage your appointments
        and patient queue.
      </p>


      {/* =================================================
          TODAY'S APPOINTMENTS
      ================================================= */}

      <section
        style={{
          marginTop: "30px",
        }}
      >

        <h2>
          Today's Appointments
        </h2>

        {appointments.length === 0 ? (

          <p>
            No appointments found.
          </p>

        ) : (

          appointments.map(
            (appointment) => (

              <div
                key={appointment.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "20px",
                  marginTop: "15px",
                  borderRadius: "10px",
                }}
              >

                <h3>
                  {appointment.patient_name}
                </h3>

                <p>
                  📧{" "}
                  {appointment.patient_email}
                </p>

                <p>
                  📅{" "}
                  {formatDisplayDate(appointment.appointment_date)}
                </p>

                <p>
                  🕐{" "}
                  {appointment.appointment_time}
                </p>

                <p>
                  Status:{" "}

                  <strong>
                    {appointment.status}
                  </strong>
                </p>


                {/* Appointment Actions */}

                {appointment.status
                  ?.toUpperCase() ===
                  "BOOKED" && (

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "15px",
                    }}
                  >

                    {/* Complete */}

                    <button
                      onClick={() => {

                        const confirmed =
                          window.confirm(
                            "Are you sure you want to mark this appointment as COMPLETED?"
                          );

                        if (!confirmed) {
                          return;
                        }

                        updateAppointmentStatus(
                          appointment.id,
                          "COMPLETED"
                        );
                      }}
                    >
                      Complete
                    </button>


                    {/* No Show */}

                    <button
                      onClick={() => {

                        const confirmed =
                          window.confirm(
                            "Are you sure you want to mark this patient as NO SHOW?"
                          );

                        if (!confirmed) {
                          return;
                        }

                        updateAppointmentStatus(
                          appointment.id,
                          "NO_SHOW"
                        );
                      }}
                    >
                      No Show
                    </button>


                    {/* Cancel */}

                    <button
                      onClick={() => {

                        const confirmed =
                          window.confirm(
                            "Are you sure you want to CANCEL this appointment?\n\nThis action cannot be undone."
                          );

                        if (!confirmed) {
                          return;
                        }

                        updateAppointmentStatus(
                          appointment.id,
                          "CANCELLED"
                        );
                      }}
                    >
                      Cancel
                    </button>

                  </div>
                )}

              </div>
            )
          )
        )}

      </section>


      {/* =================================================
          PATIENT QUEUE
      ================================================= */}

      <section
        style={{
          marginTop: "50px",
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >

          <h2>
            Patient Queue
          </h2>

          <button
            onClick={fetchQueue}
            disabled={queueLoading}
          >
            {queueLoading
              ? "Refreshing..."
              : "Refresh Queue"}
          </button>

        </div>


        {queue.length === 0 ? (
  <p>No patients in the queue.</p>
) : (
  queue.map((entry) => {
    const isNextPatient =
      nextWaitingPatient?.id === entry.id;

    return (
      <div
        key={entry.id}
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          marginTop: "15px",
          borderRadius: "10px",
        }}
      >
        {/* Queue Number */}

        <h3>
          Queue #{entry.queue_number}
        </h3>

        {/* Patient */}

        <p>
          👤{" "}
          <strong>
            {entry.patient_name}
          </strong>
        </p>

        {/* Email */}

        <p>
          📧 {entry.patient_email}
        </p>

        {/* Appointment */}

        {entry.appointment_date && (
          <p>
            📅 {formatDisplayDate(entry.appointment_date)}
          </p>
        )}

        {entry.appointment_time && (
          <p>
            🕐 {entry.appointment_time}
          </p>
        )}

        {/* Status */}

        <p>
          Status:{" "}
          <strong>
            {entry.status}
          </strong>
        </p>

        {/* =========================================
            WAITING - NEXT PATIENT
        ========================================= */}

        {entry.status === "WAITING" &&
          isNextPatient && (
            <button
              onClick={() =>
                callPatient(entry.id)
              }
              style={{
                marginTop: "10px",
              }}
            >
              📢 Call Patient
            </button>
          )}

        {/* =========================================
            WAITING - OTHER PATIENTS
        ========================================= */}

        {entry.status === "WAITING" &&
          !isNextPatient && (
            <p
              style={{
                color: "#777",
              }}
            >
              Waiting for previous patient
            </p>
          )}

        {/* =========================================
            CALLED
        ========================================= */}

        {entry.status === "CALLED" && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <button
              onClick={() =>
                completeQueue(entry.id)
              }
            >
              ✅ Complete
            </button>

            <button
              onClick={() =>
                skipPatient(entry.id)
              }
            >
              ⏭ Skip
            </button>
          </div>
        )}

        {/* =========================================
            COMPLETED
        ========================================= */}

        {entry.status === "COMPLETED" && (
          <p
            style={{
              color: "green",
            }}
          >
            ✅ Consultation completed
          </p>
        )}

        {/* =========================================
            SKIPPED
        ========================================= */}

        {entry.status === "SKIPPED" && (
          <p
            style={{
              color: "#777",
            }}
          >
            ⏭ Patient skipped
          </p>
        )}
      </div>
    );
  })
)}
</section>
</div>
  );
}

export default DoctorDashboard;
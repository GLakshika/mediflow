import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { formatDisplayDate } from "../utils/date";

interface Queue {
  id: string;
  queue_number: number;
  status: string;
  joined_at: string;

  appointment_id: string;
  appointment_date: string;
  appointment_time: string;

  doctor_id: string;
  doctor_name: string;
  specialization: string | null;

  hospital_id: string;
  hospital_name: string;
  hospital_address: string;
}

function MyQueue() {
  const navigate = useNavigate();

  const [queues, setQueues] =
    useState<Queue[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/queues/my");

      console.log(
        "My Queue:",
        response.data.queues
      );

      setQueues(
        response.data.queues || []
      );

    } catch (error: any) {
      console.error(
        "Queue error:",
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
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchQueue();
  }, []);


  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Loading your queue...</h2>
      </div>
    );
  }


  if (error) {
    return (
      <div style={{ padding: "30px" }}>
        <button
          onClick={() =>
            navigate("/patient")
          }
        >
          ← Back
        </button>

        <h2>Error</h2>

        <p>{error}</p>

        <button
          onClick={fetchQueue}
        >
          Try Again
        </button>
      </div>
    );
  }

  const normalizeQueueStatus = (
    value: string
  ): "WAITING" | "CALLED" | "COMPLETED" | "SKIPPED" | "CANCELLED" | "OTHER" => {
    const normalized = value
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_")
      .replace(/-/g, "_");

    if (normalized === "WAITING") {
      return "WAITING";
    }

    if (normalized === "CALLED") {
      return "CALLED";
    }

    if (normalized === "COMPLETED") {
      return "COMPLETED";
    }

    if (normalized === "SKIPPED") {
      return "SKIPPED";
    }

    if (normalized === "CANCELLED" || normalized === "CANCELED") {
      return "CANCELLED";
    }

    return "OTHER";
  };

  const groupedQueues: Record<
    "WAITING" | "CALLED" | "COMPLETED" | "SKIPPED" | "CANCELLED" | "OTHER",
    Queue[]
  > = {
    WAITING: [],
    CALLED: [],
    COMPLETED: [],
    SKIPPED: [],
    CANCELLED: [],
    OTHER: [],
  };

  queues.forEach((queue) => {
    const normalized = normalizeQueueStatus(queue.status);
    groupedQueues[normalized].push(queue);
  });

  const queueSections: Array<{
    key: "WAITING" | "CALLED" | "COMPLETED" | "SKIPPED" | "CANCELLED" | "OTHER";
    title: string;
  }> = [
    { key: "WAITING", title: "Waiting" },
    { key: "CALLED", title: "Called" },
    { key: "COMPLETED", title: "Completed" },
    { key: "SKIPPED", title: "Skipped" },
    { key: "CANCELLED", title: "Cancelled" },
  ];

  if (groupedQueues.OTHER.length > 0) {
    queueSections.push({ key: "OTHER", title: "Other" });
  }


  return (
    <div className="patient-page queue-page">
      <div className="patient-page-header">
        <div className="patient-brand">
          <img src="/logo.jpg" alt="MediFlow logo" />
          <span>MediFlow</span>
        </div>
        <button className="patient-back-button" onClick={() => navigate("/patient")}>Back to dashboard</button>
      </div>

      <div className="queue-content">
        <button
          className="queue-back-link"
          onClick={() =>
            navigate("/patient")
          }
        >
          ← Back to Dashboard
        </button>

        <div className="queue-heading-row">
          <div className="page-title-block">
            <h1>My Queue</h1>

            <p>
              Check your current queue status.
            </p>
          </div>

          <button
            className="queue-refresh-button"
            onClick={fetchQueue}
          >
            🔄 Refresh
          </button>
        </div>


      {queues.length === 0 ? (

        <div className="queue-empty-card">

          <h2>
            No Queue Found
          </h2>

          <p>
            You don't currently have
            any queue entries.
          </p>

          <button
            onClick={() =>
              navigate("/hospitals")
            }
          >
            Find Hospital
          </button>

        </div>

      ) : (

        <div className="queue-sections">
          {queueSections.map((section) => {
            const sectionQueues = groupedQueues[section.key];

            return (
              <section key={section.key} className="queue-status-section">
                <div className="queue-status-head">
                  <h2>{section.title}</h2>
                  <span>{sectionQueues.length}</span>
                </div>

                {sectionQueues.length === 0 ? (
                  <p className="queue-empty-status">No queue entries in this section.</p>
                ) : (
                  <div className="queue-status-grid">
                    {sectionQueues.map((queue) => {
                      const normalizedStatus = normalizeQueueStatus(queue.status);
                      const statusClass = normalizedStatus.toLowerCase();

                      return (
                        <div className={`queue-card status-${statusClass}`} key={queue.id}>
                          <div className="queue-card-head">
                            <h3>{queue.hospital_name}</h3>
                            <span className={`queue-badge status-${statusClass}`}>{section.title}</span>
                          </div>

                          <p>📍 {queue.hospital_address}</p>

                          <h4>👨‍⚕️ {queue.doctor_name}</h4>

                          <p>{queue.specialization || "Specialization not specified"}</p>

                          <div className="queue-number-box">
                            <p>Your Queue Number</p>
                            <div className="queue-number-value">#{queue.queue_number}</div>
                          </div>

                          <div className="queue-meta-row">
                            <div>
                              <strong>Appointment Date</strong>
                              <p>📅 {formatDisplayDate(queue.appointment_date)}</p>
                            </div>

                            <div>
                              <strong>Appointment Time</strong>
                              <p>🕐 {queue.appointment_time}</p>
                            </div>
                          </div>

                          {normalizedStatus === "WAITING" && (
                            <p className="queue-note">
                              ⏳ Please wait for the doctor to call your queue number.
                            </p>
                          )}

                          {normalizedStatus === "CALLED" && (
                            <p className="queue-note">
                              🔔 Your queue number has been called. Please proceed to the doctor.
                            </p>
                          )}

                          {normalizedStatus === "COMPLETED" && (
                            <p className="queue-note">
                              ✅ Your appointment has been completed.
                            </p>
                          )}

                          {normalizedStatus === "SKIPPED" && (
                            <p className="queue-note">
                              ⚠️ Your queue was skipped. Please contact the hospital.
                            </p>
                          )}

                          {normalizedStatus === "CANCELLED" && (
                            <p className="queue-note">
                              ❌ Your queue entry has been cancelled. Please contact the hospital if you need assistance.
                            </p>
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

export default MyQueue;
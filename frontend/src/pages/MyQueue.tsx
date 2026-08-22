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


  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "30px",
      }}
    >

      <button
        onClick={() =>
          navigate("/patient")
        }
        style={{
          marginBottom: "20px",
        }}
      >
        ← Back to Dashboard
      </button>


      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >

        <div>
          <h1>My Queue</h1>

          <p>
            Check your current queue position.
          </p>
        </div>


        <button
          onClick={fetchQueue}
        >
          🔄 Refresh
        </button>

      </div>


      {queues.length === 0 ? (

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "30px",
            marginTop: "20px",
          }}
        >

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

        <div
          style={{
            display: "grid",
            gap: "20px",
            marginTop: "20px",
          }}
        >

          {queues.map((queue) => (

            <div
              key={queue.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "25px",
              }}
            >

              <h2>
                {queue.hospital_name}
              </h2>

              <p>
                📍 {queue.hospital_address}
              </p>


              <hr />


              <h3>
                👨‍⚕️ {queue.doctor_name}
              </h3>

              <p>
                {queue.specialization ||
                  "Specialization not specified"}
              </p>


              <div
                style={{
                  background: "#f5f5f5",
                  borderRadius: "10px",
                  padding: "25px",
                  marginTop: "20px",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >

                <p>
                  Your Queue Number
                </p>

                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                  }}
                >
                  #{queue.queue_number}
                </div>

                <strong>
                  {queue.status}
                </strong>

              </div>


              <div
                style={{
                  display: "flex",
                  gap: "30px",
                  flexWrap: "wrap",
                }}
              >

                <div>
                  <strong>
                    Appointment Date
                  </strong>

                  <p>
                    📅 {formatDisplayDate(queue.appointment_date)}
                  </p>
                </div>


                <div>
                  <strong>
                    Appointment Time
                  </strong>

                  <p>
                    🕐 {queue.appointment_time}
                  </p>
                </div>

              </div>


              {queue.status ===
                "WAITING" && (

                <p>
                  ⏳ Please wait for the
                  doctor to call your queue
                  number.
                </p>

              )}


              {queue.status ===
                "CALLED" && (

                <p>
                  🔔 Your queue number has
                  been called. Please proceed
                  to the doctor.
                </p>

              )}


              {queue.status ===
                "COMPLETED" && (

                <p>
                  ✅ Your appointment has
                  been completed.
                </p>

              )}


              {queue.status ===
                "SKIPPED" && (

                <p>
                  ⚠️ Your queue was skipped.
                  Please contact the hospital.
                </p>

              )}
              {queue.status === "CANCELLED" && (
              <p>
                ❌ Your queue entry has been cancelled.
                Please contact the hospital if you need
                assistance.
              </p>
            )}

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default MyQueue;
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


      <h1>
        My Appointments
      </h1>

      <p>
        View your upcoming and previous
        appointments.
      </p>


      {appointments.length === 0 ? (

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "30px",
            marginTop: "20px",
          }}
        >

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

        <div
          style={{
            display: "grid",
            gap: "20px",
            marginTop: "20px",
          }}
        >

          {appointments.map(
            (appointment) => (

              <div
                key={appointment.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "25px",
                }}
              >

                <h2>
                  {appointment.doctor_name}
                </h2>

                <p>
                  <strong>
                    Specialization:
                  </strong>{" "}

                  {appointment.specialization ||
                    "Not specified"}
                </p>


                <hr />


                <h3>
                  🏥{" "}
                  {appointment.hospital_name}
                </h3>

                <p>
                  📍{" "}
                  {appointment.hospital_address}
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


                {appointment.status ===
                  "BOOKED" && (

                  <button
                    onClick={() =>
                      handleCancel(appointment.id)
                    }
                  >
                    Cancel Appointment
                  </button>

                )}

              </div>

            )
          )}

        </div>
      )}

    </div>
  );
}

export default MyAppointments;
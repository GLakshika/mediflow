import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

interface Doctor {
  id: string;
  doctor_name: string;
  specialization: string | null;
  department_name: string | null;
  available: boolean;
}

interface Hospital {
  id: string;
  name: string;
}

function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const doctorId = searchParams.get("doctorId");
  const hospitalId = searchParams.get("hospitalId");

  const [doctor, setDoctor] =
    useState<Doctor | null>(null);

  const [hospital, setHospital] =
    useState<Hospital | null>(null);

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [booking, setBooking] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!doctorId || !hospitalId) {
          setError(
            "Doctor or hospital information is missing."
          );
          return;
        }

        const response =
          await api.get(
            `/hospitals/${hospitalId}`
          );

        const hospitalData =
          response.data.hospital;

        const doctors =
          response.data.doctors || [];

        const selectedDoctor =
          doctors.find(
            (doctor: Doctor) =>
              doctor.id === doctorId
          );

        if (!selectedDoctor) {
          setError("Doctor not found.");
          return;
        }

        setHospital({
          id: hospitalData.id,
          name: hospitalData.name,
        });

        setDoctor(selectedDoctor);

      } catch (error: any) {
        console.error(
          "Booking details error:",
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
            "Failed to load booking details."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [doctorId, hospitalId, navigate]);


  const handleBooking = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!doctorId || !hospitalId) {
      setError(
        "Doctor or hospital information is missing."
      );
      return;
    }

    if (!date || !time) {
      setError(
        "Please select a date and time."
      );
      return;
    }

    try {
      setBooking(true);

      const response =
        await api.post(
          "/appointments",
          {
            doctor_id: doctorId,
            hospital_id: hospitalId,
            appointment_date: date,
            appointment_time: time,
          }
        );

      console.log(
        "Appointment:",
        response.data
      );

      setSuccess(
        "Appointment booked successfully!"
      );

    } catch (error: any) {
      console.error(
        "Booking error:",
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
          "Failed to book appointment."
      );

    } finally {
      setBooking(false);
    }
  };


  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>
          Loading appointment details...
        </h2>
      </div>
    );
  }


  if (error && !doctor) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Error</h2>

        <p>{error}</p>

        <button
          onClick={() =>
            navigate(
              `/hospitals/${hospitalId}`
            )
          }
        >
          Back to Hospital
        </button>
      </div>
    );
  }


  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "30px",
      }}
    >

      <button
        onClick={() =>
          navigate(
            `/hospitals/${hospitalId}`
          )
        }
        style={{
          marginBottom: "20px",
        }}
      >
        ← Back to Hospital
      </button>


      <h1>
        Book Appointment
      </h1>


      {/* DOCTOR */}

      {doctor && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >

          <h2>
            {doctor.doctor_name}
          </h2>

          <p>
            Specialization:{" "}
            {doctor.specialization ||
              "Not specified"}
          </p>

          <p>
            Department:{" "}
            {doctor.department_name ||
              "Not assigned"}
          </p>

          <p>
            Availability:{" "}
            {doctor.available
              ? "Available"
              : "Unavailable"}
          </p>

        </div>
      )}


      {/* HOSPITAL */}

      {hospital && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >

          <h3>
            Hospital
          </h3>

          <p>
            {hospital.name}
          </p>

        </div>
      )}


      {/* ERROR */}

      {error && (
        <div
          style={{
            marginBottom: "15px",
            padding: "12px",
            border: "1px solid #f00",
          }}
        >
          {error}
        </div>
      )}


      {/* SUCCESS */}

      {success && (
        <div
          style={{
            marginBottom: "15px",
            padding: "15px",
            border: "1px solid green",
          }}
        >

          <strong>
            {success}
          </strong>

          <br />

          <button
            onClick={() =>
              navigate("/patient")
            }
            style={{
              marginTop: "10px",
            }}
          >
            Back to Dashboard
          </button>

        </div>
      )}


      {/* BOOKING FORM */}

      {!success && (

        <form
          onSubmit={handleBooking}
        >

          {/* DATE */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >

            <label>
              Appointment Date
            </label>

            <br />

            <input
              type="date"
              value={date}
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(event) =>
                setDate(event.target.value)
              }
              required
              style={{
                marginTop: "8px",
                padding: "10px",
                width: "100%",
                boxSizing: "border-box",
              }}
            />

          </div>


          {/* TIME */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >

            <label>
              Appointment Time
            </label>

            <br />

            <input
              type="time"
              value={time}
              onChange={(event) =>
                setTime(event.target.value)
              }
              required
              style={{
                marginTop: "8px",
                padding: "10px",
                width: "100%",
                boxSizing: "border-box",
              }}
            />

          </div>


          {/* SUBMIT */}

          <button
            type="submit"
            disabled={booking}
            style={{
              padding: "12px 20px",
              cursor: booking
                ? "not-allowed"
                : "pointer",
            }}
          >
            {booking
              ? "Booking..."
              : "Confirm Appointment"}
          </button>

        </form>
      )}

    </div>
  );
}

export default BookAppointment;
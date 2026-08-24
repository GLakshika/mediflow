import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: string | number | null;
  longitude: string | number | null;
  phone: string;
  status: string;
  available_beds: number;
  emergency_queue: number;
  doctors_available: number;
  emergency_status: string;
}

interface Department {
  id: string;
  name: string;
  status: string;
}

interface Doctor {
  id: string;
  doctor_name: string;
  specialization: string | null;
  available: boolean;
  department_name: string | null;
}

function HospitalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hospital, setHospital] =
    useState<Hospital | null>(null);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [doctors, setDoctors] =
    useState<Doctor[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        if (!id) {
          setError("Hospital ID is missing");
          return;
        }

        const response =
          await api.get(`/hospitals/${id}`);

        console.log(
          "Hospital details:",
          response.data
        );

        setHospital(
          response.data.hospital
        );

        setDepartments(
          response.data.departments || []
        );

        setDoctors(
          response.data.doctors || []
        );

      } catch (error: any) {
        console.error(
          "Hospital details error:",
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

        if (
          error.response?.status === 404
        ) {
          setError("Hospital not found");
        } else {
          setError(
            error.response?.data?.message ||
              "Failed to load hospital"
          );
        }

      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, [id, navigate]);


  if (loading) {
    return (
      <div>
        <h2>Loading hospital...</h2>
      </div>
    );
  }


  if (error) {
    return (
      <div
        style={{
          padding: "30px",
        }}
      >
        <h2>Error</h2>

        <p>{error}</p>

        <button
          onClick={() =>
            navigate("/hospitals")
          }
        >
          Back to Hospitals
        </button>
      </div>
    );
  }


  if (!hospital) {
    return (
      <div>
        <p>Hospital not found.</p>
      </div>
    );
  }


  return (
    <div className="patient-page hospital-details-page">

      <div className="patient-page-header">
        <div className="patient-brand">
          <img src="/logo.jpg" alt="MediFlow logo" />
          <span>MediFlow</span>
        </div>
        <button className="patient-back-button" onClick={() => navigate("/patient")}>Back to dashboard</button>
      </div>

      <div className="hospital-details-content">

      {/* BACK BUTTON */}

      <button
        className="page-back-link"
        onClick={() =>
          navigate("/hospitals")
        }
        style={{
          marginBottom: "20px",
        }}
      >
        ← Back to Hospitals
      </button>


      {/* HOSPITAL INFORMATION */}

      <div className="hospital-details-summary"
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "25px",
          marginBottom: "25px",
        }}
      >

        <h1>
          {hospital.name}
        </h1>

        <p>
          📍 {hospital.address}
        </p>

        <p>
          ☎ {hospital.phone}
        </p>

        <p>
          Status:{" "}

          <strong>
            {hospital.status}
          </strong>
        </p>

      </div>


      {/* EMERGENCY CAPACITY */}

      <h2>
        Emergency Capacity
      </h2>

      <div className="hospital-capacity-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap: "15px",
          marginBottom: "30px",
        }}
      >

        <div className="capacity-card"
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h3>
            🛏 Available Beds
          </h3>

          <p
            style={{
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            {hospital.available_beds}
          </p>
        </div>


        <div className="capacity-card"
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h3>
            👥 Emergency Queue
          </h3>

          <p
            style={{
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            {hospital.emergency_queue}
          </p>
        </div>


        <div className="capacity-card"
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h3>
            👨‍⚕️ Doctors Available
          </h3>

          <p
            style={{
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            {hospital.doctors_available}
          </p>
        </div>

      </div>


      {/* EMERGENCY STATUS */}

      <div className="hospital-emergency-card"
        style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "30px",
        }}
      >

        <h2>
          Emergency Status
        </h2>

        <p>
          🚨{" "}

          <strong>
            {hospital.emergency_status}
          </strong>
        </p>

      </div>


      {/* DEPARTMENTS */}

      <section className="departments-section">
        <h2>Departments</h2>

      {departments.length === 0 ? (

        <p>
          No departments available.
        </p>

      ) : (

        <div className="departments-list"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "30px",
          }}
        >

          {departments.map(
            (department) => (

              <div className="department-card"
                key={department.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px 20px",
                }}
              >
                {department.name}
              </div>

            )
          )}

        </div>
      )}
      </section>


      {/* DOCTORS */}

      <h2>
        Doctors
      </h2>

      {doctors.length === 0 ? (

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <p>
            No doctors available at this hospital.
          </p>
        </div>

      ) : (

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, 1fr)",
            gap: "20px",
          }}
        >

          {doctors.map((doctor) => (

            <div className="details-doctor-card"
              key={doctor.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "20px",
              }}
            >

              <h3>
                {doctor.doctor_name}
              </h3>

              <p>
                <strong>
                  Specialization:
                </strong>{" "}

                {doctor.specialization ||
                  "Not specified"}
              </p>

              <p>
                <strong>
                  Department:
                </strong>{" "}

                {doctor.department_name ||
                  "Not assigned"}
              </p>

              <p>
                <strong>
                  Availability:
                </strong>{" "}

                {doctor.available
                  ? "Available"
                  : "Unavailable"}
              </p>


              {/* BOOK APPOINTMENT */}

              {doctor.available && (
                <button className="hospital-view-button"
                  onClick={() =>
                    navigate(
                      `/appointments/book?doctorId=${doctor.id}&hospitalId=${hospital.id}`
                    )
                  }
                >
                  Book Appointment
                </button>
              )}

            </div>

          ))}

        </div>
      )}

      </div>

    </div>
  );
}

export default HospitalDetails;
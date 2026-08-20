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
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "30px",
      }}
    >

      {/* BACK BUTTON */}

      <button
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

      <div
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap: "15px",
          marginBottom: "30px",
        }}
      >

        <div
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


        <div
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


        <div
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

      <div
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

      <h2>
        Departments
      </h2>

      {departments.length === 0 ? (

        <p>
          No departments available.
        </p>

      ) : (

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "30px",
          }}
        >

          {departments.map(
            (department) => (

              <div
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

            <div
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
                <button
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
  );
}

export default HospitalDetails;
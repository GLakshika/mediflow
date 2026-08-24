import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: string;
  emergency_status: string;
}

function HospitalDashboard() {
  const navigate = useNavigate();

  const [hospitals, setHospitals] =
    useState<Hospital[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response =
          await api.get("/hospitals");

        console.log(
          "Hospitals:",
          response.data.hospitals
        );

        setHospitals(
          response.data.hospitals
        );

      } catch (error: any) {
        console.error(
          "Hospital error:",
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
            "Failed to load hospitals"
        );

      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [navigate]);


  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Loading hospitals...</h2>
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
    <div className="patient-page hospitals-page">

      <div className="patient-page-header">
        <div className="patient-brand">
          <img src="/logo.jpg" alt="MediFlow logo" />
          <span>MediFlow</span>
        </div>
        <button className="patient-back-button" onClick={() => navigate("/patient")}>Back to dashboard</button>
      </div>

      {/* PAGE HEADER */}

      <div className="page-title-block">
        <h1>
          Find a Hospital
        </h1>

        <p>
          Find nearby hospitals and
          check their emergency status.
        </p>
      </div>


      {/* HOSPITAL LIST */}

      {hospitals.length === 0 ? (

        <p>
          No hospitals found.
        </p>

      ) : (

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >

          {hospitals.map(
            (hospital) => (

              <div className="hospital-card" key={hospital.id}>

                {/* HOSPITAL NAME */}

                <h2>
                  {hospital.name}
                </h2>


                {/* LOCATION */}

                <p>
                  📍 {hospital.address}
                </p>


                {/* PHONE */}

                <p>
                  ☎ {hospital.phone}
                </p>


                {/* STATUS */}

                <p>
                  Hospital Status:{" "}

                  <strong>
                    {hospital.status}
                  </strong>
                </p>


                {/* EMERGENCY */}

                <p>
                  🚨 Emergency:{" "}

                  <strong>
                    {hospital.emergency_status}
                  </strong>
                </p>


                {/* VIEW BUTTON */}

                <button className="hospital-view-button"
                  onClick={() =>
                    navigate(
                      `/hospitals/${hospital.id}`
                    )
                  }
                  style={{
                    marginTop: "10px",
                    cursor: "pointer",
                  }}
                >
                  View Hospital
                </button>

              </div>

            )
          )}

        </div>
      )}

    </div>
  );
}

export default HospitalDashboard;
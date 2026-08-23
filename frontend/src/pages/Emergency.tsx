import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface EmergencyHospital {
  id: string;
  name: string;
  address: string;
  latitude: string | number | null;
  longitude: string | number | null;
  phone: string;
  hospital_status: string;

  available_beds: number | null;
  emergency_queue: number | null;
  doctors_available: number | null;
  emergency_status: string | null;
  updated_at: string | null;
}

function Emergency() {
  const navigate = useNavigate();

  const [hospitals, setHospitals] =
    useState<EmergencyHospital[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchEmergency = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/emergency");

      console.log(
        "Emergency hospitals:",
        response.data.hospitals
      );

      setHospitals(
        response.data.hospitals || []
      );

    } catch (error: any) {
      console.error(
        "Emergency error:",
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
          "Failed to load emergency information"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergency();
  }, []);

  const getStatusSymbol = (
    status: string | null
  ) => {
    switch (status) {
      case "AVAILABLE":
        return "🟢";

      case "LIMITED":
        return "🟡";

      case "FULL":
        return "🔴";

      default:
        return "⚪";
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>
          Loading emergency information...
        </h2>
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
          onClick={fetchEmergency}
        >
          Try Again
        </button>
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

      <button
        onClick={() =>
          navigate("/patient")
        }
      >
        ← Back to Dashboard
      </button>

      <h1>
        🚨 Emergency Hospitals
      </h1>

      <p>
        Check the current emergency capacity
        of nearby hospitals.
      </p>

      {hospitals.length === 0 ? (

        <div>
          <h2>
            No emergency information available
          </h2>

          <p>
            There are currently no active
            hospitals available.
          </p>
        </div>

      ) : (

        <div
          style={{
            display: "grid",
            gap: "20px",
            marginTop: "25px",
          }}
        >

          {hospitals.map(
            (hospital) => (

              <div
                key={hospital.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "25px",
                }}
              >

                <h2>
                  {hospital.name}
                </h2>

                <p>
                  📍 {hospital.address}
                </p>

                <p>
                  ☎ {hospital.phone}
                </p>

                <hr />

                <h3>
                  Emergency Status
                </h3>

                <p>
                  {getStatusSymbol(
                    hospital.emergency_status
                  )}{" "}
                  <strong>
                    {hospital.emergency_status ||
                      "UNKNOWN"}
                  </strong>
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "40px",
                    flexWrap: "wrap",
                    marginTop: "20px",
                  }}
                >

                  <div>
                    <strong>
                      🛏 Available Beds
                    </strong>

                    <p>
                      {hospital.available_beds ??
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <strong>
                      👥 Emergency Queue
                    </strong>

                    <p>
                      {hospital.emergency_queue ??
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <strong>
                      👨‍⚕ Doctors Available
                    </strong>

                    <p>
                      {hospital.doctors_available ??
                        "N/A"}
                    </p>
                  </div>

                </div>

                <button
                  onClick={() =>
                    navigate(
                      `/hospitals/${hospital.id}`
                    )
                  }
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

export default Emergency;
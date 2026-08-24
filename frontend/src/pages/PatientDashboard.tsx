import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {

  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  const user =
    JSON.parse(
      localStorage.getItem("user") ||
      "{}"
    );


  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/login");
  };


  return (
    <div className="dashboard patient-dashboard">

      <nav>
        <div className="patient-brand">
          <img src="/logo.jpg" alt="MediFlow logo" />
          <span>MediFlow</span>
        </div>

        <div className="patient-nav-actions">
          <span>Patient portal</span>
          <button onClick={logout}>Sign out</button>
        </div>
      </nav>

      <main>
        <div className="patient-welcome">
          <div>
            <p className="patient-eyebrow">YOUR HEALTH, SIMPLIFIED</p>
            <h1>Welcome, {user.name || "there"}</h1>
            <p>Find care, manage appointments, and stay connected with your healthcare team.</p>
          </div>
          <time className="patient-welcome-mark" dateTime={currentTime.toISOString()}>
            <strong>{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
            <span>{currentTime.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
          </time>
        </div>


        <div className="dashboard-grid">

          <div className="dashboard-card patient-card">
            <h3><button className="patient-action"
                onClick={() => navigate("/hospitals")}
                >
                🏥 Find Hospitals
                </button></h3>
            <p>
              Search nearby hospitals
            </p>
          </div>

          <div className="dashboard-card patient-card">
            <h3><button className="patient-action"
                onClick={() =>
                    navigate("/appointments")
                }
                >
                📅 My Appointments
                </button></h3>
            <p>
              Manage your appointments
            </p>
          </div>

          <div className="dashboard-card patient-card">
            <h3><button className="patient-action"
                onClick={() =>
                    navigate("/queue")
                }
                >
                🎫 My Queue
                </button></h3>
            <p>
              View your queue status
            </p>
          </div>

          <div className="dashboard-card patient-card">
            <h3><button className="patient-action"
                    onClick={() =>
                        navigate("/emergency")
                    }
                    >
                    🚨 Emergency
                    </button>
            </h3>
            <p>
              Check emergency capacity
            </p>
          </div>

          <div className="dashboard-card patient-card">
            <h3><button className="patient-action"
                onClick={() =>
                    navigate("/notifications")
                }
                >
                🔔 Notifications
                </button>
            </h3>
            <p>
              View notifications
            </p>
          </div>

        </div>

      </main>

    </div>
  );
}
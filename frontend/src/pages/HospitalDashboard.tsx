import { useNavigate } from "react-router-dom";

export default function HospitalDashboard() {

  const navigate = useNavigate();

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
    <div className="dashboard">

      <nav>

        <h2>MediFlow</h2>

        <button onClick={logout}>
          Logout
        </button>

      </nav>


      <main>

        <h1>
          Hospital Dashboard
        </h1>

        <p>
          Welcome, {user.name}
        </p>


        <div className="dashboard-grid">

          <div className="dashboard-card">
            <h3>📅 Appointments</h3>
            <h2>24</h2>
            <p>
              Today's appointments
            </p>
          </div>


          <div className="dashboard-card">
            <h3>🎫 Queue</h3>
            <h2>8</h2>
            <p>
              Patients waiting
            </p>
          </div>


          <div className="dashboard-card">
            <h3>👨‍⚕️ Doctors</h3>
            <h2>12</h2>
            <p>
              Available doctors
            </p>
          </div>


          <div className="dashboard-card">
            <h3>🚑 Emergency</h3>
            <h2>AVAILABLE</h2>
            <p>
              Emergency capacity
            </p>
          </div>

        </div>


        <section className="queue-section">

          <h2>
            Current Queue
          </h2>

          <div>
            Patient #001
            <button>
              Call Next
            </button>
          </div>

        </section>

      </main>

    </div>
  );
}
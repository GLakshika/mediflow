import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {

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
          Welcome, {user.name}
        </h1>

        <p>
          Patient Dashboard
        </p>


        <div className="dashboard-grid">

          <div className="dashboard-card">
            <h3><button
                onClick={() => navigate("/hospitals")}
                >
                🏥 Find Hospitals
                </button></h3>
            <p>
              Search nearby hospitals
            </p>
          </div>

          <div className="dashboard-card">
            <h3><button
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

          <div className="dashboard-card">
            <h3><button
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

          <div className="dashboard-card">
            <h3>🚑 Emergency</h3>
            <p>
              Check emergency capacity
            </p>
          </div>

          <div className="dashboard-card">
            <h3>🔔 Notifications</h3>
            <p>
              View notifications
            </p>
          </div>

        </div>

      </main>

    </div>
  );
}
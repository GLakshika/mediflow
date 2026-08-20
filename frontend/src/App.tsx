import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register.tsx";
import PatientDashboard from "./pages/PatientDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";


function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {

  const token =
    localStorage.getItem("token");

  const user =
    JSON.parse(
      localStorage.getItem("user") ||
      "null"
    );


  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  if (
    !allowedRoles.includes(
      user.role
    )
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  return children;
}


function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/patient"
          element={
            <ProtectedRoute
              allowedRoles={[
                "PATIENT",
              ]}
            >
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hospital"
          element={
            <ProtectedRoute
              allowedRoles={[
                "DOCTOR",
                "HOSPITAL_ADMIN",
              ]}
            >
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
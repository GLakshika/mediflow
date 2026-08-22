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
import HospitalDetails from "./pages/HospitalDetails";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import MyQueue from "./pages/MyQueue";
import Emergency from "./pages/Emergency";
import Notifications from "./pages/Notifications";
import HospitalAdminDashboard from "./pages/HospitalAdminDashboard";
import ManageDoctors from "./pages/ManageDoctors";
import ManageDepartments from "./pages/ManageDepartments";
import DoctorDashboard from "./pages/DoctorDashboard";

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
          path="/hospitals"
          element={
            <ProtectedRoute
              allowedRoles={[
              "PATIENT",
                "DOCTOR",
                "HOSPITAL_ADMIN",
              ]}
            >
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hospitals/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "PATIENT",
                "DOCTOR",
                "HOSPITAL_ADMIN",
              ]}
            >
              <HospitalDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/book"
          element={
            <ProtectedRoute
              allowedRoles={[
                "PATIENT",
              ]}
            >
              <BookAppointment />
            </ProtectedRoute>
          }
        />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute
            allowedRoles={[
              "PATIENT",
            ]}
          >
            <MyAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/queue"
        element={
          <ProtectedRoute
            allowedRoles={[
              "PATIENT",
            ]}
          >
            <MyQueue />
          </ProtectedRoute>
        }
      />

      <Route
        path="/emergency"
        element={
          <ProtectedRoute
            allowedRoles={["PATIENT"]}
          >
            <Emergency />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute
            allowedRoles={["PATIENT"]}
          >
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRoles={[
              "HOSPITAL_ADMIN",
            ]}
          >
            <HospitalAdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute
            allowedRoles={[
              "HOSPITAL_ADMIN",
            ]}
          >
            <ManageDoctors />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute
            allowedRoles={[
              "HOSPITAL_ADMIN",
            ]}
          >
            <ManageDepartments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor"
        element={
          <ProtectedRoute
            allowedRoles={[
              "DOCTOR",
            ]}
          >
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      </Routes>
      


    </BrowserRouter>
  );
}

export default App;
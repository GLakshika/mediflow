import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Department {
  id: string;
  name: string;
  status: string;
}

interface Doctor {
  id: string;
  user_id: string;
  hospital_id: string;
  department_id: string | null;
  specialization: string | null;
  available: boolean;
  name: string;
  email: string;
  department_name: string | null;
}

function ManageDoctors() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [doctors, setDoctors] =
    useState<Doctor[]>([]);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    department_id: "",
  });


  // =====================================================
  // FETCH DOCTORS
  // =====================================================

  const fetchDoctors = async () => {
    try {
      const response =
        await api.get("/doctors/admin");

      console.log(
        "Doctors:",
        response.data.doctors
      );

      setDoctors(
        response.data.doctors
      );

    } catch (error: any) {
      console.error(
        "Doctors error:",
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
        "Failed to load doctors"
      );
    }
  };


  // =====================================================
  // FETCH DEPARTMENTS
  // =====================================================

  const fetchDepartments = async () => {
    try {
      const response =
        await api.get("/departments/admin");

      console.log(
        "Departments:",
        response.data.departments
      );

      const activeDepartments =
        response.data.departments.filter(
          (department: Department) =>
            department.status === "ACTIVE"
        );

      setDepartments(
        activeDepartments
      );

    } catch (error: any) {
      console.error(
        "Departments error:",
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
        "Failed to load departments"
      );
    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchDoctors(),
        fetchDepartments(),
      ]);

      setLoading(false);
    };

    loadData();

  }, [navigate]);


  // =====================================================
  // FORM INPUT HANDLER
  // =====================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // =====================================================
  // ADD DOCTOR
  // =====================================================

  const handleAddDoctor = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validate department

    if (!form.department_id) {
      setError(
        "Please select a department"
      );

      return;
    }

    setSubmitting(true);

    try {

      // Debug
      console.log(
        "Sending doctor data:",
        {
          name: form.name,
          email: form.email,
          password: form.password,
          specialization:
            form.specialization,
          department_id:
            form.department_id,
        }
      );


      // Send request

      const response =
        await api.post(
          "/doctors/admin",
          {
            name: form.name,
            email: form.email,
            password: form.password,
            specialization:
              form.specialization,
            department_id:
              form.department_id,
          }
        );


      console.log(
        "Add doctor response:",
        response.data
      );


      // Success message

      setSuccess(
        "Doctor added successfully"
      );


      // Reset form

      setForm({
        name: "",
        email: "",
        password: "",
        specialization: "",
        department_id: "",
      });


      // Close form

      setShowForm(false);


      // Reload doctor list

      await fetchDoctors();

    } catch (error: any) {

      console.error(
        "Add doctor error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to add doctor"
      );

    } finally {

      setSubmitting(false);

    }
  };


  // =====================================================
  // TOGGLE FORM
  // =====================================================

  const handleToggleForm = () => {
    setError("");
    setSuccess("");

    setShowForm(
      !showForm
    );
  };


  // =====================================================
  // CANCEL FORM
  // =====================================================

  const handleCancel = () => {

    setShowForm(false);

    setForm({
      name: "",
      email: "",
      password: "",
      specialization: "",
      department_id: "",
    });

    setError("");
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "30px",
        }}
      >
        <h2>
          Loading doctors...
        </h2>
      </div>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "30px",
      }}
    >

      {/* Back button */}

      <button
        onClick={() =>
          navigate("/admin")
        }
      >
        ← Back to Dashboard
      </button>


      {/* Page title */}

      <h1>
        Manage Doctors
      </h1>

      <p>
        Add and manage doctors
        working in your hospital.
      </p>


      {/* Error */}

      {error && (
        <div
          style={{
            backgroundColor: "#ffe5e5",
            color: "#cc0000",
            padding: "12px",
            borderRadius: "8px",
            marginTop: "15px",
            marginBottom: "15px",
          }}
        >
          {error}
        </div>
      )}


      {/* Success */}

      {success && (
        <div
          style={{
            backgroundColor: "#e5ffe5",
            color: "#008000",
            padding: "12px",
            borderRadius: "8px",
            marginTop: "15px",
            marginBottom: "15px",
          }}
        >
          {success}
        </div>
      )}


      {/* Add Doctor button */}

      <button
        onClick={
          handleToggleForm
        }
        style={{
          marginTop: "10px",
          padding: "10px 18px",
          cursor: "pointer",
        }}
      >
        {showForm
          ? "− Close Form"
          : "+ Add Doctor"}
      </button>


      {/* =================================================
          ADD DOCTOR FORM
          ================================================= */}

      {showForm && (

        <form
          onSubmit={
            handleAddDoctor
          }
          style={{
            border: "1px solid #ddd",
            padding: "25px",
            marginTop: "20px",
            borderRadius: "10px",
          }}
        >

          <h2>
            Add Doctor
          </h2>


          {/* Name */}

          <label>
            Doctor Name
          </label>

          <br />

          <input
            type="text"
            name="name"
            placeholder="Doctor name"
            value={form.name}
            onChange={
              handleChange
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />

          <br />
          <br />


          {/* Email */}

          <label>
            Email
          </label>

          <br />

          <input
            type="email"
            name="email"
            placeholder="Doctor email"
            value={form.email}
            onChange={
              handleChange
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />

          <br />
          <br />


          {/* Password */}

          <label>
            Temporary Password
          </label>

          <br />

          <input
            type="password"
            name="password"
            placeholder="Temporary password"
            value={form.password}
            onChange={
              handleChange
            }
            required
            minLength={6}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />

          <br />
          <br />


          {/* Specialization */}

          <label>
            Specialization
          </label>

          <br />

          <input
            type="text"
            name="specialization"
            placeholder="e.g. Cardiology"
            value={
              form.specialization
            }
            onChange={
              handleChange
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />

          <br />
          <br />


          {/* Department */}

          <label>
            Department
          </label>

          <br />

          <select
            name="department_id"
            value={
              form.department_id
            }
            onChange={
              handleChange
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          >

            <option value="">
              Select Department
            </option>

            {departments.map(
              (department) => (

                <option
                  key={
                    department.id
                  }
                  value={
                    department.id
                  }
                >
                  {department.name}
                </option>

              )
            )}

          </select>


          {departments.length === 0 && (
            <p
              style={{
                color: "#cc0000",
                fontSize: "14px",
              }}
            >
              No active departments
              available. Please create
              an active department first.
            </p>
          )}


          <br />
          <br />


          {/* Submit */}

          <button
            type="submit"
            disabled={
              submitting ||
              departments.length === 0
            }
            style={{
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            {submitting
              ? "Adding..."
              : "Add Doctor"}
          </button>


          {/* Cancel */}

          <button
            type="button"
            onClick={
              handleCancel
            }
            style={{
              marginLeft: "10px",
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

        </form>
      )}


      {/* =================================================
          DOCTOR LIST
          ================================================= */}

      <div
        style={{
          marginTop: "30px",
        }}
      >

        <h2>
          Doctors
        </h2>


        {doctors.length === 0 ? (

          <div
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <p>
              No doctors found.
            </p>

            <p>
              Click "+ Add Doctor"
              to add a doctor.
            </p>
          </div>

        ) : (

          doctors.map(
            (doctor) => (

              <div
                key={doctor.id}
                style={{
                  border:
                    "1px solid #ddd",
                  padding: "20px",
                  marginTop: "20px",
                  borderRadius: "10px",
                }}
              >

                {/* Doctor name */}

                <h2>
                  {doctor.name}
                </h2>


                {/* Email */}

                <p>
                  📧{" "}
                  <strong>
                    Email:
                  </strong>{" "}
                  {doctor.email}
                </p>


                {/* Specialization */}

                <p>
                  🩺{" "}
                  <strong>
                    Specialization:
                  </strong>{" "}
                  {doctor.specialization ||
                    "Not specified"}
                </p>


                {/* Department */}

                <p>
                  🏥{" "}
                  <strong>
                    Department:
                  </strong>{" "}
                  {doctor.department_name ||
                    "Not assigned"}
                </p>


                {/* Availability */}

                <p>
                  <strong>
                    Status:
                  </strong>{" "}

                  {doctor.available ? (
                    <span
                      style={{
                        color: "green",
                      }}
                    >
                      Available
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "red",
                      }}
                    >
                      Unavailable
                    </span>
                  )}
                </p>


                {/* Buttons */}

                <button
                  type="button"
                  onClick={() => {
                    console.log(
                      "Edit doctor:",
                      doctor.id
                    );
                  }}
                  style={{
                    marginRight: "10px",
                    padding:
                      "8px 15px",
                  }}
                >
                  Edit
                </button>


                <button
                  type="button"
                  onClick={() => {
                    console.log(
                      "Toggle doctor:",
                      doctor.id
                    );
                  }}
                  style={{
                    padding:
                      "8px 15px",
                  }}
                >
                  {doctor.available
                    ? "Disable"
                    : "Enable"}
                </button>

              </div>

            )
          )

        )}

      </div>

    </div>
  );
}

export default ManageDoctors;
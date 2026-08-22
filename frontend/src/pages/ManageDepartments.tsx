import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Department {
  id: string;
  hospital_id: string;
  name: string;
  status: string;
  created_at: string;
  hospital_name: string;
}

function ManageDepartments() {
  const navigate = useNavigate();

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

  const [name, setName] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);
  const [editName, setEditName] =
    useState("");

  const handleEdit = async (
  id: string
) => {
  if (!editName.trim()) {
    setError(
      "Department name is required"
    );
    return;
  }

  try {
    setError("");
    setSuccess("");

    await api.patch(
      `/departments/admin/${id}`,
      {
        name: editName.trim(),
      }
    );

    setSuccess(
      "Department updated successfully"
    );

    setEditingId(null);
    setEditName("");

    await fetchDepartments();

  } catch (error: any) {
    setError(
      error.response?.data?.message ||
      "Failed to update department"
    );
  }
};
const handleStatusChange = async (
  department: Department
) => {
  const newStatus =
    department.status === "ACTIVE"
      ? "INACTIVE"
      : "ACTIVE";

  try {
    setError("");
    setSuccess("");

    await api.patch(
      `/departments/admin/${department.id}/status`,
      {
        status: newStatus,
      }
    );

    setSuccess(
      `Department ${
        newStatus === "ACTIVE"
          ? "activated"
          : "deactivated"
      } successfully`
    );

    await fetchDepartments();

  } catch (error: any) {
    setError(
      error.response?.data?.message ||
      "Failed to update department status"
    );
  }
};
  const fetchDepartments = async () => {
    try {
      const response =
        await api.get(
          "/departments/admin"
        );

      console.log(
        "Departments:",
        response.data.departments
      );

      setDepartments(
        response.data.departments
      );

    } catch (error: any) {
      console.error(
        "Department error:",
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

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDepartments();
  }, []);


  const handleAddDepartment = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError(
        "Department name is required"
      );
      return;
    }

    setSubmitting(true);

    try {
      await api.post(
        "/departments/admin",
        {
          name: name.trim(),
        }
      );

      setSuccess(
        "Department added successfully"
      );

      setName("");
      setShowForm(false);

      await fetchDepartments();

    } catch (error: any) {
      console.error(
        "Add department error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to add department"
      );

    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>
          Loading departments...
        </h2>
      </div>
    );
  }


  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "30px",
      }}
    >

      <button
        onClick={() =>
          navigate("/admin")
        }
      >
        ← Back to Dashboard
      </button>


      <h1>
        Manage Departments
      </h1>


      <p>
        Manage departments belonging
        to your hospital.
      </p>


      {error && (
        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>
      )}


      {success && (
        <p
          style={{
            color: "green",
          }}
        >
          {success}
        </p>
      )}


      <button
        onClick={() =>
          setShowForm(!showForm)
        }
      >
        + Add Department
      </button>


      {showForm && (
        <form
          onSubmit={
            handleAddDepartment
          }
          style={{
            border:
              "1px solid #ddd",
            padding: "20px",
            marginTop: "20px",
            marginBottom: "20px",
            borderRadius: "10px",
          }}
        >

          <h2>
            Add Department
          </h2>

          <input
            type="text"
            placeholder="Department name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />

          <br />
          <br />

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Adding..."
              : "Add Department"}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setName("");
            }}
            style={{
              marginLeft: "10px",
            }}
          >
            Cancel
          </button>

        </form>
      )}


      <div
        style={{
          marginTop: "30px",
        }}
      >

        {departments.length === 0 ? (
          <p>
            No departments found.
          </p>
        ) : (
          departments.map(
  (department) => (
    <div
      key={department.id}
      style={{
        border: "1px solid #ddd",
        padding: "20px",
        marginBottom: "15px",
        borderRadius: "10px",
      }}
    >

      {editingId === department.id ? (

        <>
          <input
            type="text"
            value={editName}
            onChange={(e) =>
              setEditName(
                e.target.value
              )
            }
          />

          <button
            onClick={() =>
              handleEdit(
                department.id
              )
            }
          >
            Save
          </button>

          <button
            onClick={() => {
              setEditingId(null);
              setEditName("");
            }}
          >
            Cancel
          </button>
        </>

      ) : (

        <>
          <h2>
            {department.name}
          </h2>

          <p>
            Hospital:{" "}
            {department.hospital_name}
          </p>

          <p>
            Status:{" "}
            <strong>
              {department.status}
            </strong>
          </p>

          <button
            onClick={() => {
              setEditingId(
                department.id
              );
              setEditName(
                department.name
              );
            }}
          >
            Edit
          </button>

          <button
            onClick={() =>
              handleStatusChange(
                department
              )
            }
            style={{
              marginLeft: "10px",
            }}
          >
            {department.status ===
            "ACTIVE"
              ? "Deactivate"
              : "Activate"}
          </button>
        </>

      )}

    </div>
  )
)
        )}

      </div>

    </div>
  );
}

export default ManageDepartments;
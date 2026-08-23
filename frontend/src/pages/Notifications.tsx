import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean;
  created_at: string;
}

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/notifications/my");

      setNotifications(
        response.data.notifications || []
      );

    } catch (error: any) {
      console.error(
        "Notification error:",
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
          "Failed to load notifications"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (
    id: string
  ) => {
    try {
      await api.patch(
        `/notifications/${id}/read`
      );

      setNotifications(
        notifications.map(
          (notification) =>
            notification.id === id
              ? {
                  ...notification,
                  is_read: true,
                }
              : notification
        )
      );

    } catch (error) {
      console.error(
        "Mark notification error:",
        error
      );
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>
          Loading notifications...
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
          onClick={fetchNotifications}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
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

      <h1>🔔 Notifications</h1>

      <p>
        View updates about your appointments,
        queues and hospital activities.
      </p>

      {notifications.length === 0 ? (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "30px",
            marginTop: "20px",
          }}
        >
          <h2>No notifications</h2>

          <p>
            You don't have any notifications
            yet.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          {notifications.map(
            (notification) => (
              <div
                key={notification.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "20px",

                  backgroundColor:
                    notification.is_read
                      ? "#ffffff"
                      : "#f0f7ff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: "20px",
                  }}
                >
                  <div>
                    <h3>
                      {notification.title}
                    </h3>

                    <p>
                      {notification.message}
                    </p>

                    <small>
                      {new Date(
                        notification.created_at
                      ).toLocaleString()}
                    </small>
                  </div>

                  {!notification.is_read && (
                    <button
                      onClick={() =>
                        markAsRead(
                          notification.id
                        )
                      }
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default Notifications;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
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

  const [updating, setUpdating] =
    useState(false);

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/notifications");

      console.log(
        "Notifications:",
        response.data.notifications
      );

      setNotifications(
        response.data.notifications || []
      );

    } catch (error: any) {
      console.error(
        "Notifications error:",
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

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchNotifications();
    const interval=setInterval(()=>{
      fetchNotifications();
    },10000);
    return ()=>{
      clearInterval(interval);
    };
  }, []);

  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const markAsRead = async (
    notificationId: string
  ) => {
    try {
      setUpdating(true);
      setError("");

      await api.patch(
        `/notifications/${notificationId}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );

    } catch (error: any) {
      console.error(
        "Mark notification read error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to mark notification as read"
      );

    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {
    try {
      setUpdating(true);
      setError("");

      await api.patch(
        "/notifications/read-all"
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

    } catch (error: any) {
      console.error(
        "Mark all notifications error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to mark notifications as read"
      );

    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>
          Loading notifications...
        </h2>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "30px",
      }}
    >

      {/* BACK */}

      <button
        onClick={() =>
          navigate("/patient")
        }
        style={{
          marginBottom: "20px",
        }}
      >
        ← Back to Dashboard
      </button>


      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >

        <div>

          <h1>
            🔔 Notifications
          </h1>

          <p>
            Stay updated about your
            appointments and queue.
          </p>

        </div>


        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >

          <button
            onClick={fetchNotifications}
          >
            🔄 Refresh
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={updating}
            >
              ✓ Mark All as Read
            </button>
          )}

        </div>

      </div>


      {/* ERROR */}

      {error && (
        <div
          style={{
            border: "1px solid #f00",
            padding: "15px",
            marginTop: "20px",
            borderRadius: "8px",
          }}
        >
          <strong>
            Error
          </strong>

          <p>
            {error}
          </p>
        </div>
      )}


      {/* UNREAD COUNT */}

      <div
        style={{
          marginTop: "25px",
          padding: "15px",
          background: "#f5f5f5",
          borderRadius: "10px",
        }}
      >

        <strong>
          {unreadCount}
        </strong>

        {" "}

        unread notification
        {unreadCount !== 1
          ? "s"
          : ""}

      </div>


      {/* NO NOTIFICATIONS */}

      {notifications.length === 0 ? (

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "30px",
            marginTop: "20px",
            textAlign: "center",
          }}
        >

          <h2>
            No Notifications
          </h2>

          <p>
            You don't have any
            notifications yet.
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
                  border:
                    notification.is_read
                      ? "1px solid #ddd"
                      : "2px solid #333",

                  borderRadius: "12px",

                  padding: "20px",

                  background:
                    notification.is_read
                      ? "#fff"
                      : "#f7f7f7",
                }}
              >

                {/* TITLE */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >

                  <h3>
                    {notification.title}
                  </h3>

                  {!notification.is_read && (
                    <span>
                      🔵 NEW
                    </span>
                  )}

                </div>


                {/* MESSAGE */}

                <p>
                  {notification.message}
                </p>


                {/* TYPE */}

                <p>
                  <strong>
                    Type:
                  </strong>{" "}
                  {notification.type}
                </p>


                {/* DATE */}

                <p>
                  <strong>
                    Received:
                  </strong>{" "}
                  {new Date(
                    notification.created_at
                  ).toLocaleString()}
                </p>


                {/* ACTION */}

                {!notification.is_read && (

                  <button
                    onClick={() =>
                      markAsRead(
                        notification.id
                      )
                    }
                    disabled={updating}
                  >
                    ✓ Mark as Read
                  </button>

                )}

                {notification.is_read && (

                  <p>
                    ✅ Read
                  </p>

                )}

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}

export default Notifications;
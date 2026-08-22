import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { pool } from "./config/database";
import authRoutes from "./routes/authRoutes";
import hospitalRoutes from "./routes/hospitalRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import queueRoutes from "./routes/queueRoutes";
import emergencyRoutes from "./routes/emergencyRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import hospitalAdminRoutes from "./routes/hospitalAdminRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import departmentRoutes from "./routes/departmentRoutes";
import doctorAppointmentRoutes from "./routes/doctorAppointmentRoutes";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());


// Health check
app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      status: "OK",
      message: "MediFlow API is running",
      database: "Connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("DATABASE HEALTH ERROR:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
    });
  }
});


// Authentication routes
app.use("/api/auth", authRoutes);

app.use(
  "/api/hospitals",
  hospitalRoutes
);

app.use(
  "/api/appointments",
  appointmentRoutes
);

app.use(
  "/api/queues",
  queueRoutes
);

app.use(
  "/api/emergency",
  emergencyRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/hospital-admin",
  hospitalAdminRoutes
);

app.use(
  "/api/doctors",
  doctorRoutes
);

app.use(
  "/api/departments",
  departmentRoutes
);

app.use(
  "/api/appointments",
  doctorAppointmentRoutes
);

app.use(
  "/api/queues",
  queueRoutes
);

app.listen(PORT, () => {
  console.log(
    `MediFlow backend running on http://localhost:${PORT}`
  );
});


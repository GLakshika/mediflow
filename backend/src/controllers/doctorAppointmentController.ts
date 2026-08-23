import { Request, Response } from "express";
import { pool } from "../config/database";

export const getDoctorAppointments = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "DOCTOR") {
      return res.status(403).json({
        message: "Only doctors can access appointments",
      });
    }

    // Find doctor profile belonging to logged-in user
    const doctorResult = await pool.query(
      `
      SELECT
        id,
        hospital_id,
        department_id,
        specialization,
        available
      FROM doctors
      WHERE user_id = $1
      `,
      [user.id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const doctor = doctorResult.rows[0];

    // Get doctor's appointments
    const result = await pool.query(
      `
      SELECT
        a.id,
        a.patient_id,
        a.doctor_id,
        a.hospital_id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.created_at,

        u.name AS patient_name,
        u.email AS patient_email

      FROM appointments a

      JOIN users u
        ON a.patient_id = u.id

      WHERE a.doctor_id = $1

      ORDER BY
        a.appointment_date ASC,
        a.appointment_time ASC
      `,
      [doctor.id]
    );

    return res.status(200).json({
      appointments: result.rows,
    });

  } catch (error) {
    console.error(
      "Get doctor appointments error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load doctor appointments",
    });
  }
};

export const updateDoctorAppointmentStatus = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const user = (req as any).user;
    const appointmentId = req.params.id;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "DOCTOR") {
      return res.status(403).json({
        message:
          "Only doctors can update appointment status",
      });
    }

    const { status } = req.body;

    const allowedStatuses = [
      "COMPLETED",
      "NO_SHOW",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid appointment status",
      });
    }

    const doctorResult = await client.query(
      `
      SELECT id
      FROM doctors
      WHERE user_id = $1
      `,
      [user.id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const doctorId = doctorResult.rows[0].id;

    await client.query("BEGIN");

    const appointmentResult = await client.query(
      `
      SELECT id, status
      FROM appointments
      WHERE id = $1
        AND doctor_id = $2
      FOR UPDATE
      `,
      [appointmentId, doctorId]
    );

    if (appointmentResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message:
          "Appointment not found for this doctor",
      });
    }

    const appointment = appointmentResult.rows[0];

    if (appointment.status !== "BOOKED") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message:
          "Only booked appointments can be updated from this route",
      });
    }

    if (status === "COMPLETED") {
      const queueResult = await client.query(
        `
        SELECT id, status
        FROM queues
        WHERE appointment_id = $1
          AND doctor_id = $2
        FOR UPDATE
        `,
        [appointmentId, doctorId]
      );

      if (queueResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message:
            "No queue entry exists for this appointment",
        });
      }

      if (queueResult.rows[0].status !== "CALLED") {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message:
            "Only a called patient can be marked completed",
        });
      }

      await client.query(
        `
        UPDATE queues
        SET status = 'COMPLETED'
        WHERE appointment_id = $1
          AND doctor_id = $2
        `,
        [appointmentId, doctorId]
      );
    }

    if (status === "NO_SHOW") {
      await client.query(
        `
        UPDATE queues
        SET status = 'SKIPPED'
        WHERE appointment_id = $1
          AND doctor_id = $2
          AND status IN ('WAITING', 'CALLED')
        `,
        [appointmentId, doctorId]
      );
    }

    if (status === "CANCELLED") {
      await client.query(
        `
        UPDATE queues
        SET status = 'SKIPPED'
        WHERE appointment_id = $1
          AND doctor_id = $2
          AND status IN ('WAITING', 'CALLED')
        `,
        [appointmentId, doctorId]
      );
    }

    const result = await client.query(
      `
      UPDATE appointments
      SET status = $1
      WHERE id = $2
        AND doctor_id = $3
      RETURNING
        id,
        patient_id,
        doctor_id,
        hospital_id,
        appointment_date,
        appointment_time,
        status,
        created_at
      `,
      [
        status,
        appointmentId,
        doctorId,
      ]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message:
        "Appointment status updated successfully",
      appointment:
        result.rows[0],
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      "Update appointment status error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update appointment status",
    });
  } finally {
    client.release();
  }
};
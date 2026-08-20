import { Request, Response } from "express";
import {pool} from "../config/database";


export const createAppointment = async (
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

    if (user.role !== "PATIENT") {
      return res.status(403).json({
        message: "Only patients can book appointments",
      });
    }

    const {
      doctor_id,
      hospital_id,
      appointment_date,
      appointment_time,
    } = req.body;

    // Validate required fields
    if (
      !doctor_id ||
      !hospital_id ||
      !appointment_date ||
      !appointment_time
    ) {
      return res.status(400).json({
        message:
          "doctor_id, hospital_id, appointment_date and appointment_time are required",
      });
    }

    // Check doctor
    const doctorResult = await pool.query(
      `
      SELECT id
      FROM doctors
      WHERE id = $1
      AND hospital_id = $2
      AND available = true
      `,
      [doctor_id, hospital_id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        message:
          "Doctor not found or doctor is unavailable",
      });
    }

    // Check whether the same doctor already
    // has an appointment at this date/time
    const existingAppointment =
      await pool.query(
        `
        SELECT id
        FROM appointments
        WHERE doctor_id = $1
        AND appointment_date = $2
        AND appointment_time = $3
        AND status = 'BOOKED'
        `,
        [
          doctor_id,
          appointment_date,
          appointment_time,
        ]
      );

    if (existingAppointment.rows.length > 0) {
      return res.status(409).json({
        message:
          "This time slot is already booked",
      });
    }

    /*
     * Start transaction.
     *
     * Appointment and queue should either
     * both be created or neither should be created.
     */
    await pool.query("BEGIN");

    try {
      // 1. Create appointment
      const appointmentResult =
        await pool.query(
          `
          INSERT INTO appointments (
            patient_id,
            doctor_id,
            hospital_id,
            appointment_date,
            appointment_time,
            status
          )
          VALUES ($1, $2, $3, $4, $5, 'BOOKED')
          RETURNING *
          `,
          [
            user.id,
            doctor_id,
            hospital_id,
            appointment_date,
            appointment_time,
          ]
        );

      const appointment =
        appointmentResult.rows[0];

      // 2. Find next queue number for this doctor
      const queueResult =
        await pool.query(
          `
          SELECT COALESCE(
            MAX(queue_number),
            0
          ) + 1 AS next_queue_number
          FROM queues
          WHERE doctor_id = $1
          AND appointment_id IN (
            SELECT id
            FROM appointments
            WHERE appointment_date = $2
          )
          `,
          [
            doctor_id,
            appointment_date,
          ]
        );

      const queueNumber =
        queueResult.rows[0].next_queue_number;

      // 3. Create queue entry
      const queueInsert =
        await pool.query(
          `
          INSERT INTO queues (
            patient_id,
            doctor_id,
            appointment_id,
            queue_number,
            status
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            'WAITING'
          )
          RETURNING *
          `,
          [
            user.id,
            doctor_id,
            appointment.id,
            queueNumber,
          ]
        );

      await pool.query("COMMIT");

      return res.status(201).json({
        message:
          "Appointment booked successfully",
        appointment,
        queue: queueInsert.rows[0],
      });

    } catch (transactionError) {
      await pool.query("ROLLBACK");

      throw transactionError;
    }

  } catch (error) {
    console.error(
      "Create appointment error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create appointment",
    });
  }
};

export const getMyAppointments = async (
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

    if (user.role !== "PATIENT") {
      return res.status(403).json({
        message:
          "Only patients can view their appointments",
      });
    }

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.created_at,

        h.id AS hospital_id,
        h.name AS hospital_name,
        h.address AS hospital_address,

        d.id AS doctor_id,
        d.specialization,

        u.name AS doctor_name

      FROM appointments a

      JOIN hospitals h
        ON a.hospital_id = h.id

      JOIN doctors d
        ON a.doctor_id = d.id

      JOIN users u
        ON d.user_id = u.id

      WHERE a.patient_id = $1

      ORDER BY
        a.appointment_date ASC,
        a.appointment_time ASC
      `,
      [user.id]
    );

    return res.status(200).json({
      appointments: result.rows,
    });

  } catch (error) {
    console.error(
      "Get appointments error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load appointments",
    });
  }
};
export const cancelAppointment = async (
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

    if (user.role !== "PATIENT") {
      return res.status(403).json({
        message: "Only patients can cancel appointments",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Appointment ID is required",
      });
    }

    // Make sure this appointment belongs
    // to the logged-in patient
    const appointmentResult = await pool.query(
      `
      SELECT id, status
      FROM appointments
      WHERE id = $1
      AND patient_id = $2
      `,
      [id, user.id]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    const appointment =
      appointmentResult.rows[0];

    if (appointment.status !== "BOOKED") {
      return res.status(400).json({
        message:
          "Only booked appointments can be cancelled",
      });
    }

    const result = await pool.query(
      `
      UPDATE appointments
      SET status = 'CANCELLED'
      WHERE id = $1
      AND patient_id = $2
      RETURNING *
      `,
      [id, user.id]
    );

    return res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Cancel appointment error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to cancel appointment",
    });
  }
};
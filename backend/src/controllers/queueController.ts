import { Request, Response } from "express";
import {pool} from "../config/database";

export const getMyQueue = async (
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
        message: "Only patients can view their queue",
      });
    }

    const result = await pool.query(
      `
      SELECT
        q.id,
        q.queue_number,
        q.status,
        q.joined_at,

        a.id AS appointment_id,
        a.appointment_date,
        a.appointment_time,

        d.id AS doctor_id,
        d.specialization,

        u.name AS doctor_name,

        h.id AS hospital_id,
        h.name AS hospital_name,
        h.address AS hospital_address

      FROM queues q

      JOIN appointments a
        ON q.appointment_id = a.id

      JOIN doctors d
        ON q.doctor_id = d.id

      JOIN users u
        ON d.user_id = u.id

      JOIN hospitals h
        ON a.hospital_id = h.id

      WHERE q.patient_id = $1

      ORDER BY
        a.appointment_date ASC,
        a.appointment_time ASC
      `,
      [user.id]
    );

    return res.status(200).json({
      queues: result.rows,
    });

  } catch (error) {
    console.error(
      "Get my queue error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load queue",
    });
  }
};

// =====================================================
// GET QUEUE FOR LOGGED-IN DOCTOR
// =====================================================

export const getDoctorQueue = async (
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
        message: "Only doctors can access this queue",
      });
    }

    // Find doctor profile
    const doctorResult = await pool.query(
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

    // Get doctor's queue
    const result = await pool.query(
      `
      SELECT
        q.id,
        q.patient_id,
        q.doctor_id,
        q.appointment_id,
        q.queue_number,
        q.status,
        q.joined_at,

        u.name AS patient_name,
        u.email AS patient_email,

        a.appointment_date,
        a.appointment_time

      FROM queues q

      JOIN users u
        ON q.patient_id = u.id

      LEFT JOIN appointments a
        ON q.appointment_id = a.id

      WHERE q.doctor_id = $1

      ORDER BY
        CASE
          WHEN q.status = 'CALLED' THEN 1
          WHEN q.status = 'WAITING' THEN 2
          ELSE 3
        END,
        q.queue_number ASC
      `,
      [doctorId]
    );

    return res.status(200).json({
      queue: result.rows,
    });

  } catch (error) {
    console.error(
      "Get doctor queue error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load doctor queue",
    });
  }
};


// =====================================================
// CALL PATIENT
// =====================================================

export const callPatient = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const queueId = req.params.id;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "DOCTOR") {
      return res.status(403).json({
        message: "Only doctors can call patients",
      });
    }

    // Find doctor
    const doctorResult = await pool.query(
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

    // Make sure queue belongs to doctor
    const queueResult = await pool.query(
      `
      SELECT
        id,
        patient_id,
        status,
        queue_number
      FROM queues
      WHERE id = $1
        AND doctor_id = $2
      `,
      [queueId, doctorId]
    );

    if (queueResult.rows.length === 0) {
      return res.status(404).json({
        message: "Queue entry not found",
      });
    }

    const queue = queueResult.rows[0];

    if (queue.status !== "WAITING") {
      return res.status(400).json({
        message:
          "Only waiting patients can be called",
      });
    }

    // Check if another patient is already being called
    const activeQueue = await pool.query(
      `
      SELECT id
      FROM queues
      WHERE doctor_id = $1
        AND status = 'CALLED'
      `,
      [doctorId]
    );

    if (activeQueue.rows.length > 0) {
      return res.status(400).json({
        message:
          "Another patient is already being served",
      });
    }

    const result = await pool.query(
      `
      UPDATE queues
      SET status = 'CALLED'
      WHERE id = $1
        AND doctor_id = $2
      RETURNING *
      `,
      [queueId, doctorId]
    );

    return res.status(200).json({
      message: "Patient called successfully",
      queue: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Call patient error:",
      error
    );

    return res.status(500).json({
      message: "Failed to call patient",
    });
  }
};


// =====================================================
// COMPLETE QUEUE
// =====================================================

export const completeQueue = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const user = (req as any).user;
    const queueId = req.params.id;

    // -------------------------------------------------
    // Authentication
    // -------------------------------------------------

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "DOCTOR") {
      return res.status(403).json({
        message:
          "Only doctors can complete queue entries",
      });
    }

    // -------------------------------------------------
    // Find doctor profile
    // -------------------------------------------------

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

    const doctorId =
      doctorResult.rows[0].id;

    // -------------------------------------------------
    // Start transaction
    // -------------------------------------------------

    await client.query("BEGIN");

    // -------------------------------------------------
    // Find queue entry
    // -------------------------------------------------

    const queueResult = await client.query(
      `
      SELECT
        id,
        appointment_id,
        doctor_id,
        status
      FROM queues
      WHERE id = $1
        AND doctor_id = $2
      `,
      [
        queueId,
        doctorId,
      ]
    );

    if (queueResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message:
          "Queue entry not found",
      });
    }

    const queue =
      queueResult.rows[0];

    // -------------------------------------------------
    // Make sure queue is currently CALLED
    // -------------------------------------------------

    if (queue.status !== "CALLED") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Only a called patient can be completed",
      });
    }

    // -------------------------------------------------
    // Update queue
    // -------------------------------------------------

    const updatedQueue =
      await client.query(
        `
        UPDATE queues
        SET status = 'COMPLETED'
        WHERE id = $1
          AND doctor_id = $2
        RETURNING *
        `,
        [
          queueId,
          doctorId,
        ]
      );

    // -------------------------------------------------
    // Update related appointment
    // -------------------------------------------------

    if (queue.appointment_id) {

      await client.query(
        `
        UPDATE appointments
        SET status = 'COMPLETED'
        WHERE id = $1
        `,
        [
          queue.appointment_id,
        ]
      );

    }

    // -------------------------------------------------
    // Commit
    // -------------------------------------------------

    await client.query("COMMIT");

    return res.status(200).json({
      message:
        "Queue and appointment completed successfully",

      queue:
        updatedQueue.rows[0],
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(
      "Complete queue error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to complete queue",
    });

  } finally {

    client.release();

  }
};


// =====================================================
// SKIP PATIENT
// =====================================================

export const skipPatient = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const user = (req as any).user;
    const queueId = req.params.id;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "DOCTOR") {
      return res.status(403).json({
        message: "Only doctors can skip patients",
      });
    }

    // Find doctor profile
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

    // Find active queue entry
    const queueResult = await client.query(
      `
      SELECT
        id,
        appointment_id,
        status
      FROM queues
      WHERE id = $1
        AND doctor_id = $2
        AND status = 'CALLED'
      `,
      [queueId, doctorId]
    );

    if (queueResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Active queue entry not found",
      });
    }

    const queue = queueResult.rows[0];

    // ---------------------------------------------
    // Update queue → SKIPPED
    // ---------------------------------------------

    const updatedQueue = await client.query(
      `
      UPDATE queues
      SET status = 'SKIPPED'
      WHERE id = $1
        AND doctor_id = $2
      RETURNING *
      `,
      [queueId, doctorId]
    );

    // ---------------------------------------------
    // Update appointment → NO_SHOW
    // ---------------------------------------------

    if (queue.appointment_id) {
      await client.query(
        `
        UPDATE appointments
        SET status = 'NO_SHOW'
        WHERE id = $1
        `,
        [queue.appointment_id]
      );
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message:
        "Patient skipped and appointment marked as no-show",
      queue: updatedQueue.rows[0],
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(
      "Skip patient error:",
      error
    );

    return res.status(500).json({
      message: "Failed to skip patient",
    });

  } finally {
    client.release();
  }
};
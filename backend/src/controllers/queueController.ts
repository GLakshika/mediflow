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
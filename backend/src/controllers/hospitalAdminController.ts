import { Request, Response } from "express";
import {pool} from "../config/database";

export const getAdminDashboard = async (
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

    if (user.role !== "HOSPITAL_ADMIN") {
      return res.status(403).json({
        message:
          "Only hospital administrators can access this dashboard",
      });
    }

    const result = await pool.query(
      `
      SELECT
        h.id,
        h.name,
        h.address,
        h.phone,
        h.status,

        COUNT(DISTINCT d.id)::integer
          AS doctors_count,

        COUNT(DISTINCT dep.id)::integer
          AS departments_count,

        COALESCE(ec.available_beds, 0)::integer
          AS available_beds,

        COALESCE(ec.emergency_queue, 0)::integer
          AS emergency_queue,

        COALESCE(ec.doctors_available, 0)::integer
          AS doctors_available,

        COALESCE(ec.status, 'UNKNOWN')
          AS emergency_status

      FROM hospital_admins ha

      JOIN hospitals h
        ON ha.hospital_id = h.id

      LEFT JOIN doctors d
        ON d.hospital_id = h.id

      LEFT JOIN departments dep
        ON dep.hospital_id = h.id

      LEFT JOIN emergency_capacity ec
        ON ec.hospital_id = h.id

      WHERE ha.user_id = $1

      GROUP BY
        h.id,
        h.name,
        h.address,
        h.phone,
        h.status,
        ec.available_beds,
        ec.emergency_queue,
        ec.doctors_available,
        ec.status
      `,
      [user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "No hospital is assigned to this administrator",
      });
    }

    return res.status(200).json({
      hospital: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load hospital dashboard",
    });
  }
};
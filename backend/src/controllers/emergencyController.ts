import { Request, Response } from "express";
import {pool} from "../config/database";

export const getEmergencyHospitals = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(
      `
      SELECT
        h.id,
        h.name,
        h.address,
        h.latitude,
        h.longitude,
        h.phone,
        h.status AS hospital_status,

        ec.available_beds,
        ec.emergency_queue,
        ec.doctors_available,
        ec.status AS emergency_status,
        ec.updated_at

      FROM hospitals h

      LEFT JOIN emergency_capacity ec
        ON h.id = ec.hospital_id

      WHERE h.status = 'ACTIVE'

      ORDER BY
        CASE
          WHEN ec.status = 'AVAILABLE' THEN 1
          WHEN ec.status = 'LIMITED' THEN 2
          WHEN ec.status = 'FULL' THEN 3
          ELSE 4
        END,

        h.name ASC
      `
    );

    return res.status(200).json({
      hospitals: result.rows,
    });

  } catch (error) {
    console.error(
      "Get emergency hospitals error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load emergency information",
    });
  }
};
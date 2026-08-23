import { Request, Response } from "express";
import { pool } from "../config/database";


// =====================================================
// GET EMERGENCY INFORMATION FOR PATIENTS
// =====================================================

export const getEmergencyHospitals = async (
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
          "Only patients can view emergency information",
      });
    }


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

      ORDER BY h.name ASC
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

// =====================================================
// GET OWN HOSPITAL EMERGENCY CAPACITY
// HOSPITAL ADMIN
// =====================================================

export const getAdminEmergencyCapacity = async (
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
          "Only hospital admins can access emergency capacity",
      });
    }

    // Find hospital assigned to admin

    const hospitalResult = await pool.query(
      `
      SELECT hospital_id
      FROM hospital_admins
      WHERE user_id = $1
      `,
      [user.id]
    );

    if (hospitalResult.rows.length === 0) {
      return res.status(404).json({
        message:
          "No hospital is assigned to this administrator",
      });
    }

    const hospitalId =
      hospitalResult.rows[0].hospital_id;

    // Get emergency capacity

    const result = await pool.query(
      `
      SELECT
        ec.id,
        ec.hospital_id,
        h.name AS hospital_name,
        h.address AS hospital_address,

        ec.available_beds,
        ec.emergency_queue,
        ec.doctors_available,
        ec.status,
        ec.updated_at

      FROM emergency_capacity ec

      JOIN hospitals h
        ON ec.hospital_id = h.id

      WHERE ec.hospital_id = $1
      `,
      [hospitalId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "Emergency capacity has not been configured",
      });
    }

    return res.status(200).json({
      emergency: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Get admin emergency capacity error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load emergency capacity",
    });
  }
};


// =====================================================
// UPDATE EMERGENCY CAPACITY
// HOSPITAL ADMIN
// =====================================================

export const updateEmergencyCapacity = async (
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
          "Only hospital admins can update emergency capacity",
      });
    }

    const {
      available_beds,
      emergency_queue,
      doctors_available,
      status,
    } = req.body;

    // Validate numbers

    if (
      available_beds === undefined ||
      emergency_queue === undefined ||
      doctors_available === undefined || !status
    ) {
      return res.status(400).json({
        message:
          "Available beds, emergency queue and doctors available are required",
      });
    }

     if (
      available_beds < 0 ||
      emergency_queue < 0 ||
      doctors_available < 0
    ) {
      return res.status(400).json({
        message:
          "Capacity values cannot be negative",
      });
    }

    const allowedStatuses = [
      "AVAILABLE",
      "LIMITED",
      "FULL",
    ];

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message:
          "Invalid emergency status",
      });
    }

    // Find hospital

    const hospitalResult = await pool.query(
      `
      SELECT hospital_id
      FROM hospital_admins
      WHERE user_id = $1
      `,
      [user.id]
    );

    if (hospitalResult.rows.length === 0) {
      return res.status(404).json({
        message:
          "No hospital is assigned to this administrator",
      });
    }

    const hospitalId =
      hospitalResult.rows[0].hospital_id;

    // Make sure record exists

    const existingResult = await pool.query(
      `
      SELECT id
      FROM emergency_capacity
      WHERE hospital_id = $1
      `,
      [hospitalId]
    );

    let result;

    if (existingResult.rows.length === 0) {

      // Create emergency capacity

      result = await pool.query(
        `
        INSERT INTO emergency_capacity (
          hospital_id,
          available_beds,
          emergency_queue,
          doctors_available,
          status,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          CURRENT_TIMESTAMP
        )
        RETURNING *
        `,
        [
          hospitalId,
          available_beds,
          emergency_queue,
          doctors_available,
          status || "AVAILABLE",
        ]
      );

    } else {

      // Update existing record

      result = await pool.query(
        `
        UPDATE emergency_capacity
        SET
          available_beds = $1,
          emergency_queue = $2,
          doctors_available = $3,
          status = $4,
          updated_at = CURRENT_TIMESTAMP

        WHERE hospital_id = $5

        RETURNING *
        `,
        [
          available_beds,
          emergency_queue,
          doctors_available,
          status || "AVAILABLE",
          hospitalId,
        ]
      );
    }

    return res.status(200).json({
      message:
        "Emergency capacity updated successfully",

      emergency: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Update emergency capacity error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update emergency capacity",
    });
  }
};
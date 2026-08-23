import { Request, Response } from "express";
import {pool} from "../config/database";


// GET departments belonging to logged-in admin's hospital
export const getAdminDepartments = async (
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
          "Only hospital admins can access departments",
      });
    }

    const result = await pool.query(
      `
      SELECT
        d.id,
        d.hospital_id,
        d.name,
        d.status,
        d.created_at,
        h.name AS hospital_name

      FROM departments d

      JOIN hospital_admins ha
        ON d.hospital_id = ha.hospital_id

      JOIN hospitals h
        ON d.hospital_id = h.id

      WHERE ha.user_id = $1

      ORDER BY d.name ASC
      `,
      [user.id]
    );

    return res.status(200).json({
      departments: result.rows,
    });

  } catch (error) {
    console.error(
      "Get departments error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load departments",
    });
  }
};


// ADD department
export const addDepartment = async (
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
          "Only hospital admins can add departments",
      });
    }

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Department name is required",
      });
    }

    // Find hospital belonging to admin
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

    // Prevent duplicate department names
    const existingResult = await pool.query(
      `
      SELECT id
      FROM departments
      WHERE hospital_id = $1
      AND LOWER(name) = LOWER($2)
      `,
      [
        hospitalId,
        name.trim(),
      ]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        message:
          "This department already exists",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO departments (
        hospital_id,
        name,
        status
      )
      VALUES ($1, $2, 'ACTIVE')
      RETURNING *
      `,
      [
        hospitalId,
        name.trim(),
      ]
    );

    return res.status(201).json({
      message:
        "Department added successfully",
      department: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Add department error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to add department",
    });
  }
};

export const updateDepartment = async (
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
          "Only hospital admins can update departments",
      });
    }

    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Department name is required",
      });
    }

    // Get admin's hospital
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

    // Make sure department belongs to this hospital
    const departmentResult =
      await pool.query(
        `
        SELECT id
        FROM departments
        WHERE id = $1
        AND hospital_id = $2
        `,
        [id, hospitalId]
      );

    if (departmentResult.rows.length === 0) {
      return res.status(404).json({
        message:
          "Department not found",
      });
    }

    // Check duplicate name
    const duplicateResult =
      await pool.query(
        `
        SELECT id
        FROM departments
        WHERE hospital_id = $1
        AND LOWER(name) = LOWER($2)
        AND id <> $3
        `,
        [
          hospitalId,
          name.trim(),
          id,
        ]
      );

    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        message:
          "Another department with this name already exists",
      });
    }

    const result = await pool.query(
      `
      UPDATE departments
      SET name = $1
      WHERE id = $2
      AND hospital_id = $3
      RETURNING *
      `,
      [
        name.trim(),
        id,
        hospitalId,
      ]
    );

    return res.status(200).json({
      message:
        "Department updated successfully",
      department: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Update department error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update department",
    });
  }
};

export const updateDepartmentStatus = async (
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
          "Only hospital admins can change department status",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (
      status !== "ACTIVE" &&
      status !== "INACTIVE"
    ) {
      return res.status(400).json({
        message:
          "Status must be ACTIVE or INACTIVE",
      });
    }

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

    const result = await pool.query(
      `
      UPDATE departments
      SET status = $1
      WHERE id = $2
      AND hospital_id = $3
      RETURNING *
      `,
      [
        status,
        id,
        hospitalId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "Department not found",
      });
    }

    return res.status(200).json({
      message:
        "Department status updated successfully",
      department: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Department status error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update department status",
    });
  }
};
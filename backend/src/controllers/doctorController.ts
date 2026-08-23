import { Request, Response } from "express";
import { pool } from "../config/database";
import bcrypt from "bcryptjs";


// =====================================================
// GET DOCTORS FOR LOGGED-IN HOSPITAL ADMIN
// =====================================================

export const getAdminDoctors = async (
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
          "Only hospital admins can access doctors",
      });
    }

    // Find hospital belonging to this admin
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


    // Get doctors belonging to this hospital
    const result = await pool.query(
      `
      SELECT
        d.id,
        d.user_id,
        d.hospital_id,
        d.department_id,
        d.specialization,
        d.available,
        d.created_at,

        u.name,
        u.email,

        dep.name AS department_name

      FROM doctors d

      JOIN users u
        ON d.user_id = u.id

      LEFT JOIN departments dep
        ON d.department_id = dep.id

      WHERE d.hospital_id = $1

      ORDER BY u.name ASC
      `,
      [hospitalId]
    );

    return res.status(200).json({
      doctors: result.rows,
    });

  } catch (error) {

    console.error(
      "Get admin doctors error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load doctors",
    });
  }
};


// =====================================================
// ADD DOCTOR
// =====================================================

export const addDoctor = async (
  req: Request,
  res: Response
) => {

  const client = await pool.connect();

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
          "Only hospital admins can add doctors",
      });
    }


    const {
      name,
      email,
      password,
      department_id,
      specialization,
    } = req.body;


    // Validate input

    if (
      !name ||
      !email ||
      !password ||
      !specialization ||
      !department_id
    ) {
      return res.status(400).json({
        message:
          "Name, email, password, specialization and department are required",
      });
    }


    // Find hospital belonging to admin

    const hospitalResult =
      await client.query(
        `
        SELECT hospital_id
        FROM hospital_admins
        WHERE user_id = $1
        `,
        [user.id]
      );


    if (
      hospitalResult.rows.length === 0
    ) {
      return res.status(404).json({
        message:
          "No hospital is assigned to this administrator",
      });
    }


    const hospitalId =
      hospitalResult.rows[0].hospital_id;


    // Check email already exists

    const existingUser =
      await client.query(
        `
        SELECT id
        FROM users
        WHERE email = $1
        `,
        [email]
      );


    if (
      existingUser.rows.length > 0
    ) {
      return res.status(409).json({
        message:
          "A user with this email already exists",
      });
    }

    // =================================================
    // VERIFY DEPARTMENT
    // =================================================

    const departmentResult =
      await client.query(
        `
        SELECT
          id,
          name,
          status
        FROM departments
        WHERE id = $1
          AND hospital_id = $2
          AND status = 'ACTIVE'
        `,
        [
          department_id,
          hospitalId,
        ]
      );


    if (
      departmentResult.rows.length === 0
    ) {
      return res.status(400).json({
        message:
          "Invalid or inactive department",
      });
    }


    // =================================================
    // START TRANSACTION
    // =================================================

    await client.query("BEGIN");


    // Hash password

    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );


    // =================================================
    // CREATE USER
    // =================================================

    const userResult =
      await client.query(
        `
        INSERT INTO users (
          name,
          email,
          password_hash,
          role
        )
        VALUES (
          $1,
          $2,
          $3,
          'DOCTOR'
        )
        RETURNING
          id,
          name,
          email,
          role
        `,
        [
          name,
          email,
          passwordHash,
        ]
      );


    const doctorUser =
      userResult.rows[0];


    // =================================================
    // CREATE DOCTOR PROFILE
    // =================================================

    const doctorResult =
      await client.query(
        `
        INSERT INTO doctors (
          user_id,
          hospital_id,
          department_id,
          specialization,
          available
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          true
        )
        RETURNING *
        `,
        [
          doctorUser.id,
          hospitalId,
          department_id,
          specialization,
        ]
      );


    // =================================================
    // COMMIT
    // =================================================

    await client.query("COMMIT");


    return res.status(201).json({

      message:
        "Doctor added successfully",

      doctor: {
        ...doctorResult.rows[0],

        name:
          doctorUser.name,

        email:
          doctorUser.email,

        role:
          doctorUser.role,

        department_name:
          departmentResult.rows[0].name,
      },

    });

  } catch (error) {

    await client.query(
      "ROLLBACK"
    );

    console.error(
      "Add doctor error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to add doctor",
    });

  } finally {

    client.release();

  }
};

// =====================================================
// UPDATE DOCTOR
// =====================================================

export const updateDoctor = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const doctorId = req.params.id;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "HOSPITAL_ADMIN") {
      return res.status(403).json({
        message:
          "Only hospital admins can update doctors",
      });
    }

    const {
      name,
      email,
      specialization,
      department_id,
    } = req.body;

    if (
      !name ||
      !email ||
      !specialization ||
      !department_id
    ) {
      return res.status(400).json({
        message:
          "Name, email, specialization and department are required",
      });
    }

    // -------------------------------------------------
    // Find hospital of logged-in admin
    // -------------------------------------------------

    const hospitalResult =
      await pool.query(
        `
        SELECT hospital_id
        FROM hospital_admins
        WHERE user_id = $1
        `,
        [user.id]
      );

    if (
      hospitalResult.rows.length === 0
    ) {
      return res.status(404).json({
        message:
          "No hospital is assigned to this administrator",
      });
    }

    const hospitalId =
      hospitalResult.rows[0].hospital_id;


    // -------------------------------------------------
    // Check doctor belongs to admin's hospital
    // -------------------------------------------------

    const doctorResult =
      await pool.query(
        `
        SELECT
          id,
          user_id,
          hospital_id
        FROM doctors
        WHERE id = $1
          AND hospital_id = $2
        `,
        [
          doctorId,
          hospitalId,
        ]
      );

    if (
      doctorResult.rows.length === 0
    ) {
      return res.status(404).json({
        message:
          "Doctor not found in your hospital",
      });
    }

    const doctor =
      doctorResult.rows[0];


    // -------------------------------------------------
    // Check department
    // -------------------------------------------------

    const departmentResult =
      await pool.query(
        `
        SELECT id, name
        FROM departments
        WHERE id = $1
          AND hospital_id = $2
          AND status = 'ACTIVE'
        `,
        [
          department_id,
          hospitalId,
        ]
      );

    if (
      departmentResult.rows.length === 0
    ) {
      return res.status(400).json({
        message:
          "Invalid or inactive department",
      });
    }


    // -------------------------------------------------
    // Check email belongs to another user
    // -------------------------------------------------

    const existingUser =
      await pool.query(
        `
        SELECT id
        FROM users
        WHERE email = $1
          AND id != $2
        `,
        [
          email,
          doctor.user_id,
        ]
      );

    if (
      existingUser.rows.length > 0
    ) {
      return res.status(409).json({
        message:
          "Another user already uses this email",
      });
    }


    // -------------------------------------------------
    // Update user information
    // -------------------------------------------------

    await pool.query(
      `
      UPDATE users
      SET
        name = $1,
        email = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [
        name,
        email,
        doctor.user_id,
      ]
    );


    // -------------------------------------------------
    // Update doctor information
    // -------------------------------------------------

    const updatedDoctor =
      await pool.query(
        `
        UPDATE doctors
        SET
          department_id = $1,
          specialization = $2
        WHERE id = $3
        RETURNING *
        `,
        [
          department_id,
          specialization,
          doctorId,
        ]
      );


    return res.status(200).json({
      message:
        "Doctor updated successfully",

      doctor: {
        ...updatedDoctor.rows[0],
        name,
        email,
        department_name:
          departmentResult.rows[0].name,
      },
    });

  } catch (error) {

    console.error(
      "Update doctor error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update doctor",
    });
  }
};


// =====================================================
// ENABLE / DISABLE DOCTOR
// =====================================================

export const updateDoctorStatus = async (
  req: Request,
  res: Response
) => {
  try {

    const user = (req as any).user;
    const doctorId = req.params.id;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "HOSPITAL_ADMIN") {
      return res.status(403).json({
        message:
          "Only hospital admins can change doctor status",
      });
    }

    const {
      available,
    } = req.body;

    if (
      typeof available !== "boolean"
    ) {
      return res.status(400).json({
        message:
          "Available must be true or false",
      });
    }
    // Find hospital

    const hospitalResult =
      await pool.query(
        `
        SELECT hospital_id
        FROM hospital_admins
        WHERE user_id = $1
        `,
        [user.id]
      );

    if (
      hospitalResult.rows.length === 0
    ) {
      return res.status(404).json({
        message:
          "No hospital is assigned to this administrator",
      });
    }

    const hospitalId =
      hospitalResult.rows[0].hospital_id;


    // Update only doctor's own hospital

    const result =
      await pool.query(
        `
        UPDATE doctors
        SET available = $1
        WHERE id = $2
          AND hospital_id = $3
        RETURNING *
        `,
        [
          available,
          doctorId,
          hospitalId,
        ]
      );


    if (
      result.rows.length === 0
    ) {
      return res.status(404).json({
        message:
          "Doctor not found in your hospital",
      });
    }


    return res.status(200).json({
      message:
        available
          ? "Doctor enabled successfully"
          : "Doctor disabled successfully",

      doctor:
        result.rows[0],
    });

  } catch (error) {

    console.error(
      "Update doctor status error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update doctor status",
    });
  }
};
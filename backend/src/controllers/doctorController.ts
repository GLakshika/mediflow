import { Request, Response } from "express";
import {pool} from "../config/database";
import bcrypt from "bcryptjs";

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
        message: "Only hospital admins can access doctors",
      });
    }

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

      JOIN hospital_admins ha
        ON d.hospital_id = ha.hospital_id

      WHERE ha.user_id = $1

      ORDER BY u.name ASC
      `,
      [user.id]
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
      message: "Failed to load doctors",
    });
  }
};


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
        message: "Only hospital admins can add doctors",
      });
    }

    const {
      name,
      email,
      password,
      department_id,
      specialization,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !specialization
    ) {
      return res.status(400).json({
        message:
          "Name, email, password and specialization are required",
      });
    }

    // Find the hospital assigned to this admin
    const hospitalResult = await client.query(
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

    // Check email
    const existingUser = await client.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message:
          "A user with this email already exists",
      });
    }

    // If department was supplied,
    // make sure it belongs to admin's hospital
    if (department_id) {
      const departmentResult =
        await client.query(
          `
          SELECT id
          FROM departments
          WHERE id = $1
          AND hospital_id = $2
          `,
          [department_id, hospitalId]
        );

      if (departmentResult.rows.length === 0) {
        return res.status(400).json({
          message:
            "Invalid department for this hospital",
        });
      }
    }

    await client.query("BEGIN");

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    // Create user
    const userResult = await client.query(
      `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, 'DOCTOR')
      RETURNING id, name, email, role
      `,
      [
        name,
        email,
        passwordHash,
      ]
    );

    const doctorUser =
      userResult.rows[0];

    // Create doctor profile
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
        VALUES ($1, $2, $3, $4, true)
        RETURNING *
        `,
        [
          doctorUser.id,
          hospitalId,
          department_id || null,
          specialization,
        ]
      );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Doctor added successfully",

      doctor: {
        ...doctorResult.rows[0],
        name: doctorUser.name,
        email: doctorUser.email,
        role: doctorUser.role,
      },
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Add doctor error:",
      error
    );

    return res.status(500).json({
      message: "Failed to add doctor",
    });

  } finally {
    client.release();
  }
};
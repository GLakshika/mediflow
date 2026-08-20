import { Request, Response } from "express";
import { pool } from "../config/database";


// GET ALL HOSPITALS
export const getHospitals = async (
  req: Request,
  res: Response
) => {
  try {

    const result = await pool.query(`
      SELECT
        h.id,
        h.name,
        h.address,
        h.latitude,
        h.longitude,
        h.phone,
        h.status,

        ec.available_beds,
        ec.emergency_queue,
        ec.doctors_available,
        ec.status AS emergency_status

      FROM hospitals h

      LEFT JOIN emergency_capacity ec
        ON h.id = ec.hospital_id

      WHERE h.status = 'ACTIVE'

      ORDER BY h.name;
    `);

    return res.status(200).json({
      hospitals: result.rows,
    });

  } catch (error: any) {

    console.error(
      "GET HOSPITALS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch hospitals",
    });
  }
};


// GET SINGLE HOSPITAL
export const getHospitalById = async (
  req: Request,
  res: Response
) => {

  try {

    const { id } = req.params;

    const hospitalResult = await pool.query(
      `
      SELECT
        h.id,
        h.name,
        h.address,
        h.latitude,
        h.longitude,
        h.phone,
        h.status,

        ec.available_beds,
        ec.emergency_queue,
        ec.doctors_available,
        ec.status AS emergency_status

      FROM hospitals h

      LEFT JOIN emergency_capacity ec
        ON h.id = ec.hospital_id

      WHERE h.id = $1
      `,
      [id]
    );

    if (hospitalResult.rows.length === 0) {

      return res.status(404).json({
        message: "Hospital not found",
      });

    }

    const departmentResult = await pool.query(
      `
      SELECT
        id,
        name,
        status
      FROM departments
      WHERE hospital_id = $1
      AND status = 'ACTIVE'
      ORDER BY name
      `,
      [id]
    );

    const doctorResult = await pool.query(
      `
      SELECT
        d.id,
        d.specialization,
        d.available,

        u.id AS user_id,
        u.name AS doctor_name,

        dep.id AS department_id,
        dep.name AS department_name

      FROM doctors d

      JOIN users u
        ON d.user_id = u.id

      LEFT JOIN departments dep
        ON d.department_id = dep.id

      WHERE d.hospital_id = $1
      ORDER BY u.name
      `,
      [id]
    );

    return res.status(200).json({
      hospital: hospitalResult.rows[0],
      departments: departmentResult.rows,
      doctors: doctorResult.rows,
    });

  } catch (error: any) {

    console.error(
      "GET HOSPITAL ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch hospital",
    });
  }
};
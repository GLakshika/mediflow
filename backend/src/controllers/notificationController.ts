import { Request, Response } from "express";
import { pool } from "../config/database";


interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: string;
}

// =====================================================
// GET MY NOTIFICATIONS
// =====================================================

export const getMyNotifications = async (
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

    const result = await pool.query(
      `
      SELECT
        id,
        title,
        message,
        type,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [user.id]
    );

    return res.status(200).json({
      notifications: result.rows,
    });

  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load notifications",
    });
  }
};


// =====================================================
// MARK NOTIFICATION AS READ
// =====================================================

export const markNotificationAsRead = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const notificationId = req.params.id;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const result = await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
        AND user_id = $2
      RETURNING *
      `,
      [
        notificationId,
        user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      notification: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update notification",
    });
  }
};


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

export const markAllNotificationsAsRead = async (
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

    await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1
        AND is_read = FALSE
      `,
      [user.id]
    );

    return res.status(200).json({
      message:
        "All notifications marked as read",
    });

  } catch (error) {
    console.error(
      "Mark all notifications error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update notifications",
    });
  }
};

export const createNotification = async ({
  userId,
  title,
  message,
  type,
}: CreateNotificationParams) => {
  try {
    const result = await pool.query(
      `
      INSERT INTO notifications (
        user_id,
        title,
        message,
        type
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        userId,
        title,
        message,
        type,
      ]
    );

    return result.rows[0];

  } catch (error) {
    console.error(
      "Create notification error:",
      error
    );

    throw error;
  }
};
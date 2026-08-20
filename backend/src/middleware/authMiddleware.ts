import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid authorization header",
      });
    }

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    (req as any).user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};


export const authorize = (
  ...roles: string[]
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};
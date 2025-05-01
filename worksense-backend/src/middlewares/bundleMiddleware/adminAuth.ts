// middlewares/authorization.ts

import { Request, Response, NextFunction } from "express";
// *** USE YOUR EXISTING SQL IMPORTS ***
import { sqlConnect, sql } from "../../models/sqlModel.js"; // Adjust path as needed

/**
 * Check if user has admin platform role
 */
export const checkPlatformAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRole = req.user?.platformRole;

  if (!userRole) {
    res.status(401).json({ message: "Authentication data missing" });
    return;
  }

  if (userRole === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Requires admin privileges" });
  }
};

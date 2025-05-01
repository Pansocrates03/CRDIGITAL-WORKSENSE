import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Verify JWT token middleware
 */
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header("auth-token");

  if (!token) {
    res.status(401).json({ message: "Access denied: No token provided" });
    return;
  }

  try {
    if (!process.env.TOKEN_SECRET) {
      throw new Error("TOKEN_SECRET not defined in environment variables");
    }

    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
    } else if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
    } else {
      res.status(500).json({ message: "Authentication error" });
    }
  }
}

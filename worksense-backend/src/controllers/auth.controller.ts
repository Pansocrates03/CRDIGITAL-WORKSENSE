import { sqlConnect, sql } from "../models/sqlModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const pool = await sqlConnect();
    if (!pool) {
      res.status(500).json({ message: "Database connection failed" });
      return;
    }

    const result = await pool.request().execute("spGetUsers");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Note: This appears to be a duplicate of getAllUsers
export const getUsers = async (req: Request, res: Response) => {
  try {
    const pool = await sqlConnect();
    if (!pool) {
      res.status(500).json({ message: "Database connection failed" });
      return;
    }

    const result = await pool.request().execute("spGetUsers");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, gender, password, platformRole } =
      req.body;

    const pool = await sqlConnect();
    if (!pool) {
      res.status(500).json({ message: "Database connection failed" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool
      .request()
      .input("email", sql.VarChar, email)
      .input("firstName", sql.VarChar, firstName)
      .input("lastName", sql.VarChar, lastName)
      .input("gender", sql.Int, gender)
      .input("passwordHash", sql.VarChar, hashedPassword)
      .input("platformRole", sql.VarChar, platformRole)
      .execute("spUserRegistration");

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

export const updateUser = (req: Request, res: Response) => {
  res.json({ message: "Update user endpoint" });
};

export const deleteUser = (req: Request, res: Response) => {
  res.json({ message: "Delete user endpoint" });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const pool = await sqlConnect();
    if (!pool) {
      res.status(500).json({ message: "Database connection failed" });
      return;
    }

    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, password)
      .execute("spValidateCredentials");

    const loginData = result.recordset[0];

    // Validate password
    const isPasswordValid = await bcrypt.compare(
      password,
      loginData.PasswordHash
    );

    if (loginData.IsValid === 1 && isPasswordValid) {
      if (!process.env.TOKEN_SECRET) {
        res.status(500).json({ message: "Server configuration error" });
        return;
      }

      // Generate JWT
      const token = jwt.sign(
        {
          email,
          userId: loginData.UserID,
          platformRole: loginData.platformRole,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      // User data to return
      const user = {
        email,
        userId: loginData.UserID,
        firstName: loginData.FirstName,
        lastName: loginData.LastName,
        gender: loginData.Gender,
        platformRole: loginData.platformRole,
      };

      res.status(200).json({ message: "Login successful", token, user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

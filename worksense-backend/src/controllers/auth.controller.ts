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
    const { email, firstName, lastName, password, platformRole } = req.body;

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
      .input("passwordHash", sql.VarChar, hashedPassword)
      .input("platformRole", sql.VarChar, platformRole)
      .execute("spUserRegistration");

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

/**
 * Get the current user's profile
 */
export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const pool = await sqlConnect();
    if (!pool) {
      res.status(500).json({ message: "Database connection failed" });
      return;
    }

    const result = await pool
      .request()
      .input("userId", sql.Int, req.user.userId)
      .execute("spGetUserById");

    if (result.recordset.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const user = result.recordset[0];
    res.json({
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : undefined,
      nickName: user.nickName,
      pfp: user.pfp,
      platformRole: user.platformRole,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get profile" });
  }
};

/**
 * Update the current user's own profile
 */
export const updateSelf = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nickName, pfp } = req.body;

    const pool = await sqlConnect();
    if (!pool) {
      res.status(500).json({ message: "Database connection failed" });
      return;
    }

    await pool
      .request()
      .input("userId", sql.Int, req.user.userId)
      .input("nickName", sql.NVarChar(50), nickName)
      .input("pfp", sql.NVarChar(255), pfp)
      .execute("spUpdateUserProfile");

    // Get updated profile
    const result = await pool
      .request()
      .input("userId", sql.Int, req.user.userId)
      .execute("spGetUserById");

    if (result.recordset.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const user = result.recordset[0];
    res.json({
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : undefined,
      nickName: user.nickName,
      pfp: user.pfp,
      platformRole: user.platformRole,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
};

/**
 * Update a user's profile by an admin
 * This function is for admins updating any user's information
 */
export const updateUserByAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, pfp, platformRole } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      res
        .status(400)
        .json({ message: "Email, first name, and last name are required" });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    // Check if user exists
    const pool = await sqlConnect();
    if (!pool) {
      res.status(500).json({ message: "Database connection failed" });
      return;
    }

    const userExistsResult = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("spCheckUserExists");

    if (userExistsResult.recordset[0].UserExists !== 1) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Update user using the same stored procedure
    await pool
      .request()
      .input("userId", sql.Int, id)
      .input("email", sql.NVarChar(50), email)
      .input("firstName", sql.NVarChar(50), firstName)
      .input("lastName", sql.NVarChar(50), lastName)
      .input("pfp", sql.NVarChar(255), pfp)
      .input("platformRole", sql.NVarChar(50), platformRole)
      .execute("spUpdateUser");

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
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
        platformRole: loginData.platformRole,
        pfp: loginData.pfp,
        nickName: loginData.nickName,
      };

      res.status(200).json({ message: "Login successful", token, user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

import { sqlConnect, sql } from "../models/sqlModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const getAllUsers = async (req: Request, res: Response) => {
  const pool = await sqlConnect();
  if (!pool) return;
  const result = await pool.request().execute("spGetUsers");
  res.json(result.recordset);
}

export const getUsers = async (req: Request, res: Response) => {
  const pool = await sqlConnect();
  if (!pool) return;
  const result = await pool.request().execute("spGetUsers");
  res.json(result.recordset);
};

export const createUser = async (req: Request, res: Response) => {
  const { email, firstName, lastName, gender, password } = req.body;

  // Verificar si el usuario ya existe usando Procedure

  const pool = await sqlConnect();
  if (!pool) return;
  /*
  const data = await pool
    .request()
    .input("username", sql.VarChar, username)
    .execute("spCheckUserExists");
  if (data.recordset[0].UserExists === 1)
    res.status(400).send("El usuario ya existe");
  */

  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear el nuevo usuario en la base de datos
  await pool
    .request()
    .input("email", sql.VarChar, email)
    .input("firstName", sql.VarChar, firstName)
    .input("lastName", sql.VarChar, lastName)
    .input("gender", sql.Int, gender)
    .input("passwordHash", sql.VarChar, hashedPassword)
    .execute("spUserRegistration");

  res.status(201).send("Usuario registrado exitosamente");
};

export const updateUser = (req: Request, res: Response) => {
  res.json([{ text: "Hello from updateUser!" }]);
};

export const deleteUser = (req: Request, res: Response) => {
  res.json([{ text: "Hello from deleteUser!" }]);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validar que el cuerpo de la solicitud contenga los campos necesarios
  if (!email || !password) {
    return res.status(400).json({
      message: "Nombre de usuario y contraseña son obligatorios",
    });
  }

  try {
    const pool = await sqlConnect();
    if (!pool) return;
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, password)
      .execute("spValidateCredentials");

    const loginData = result.recordset[0];

    // Validar la contraseña usando bcrypt
    const isPasswordValid = await bcrypt.compare(
      password,
      loginData.PasswordHash
    );

    if (loginData.IsValid === 1 && isPasswordValid) {
      if (!process.env.TOKEN_SECRET) {
        throw new Error("TOKEN_SECRET no está definido");
      }
      // Generar JWT con más información
      const token = jwt.sign(
        {
          email: email,
          userId: loginData.UserID,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      const userObject = {
        email: email,
        userId: loginData.UserID,
        firstName: loginData.FirstName,
        lastName: loginData.LastName,
        gender: loginData.Gender,
      };

      return res.status(200).json({
        message: "Login exitoso",
        token: token,
        user: userObject,
      });
    } else {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

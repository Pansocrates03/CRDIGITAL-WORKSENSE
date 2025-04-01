import { sqlConnect, sql } from "../models/sqlModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const getUsers = (req: Request, res: Response) => {
  res.json([{ text: "Hello from getUsers!" }]);
};

export const createUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Verificar si el usuario ya existe usando Procedure

  const pool = await sqlConnect();
  const data = await pool
    .request()
    .input("username", sql.VarChar, username)
    .execute("spCheckUserExists");
  if (data.recordset[0].UserExists === 1)
    return res.status(400).send("El usuario ya existe");

  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear el nuevo usuario en la base de datos
  const data2 = await pool
    .request()
    .input("username", sql.VarChar, username)
    .input("passwordHash", sql.VarChar, hashedPassword)
    .input("role", sql.VarChar, "1")
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
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Nombre de usuario y contraseña son obligatorios",
    });
  }

  try {
    const pool = await sqlConnect();
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password)
      .execute("spValidateCredentials");

    const loginData = result.recordset[0];

    // Validar la contraseña usando bcrypt
    const isPasswordValid = await bcrypt.compare(
      password,
      loginData.PasswordHash
    );

    if (loginData.IsValid === 1 && isPasswordValid) {
      // Generar JWT con más información
      const token = jwt.sign(
        {
          username: username,
          userId: loginData.UserID,
          roleId: loginData.RoleID,
          roleName: loginData.RoleName,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message: "Login exitoso",
        token: token,
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
      error: error.message,
    });
  }
};

// Middleware para verificar el token JWT
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Acceso denegado");

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next(); // Continuar con la solicitud
  } catch (err) {
    res.status(400).send("Token inválido");
  }
}

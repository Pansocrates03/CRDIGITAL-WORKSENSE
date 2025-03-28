import { sqlConnect, sql } from "../utils/sql.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// Base de datos simulada
const users = [];

export const getUsers = (req, res) => {
  res.json([{ text: "Hello from getUsers!" }]);
}

export const createUser = async (req, res) => {
  const { username, password } = req.body;

  // Verificar si el usuario ya existe usando Procedure
  
  const pool = await sqlConnect();
  const data = await pool.request()
    .input('username', sql.VarChar, username)
    .execute('spCheckUserExists');
  if (data.recordset[0].UserExists === 1) return res.status(400).send('El usuario ya existe');

  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear el nuevo usuario en la base de datos
  const data2 = await pool.request()
    .input('username', sql.VarChar, username)
    .input('passwordHash', sql.VarChar, hashedPassword)
    .input('role', sql.VarChar, '1')
    .execute('spUserRegistration');

  res.status(201).send('Usuario registrado exitosamente');
}

export const updateUser = (req, res) => {
  res.json([{ text: "Hello from updateUser!" }]);
}

export const deleteUser = (req, res) => {
  res.json([{ text: "Hello from deleteUser!" }]);
}


export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Nombre de usuario y contraseña son obligatorios');
  }

  try {
    const pool = await sqlConnect();
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password) // La contraseña proporcionada
      .execute('spValidateCredentials');

    const isValid = result.recordset[0]?.IsValid;

    if (isValid === 1) {
      // Generar el JWT
      const token = jwt.sign({ username }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
      return res.header('auth-token', token).send({ token });
    } else {
      return res.status(400).send('Usuario no encontrado o contraseña incorrecta');
    }
  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).send('Error interno del servidor');
  }
};

// Middleware para verificar el token JWT
export function verifyToken(req, res, next) {
  const token = req.header('auth-token');
  if (!token) return res.status(401).send('Acceso denegado');

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next(); // Continuar con la solicitud
  } catch (err) {
    res.status(400).send('Token inválido');
  }
}


import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any; // You can replace 'any' with a more specific type for your user object
    }
  }
}

// Middleware para verificar el token JWT
export function verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.header("auth-token");
    if (!token) {
        res.status(401).json({ error: "Acceso denegado: Token no proporcionado" });
        return; // Importante: solo retornamos después de enviar la respuesta
    }
  
    try {
        if (!process.env.TOKEN_SECRET) {
            throw new Error("TOKEN_SECRET no está definido en las variables de entorno");
        }
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next(); // Continuamos con el siguiente middleware o controlador
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: "Token inválido" });
        } else if (err instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: "Token expirado" });
        } else {
            res.status(500).json({ error: "Error en la autenticación" });
        }
        // No llamamos a next() después de un error
    }
}
import { Request, Response } from "express";

export const generateEpicHandler = async (req: Request, res: Response) => {
    // Validación de autenticación
    const userId = (req as any).user?.userId;
    if (!userId) {
        return res.status(401).json({ error: "Acceso denegado: usuario no autenticado" });
    }

    // Extracción de projectId
    const projectId = req.params.id;
    if (!projectId) {
        return res.status(400).json({ error: "Faltan parámetros: se requiere projectId" });
    }

    // Punto de control: Endpoint alcanzado correctamente
    return res.status(200).json({ 
        message: "Endpoint generate-epic alcanzado.",
        projectId,
        userId
        
    });
};
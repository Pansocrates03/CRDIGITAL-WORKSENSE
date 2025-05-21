import { Request, Response } from 'express';
import { forYouService } from '../service/forYou.service.js';

// Obtener items asignados al usuario
export const getAssignedItems = async (req: Request, res: Response) => {
  try {
    const { userId, projectId } = req.query;
    if (!userId || !projectId) {
      return res.status(400).json({ message: 'userId and projectId are required' });
    }
    const items = await forYouService.getAssignedItems(String(userId), String(projectId));
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assigned items', error });
  }
};

// Obtener tareas completadas
export const getCompletedTasks = async (req: Request, res: Response) => {
  try {
    const { userId, projectId, limit } = req.query;
    if (!userId || !projectId) {
      return res.status(400).json({ message: 'userId and projectId are required' });
    }
    const items = await forYouService.getCompletedTasks(String(userId), String(projectId), limit ? Number(limit) : 3);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching completed tasks', error });
  }
};

// Endpoint para gamificación (vacío por ahora)
export const getGamification = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Stub: gamification' });
}; 
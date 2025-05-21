import { Request, Response } from 'express';

// Obtener items asignados al usuario
export const getAssignedItems = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Stub: assigned items' });
};

// Obtener tareas completadas
export const getCompletedTasks = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Stub: completed tasks' });
};

// Obtener datos para el calendario
export const getCalendarData = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Stub: calendar data' });
};

// Endpoint para gamificación (vacío por ahora)
export const getGamification = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Stub: gamification' });
}; 
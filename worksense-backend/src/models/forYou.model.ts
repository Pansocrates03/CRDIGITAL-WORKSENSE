// Modelos para la sección ForYou

export interface AssignedItem {
  id: string;
  type: string;
  name: string;
  status: string;
  assigneeId: string;
}

export interface CompletedTask {
  id: string;
  name: string;
  completedAt: Date;
}

export interface GamificationData {
  // Definir en el futuro
} 
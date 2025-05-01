export interface Task {
  id: string;
  projectId: string;
  sprintId: string;
  type: string;
  originalId: string;
  originalType: string;
  title: string;
  description: string | null;
  status: string;
  assigneeId: string | null;
  order: number;
  subtasksCompleted: number;
  subtasksTotal: number;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  priority: string | null;
  coverImageUrl?: string;
}

export interface CreateTaskData {
  type: string;
  originalId: string;
  originalType: string;
  assigneeId?: string;
  title?: string;
  description?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  assigneeId?: string;
  priority?: string;
  order?: number;
  type?: string;
  subtasksCompleted?: number;
  subtasksTotal?: number;
  coverImageUrl?: string;
}

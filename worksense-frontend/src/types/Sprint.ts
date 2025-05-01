export interface Sprint {
  id: string;
  projectId: string;
  title: string;
  description: string;
  startDate: {
    _seconds: number;
    _nanoseconds: number;
  };
  endDate: {
    _seconds: number;
    _nanoseconds: number;
  };
  status: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface CreateSprintData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
}

export interface CreateSprintItemDTO {
  type: string;
  originalId: string;
  originalType: string;
  assigneeId?: string;
  title?: string;
  description?: string;
}

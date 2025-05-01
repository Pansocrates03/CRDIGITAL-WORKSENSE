export default interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  ownerId: number;
  context: {};
  createdAt: {};
}

export interface CreateProject {
  name: string;
  description: string;
  context: object;
}

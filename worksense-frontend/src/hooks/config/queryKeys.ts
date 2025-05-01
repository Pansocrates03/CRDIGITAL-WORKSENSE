// src/config/queryKeys.ts

export const projectQueryKeys = {
  list: () => ["projects"] as const,
  detail: (projectId: string) => ["projects", projectId] as const,
};

export const sprintQueryKeys = {
  // Key for ALL sprints belonging to a SPECIFIC PROJECT
  listByProject: (projectId: string) =>
    ["sprints", "byProject", projectId] as const,
  // Key for relevant (Active/Planned) sprints for a project (used by dropdown)
  relevantByProject: (projectId: string) =>
    ["sprints", "byProject", projectId, "relevant"] as const,
  // Key for the details of a SPECIFIC SPRINT
  detail: (projectId: string, sprintId: string) =>
    ["sprints", "byProject", projectId, "detail", sprintId] as const,
  // Key for the tasks *within* a specific sprint for a project
  // We link this logically to sprints, even though tasks might be fetched via taskService
  tasks: (projectId: string, sprintId: string) =>
    ["sprints", "byProject", projectId, "tasks", sprintId] as const,
};

export const taskQueryKeys = {
  // Key for the details of a SPECIFIC TASK (unique ID across projects)
  detail: (taskId: string | number) => ["tasks", "detail", taskId] as const,
  // We generally fetch tasks via the sprint context (sprintQueryKeys.tasks)
  // Add other task-specific list keys if needed (e.g., tasks assigned to user)
};

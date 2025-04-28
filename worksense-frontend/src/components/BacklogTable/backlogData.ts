import { Epic, Story } from "./types";

export const backlogData = {
  epics: [
    {
      id: "epic-3",
      title: "Épica 3: Gestión de Flujo de Trabajo Ágil y Sprints",
      stories: [
        {
          id: "HU10",
          title: "Asignar ítems al Sprint Backlog",
          status: "Sprint Backlog",
          assignee: "Usuario A",
          size: "L",
          priority: "Alta",
          dueDate: "2025-05-15",
          points: 8,
          labels: ["Sprint", "Backend"],
        },
        {
          id: "HU11",
          title: "Crear y activar un nuevo Sprint",
          status: "Sprint Backlog",
          assignee: "Usuario B",
          size: "M",
          priority: "Media",
          dueDate: "2025-05-20",
          points: 5,
          labels: ["Sprint", "Frontend"],
        },
      ],
    },
  ],
  userStories: [
    {
      id: "HU20",
      title: "Configurar notificaciones",
      status: "In Progress",
      assignee: "Usuario C",
      size: "S",
      priority: "Baja",
      dueDate: "2025-05-10",
      points: 3,
      epic: "epic-3",
      labels: ["Usabilidad"],
    },
  ],
  bugs: [
    {
      id: "BUG15",
      title: "Error en login",
      status: "In Review",
      assignee: "Usuario D",
      size: "M",
      priority: "Alta",
      dueDate: "2025-04-30",
      points: 2,
      epic: "",
      labels: ["Crítico", "Frontend"],
    },
  ],
};

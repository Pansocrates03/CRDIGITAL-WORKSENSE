// src/components/BacklogTable/data.ts
import { BacklogData } from "./types";

// Datos de ejemplo para el backlog
export const backlogData: BacklogData = {
  epics: [
    {
      id: "epic-3",
      title: "Epic 3: Agile Workflow Management and Sprints",
      stories: [
        {
          id: "HU10",
          title: "Assign items to Sprint Backlog",
          status: "Sprint Backlog",
          assignee: "User A",
          size: "L",
          priority: "High",
          dueDate: "2025-05-15",
          points: 8,
          labels: ["Sprint", "Backend"],
        },
        {
          id: "HU11",
          title: "Create and activate a new Sprint",
          status: "Sprint Backlog",
          assignee: "User B",
          size: "M",
          priority: "Medium",
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
      title: "Configure notifications",
      status: "In Progress",
      assignee: "User C",
      size: "S",
      priority: "Low",
      dueDate: "2025-05-10",
      points: 3,
      epic: "epic-3",
      labels: ["Usability"],
    },
  ],
  bugs: [
    {
      id: "BUG15",
      title: "Login error",
      status: "In Review",
      assignee: "User D",
      size: "M",
      priority: "High",
      dueDate: "2025-04-30",
      points: 2,
      epic: "",
      labels: ["Critical", "Frontend"],
    },
  ],
};
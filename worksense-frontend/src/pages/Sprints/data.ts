export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  startDate: string | null;
  endDate: string | null;
  assignees: Array<{
    id: string;
    name: string;
    avatarUrl: string;
  }>;
  commentsCount: number;
  linksCount: number;
  subtasksTotal: number;
  subtasksCompleted: number;
}

export const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Design System Implementation",
    status: "sprint_backlog",
    priority: "P1",
    startDate: "2024-03-20",
    endDate: "2024-03-25",
    assignees: [
      {
        id: "u1",
        name: "Jon A.",
        avatarUrl: "https://avatar.iran.liara.run/public"
      }
    ],
    commentsCount: 5,
    linksCount: 2,
    subtasksTotal: 8,
    subtasksCompleted: 3
  },
  {
    id: "task-2",
    title: "API Integration for Authentication",
    status: "in_progress",
    priority: "P1",
    startDate: "2024-03-18",
    endDate: "2024-03-22",
    assignees: [
      {
        id: "u2",
        name: "Jane B.",
        avatarUrl: "https://avatar.iran.liara.run/public"
      },
      {
        id: "u3",
        name: "Chris C.",
        avatarUrl: "https://avatar.iran.liara.run/public"
      }
    ],
    commentsCount: 8,
    linksCount: 4,
    subtasksTotal: 6,
    subtasksCompleted: 4
  },
  {
    id: "task-3",
    title: "User Dashboard Analytics",
    status: "in_review",
    priority: "P2",
    startDate: "2024-03-15",
    endDate: "2024-03-21",
    assignees: [
      {
        id: "u4",
        name: "Sara D.",
        avatarUrl: "https://avatar.iran.liara.run/public"
      }
    ],
    commentsCount: 3,
    linksCount: 2,
    subtasksTotal: 4,
    subtasksCompleted: 4
  },
  {
    id: "task-4",
    title: "Mobile Responsive Layout",
    status: "done",
    priority: "P1",
    startDate: "2024-03-10",
    endDate: "2024-03-15",
    assignees: [
      {
        id: "u5",
        name: "Mike E.",
        avatarUrl: "https://avatar.iran.liara.run/public"
      }
    ],
    commentsCount: 6,
    linksCount: 1,
    subtasksTotal: 5,
    subtasksCompleted: 5
  },
  {
    id: "task-5",
    title: "Performance Optimization",
    status: "sprint_backlog",
    priority: "P2",
    startDate: "2024-03-25",
    endDate: "2024-03-30",
    assignees: [
      {
        id: "u3",
        name: "Chris C.",
        avatarUrl: "https://avatar.iran.liara.run/public"
      }
    ],
    commentsCount: 2,
    linksCount: 3,
    subtasksTotal: 6,
    subtasksCompleted: 0
  },
  {
    id: "task-6",
    title: "User Testing Sessions",
    status: "in_progress",
    priority: "P1",
    startDate: "2024-03-19",
    endDate: "2024-03-24",
    assignees: [
      {
        id: "u4",
        name: "Sara D.",
        avatarUrl: "https://avatar.iran.liara.run/public"
      },
      {
        id: "u1",
        name: "Jon A.",
        avatarUrl: "https://avatar.iran.liara.run/public"
      }
    ],
    commentsCount: 10,
    linksCount: 5,
    subtasksTotal: 8,
    subtasksCompleted: 3
  },
  {
    id: "task-7",
    title: "Documentation Update",
    status: "in_review",
    priority: "P3",
    startDate: "2024-03-16",
    endDate: "2024-03-23",
    assignees: [
      {
        id: "u2",
        name: "Jane B.",
        avatarUrl: "https://avatar.iran.liara.run/public"
      }
    ],
    commentsCount: 4,
    linksCount: 2,
    subtasksTotal: 3,
    subtasksCompleted: 3
  },
  {
    id: "task-8",
    title: "Security Audit",
    status: "done",
    priority: "P1",
    startDate: "2024-03-12",
    endDate: "2024-03-17",
    assignees: [
      {
        id: "u5",
        name: "Mike E.",
        avatarUrl: "https://avatar.iran.liara.run/public"
      },
      {
        id: "u3",
        name: "Chris C.",
        avatarUrl: "https://avatar.iran.liara.run/public"
      }
    ],
    commentsCount: 7,
    linksCount: 4,
    subtasksTotal: 10,
    subtasksCompleted: 10
  }
]; 
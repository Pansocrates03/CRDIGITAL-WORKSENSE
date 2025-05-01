// config/swaggerConfig.ts (or wherever you define this)

import { Options } from "swagger-jsdoc";

// --- Configuration Values ---
const PORT = process.env.PORT || 5050;
const HOST = process.env.HOST || "localhost";
const URL = process.env.URL || `http://${HOST}:${PORT}`;
const API_BASE_PATH = "/api/v1"; // Your API base path

// --- Simplified Swagger Definition ---
export const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Worksense API (Simple)", // Indicate simplicity if helpful
      version: "1.0.0",
      description:
        "Basic API Documentation for the Worksense Project Management Platform\n\n" +
        "**Note:** All API routes have the following prefixes:\n" +
        "- New API routes: `/api/v1/...`\n" +
        "- Legacy routes: `/...` (root path)\n\n" +
        "Please use the new API routes when possible as legacy routes may be deprecated in future versions.",
    },
    servers: [
      {
        // Essential: Where Swagger UI should send requests
        url: `${URL}${API_BASE_PATH}`,
        description: "Development Server (New API)",
      },
      {
        // Legacy server
        url: URL,
        description: "Legacy Server (Root Path)",
      },
    ],
    // --- Tags for Grouping (Keep these refined tags) ---
    tags: [
      {
        name: "Authentication",
        description:
          "User authentication operations (Login, Register, Get Self)",
      },
      {
        name: "Platform Admin",
        description:
          "Platform-level administration (Managing roles/permissions)",
      },
      {
        name: "Projects",
        description:
          "Project management operations including creation, updates, and member management",
      },
      {
        name: "Project Members",
        description: "Operations for managing project members and their roles",
      },
      {
        name: "Sprints",
        description: "Sprint management operations within projects",
      },
      {
        name: "Tasks",
        description: "Task management operations within projects",
      },
      {
        name: "Backlog",
        description: "Backlog management operations within projects",
      },
      {
        name: "AI Module",
        description: "AI-powered content generation features",
      },
    ],
    components: {
      securitySchemes: {
        authToken: {
          // Name used in route security definitions
          type: "apiKey",
          in: "header",
          name: "auth-token", // *** IMPORTANT: Matches the header your verifyToken expects ***
        },
      },
      schemas: {
        // User schemas
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the user",
              example: "user123",
            },
            name: {
              type: "string",
              description: "Full name of the user",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email address of the user",
              example: "john.doe@example.com",
            },
            role: {
              type: "string",
              description: "User's role in the system",
              example: "user",
              enum: ["user", "admin", "platform_admin"],
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the user was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the user was last updated",
            },
          },
        },
        UserCreate: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              description: "Full name of the user",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email address of the user",
              example: "john.doe@example.com",
            },
            password: {
              type: "string",
              format: "password",
              description: "Password for the user account",
              example: "securePassword123",
            },
          },
        },
        UserUpdate: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "New name for the user",
              example: "John Smith",
            },
            email: {
              type: "string",
              format: "email",
              description: "New email for the user",
              example: "john.smith@example.com",
            },
            password: {
              type: "string",
              format: "password",
              description: "New password for the user (will be hashed)",
              example: "newSecurePassword123",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Email address of the user",
              example: "john.doe@example.com",
            },
            password: {
              type: "string",
              format: "password",
              description: "Password for the user account",
              example: "securePassword123",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "JWT token for authentication",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
          },
        },

        // Project schemas
        Project: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the project",
              example: "proj_abc123",
            },
            name: {
              type: "string",
              description: "Name of the project",
              example: "changedName Platform Enhancements",
            },
            description: {
              type: "string",
              description: "Description of the project",
              example: "There is none because i changed it",
            },
            ownerId: {
              type: "integer",
              description: "ID of the project owner",
              example: 16,
            },
            context: {
              type: "object",
              properties: {
                techStack: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "List of technologies used in the project",
                  example: ["React"],
                },
                objectives: {
                  type: "string",
                  description: "Project objectives",
                  example: "",
                },
              },
            },
            createdAt: {
              type: "object",
              properties: {
                _seconds: {
                  type: "integer",
                  description: "Unix timestamp in seconds",
                  example: 1745715508,
                },
                _nanoseconds: {
                  type: "integer",
                  description: "Nanoseconds part of the timestamp",
                  example: 392000000,
                },
              },
            },
            updatedAt: {
              type: "object",
              properties: {
                _seconds: {
                  type: "integer",
                  description: "Unix timestamp in seconds",
                  example: 1745788678,
                },
                _nanoseconds: {
                  type: "integer",
                  description: "Nanoseconds part of the timestamp",
                  example: 523000000,
                },
              },
            },
          },
        },
        ProjectCreate: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              description: "Name of the project",
              example: "Worksense Platform",
            },
            description: {
              type: "string",
              description: "Description of the project",
              example: "A project management platform for teams",
            },
          },
        },
        ProjectUpdate: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "New name for the project",
              example: "Worksense Platform v2",
            },
            description: {
              type: "string",
              description: "New description for the project",
              example: "An improved project management platform for teams",
            },
          },
        },

        // Project Member schemas
        ProjectMember: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the project member",
              example: "member123",
            },
            userId: {
              type: "string",
              description: "ID of the user",
              example: "user123",
            },
            projectId: {
              type: "string",
              description: "ID of the project",
              example: "proj123",
            },
            roleId: {
              type: "string",
              description: "ID of the role assigned to the member",
              example: "role123",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
            role: {
              $ref: "#/components/schemas/ProjectRole",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the member was added to the project",
            },
          },
        },
        ProjectMemberCreate: {
          type: "object",
          required: ["userId", "roleId"],
          properties: {
            userId: {
              type: "string",
              description: "ID of the user to add to the project",
              example: "user123",
            },
            roleId: {
              type: "string",
              description: "ID of the role to assign to the user",
              example: "role123",
            },
          },
        },
        ProjectMemberUpdate: {
          type: "object",
          required: ["roleId"],
          properties: {
            roleId: {
              type: "string",
              description: "New role ID to assign to the member",
              example: "role456",
            },
          },
        },

        // Project Role schemas
        ProjectRole: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the project role",
              example: "role123",
            },
            name: {
              type: "string",
              description: "Name of the role",
              example: "Developer",
            },
            permissions: {
              type: "array",
              description: "List of permissions assigned to this role",
              items: {
                type: "string",
              },
              example: ["read:backlog", "write:backlog", "delete:backlog"],
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the role was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the role was last updated",
            },
          },
        },
        ProjectRoleCreate: {
          type: "object",
          required: ["name", "permissions"],
          properties: {
            name: {
              type: "string",
              description: "Name of the role",
              example: "Developer",
            },
            permissions: {
              type: "array",
              description: "List of permissions to assign to this role",
              items: {
                type: "string",
              },
              example: ["read:backlog", "write:backlog", "delete:backlog"],
            },
          },
        },
        ProjectRoleUpdate: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "New name for the role",
              example: "Senior Developer",
            },
            permissions: {
              type: "array",
              description: "Updated list of permissions for this role",
              items: {
                type: "string",
              },
              example: [
                "read:backlog",
                "write:backlog",
                "delete:backlog",
                "manage:members",
              ],
            },
          },
        },

        // Backlog Item schemas
        BacklogItem: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the backlog item",
              example: "item123",
            },
            title: {
              type: "string",
              description: "Title of the backlog item",
              example: "Implement user authentication",
            },
            description: {
              type: "string",
              description: "Description of the backlog item",
              example: "Create a secure authentication system with JWT tokens",
            },
            type: {
              type: "string",
              description: "Type of the backlog item",
              example: "epic",
              enum: ["epic", "story", "bug", "task"],
            },
            status: {
              type: "string",
              description: "Current status of the backlog item",
              example: "in_progress",
              enum: ["todo", "in_progress", "review", "done"],
            },
            priority: {
              type: "string",
              description: "Priority of the backlog item",
              example: "high",
              enum: ["low", "medium", "high", "urgent"],
            },
            projectId: {
              type: "string",
              description: "ID of the project this item belongs to",
              example: "proj123",
            },
            parentId: {
              type: "string",
              description: "ID of the parent item (for stories within epics)",
              example: "epic123",
            },
            assigneeId: {
              type: "string",
              description: "ID of the user assigned to this item",
              example: "user123",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the item was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the item was last updated",
            },
          },
        },
        BacklogItemCreate: {
          type: "object",
          required: ["title", "type", "projectId"],
          properties: {
            title: {
              type: "string",
              description: "Title of the backlog item",
              example: "Implement user authentication",
            },
            description: {
              type: "string",
              description: "Description of the backlog item",
              example: "Create a secure authentication system with JWT tokens",
            },
            type: {
              type: "string",
              description: "Type of the backlog item",
              example: "epic",
              enum: ["epic", "story", "bug", "task"],
            },
            status: {
              type: "string",
              description: "Initial status of the backlog item",
              example: "todo",
              enum: ["todo", "in_progress", "review", "done"],
              default: "todo",
            },
            priority: {
              type: "string",
              description: "Priority of the backlog item",
              example: "high",
              enum: ["low", "medium", "high", "urgent"],
              default: "medium",
            },
            projectId: {
              type: "string",
              description: "ID of the project this item belongs to",
              example: "proj123",
            },
            parentId: {
              type: "string",
              description: "ID of the parent item (for stories within epics)",
              example: "epic123",
            },
            assigneeId: {
              type: "string",
              description: "ID of the user assigned to this item",
              example: "user123",
            },
          },
        },
        BacklogItemUpdate: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "New title for the backlog item",
              example: "Implement secure user authentication",
            },
            description: {
              type: "string",
              description: "New description for the backlog item",
              example:
                "Create a secure authentication system with JWT tokens and refresh tokens",
            },
            status: {
              type: "string",
              description: "New status for the backlog item",
              example: "in_progress",
              enum: ["todo", "in_progress", "review", "done"],
            },
            priority: {
              type: "string",
              description: "New priority for the backlog item",
              example: "high",
              enum: ["low", "medium", "high", "urgent"],
            },
            assigneeId: {
              type: "string",
              description: "New assignee for the backlog item",
              example: "user456",
            },
          },
        },

        // AI Service schemas
        EpicGenerationRequest: {
          type: "object",
          required: ["prompt"],
          properties: {
            prompt: {
              type: "string",
              description: "Description of the epic to generate",
              example:
                "Create an epic about user authentication with username and password",
            },
          },
        },
        EpicGenerationResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Success message",
              example: "Epic created and saved",
            },
            epicId: {
              type: "string",
              description: "ID of the generated epic",
              example: "epic123",
            },
          },
        },

        // Error schemas
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
              example: "User not found",
            },
            code: {
              type: "string",
              description: "Error code",
              example: "NOT_FOUND",
            },
          },
        },

        // Add these schema definitions to the components.schemas section
        Epic: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the epic",
              example: "epic_001",
            },
            projectId: {
              type: "string",
              description: "ID of the project this epic belongs to",
              example: "proj_abc123",
            },
            type: {
              type: "string",
              description: "Type of the item",
              example: "epic",
            },
            title: {
              type: "string",
              description: "Title of the epic",
              example: "User Authentication Module",
            },
            description: {
              type: "string",
              description: "Description of the epic",
              example:
                "Implement complete user login, registration, and profile management.",
            },
            priority: {
              type: "string",
              description: "Priority of the epic",
              example: "high",
            },
            reporterId: {
              type: "string",
              description: "ID of the user who reported the epic",
              example: "101",
            },
            assigneeId: {
              type: "string",
              nullable: true,
              description: "ID of the user assigned to the epic",
              example: null,
            },
            status: {
              type: "string",
              description: "Current status of the epic",
              example: "new",
            },
            createdAt: {
              type: "object",
              properties: {
                _seconds: {
                  type: "integer",
                  description: "Unix timestamp in seconds",
                  example: 1745792338,
                },
                _nanoseconds: {
                  type: "integer",
                  description: "Nanoseconds part of the timestamp",
                  example: 635000000,
                },
              },
            },
            updatedAt: {
              type: "object",
              properties: {
                _seconds: {
                  type: "integer",
                  description: "Unix timestamp in seconds",
                  example: 1745792352,
                },
                _nanoseconds: {
                  type: "integer",
                  description: "Nanoseconds part of the timestamp",
                  example: 683000000,
                },
              },
            },
            linkedItems: {
              type: "array",
              nullable: true,
              description: "Items linked to this epic",
              example: null,
            },
          },
        },

        Story: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the story",
              example: "story_001",
            },
            projectId: {
              type: "string",
              description: "ID of the project this story belongs to",
              example: "proj_abc123",
            },
            type: {
              type: "string",
              description: "Type of the item",
              example: "story",
            },
            title: {
              type: "string",
              description: "Title of the story",
              example: "User Login with Email/Password",
            },
            description: {
              type: "string",
              description: "Description of the story",
              example:
                "As a user, I want to log in using my email and password.",
            },
            epicId: {
              type: "string",
              nullable: true,
              description: "ID of the epic this story belongs to",
              example: "epic_001",
            },
            priority: {
              type: "string",
              description: "Priority of the story",
              example: "highest",
            },
            storyPoints: {
              type: "integer",
              nullable: true,
              description: "Estimated story points",
              example: 5,
            },
            reporterId: {
              type: "integer",
              description: "ID of the user who reported the story",
              example: 16,
            },
            assigneeId: {
              type: "integer",
              nullable: true,
              description: "ID of the user assigned to the story",
              example: 17,
            },
            status: {
              type: "string",
              description: "Current status of the story",
              example: "todo",
            },
            createdAt: {
              type: "object",
              properties: {
                _seconds: {
                  type: "integer",
                  description: "Unix timestamp in seconds",
                  example: 1745792542,
                },
                _nanoseconds: {
                  type: "integer",
                  description: "Nanoseconds part of the timestamp",
                  example: 435000000,
                },
              },
            },
            updatedAt: {
              type: "object",
              nullable: true,
              properties: {
                _seconds: {
                  type: "integer",
                  description: "Unix timestamp in seconds",
                  example: 1745792774,
                },
                _nanoseconds: {
                  type: "integer",
                  description: "Nanoseconds part of the timestamp",
                  example: 85000000,
                },
              },
            },
            linkedItems: {
              type: "array",
              nullable: true,
              description: "Items linked to this story",
              example: null,
            },
          },
        },

        Bug: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the bug",
              example: "bug001",
            },
            projectId: {
              type: "string",
              description: "ID of the project this bug belongs to",
              example: "proj_abc123",
            },
            type: {
              type: "string",
              description: "Type of the item",
              example: "bug",
            },
            title: {
              type: "string",
              description: "Title of the bug",
              example: "Login button unresponsive on Safari",
            },
            description: {
              type: "string",
              description: "Description of the bug",
              example:
                "Steps: 1. Open on Safari 15. 2. Enter credentials. 3. Click Login. Expected: Login proceeds. Actual: Nothing happens.",
            },
            linkedStoryId: {
              type: "string",
              nullable: true,
              description: "ID of the story this bug is linked to",
              example: "story_001",
            },
            priority: {
              type: "string",
              description: "Priority of the bug",
              example: "high",
            },
            severity: {
              type: "string",
              description: "Severity of the bug",
              example: "major",
            },
            reporterId: {
              type: "integer",
              description: "ID of the user who reported the bug",
              example: 18,
            },
            assigneeId: {
              type: "integer",
              nullable: true,
              description: "ID of the user assigned to the bug",
              example: 17,
            },
            status: {
              type: "string",
              description: "Current status of the bug",
              example: "confirmed",
            },
            createdAt: {
              type: "object",
              properties: {
                _seconds: {
                  type: "integer",
                  description: "Unix timestamp in seconds",
                  example: 1745792917,
                },
                _nanoseconds: {
                  type: "integer",
                  description: "Nanoseconds part of the timestamp",
                  example: 903000000,
                },
              },
            },
            updatedAt: {
              type: "object",
              nullable: true,
              properties: {
                _seconds: {
                  type: "integer",
                  description: "Unix timestamp in seconds",
                  example: 1745792931,
                },
                _nanoseconds: {
                  type: "integer",
                  description: "Nanoseconds part of the timestamp",
                  example: 104000000,
                },
              },
            },
            linkedItems: {
              type: "array",
              nullable: true,
              description: "Items linked to this bug",
              example: null,
            },
          },
        },

        TechTask: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the technical task",
              example: "task_001",
            },
            projectId: {
              type: "string",
              description: "ID of the project this task belongs to",
              example: "proj_abc123",
            },
            type: {
              type: "string",
              description: "Type of the item",
              example: "techTask",
            },
            title: {
              type: "string",
              description: "Title of the technical task",
              example: "set up Firestore indexing for backlog queries",
            },
            description: {
              type: "string",
              description: "Description of the technical task",
              example:
                "Define and deploy necessary composite indexes for filtering/sorting the backlog.",
            },
            linkedStoryId: {
              type: "string",
              nullable: true,
              description: "ID of the story this task is linked to",
              example: null,
            },
            priority: {
              type: "string",
              description: "Priority of the technical task",
              example: "medium",
            },
            reporterId: {
              type: "integer",
              description: "ID of the user who reported the task",
              example: 16,
            },
            assigneeId: {
              type: "integer",
              nullable: true,
              description: "ID of the user assigned to the task",
              example: 16,
            },
            status: {
              type: "string",
              description: "Current status of the technical task",
              example: "todo",
            },
            createdAt: {
              type: "object",
              properties: {
                _seconds: {
                  type: "integer",
                  description: "Unix timestamp in seconds",
                  example: 1745793050,
                },
                _nanoseconds: {
                  type: "integer",
                  description: "Nanoseconds part of the timestamp",
                  example: 570000000,
                },
              },
            },
            updatedAt: {
              type: "object",
              nullable: true,
              properties: {
                _seconds: {
                  type: "integer",
                  description: "Unix timestamp in seconds",
                  example: 1745793061,
                },
                _nanoseconds: {
                  type: "integer",
                  description: "Nanoseconds part of the timestamp",
                  example: 218000000,
                },
              },
            },
            linkedItems: {
              type: "array",
              nullable: true,
              description: "Items linked to this technical task",
              example: null,
            },
          },
        },

        Knowledge: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the knowledge item",
              example: "know_001",
            },
            projectId: {
              type: "string",
              description: "ID of the project this knowledge item belongs to",
              example: "proj_abc123",
            },
            type: {
              type: "string",
              description: "Type of the item",
              example: "knowledge",
            },
            title: {
              type: "string",
              description: "Title of the knowledge item",
              example: "Decision Log: Authentication Flow",
            },
            content: {
              type: "string",
              description: "Content of the knowledge item",
              example:
                "Decided on JWT-based auth with 1-hour expiry. Role included in payload.",
            },
            tags: {
              type: "array",
              nullable: true,
              items: {
                type: "string",
              },
              description: "Tags associated with the knowledge item",
              example: ["auth", "decision"],
            },
            reporterId: {
              type: "integer",
              description: "ID of the user who created the knowledge item",
              example: 16,
            },
            assigneeId: {
              type: "integer",
              nullable: true,
              description: "ID of the user assigned to the knowledge item",
              example: null,
            },
            status: {
              type: "string",
              description: "Current status of the knowledge item",
              example: "active",
            },
            createdAt: {
              type: "object",
              properties: {
                _seconds: {
                  type: "integer",
                  description: "Unix timestamp in seconds",
                  example: 1745793184,
                },
                _nanoseconds: {
                  type: "integer",
                  description: "Nanoseconds part of the timestamp",
                  example: 787000000,
                },
              },
            },
            updatedAt: {
              type: "object",
              nullable: true,
              properties: {
                _seconds: {
                  type: "integer",
                  description: "Unix timestamp in seconds",
                  example: 1745793193,
                },
                _nanoseconds: {
                  type: "integer",
                  description: "Nanoseconds part of the timestamp",
                  example: 405000000,
                },
              },
            },
            linkedItems: {
              type: "array",
              nullable: true,
              description: "Items linked to this knowledge item",
              example: null,
            },
          },
        },
      },
    },
  },
  // --- Path to API files (Essential for swagger-jsdoc) ---
  // Make sure this path correctly points to where your route files with @swagger comments are.
  apis: ["./src/routes/*.ts"],
};

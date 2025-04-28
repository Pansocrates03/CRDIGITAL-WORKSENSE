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
        description: "Operations related to managing projects",
      },
      {
        name: "Project Members",
        description: "Managing members within a specific project",
      },
      {
        name: "Backlog Items",
        description: "Managing backlog items (Epics, Stories, Bugs, etc.)",
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
              example: "proj123",
            },
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
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the project was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the project was last updated",
            },
            ownerId: {
              type: "string",
              description: "ID of the user who owns the project",
              example: "user123",
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
      },
    },
  },
  // --- Path to API files (Essential for swagger-jsdoc) ---
  // Make sure this path correctly points to where your route files with @swagger comments are.
  apis: ["./src/routes/*.ts"],
};

// server.ts / app.ts

// Core Imports
import express, { Request, Response, NextFunction } from "express"; // Added types for Request, Response, NextFunction
import cors from "cors";
import morgan from "morgan";

// Documentation Imports
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// Routes Imports
import sqlRoutes from "./routes/auth.routes.js"; // Adjust paths if needed
import aiRoutes from "./routes/ai.routes.js";
import adminRoutes from "./routes/admin.routes.js";
// Assuming projectBaseRoutes might handle GET /projects, POST /projects
import projectBaseRoutes from "./routes/project.routes.js";
// Assuming sprintRoutes handles routes starting with /{projectId}/sprints...
import sprintRoutes from "./routes/sprints.routes.js";
// Task router, expected to be configured with mergeParams and relative paths
import taskRoutes from "./routes/task.routes.js";

// Documentation Imports
import { swaggerOptions } from "../swagger/swaggerSetup.js"; // Adjust path

// Config
const PORT = process.env.PORT || 5050;
const API_PREFIX = process.env.API_PREFIX || "/api/v1"; // Default API prefix
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// APP Initialization
const app = express();

// Core Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(morgan("dev")); // HTTP request logger middleware for node.js
app.use(express.json()); // Middleware to parse JSON bodies

// --- API Routes Mounting ---

// Mount non-project specific routes directly under the API prefix
app.use(API_PREFIX, sqlRoutes); // e.g., /api/v1/auth/...
app.use(API_PREFIX, aiRoutes); // e.g., /api/v1/ai/...
app.use(`${API_PREFIX}/admin`, adminRoutes); // e.g., /api/v1/admin/...

// --- Mount Project-related Routes Logically ---

// Mount base project routes (e.g., for listing all projects, creating a project)
// Handles routes like GET /api/v1/projects, POST /api/v1/projects
app.use(`${API_PREFIX}/`, projectBaseRoutes);

// Mount sprint routes.
// Assumes paths inside sprintRoutes START WITH /{projectId}/...
// Example: A route '/{projectId}/sprints' inside sprintRoutes will match GET /api/v1/projects/{projectId}/sprints
app.use(`${API_PREFIX}/`, sprintRoutes);

// Mount task routes UNDER the /{projectId} path.
// This is CRUCIAL for taskRoutes (using mergeParams: true) to inherit the {projectId} parameter.
// Example: A route '/sprints/:sprintId/tasks' inside taskRoutes will match POST /api/v1/{projectId}/sprints/:sprintId/tasks
app.use(`${API_PREFIX}/:projectId`, taskRoutes);

// API Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Root / Health Check Route
app.get("/", (req: Request, res: Response) => {
  // Added types
  res.send("API is running...");
});

// Centralized Error Handler Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Added types
  console.error("Error Handler:", err); // Log the full error object for debugging
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    message: message,
    // Optionally include stack trace only in development environment
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start Server
app.listen(PORT, () =>
  console.log(
    `Server running at http://localhost:${PORT}, API Prefix: ${API_PREFIX}`
  )
);

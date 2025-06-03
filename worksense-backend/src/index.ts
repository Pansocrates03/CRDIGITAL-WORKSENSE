// Core Imports
import express from "express"; // Runs the server
import cors from "cors"; // Allows cross-origin requests
import morgan from "morgan"; // Logs requests to the console

// Documentation Imports
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// Routes Imports
import sqlRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import project_Routes from "./routes/project.routes.js";
import geminiRoutes from "./routes/gemini.routes.js";
import forYouRoutes from "./routes/forYou.routes.js";
import speechRoutes from "./routes/speech.routes.js";
import cacheRoutes from "./routes/cache.routes.js";
import meetingsRoutes, {
  globalMeetingRoutes,
} from "./routes/meetings.routes.js";
import forYouGamificationRoutes from "./routes/forYouGamification.routes.js";

// Documenattion Imports
import { swaggerOptions } from "../swagger/swaggerSetup.js"; // Swagger options

// Import cleanup function
import { cleanupSubscriptions } from "./controllers/gemini.controller.js";

// Obtain URL
const PORT = process.env.PORT || 5050;
const HOST = process.env.HOST || "localhost";
const URL: string = process.env.URL || `http://${HOST}:${PORT}`;
const API_PREFIX = process.env.API_PREFIX || "/api/v1"; // API prefix

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// APP USAGE
const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" })); // Aumentar el límite de tamaño del cuerpo a 10 MB para el audio
app.use(API_PREFIX, sqlRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/projects`, project_Routes);
app.use(`${API_PREFIX}/gemini`, geminiRoutes);
app.use(`${API_PREFIX}/for-you`, forYouRoutes);
app.use(`${API_PREFIX}/speech`, speechRoutes);
app.use(`${API_PREFIX}/cache`, cacheRoutes);
app.use(`${API_PREFIX}/projects`, meetingsRoutes); // Project-specific meeting routes
app.use(`${API_PREFIX}/meetings`, globalMeetingRoutes); // Global meeting routes
app.use(`${API_PREFIX}/for-you-gamification`, forYouGamificationRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get("/", (req: any, res: any) => {
  res.send("API is running...");
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Start Server
const server = app.listen(PORT, () =>
  console.log(
    `Server running at http://localhost:${PORT}, API Prefix: ${API_PREFIX}`
  )
);

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  cleanupSubscriptions();
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  cleanupSubscriptions();
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

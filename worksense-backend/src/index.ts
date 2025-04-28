// Core Imports
import express from "express"; // Runs the server
import cors from "cors"; // Allows cross-origin requests
import morgan from "morgan"; // Logs requests to the console

// Documentation Imports
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// Routes Imports
import sqlRoutes from "./routes/auth.routes.js";
import membersRoutes from "./routes/members.routes.js";
import projectRoutes from "./routes/projects.routes.js";
import itemsRoutes from "./routes/items.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import project_Routes from "./routes/projectRoutes.js";
// Documenattion Imports
import { swaggerOptions } from "../swagger/swaggerSetup.js"; // Swagger options

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
app.use(express.json());
app.use(API_PREFIX, sqlRoutes);
app.use(API_PREFIX, projectRoutes);
app.use(API_PREFIX, membersRoutes);
app.use(API_PREFIX, itemsRoutes);
app.use(API_PREFIX, aiRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}`, project_Routes);
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

app.listen(PORT, () => console.log(URL));

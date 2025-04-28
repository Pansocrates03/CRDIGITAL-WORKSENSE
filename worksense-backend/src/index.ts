// Core
import express from "express";
import cors from "cors";
import morgan from "morgan";

// Swagger
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { swaggerOptions } from "../swagger/swaggerSetup.js";

// Routes
import sqlRoutes from "./routes/auth.routes.js";
import membersRoutes from "./routes/members.routes.js";
import projectRoutes from "./routes/projects.routes.js";
import itemsRoutes from "./routes/items.routes.js";
import aiServiceRoutes from "./routes/aiService.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import projectRoutesV2 from "./routes/projectRoutes.js";

const PORT        = process.env.PORT || 5050;
const HOST        = process.env.HOST || "localhost";
const URL: string = process.env.URL  || `http://${HOST}:${PORT}`;
const API_PREFIX  = process.env.API_PREFIX || "/api/v1";

const swaggerDocs = swaggerJsdoc(swaggerOptions);

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Mount routes
app.use(sqlRoutes);
app.use(projectRoutes);
app.use(projectRoutesV2);
app.use(membersRoutes);
app.use(itemsRoutes);
app.use(aiServiceRoutes);
app.use("/api", aiRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

// Swagger & health-check
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get("/", (_req, res) => res.send("API is running..."));

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

app.listen(PORT, () => console.log(`Server listening on ${URL}`));

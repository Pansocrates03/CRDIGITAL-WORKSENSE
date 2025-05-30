// Core imports
import express from "express"
import cors from "cors"; // Allows cross-origin requests
import morgan from "morgan"; // Logs requests to the console

// Import routes
import AuthRoutes from "./routes/auth.routes.js"
import BugRoutes from "./routes/bugs.routes.js"
import MemberRoutes from "./routes/members.routes.js"
import EpicRoutes from "./routes/epics.routes.js"
import ProjectRoutes from "./routes/projects.routes.js"
import RoleRoutes from "./routes/roles.routes.js"
import SprintRoutes from "./routes/sprints.routes.js"
import StoryRoutes from "./routes/stories.routes.js"
import TicketRoutes from "./routes/tickets.routes.js"
import UserRoutes from "./routes/users.routes.js"
import GeminiRoutes from "./routes/gemini.routes.js"
import SpeechRoutes from "./routes/speech.routes.js";

// Obtain URL
const PORT = process.env.PORT || 5050;
const HOST = process.env.HOST || "localhost";
const URL: string = process.env.URL || `http://${HOST}:${PORT}`;
const API_PREFIX = process.env.API_PREFIX || "/api/v2"; // API prefix

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

// Routing
app.use(`${API_PREFIX}/`, AuthRoutes)
app.use(`${API_PREFIX}/`, BugRoutes)
app.use(`${API_PREFIX}/`, MemberRoutes)
app.use(`${API_PREFIX}/`, EpicRoutes)
app.use(`${API_PREFIX}/`, ProjectRoutes)
app.use(`${API_PREFIX}/`, RoleRoutes)
app.use(`${API_PREFIX}/`, SprintRoutes)
app.use(`${API_PREFIX}/`, StoryRoutes)
app.use(`${API_PREFIX}/`, TicketRoutes)
app.use(`${API_PREFIX}/`, UserRoutes)
app.use(`${API_PREFIX}/`, GeminiRoutes)
app.use(`${API_PREFIX}/`, SpeechRoutes)

// Start Server
const server = app.listen(PORT, () =>
    console.log(
      `Server running at http://localhost:${PORT}, API Prefix: ${API_PREFIX}`
    )
  );
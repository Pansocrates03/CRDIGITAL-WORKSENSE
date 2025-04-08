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
import epicRoutes from "./routes/epics.routes.js"
import itemsRoutes from "./routes/items.routes.js";

// Documenattion Imports
import { swaggerOptions } from "../swagger/swaggerSetup.js"; // Swagger options

// Obtain URL
const PORT = process.env.PORT || 5050;
const HOST = process.env.HOST || "localhost";
const URL: string = process.env.URL || `http://${HOST}:${PORT}`;

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// APP USAGE
const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(sqlRoutes);
app.use(projectRoutes);
app.use(membersRoutes);
app.use(epicRoutes);
app.use(itemsRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/', (req: any, res: any) => {
    res.send('API is running...');
});

app.listen(PORT, () => console.log(URL));

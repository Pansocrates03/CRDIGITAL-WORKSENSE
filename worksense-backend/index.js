// Core Imports
import express from "express"; // Runs the server
import cors from "cors"; // Allows cross-origin requests
import morgan from "morgan"; // Logs requests to the console

// Documentation Imports
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Routes Imports
import sqlRoutes from "./src/routes/sql.routes.js";
import firebaseRoutes from "./src/routes/firebase.routes.js"

const app = express();

const PORT = process.env.PORT || 5050;
const HOST = process.env.HOST || 'localhost';
const URL = process.env.URL || `http://${HOST}:${PORT}`;


  

import { swaggerOptions } from "./swagger/swaggerSetup.js";
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Ruta de la documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use(cors());
app.use(morgan());
app.use(express.json());

app.use(sqlRoutes);
app.use(firebaseRoutes);

app.listen(PORT, console.log(URL));
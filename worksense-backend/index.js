import express from "express";
import cors from "cors";
import morgan from "morgan";

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import sqlRoutes from "./SQL/routes/sql.routes.js"
import firebaseRoutes from "./Firebase/routes/firebase.routes.js"
import geminiRoutes from "./Gemini/routes/gemini.routes.js"

const app = express();

// Documentación
const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API de Usuarios',
        version: '1.0.0',
        description: 'Documentación de la API para autenticación con JWT',
      },
      servers: [
        {
          url: 'http://localhost:5050', // Cambia la URL según tu entorno
        },
      ],
    },
    apis: ['./SQL/routes/*.js'], // Rutas donde Swagger buscará documentación
  };
  
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Ruta de la documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use(cors());
app.use(morgan());
app.use(express.json());

app.use(sqlRoutes);
app.use(firebaseRoutes);
app.use("/api", geminiRoutes);

app.listen(5050, console.log("http://localhost:5050"));
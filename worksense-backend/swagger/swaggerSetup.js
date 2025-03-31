const PORT = process.env.PORT || 5050;
const HOST = process.env.HOST || 'localhost';
const URL = process.env.URL || `http://${HOST}:${PORT}`;

// Documentación
export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
        title: 'API de Autenticación con JWT',
        version: '1.0.0',
        description: 'Documentación de la API para autenticación con JWT',
        },
        servers: [
        {
            url: URL, // Cambia la URL según tu entorno
        },
        ],
    },
    apis: ['./src/routes/*.js'], // Rutas donde Swagger buscará documentación
};
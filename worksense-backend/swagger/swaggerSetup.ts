const PORT = process.env.PORT || 5050;
const HOST = process.env.HOST || 'localhost';
const URL = process.env.URL || `http://${HOST}:${PORT}`;

// Documentación
export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
        title: 'Worksense API',
        version: '1.0.0',
        description: 'Documentación de la API de Worksense',
        },
        servers: [
        {
            url: URL, // Cambia la URL según tu entorno
        },
        ],
        tags: [
            {
                name: 'AI Module',
                description: 'Operaciones relacionadas con la autenticación',
            },
            {
                name: 'Authentication Module',
                description: 'Operaciones relacionadas con la autenticación',
            },
            {
                name: 'Item Management',
                description: 'Operaciones relacionadas con la autenticación',
            },
            {
                name: 'Member Management',
                description: 'Operaciones relacionadas con la gestión de miembros dentro de un proyecto',
            },
            {
                name: 'Project Management',
                description: 'Operaciones relacionadas con la gestión general de proyectos',
            },
            {
                name: 'Role Management',
                description: 'Operaciones relacionadas con el seguimiento de errores',
            },
            {
                name: 'Bug Tracking',
                description: 'Operaciones relacionadas con el seguimiento de errores',
            },
            
            
        ],
    },
    apis: ['./src/routes/*.ts'], // Rutas donde Swagger buscará documentación
};
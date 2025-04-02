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
                name: 'Authentication',
                description: 'Operaciones relacionadas con la autenticación',
            },
            {
                name: 'Project Management',
                description: 'Operaciones relacionadas con la gestión general de proyectos',
            },
            {
                name: 'Bug Tracking',
                description: 'Operaciones relacionadas con el seguimiento de errores',
            },
            {
                name: 'Member Management',
                description: 'Operaciones relacionadas con la gestión de miembros dentro de un proyecto',
            },
            
        ],
        paths: {
            '/users': {
                get: {
                    tags: ['Authentication'],
                    summary: 'Obtiene un usuario por su ID',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'ID del usuario',
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                },
                post: {
                    tags: ['Authentication'],
                    summary: 'Crea un nuevo usuario con los datos proporcionados',
                    responses: {
                        200: {
                            description: 'Usuario creado exitosamente',
                        },
                        400: {
                            description: 'El usuario ya existe',
                        },
                    },
                },
                put: {
                    tags: ['Authentication'],
                    summary: 'Actualiza un usuario por su ID',
                    parameters: 
                        {
                            name: 'id',
                        },
                },
                delete: {
                    tags: ['Authentication'],
                    summary: 'Elimina un usuario por su ID',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'ID del usuario',
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                }

            },
            '/login': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Permite a los usuarios iniciar sesión con sus credenciales y devuelve un token de acceso',
                    responses: {
                        200: {
                            description: 'Message, token',
                        },
                        400: {
                            description: 'Credenciales inválidas',
                        },
                    },
                }
            },
            '/projects': {
                get: {
                    tags: ['Project Management'],
                    summary: 'Obtiene todos los proyectos',
                    responses: {
                        200: {
                            description: 'Lista de proyectos',
                        },
                    },
                },
                post: {
                    tags: ['Project Management'],
                    summary: 'Crea un nuevo proyecto',
                    responses: {
                        201: {
                            description: 'Proyecto creado exitosamente',
                        },
                    },
                },
                put: {
                    tags: ['Project Management'],
                    summary: 'Actualiza un proyecto existente',
                    responses: {
                        200: {
                            description: 'Proyecto actualizado exitosamente',
                        },
                    },
                },
                delete: {
                    tags: ['Project Management'],
                    summary: 'Elimina un proyecto por su ID',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'ID del proyecto',
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Proyecto eliminado exitosamente',
                        },
                    },
                },
            },
            '/projects/{id}/bug/:id': {
                get: {
                    tags: ['Bug Tracking'],
                    summary: 'Obtiene un error por su ID dentro de un proyecto',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'ID del proyecto',
                            schema: {
                                type: 'string',
                            },
                        },
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'ID del error',
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Error encontrado exitosamente',
                        },
                    },
                },
                post: {
                    tags: ['Bug Tracking'],
                    summary: 'Crea un nuevo error dentro de un proyecto',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'ID del proyecto',
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    responses: {
                        201: {
                            description: 'Error creado exitosamente',
                        },
                    },
                },
                put: {
                    tags: ['Bug Tracking'],
                    summary: 'Actualiza un error existente dentro de un proyecto',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'ID del proyecto',
                            schema: {
                                type: 'string',
                            },
                        },
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'ID del error',
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Error actualizado exitosamente',
                        },
                    },
                },
                delete: {
                    tags: ['Bug Tracking'],
                    summary: 'Elimina un error por su ID dentro de un proyecto',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'ID del proyecto',
                            schema: {
                                type: 'string',
                            },
                        },
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'ID del error',
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Error eliminado exitosamente',
                        },
                    },
                },
            },
            '/projects/{id}/members': {
                get: {
                    tags: ['Member Management'],
                    summary: 'Obtiene todos los miembros de un proyecto',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'ID del proyecto',
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Lista de miembros del proyecto',
                        },
                    },
                },
                post: {
                    tags: ['Member Management'],
                    summary: 'Agrega un nuevo miembro a un proyecto',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'ID del proyecto',
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    responses: {
                        201: {
                            description: 'Miembro agregado exitosamente',
                        },
                    },
                },
            }
        }
    },
    apis: [],
    //apis: ['./src/routes/*.ts'], // Rutas donde Swagger buscará documentación
};
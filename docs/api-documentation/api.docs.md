# Rest API Documentation
> Worksense API permite conectar todos los servicios en línea de Worksense APP de forma segura. 

## ⛏️ Tecnologías Utilizadas
- **NodeJS:** Como entorno de ejecución de javascript. 
- **Express.js:** Backend framework que corre el servidor.
- **Typescript:** Lenguaje de programación usado en el código fuente.
- **Cors:** Middleware que permite el uso de Cors dentro de express.
- **Morgan:** Middleware para mostrar los logs en la consola.
- **Swagger:** Permite documentar el API en un entorno para desarrolladores.
- **Bycrypt:** Facilita el uso de criptografía compleja para la verificación de los usuarios.

## Url Base
```
http://server.com/api/v1
```

## 👮‍♂️ Authentication
Se hizo uso de *Json Web Tokens* para autenticar a los usuarios.

## Headers
Todas las rutas privadas deberán tener el siguiente Header:
```json
{
    auth-token: secretJWTnjkdsnbfsdhoi...
}
```

## Endpoints


| URL | Method |
| ------ | ------ |
| fndjks | fndsjk |
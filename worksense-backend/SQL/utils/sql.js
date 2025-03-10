import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();

// Verificar si todas las variables de entorno necesarias están definidas
const isSqlConfigured =
  process.env.DB_USER &&
  process.env.DB_PWD &&
  process.env.DB_NAME &&
  process.env.DB_SERVER;

const sqlConfig = isSqlConfigured
  ? {
      user: process.env.DB_USER,
      password: process.env.DB_PWD,
      database: process.env.DB_NAME,
      server: process.env.DB_SERVER,
      port: 51633,
      options: {
        encrypt: true, // for azure
        trustServerCertificate: true, // change to true for local dev / self-signed certs
      },
    }
  : null;

const sqlConnect = async () => {
  if (!sqlConfig) {
    console.warn(
      "⚠️ Configuración SQL no encontrada. Funcionando en modo simulado."
    );
    return null;
  }

  try {
    return await sql.connect(sqlConfig);
  } catch (error) {
    console.error("❌ Error al conectar con SQL:", error);
    return null;
  }
};

export { sqlConnect, sql };

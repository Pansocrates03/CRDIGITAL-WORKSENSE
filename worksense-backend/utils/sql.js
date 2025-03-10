import sql from "mssql";
import dotenv from "dotenv"
dotenv.config();

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  port: 51633,
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

const sqlConnect = async () => {
    return await sql.connect(sqlConfig);
};

export { sqlConnect, sql };
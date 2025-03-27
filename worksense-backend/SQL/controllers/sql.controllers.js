import { sqlConnect, sql } from "../utils/sql.js";

export const getText = async (req, res) => {
  try {
    const pool = await sqlConnect();

    // Si no hay conexión SQL, devolver datos simulados
    if (!pool) {
      console.log("⚠️ Usando datos simulados para SQL");
      return res.json([{ text: "Hello from SQL Simulation!" }]);
    }

    const data = await pool.request().query("select * from test");
    res.json(data.recordset);
  } catch (error) {
    console.error("❌ Error en getText:", error);
    res.status(500).json([{ text: "Error al obtener datos de SQL" }]);
  }
};

export const getProjects = async (req, res) => {
  try {
    const pool = await sqlConnect();

    // Si no hay conexión SQL, devolver datos simulados
    if (!pool) {
      return res.status(500).json({ 
        error: "No se pudo conectar a la base de datos", 
        message: "Verifique la conexión con el servidor SQL"
      });
    }

    const data = await pool.request().query("select * from projects");
    res.json(data.recordset); 

  } catch (error) {
    console.error("❌ Error en getProjects:", error);
    res.status(500).json([{ text: "Error al obtener datos de SQL" }]);
  }
};

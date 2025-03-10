import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import dotenv from "dotenv";
dotenv.config();

let db;

try {
  // Verificar si el archivo de credenciales existe
  if (existsSync("./Firebase/utils/firebaseServiceAccount.json")) {
    const serviceAccount = JSON.parse(
      readFileSync("./Firebase/utils/firebaseServiceAccount.json", "utf-8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    db = admin.firestore();
    console.log("✅ Conexión a Firebase establecida correctamente");
  } else {
    console.warn(
      "⚠️ Archivo de credenciales de Firebase no encontrado. Funcionando en modo simulado."
    );
    // Crear un objeto simulado para db
    db = {
      collection: (name) => ({
        get: async () => ({ docs: [] }),
        add: async (data) => ({ id: "mock-id-" + Date.now() }),
      }),
    };
  }
} catch (error) {
  console.error("❌ Error al inicializar Firebase:", error);
  // Crear un objeto simulado para db en caso de error
  db = {
    collection: (name) => ({
      get: async () => ({ docs: [] }),
      add: async (data) => ({ id: "mock-id-" + Date.now() }),
    }),
  };
}

export { db };

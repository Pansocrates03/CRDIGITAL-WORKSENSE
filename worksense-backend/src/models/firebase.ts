import admin from "firebase-admin";
import { Firestore } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "fs";
import dotenv from "dotenv";
dotenv.config();

let db: Firestore;

const firebaseConfigPath = "./config/firebaseServiceAccount.json";

try {
  if (existsSync(firebaseConfigPath)) {
    const serviceAccount = JSON.parse(
      readFileSync(firebaseConfigPath, "utf-8")
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
    db = createMockDB();
  }
} catch (error) {
  console.error("❌ Error al inicializar Firebase:", error);
  db = createMockDB();
}

function createMockDB(): Firestore {
  return {
    collection: (name: string) => ({
      get: async () => ({ docs: [] }),
      add: async (data: any) => ({ id: "mock-id-" + Date.now() }),
    }),
    // podrías extender esto para cubrir más métodos si lo necesitas
  } as unknown as Firestore; // forzamos el tipo
}

export { db };

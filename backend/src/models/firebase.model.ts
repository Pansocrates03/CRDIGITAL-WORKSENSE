import admin from "firebase-admin";
import { Firestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
dotenv.config();

let db: Firestore;

try {
  // Procesamiento de la clave privada mejorado
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  // Validar existencia de variables de entorno esenciales
  if (!process.env.FIREBASE_PROJECT_ID || !privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error("Variables de entorno de Firebase no configuradas correctamente");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    }),
  });

  db = admin.firestore();
  console.log("✅ Conexión a Firebase establecida correctamente");
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
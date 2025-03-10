const admin = require("firebase-admin");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Cargar credenciales de Firebase
const serviceAccount = require("./firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Rutas de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando con Firebase");
});

app.get("/test", async (req, res) => {
  const snapshot = await db.collection("testCollection").get();
  const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(docs);
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

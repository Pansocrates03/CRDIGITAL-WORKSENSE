// Express JS

// Firebase Admin
const admin = require("firebase-admin");

// Cargar credenciales de Firebase
const serviceAccount = require("./firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
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

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
})
import { db } from "../utils/firebase.js";

// Obtener todos los usuarios de Firebase
export const getUsuarios = async (req, res) => {
  try {
    const snapshot = await db.collection("usuarios").get();
    const usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(usuarios);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

// Agregar un usuario a Firebase
export const addUsuario = async (req, res) => {
  try {
    const { nombre, apellido, correo } = req.body;

    if (!nombre || !apellido || !correo) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const newUser = await db.collection("usuarios").add({ nombre, apellido, correo });
    res.json({ id: newUser.id, nombre, apellido, correo });
  } catch (error) {
    console.error("Error agregando usuario:", error);
    res.status(500).json({ error: "Error al agregar el usuario" });
  }
};

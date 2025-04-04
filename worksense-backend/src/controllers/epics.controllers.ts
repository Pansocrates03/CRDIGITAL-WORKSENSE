import { Request, Response } from "express";
import { db } from "../models/firebase.js"; // Asegúrate de que la importación esté configurada correctamente

// Crear una épica con una subcolección "stories"
export const addEpic = async (req: Request, res: Response) => {
    try {
        const projectId = req.params.id // Obtener ID del proyecto de la URL
        const { title, description } = req.body; // Obtener titulo y descripcion del body con formato esperado

        // Validar que se ingresa titulo y descripcion
        if (!title || !description) {
            res.status(400).json({ message: "Title and description are required" });
        }

        // Paso 1: Obtener la referencia al proyecto
        const projectRef = db.collection("projects").doc(projectId);
        const projectDoc = await projectRef.get();

        // Validar que el project actual exista, en caso de no tirar este error
        if(!projectDoc.exists) {
            res.status(404).json({ message: `Project with ID ${projectId} not found`})
        }

        // Paso 2: Crear la épica dentro de la colección "epics" del proyecto
        const epicRef = await projectRef.collection("epics").add({
            title: title,
            description: description,
        });

        // Paso 3: Crear la subcolección "stories" dentro de la épica
        const storiesRef = epicRef.collection("stories");

        // Crear una historia de ejemplo dentro de la colección "stories"
        const newStory = {
            title: "Story Title Example",
            description: "Story Description Example",
            status: "not-started",
            priority: "medium",
            size: 3, // Puedes modificar esto según tu lógica
        };

        // Agregar una historia de ejemplo en la subcoleccion "stories"
        const storyRef = await storiesRef.add(newStory);

        // Paso 4: Crear la subcoleccion "comments" dentro de la subcoleccion "stories"
        const commentsRef = storyRef.collection("comments");

        // Crear un comentario de ejemplo para la subcoleccion "comments"
        const newComment = {
            text: "This is the first comment to the story.",
            author: "memberID",
            timestamp: new Date().toISOString(),
        };

        // Agregar el comentario a la subcoleccion "comments" de la historia
        await commentsRef.add(newComment);

        // Responder con exito y mostar el ID de la epica y la historia creada
        res.status(201).json({ 
            message: "Epic, story, and comment added successfully",
            epicId: epicRef.id,
            storyId: storiesRef.id
         });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "An error occured while adding the pic, story and comment" });
    }
};
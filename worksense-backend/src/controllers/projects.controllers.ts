import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import admin from "firebase-admin"
const { FieldValue } = admin.firestore;

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  const useMockData = false;

  try {
    if (useMockData) {
      const mockProjects = [
        {
          id: "proj1",
          name: "Test Project Alpha",
          description:
            "A temporary hardcoded project for development purposes.",
          bugs: [
            {
              id: "bug1",
              title: "Login issue",
              status: "open",
              priority: "high",
            },
          ],
          epics: [
            {
              id: "epic1",
              title: "Authentication Module",
              description: "All stories related to user auth.",
              stories: [
                {
                  id: "story1",
                  title: "Implement Login",
                  description:
                    "User should be able to log in with email and password.",
                  comments: [
                    { id: "c1", text: "Make sure to validate input" },
                    { id: "c2", text: "Check Firebase auth rules" },
                  ],
                  tasks: [
                    { id: "t1", title: "Create login UI", status: "done" },
                    {
                      id: "t2",
                      title: "Connect to Firebase",
                      status: "in progress",
                    },
                  ],
                },
              ],
            },
          ],
          members: [
            { id: "m1", name: "Alice", role: "Frontend Developer" },
            { id: "m2", name: "Bob", role: "Backend Developer" },
          ],
        },
      ];

      res.json(mockProjects);
      return;
    }

    // ✅ Lectura real desde Firebase
    const projects = await db.collection("projects").get();
    const list: any[] = [];

    for (const doc of projects.docs) {
      const projectId = doc.id;
      const data = doc.data();

      const bugsSnapshot = await db
        .collection("projects")
        .doc(projectId)
        .collection("bugs")
        .get();
      const epicsSnapshot = await db
        .collection("projects")
        .doc(projectId)
        .collection("epics")
        .get();
      const membersSnapshot = await db
        .collection("projects")
        .doc(projectId)
        .collection("members")
        .get();

      const epics = epicsSnapshot.empty
        ? []
        : await Promise.all(
            epicsSnapshot.docs.map(async (epicDoc) => {
              const epicData = epicDoc.data();
              const epicId = epicDoc.id;

              const storiesSnapshot = await db
                .collection("projects")
                .doc(projectId)
                .collection("epics")
                .doc(epicId)
                .collection("stories")
                .get();

              const stories = storiesSnapshot.empty
                ? []
                : await Promise.all(
                    storiesSnapshot.docs.map(async (storyDoc) => {
                      const storyData = storyDoc.data();
                      const storyId = storyDoc.id;

                      const commentsSnapshot = await db
                        .collection("projects")
                        .doc(projectId)
                        .collection("epics")
                        .doc(epicId)
                        .collection("stories")
                        .doc(storyId)
                        .collection("comments")
                        .get();

                      const tasksSnapshot = await db
                        .collection("projects")
                        .doc(projectId)
                        .collection("epics")
                        .doc(epicId)
                        .collection("stories")
                        .doc(storyId)
                        .collection("tasks")
                        .get();

                      return {
                        id: storyId,
                        ...storyData,
                        comments: commentsSnapshot.empty
                          ? []
                          : commentsSnapshot.docs.map((c) => ({
                              id: c.id,
                              ...c.data(),
                            })),
                        tasks: tasksSnapshot.empty
                          ? []
                          : tasksSnapshot.docs.map((t) => ({
                              id: t.id,
                              ...t.data(),
                            })),
                      };
                    })
                  );

              return {
                id: epicId,
                ...epicData,
                stories,
              };
            })
          );

      list.push({
        id: projectId,
        name: data.name || "",
        description: data.description || "",
        bugs: bugsSnapshot.empty
          ? []
          : bugsSnapshot.docs.map((b) => ({ id: b.id, ...b.data() })),
        epics,
        members: membersSnapshot.empty
          ? []
          : membersSnapshot.docs.map((m) => ({ id: m.id, ...m.data() })),
      });
    }

    res.json(list);
  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    res.status(500).json({ error: "Error al obtener proyectos" });
  }
};

// Obtener un proyecto por ID
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.id;
    const projectDoc = await db.collection("projects").doc(projectId).get();

    if (!projectDoc.exists) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const data = projectDoc.data();

    // Get items collection
    const itemsSnapshot = await db
      .collection("projects")
      .doc(projectId)
      .collection("items")
      .get();

    // Get members collection
    const membersSnapshot = await db
      .collection("projects")
      .doc(projectId)
      .collection("members")
      .get();

    // Process items and their sub-items
    const items = itemsSnapshot.empty
      ? []
      : await Promise.all(
          itemsSnapshot.docs.map(async (itemDoc) => {
            const itemData = itemDoc.data();
            const itemId = itemDoc.id;

            // Get sub-items if they exist
            const subItemsSnapshot = await db
              .collection("projects")
              .doc(projectId)
              .collection("items")
              .doc(itemId)
              .collection("items")
              .get();

            // Get comments if they exist
            const commentsSnapshot = await db
              .collection("projects")
              .doc(projectId)
              .collection("items")
              .doc(itemId)
              .collection("comments")
              .get();

            return {
              id: itemId,
              ...itemData,
              items: subItemsSnapshot.empty
                ? []
                : subItemsSnapshot.docs.map(si => ({
                    id: si.id,
                    ...si.data()
                  })),
              comments: commentsSnapshot.empty
                ? []
                : commentsSnapshot.docs.map(c => ({
                    id: c.id,
                    ...c.data()
                  }))
            };
          })
        );

    const project = {
      id: projectId,
      name: data?.name || "",
      description: data?.description || "",
      items,
      members: membersSnapshot.empty
        ? []
        : membersSnapshot.docs.map((m) => ({ id: m.id, ...m.data() }))
    };

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Error fetching project" });
  }
};

// Crear un nuevo proyecto con estructura inicial
export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      res.status(400).json({ error: "Se requieren 'name' y 'description'" });
      return;
    }

    // Paso 1: Crear un documento principal en la colección "projects"
    const projectRef = await db.collection("projects").add({
      name,
      description,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      status: "active"
    });

    const projectID = projectRef.id;

    // Subcolecciones a crear
    const subcollections = ['items', 'members', 'roles'];

    // Paso 2: Crear documentos placeholder en cada subcolección
    const creationPromises = subcollections.map(subcollection => {
      const subRef = db.collection("projects").doc(projectID).collection(subcollection);
      return subRef.doc("emptyDoc").set({ placeholder: "empty" });
    });

    await Promise.all(creationPromises);

    // Respuesta
    res.status(201).json({
      id: projectID,
      name,
      description,
      message: "Proyecto creado con subcolecciones iniciales",
    });
  } catch (error) {
    console.error("Error al crear el proyecto:", error);
    res.status(500).json({ error: "Error al crear el proyecto" });
  }
};


  // // Paso 3: Crear subcolección "roles" dentro del documento del proyecto
    // // Aquí creamos la subcolección "roles" agregando un campo vacío
    // const epicsRef = db
    //   .collection("projects")
    //   .doc(projectID)
    //   .collection("epics");
    // await epicsRef.doc("emptyDoc").set({
    //   placeholder: "empty", // Campo vacío solo para crear la subcolección
    // });

    // // Paso 4: Crear subcolección "stories" dentro de un epic
    // const storiesRef = db
    //   .collection("projects")
    //   .doc(projectID)
    //   .collection("epics")
    //   .doc("epicID")
    //   .collection("stories");
    // await storiesRef.doc("emptyDoc").set({
    //   placeholder: "empty", // Campo vacío solo para crear la subcolección
    // });

    // // Paso 5: Crear subcolección "comments" dentro de una historia
    // const commentsRef = db
    //   .collection("projects")
    //   .doc(projectID)
    //   .collection("epics")
    //   .doc("epicID")
    //   .collection("stories")
    //   .doc("storyID")
    //   .collection("comments");
    // await commentsRef.doc("emptyDoc").set({
    //   placeholder: "empty", // Campo vacío solo para crear la subcolección
    // });

    // // Paso 6: Crear subcolección "tasks" dentro de una historia
    // const tasksRef = db
    //   .collection("projects")
    //   .doc(projectID)
    //   .collection("epics")
    //   .doc("epicID")
    //   .collection("stories")
    //   .doc("storyID")
    //   .collection("tasks");
    // await tasksRef.doc("emptyDoc").set({
    //   placeholder: "empty", // Campo vacío solo para crear la subcolección
    // });

    // // Paso 7: Crear subcolección "members" dentro del proyecto
    // const membersRef = db
    //   .collection("projects")
    //   .doc(projectID)
    //   .collection("members");
    // await membersRef.doc("emptyDoc").set({
    //   placeholder: "empty", // Campo vacío solo para crear la subcolección
    // });
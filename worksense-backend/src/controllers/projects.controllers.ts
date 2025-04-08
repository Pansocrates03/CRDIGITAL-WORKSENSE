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


// Crear un proyecto con usuario actual y rol de admin
export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const user = req.user;

    if (!name || !description) {
      return res.status(400).json({ error: "Se requieren 'name' y 'description'" });
    }

    if (!user?.userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // Paso 1: Crear el documento del proyecto
    const projectRef = await db.collection("projects").add({
      name,
      description,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      status: "active"
    });

    const projectID = projectRef.id;

    // Paso 2: Crear placeholder en items
    const itemsRef = projectRef.collection("items");
    const itemsPromise = itemsRef.doc("emptyDoc").set({ placeholder: "empty" });

    // Paso 3: Crear rol 'admin' (con ID random)
    const rolesRef = projectRef.collection("roles");
    const adminRoleDocRef = rolesRef.doc(); // ID aleatorio
    const adminRoleCreate = adminRoleDocRef.set({
      name: "admin",
      permissions: {
        canAssign: true,
        canComment: true,
        canDelete: true,
        canEdit: true,
        canView: true,
      },
    });

    // Paso 4: Esperar a que el rol se cree
    await adminRoleCreate;

    // Paso 5: Buscar rol 'admin' por nombre (como referencia)
    const adminRoleQuery = await rolesRef.where("name", "==", "admin").limit(1).get();

    if (adminRoleQuery.empty) {
      return res.status(404).json({ error: "No se encontró el rol 'admin'" });
    }

    const adminRoleRef = adminRoleQuery.docs[0].ref;

    // Paso 6: Agregar al usuario como miembro con referencia al rol 'admin'
    const membersRef = projectRef.collection("members");
    const memberDocRef = membersRef.doc();

    const memberPromise = memberDocRef.set({
      userId: user.userId,
      projectId: projectID,
      role: adminRoleRef, // Referencia al rol
    });

    // Paso 7: Esperar las tareas pendientes
    await Promise.all([itemsPromise, memberPromise]);

    // Paso 8: Responder
    return res.status(201).json({
      id: projectID,
      name,
      description,
      message: "Proyecto creado exitosamente con usuario asignado como admin",
    });

  } catch (error) {
    console.error("Error al crear el proyecto:", error);
    return res.status(500).json({ error: "Error interno al crear el proyecto" });
  }
};

import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import { sqlConnect, sql } from "../models/sqlModel.js";

// Obtener todos los miembros de un proyecto
export const getProjectMembers = async (req: Request, res: Response) => {
  const projectId = req.params.ProjectId;
  if (!projectId) return res.status(400).send("Project ID is required");

  try {
    // Get the project document
    const project = await db.collection("projects").doc(req.params.ProjectId);

    // Get the members collection
    const members = await project.collection("members").get();

    // Get the members data
    const membersData = members.docs.map((doc) => doc.data());

    // Get user information from SQL database for each member
    const pool = await sqlConnect();
    if (!pool) {
      return res.status(500).send("Database connection error");
    }

    // Fetch user information for each member
    const membersWithUserInfo = await Promise.all(
      membersData.map(async (member) => {
        try {
          const result = await pool
            .request()
            .input("userId", sql.Int, member.userId)
            .execute("spGetUserById");

          const userData = result.recordset[0];
          if (userData) {
            return {
              ...member,
              name: `${userData.firstName} ${userData.lastName}`,
              fullName: `${userData.firstName} ${userData.lastName}`,
            };
          }
          return member;
        } catch (error) {
          console.error(
            `Error fetching user info for member ${member.userId}:`,
            error
          );
          return member;
        }
      })
    );

    // Return the members data with user information
    res.json(membersWithUserInfo);
  } catch (error) {
    console.error("Error fetching project members:", error);
    res.status(500).send("Error fetching project members");
  }
};

export const getMemberById = async (req: Request, res: Response) => {
  const projectId = req.params.ProjectId;
  if (!projectId) return res.status(400).send("Project ID is required");

  const memberId = req.params.MemberId;
  if (!memberId) return res.status(400).send("Member ID is required");

  // Obtener el documento del miembro
  const member = await db
    .collection("projects")
    .doc(projectId)
    .collection("members")
    .doc(memberId)
    .get();
  const memberData = member.data();

  // Devolver los datos del miembro
  res.json(memberData);
};

export const addMember = async (req: Request, res: Response) => {
  const projectId = req.params.ProjectId;
  const userId = req.body.userId;
  const roleId = req.body.roleId;

  if (!projectId) return res.status(400).send("Project ID is required");
  if (!userId) return res.status(400).send("User ID is required");
  if (!roleId) return res.status(400).send("Role ID is required");

  // Check if the user already exists in sql database
  const pool = await sqlConnect();
  const result = await pool
    .request()
    .input("id", sql.VarChar, userId + "")
    .execute("spCheckUserExists");
  if (result.recordset[0].UserExists != 1)
    return res.status(400).send("El usuario no existe");

  console.log("El usuario existe");

  // Check if the user is already a member of the project
  const member = await db
    .collection("projects")
    .doc(projectId)
    .collection("members")
    .doc(`${userId}_${projectId}`)
    .get();
  if (member.exists)
    return res.status(400).send("El usuario ya es miembro del proyecto");

  console.log("El usuario no es miembro del proyecto");

  // Create the member
  const rolepath = `/projects/${projectId}/roles/${roleId}`;
  const newMember = {
    userId: Number(userId),
    projectId: projectId,
    roleId: rolepath,
  };

  await db
    .collection("projects")
    .doc(projectId)
    .collection("members")
    .doc(`${userId}_${projectId}`)
    .set(newMember);

  res.status(201).json(newMember);
};

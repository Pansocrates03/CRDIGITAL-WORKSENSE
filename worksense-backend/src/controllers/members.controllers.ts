import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import { sqlConnect, sql } from "../models/sqlModel.js";


// Obtener todos los miembros de un proyecto
export const getProjectMembers = async (req: Request, res: Response) => {

  const projectId = req.params.ProjectId;
  if (!projectId) return res.status(400).send("Project ID is required");

  // Obtener el documento del proyecto
  const project = await db.collection('projects').doc(req.params.ProjectId)
  
  // Obtener la colección de "members"
  const members = await project.collection('members').get();

  // Obtener los datos de los miembros
  const membersData = members.docs.map((doc) => doc.data());  

  // Devolver los datos de los miembros
  res.json(membersData);
};

export const getMemberById = async (req: Request, res: Response) => {

  const projectId = req.params.ProjectId;
  if (!projectId) return res.status(400).send("Project ID is required");

  const memberId = req.params.MemberId;
  if (!memberId) return res.status(400).send("Member ID is required");

  // Obtener el documento del miembro
  const member = await db.collection('projects')
    .doc(projectId)
    .collection('members')
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
    .input("userId", sql.VarChar, userId+"")
    .execute("spCheckUserExists");
  if (result.recordset[0].UserExists != 1) return res.status(400).send("El usuario no existe");

  console.log("El usuario existe");

  // Check if the user is already a member of the project
  const member = await db.collection('projects')
    .doc(projectId)
    .collection('members')
    .doc(`${userId}_${projectId}`)
    .get();
  if (member.exists) return res.status(400).send("El usuario ya es miembro del proyecto");

  console.log("El usuario no es miembro del proyecto");

  // Create the member
  const rolepath = `/projects/${projectId}/roles/${roleId}`;
  const newMember = {
    userId: userId,
    projectId: projectId,
    roleId: rolepath
  };

  await db.collection('projects')
    .doc(projectId)
    .collection('members')
    .doc(`${userId}_${projectId}`)
    .set(newMember);

  res.status(201).json(newMember);
};










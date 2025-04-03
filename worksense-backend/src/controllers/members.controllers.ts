import { Request, Response } from "express";
import { db } from "../models/firebase.js";


// Obtener todos los miembros de un proyecto
export const getMembers = async (req: Request, res: Response) => {

    // Obtener el documento del proyecto
    const project = await db.collection('projects').doc(req.params.id)
    
    // Obtener la colección de "members"
    const members = await project.collection('members').get();

    // Obtener los datos de los miembros
    const membersData = members.docs.map((doc) => doc.data());  

    // Devolver los datos de los miembros
    res.json(membersData);
};

/*
  @swagger
  /projects/{ProjectId}/members/{MemberId}:
  get:
    summary: Obtener un miembro por ID
    description: Obtiene un miembro específico de un proyecto por su ID
    parameters:
      - name: ProjectId
        in: path
        required: true
        type: string
      - name: MemberId
        in: path  
        required: true
        type: string
    responses:
      '200':
        description: Miembro encontrado exitosamente
        schema:
          type: object
*/

export const getMemberById = async (req: Request, res: Response) => {

  // Obtener el documento del miembro
  const member = await db.collection('projects')
    .doc(req.params.ProjectId)
    .collection('members')
    .doc(req.params.MemberId)
    .get();
  const memberData = member.data();

  // Devolver los datos del miembro
  res.json(memberData);
};


export const addMember = async (req: Request, res: Response) => {

  // Check if the user already exists in sql database
  

  const newMember = {
    userId: req.body.userId,
    projectId: req.params.id,
    roleId: req.body.roleId
  };

  await db.collection('projects')
    .doc(req.params.id)
    .collection('members')
    .doc(`${req.body.userId}_${req.params.id}`)
    .set(newMember);

  res.status(201).json(newMember);
};










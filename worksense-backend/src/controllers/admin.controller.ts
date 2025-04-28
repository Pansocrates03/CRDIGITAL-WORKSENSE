// controllers/adminController.ts

import { Request, Response, NextFunction } from "express";
import { db } from "../models/firebase.js"; // Adjust path to your initialized Firestore instance
import { AvailablePermission, ProjectRole } from "../../types/permissions.js"; // Import the interfaces

/**
 * @description List all available permissions defined in the system.
 * @route GET /api/v1/admin/permissions
 * @access Platform Admin (Placeholder)
 */
export const listAvailablePermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permissionsSnap = await db.collection("availablePermissions").get();
    const permissions = permissionsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(permissions);
  } catch (error) {
    next(error);
  }
};

/**
 * @description List all defined project roles.
 * @route GET /api/v1/admin/projectRoles
 * @access Platform Admin (Placeholder)
 */
export const listProjectRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rolesSnap = await db.collection("projectRoles").get();
    const roles = rolesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};

/**
 * @description Create a new project role.
 * @route POST /api/v1/admin/projectRoles
 * @access Platform Admin (Placeholder)
 */
export const createProjectRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, permissions } = req.body;

    // Basic validation
    if (!name || !permissions) {
      res.status(400).json({ message: "Name and permissions are required" });
      return;
    }

    const newRoleData = { name, permissions };
    const roleRef = await db.collection("projectRoles").add(newRoleData);

    res.status(201).json({
      id: roleRef.id,
      ...newRoleData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @description Update an existing project role.
 * @route PUT /api/v1/admin/projectRoles/:roleId
 * @access Platform Admin (Placeholder)
 */
export const updateProjectRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roleId } = req.params;
    const updateData = req.body;

    const roleRef = db.collection("projectRoles").doc(roleId);
    const doc = await roleRef.get();

    if (!doc.exists) {
      res.status(404).json({ message: "Project role not found" });
      return;
    }

    await roleRef.update(updateData);

    const updatedDoc = await roleRef.get();
    res.status(200).json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @description Delete a project role.
 * @route DELETE /api/v1/admin/projectRoles/:roleId
 * @access Platform Admin (Placeholder)
 */
export const deleteProjectRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roleId } = req.params;
    const roleRef = db.collection("projectRoles").doc(roleId);
    const doc = await roleRef.get();

    if (!doc.exists) {
      res.status(404).json({ message: "Project role not found" });
      return;
    }

    await roleRef.delete();
    res.status(200).json({ message: "Project role deleted", id: roleId });
  } catch (error) {
    next(error);
  }
};

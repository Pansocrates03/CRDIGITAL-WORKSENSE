import { Request, Response, NextFunction } from "express";
import { db } from "../../models/firebase.js"; // Adjust path
import { ProjectMemberData } from "../../../types/project.js"; // Import needed type

// Extend Request type to potentially hold project-specific details
declare global {
  namespace Express {
    interface Request {
      projectMembership?: {
        roleId: string;
        // Add permissions array here later if fetched
      };
    }
  }
}

/**
 * Middleware to check if the authenticated user (`req.user.userId`) is a member
 * of the project specified by `req.params.projectId`.
 * If they are a member, it optionally attaches their roleId to `req.projectMembership`.
 */

export const checkProjectMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!projectId) {
      return res.status(400).json({ message: "Project ID required" });
    }

    // Check if user is a member
    const memberRef = db
      .collection("projects")
      .doc(projectId)
      .collection("members")
      .doc(String(userId));

    const memberSnap = await memberRef.get();

    if (!memberSnap.exists) {
      return res.status(403).json({ message: "Not a member of this project" });
    }

    // Attach role to request for permission checks
    const memberData = memberSnap.data() as ProjectMemberData;
    req.projectMembership = { roleId: memberData.projectRoleId };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Factory function to create middleware that checks for a specific project permission.
 * Assumes `checkProjectMembership` has run and potentially populated `req.projectMembership`.
 * Fetches role permissions if not already available.
 * @param requiredPermission The permission key string (e.g., 'edit:project', 'manage:members')
 */
export const checkProjectPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = req.projectMembership?.roleId;
      const userId = req.user?.userId;
      const { projectId } = req.params;

      // 1. Check if user is the project owner
      const projectRef = db.collection("projects").doc(projectId);
      const projectSnap = await projectRef.get();
      if (projectSnap.exists) {
        const projectData = projectSnap.data();
        if (projectData && projectData.ownerId == userId) {
          return next();
        }
      }

      // 2. Fallback to role-based permission check
      if (!roleId) {
        res.status(403).json({ message: "Membership role not determined" });
        return;
      }

      const roleRef = db.collection("projectRoles").doc(roleId);
      const roleSnap = await roleRef.get();

      if (!roleSnap.exists) {
        res.status(403).json({ message: "Role definition not found" });
        return;
      }

      const roleData = roleSnap.data();
      const permissions: string[] = roleData?.permissions || [];

      if (permissions.includes(requiredPermission)) {
        next();
      } else {
        res.status(403).json({
          message: `Requires '${requiredPermission}' permission`,
        });
        return;
      }
    } catch (error) {
      next(error);
    }
  };
};

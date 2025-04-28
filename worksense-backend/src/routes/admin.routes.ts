// routes/adminRoutes.ts
import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import { verifyToken } from "../middlewares/tokenAuth.js";
import { checkPlatformAdmin } from "../middlewares/adminAuth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Platform Admin
 *   description: Platform-level administration operations
 */

// Apply auth middlewares to all routes
const authMiddleware = [verifyToken, checkPlatformAdmin];

/**
 * @swagger
 * /admin/permissions:
 *   get:
 *     summary: List all available permissions in the platform
 *     description: |
 *       Retrieve a list of all available permissions that can be assigned to project roles.
 *       Permissions are categorized by their function (Admin, Backlog, General, etc.).
 *     tags: [Platform Admin]
 *     security:
 *       - authToken: []
 *     responses:
 *       200:
 *         description: List of available permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the permission
 *                     example: "delete:project"
 *                   key:
 *                     type: string
 *                     description: Permission key used in code
 *                     example: "delete:project"
 *                   description:
 *                     type: string
 *                     description: Human-readable description of what the permission allows
 *                     example: "Delete the entire project (use with caution)."
 *                   category:
 *                     type: string
 *                     description: Category grouping related permissions
 *                     example: "Admin"
 *                 required:
 *                   - id
 *                   - key
 *                   - description
 *                   - category
 *               example:
 *                 - id: "delete:project"
 *                   key: "delete:project"
 *                   description: "Delete the entire project (use with caution)."
 *                   category: "Admin"
 *                 - id: "edit:backlog"
 *                   key: "edit:backlog"
 *                   description: "Create, edit, delete backlog items (stories, bugs, etc.)"
 *                   category: "Backlog"
 *                 - id: "edit:project"
 *                   key: "edit:project"
 *                   description: "Edit project name, description, and context."
 *                   category: "General"
 *                 - id: "edit:sprint_items"
 *                   key: "edit:sprint_items"
 *                   description: "Add/remove items from sprints."
 *                   category: "Sprint Management"
 *                 - id: "manage:members"
 *                   key: "manage:members"
 *                   description: "Add, remove, and change roles of project members."
 *                   category: "Member Management"
 *                 - id: "manage:sprints"
 *                   key: "manage:sprints"
 *                   description: "Create, edit, start, close sprints."
 *                   category: "Sprint Management"
 *                 - id: "move:sprint_item"
 *                   key: "move:sprint_item"
 *                   description: "Change the status of items within an active sprint"
 *                   category: "Sprint Management"
 *                 - id: "view:project"
 *                   key: "view:project"
 *                   description: "allows viewing basic project details, members, and backlog items."
 *                   category: "General"
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a platform admin
 */
router.get(
  "/permissions",
  authMiddleware,
  adminController.listAvailablePermissions
);

/**
 * @swagger
 * /admin/projectRoles:
 *   get:
 *     summary: List all project roles
 *     description: |
 *       Retrieve a list of all available project roles, including both system-defined roles
 *       (Developer, Product Owner, Scrum Master, Viewer) and custom roles created by platform admins.
 *       Each role includes its assigned permissions that determine what actions members can perform.
 *     tags: [Platform Admin]
 *     security:
 *       - authToken: []
 *     responses:
 *       200:
 *         description: List of project roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the role
 *                     example: "developer"
 *                   name:
 *                     type: string
 *                     description: Display name of the role
 *                     example: "Developer"
 *                   permissions:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of permission keys assigned to this role
 *                     example: ["view:project", "edit:backlog"]
 *                 required:
 *                   - id
 *                   - name
 *                   - permissions
 *               example:
 *                 - id: "developer"
 *                   name: "Developer"
 *                   permissions:
 *                     - "view:project"
 *                     - "edit:backlog"
 *                     - "edit:sprint_items"
 *                     - "move:sprint_item"
 *                 - id: "product-owner"
 *                   name: "Product Owner"
 *                   permissions:
 *                     - "view:project"
 *                     - "edit:backlog"
 *                     - "manage:sprints"
 *                     - "manage:members"
 *                     - "edit:sprint_items"
 *                     - "move:sprint_item"
 *                     - "edit:project"
 *                 - id: "scrum-master"
 *                   name: "Scrum Master"
 *                   permissions:
 *                     - "view:project"
 *                     - "manage:sprints"
 *                     - "edit:sprint_items"
 *                     - "move:sprint_item"
 *                 - id: "viewer"
 *                   name: "Viewer"
 *                   permissions:
 *                     - "view:project"
 *                 - id: "YCT8iHm9sooTiFkxaBDU"
 *                   name: "hugoRole"
 *                   permissions:
 *                     - "view:project"
 *                 - id: "wojI7whWuVO5iNV19tp7"
 *                   name: "Santi Rolee"
 *                   permissions:
 *                     - "view:project"
 *                     - "edit:project"
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a platform admin
 */
router.get("/projectRoles", authMiddleware, adminController.listProjectRoles);

/**
 * @swagger
 * /admin/projectRoles:
 *   post:
 *     summary: Create a new project role
 *     description: |
 *       Create a new custom project role with specified permissions.
 *       The role name must be unique and permissions must be valid permission keys.
 *     tags: [Platform Admin]
 *     security:
 *       - authToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *                 description: Display name of the role
 *                 example: "Custom Developer"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of permission keys to assign to the role
 *                 example: ["view:project", "edit:backlog", "edit:sprint_items"]
 *           examples:
 *             basic:
 *               summary: Basic role with minimal permissions
 *               value:
 *                 name: "Basic Developer"
 *                 permissions: ["view:project", "edit:backlog"]
 *             advanced:
 *               summary: Advanced role with multiple permissions
 *               value:
 *                 name: "Senior Developer"
 *                 permissions: ["view:project", "edit:backlog", "edit:sprint_items", "move:sprint_item"]
 *     responses:
 *       201:
 *         description: Project role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the created role
 *                   example: "YCT8iHm9sooTiFkxaBDU"
 *                 name:
 *                   type: string
 *                   description: Display name of the role
 *                   example: "Custom Developer"
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of assigned permission keys
 *                   example: ["view:project", "edit:backlog"]
 *       400:
 *         description: Invalid request data - Invalid role name or permissions
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a platform admin
 */
router.post("/projectRoles", authMiddleware, adminController.createProjectRole);

/**
 * @swagger
 * /admin/projectRoles/{roleId}:
 *   put:
 *     summary: Update an existing project role
 *     tags: [Platform Admin]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the role to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the role
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated list of permission identifiers
 *     responses:
 *       200:
 *         description: Project role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a platform admin
 *       404:
 *         description: Role not found
 */
router.put(
  "/projectRoles/:roleId",
  authMiddleware,
  adminController.updateProjectRole
);

/**
 * @swagger
 * /admin/projectRoles/{roleId}:
 *   delete:
 *     summary: Delete a project role
 *     description: |
 *       Delete a custom project role. System-defined roles (developer, product-owner, scrum-master, viewer)
 *       cannot be deleted. Only roles created through this API can be removed.
 *     tags: [Platform Admin]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the role to delete
 *         example: "YCT8iHm9sooTiFkxaBDU"
 *     responses:
 *       200:
 *         description: Project role deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Project role deleted successfully"
 *                 roleId:
 *                   type: string
 *                   description: ID of the deleted role
 *                   example: "YCT8iHm9sooTiFkxaBDU"
 *       400:
 *         description: Bad Request - Cannot delete system-defined role
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a platform admin
 *       404:
 *         description: Role not found
 */
router.delete(
  "/projectRoles/:roleId",
  authMiddleware,
  adminController.deleteProjectRole
);

export default router;

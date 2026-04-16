// backend/src/routes/projects.route.ts

import { Router } from "express";
import { ProjectsController } from "../controllers/projects.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler.middleware"; // Importar asyncHandler

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - name
 *         - group_id
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated UUID of the project
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         group_id:
 *           type: string
 *           description: UUID of the group associated with the project
 */

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Projects management endpoints
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Returns the list of all projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get("/", asyncHandler(ProjectsController.findAll));

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get project by id
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The project id
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.get("/:id", asyncHandler(ProjectsController.findById));

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Missing required fields
 */
router.post("/", asyncHandler(ProjectsController.create));

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Update project by id
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated
 *       404:
 *         description: Project not found
 */
router.put("/:id", asyncHandler(ProjectsController.update));

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete project by id
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted
 *       404:
 *         description: Project not found
 */
router.delete("/:id", asyncHandler(ProjectsController.delete));

/**
 * @swagger
 * /projects/{id}/matrix:
 *   get:
 *     summary: Get evaluation matrix of a project
 *     description: Returns evaluations grouped by phases (preparation, fair)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Grouped evaluations matrix
 *       404:
 *         description: Project not found
 */
router.get("/:id/matrix", asyncHandler(ProjectsController.getMatrix));


export default router;

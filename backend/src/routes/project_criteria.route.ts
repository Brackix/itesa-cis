import { Router } from "express";
import { ProjectCriteriaController } from "../controllers/project_criteria.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectCriterion:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated UUID of the criterion
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         phase:
 *           type: string
 *           enum: [preparation, fair]
 *           default: preparation
 */

/**
 * @swagger
 * tags:
 *   name: Project Criteria
 *   description: Project evaluation criteria management
 */

/**
 * @swagger
 * /project-criteria:
 *   get:
 *     summary: Returns the list of all project criteria
 *     tags: [Project Criteria]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of project criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProjectCriterion'
 */
router.get("/", asyncHandler(ProjectCriteriaController.findAll));

/**
 * @swagger
 * /project-criteria/{id}:
 *   get:
 *     summary: Get project criterion by id
 *     tags: [Project Criteria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The criterion id
 *     responses:
 *       200:
 *         description: Criterion details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectCriterion'
 *       404:
 *         description: Criterion not found
 */
router.get("/:id", asyncHandler(ProjectCriteriaController.findById));

/**
 * @swagger
 * /project-criteria:
 *   post:
 *     summary: Create a new project criterion
 *     tags: [Project Criteria]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectCriterion'
 *     responses:
 *       201:
 *         description: Criterion created successfully
 *       400:
 *         description: Missing required fields
 */
router.post("/", asyncHandler(ProjectCriteriaController.create));

/**
 * @swagger
 * /project-criteria/{id}:
 *   put:
 *     summary: Update project criterion by id
 *     tags: [Project Criteria]
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
 *             $ref: '#/components/schemas/ProjectCriterion'
 *     responses:
 *       200:
 *         description: Criterion updated
 *       404:
 *         description: Criterion not found
 */
router.put("/:id", asyncHandler(ProjectCriteriaController.update));

/**
 * @swagger
 * /project-criteria/{id}:
 *   delete:
 *     summary: Delete project criterion by id
 *     tags: [Project Criteria]
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
 *         description: Criterion deleted
 *       404:
 *         description: Criterion not found
 */
router.delete("/:id", asyncHandler(ProjectCriteriaController.delete));

export default router;

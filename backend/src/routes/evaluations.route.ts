import { Router } from "express";
import { EvaluationsController } from "../controllers/evaluations.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";


const router = Router();

router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     Evaluation:
 *       type: object
 *       required:
 *         - project_id
 *         - criterion_id
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated UUID of the evaluation
 *         project_id:
 *           type: string
 *         criterion_id:
 *           type: string
 *         status:
 *           type: string
 *           enum: [in_progress, achieved, not_achieved, late]
 *           default: in_progress
 *         notes:
 *           type: string
 *         start_date:
 *           type: string
 *           format: date-time
 *         end_date:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Evaluations
 *   description: Project evaluation management
 */

/**
 * @swagger
 * /evaluations:
 *   get:
 *     summary: Returns the list of all evaluations
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of evaluations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evaluation'
 */
router.get("/", asyncHandler(EvaluationsController.findAll));

/**
 * @swagger
 * /evaluations/{id}:
 *   get:
 *     summary: Get evaluation by id
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The evaluation id
 *     responses:
 *       200:
 *         description: Evaluation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evaluation'
 *       404:
 *         description: Evaluation not found
 */
router.get("/:id", asyncHandler(EvaluationsController.findById));

/**
 * @swagger
 * /evaluations/{id}:
 *   put:
 *     summary: Update evaluation by id
 *     tags: [Evaluations]
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
 *             $ref: '#/components/schemas/Evaluation'
 *     responses:
 *       200:
 *         description: Evaluation updated
 *       404:
 *         description: Evaluation not found
 */
router.put("/:id", asyncHandler(EvaluationsController.update));

export default router;

import { Router } from "express";
import { GroupsController } from "../controllers/groups.controller";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       required:
 *         - group_name
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated UUID of the group
 *         group_name:
 *           type: string
 *         group_full:
 *           type: boolean
 *           description: Indicates if the group has reached its maximum capacity
 */

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Groups management endpoints
 */

// -------------------------
// GROUPS
// -------------------------

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Returns the list of all groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 */
router.get("/", asyncHandler(GroupsController.findAll));

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Group'
 *     responses:
 *       201:
 *         description: Group created successfully
 */
router.post("/", asyncHandler(GroupsController.create));

// -------------------------
// STUDENTS (específicas primero)
// -------------------------

/**
 * @swagger
 * /groups/students:
 *   get:
 *     summary: Get all students who are already in a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students in groups
 */
router.get("/students", asyncHandler(GroupsController.findStudentsInGroups));

/**
 * @swagger
 * /groups/{groupId}/students:
 *   get:
 *     summary: Get all students belonging to a specific group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of group members
 */
router.get("/:groupId/students", asyncHandler(GroupsController.getStudentsFromGroup));

/**
 * @swagger
 * /groups/{groupId}/students:
 *   post:
 *     summary: Add students to a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Students added successfully
 *       400:
 *         description: Group full or student already in a group
 */
router.post("/:groupId/students", asyncHandler(GroupsController.addStudents));

/**
 * @swagger
 * /groups/{groupId}/coordinator/{studentId}:
 *   patch:
 *     summary: Set a student as the group coordinator
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coordinator assigned
 */
router.patch("/:groupId/coordinator/:studentId", asyncHandler(GroupsController.setCoordinator));

/**
 * @swagger
 * /groups/{groupId}/students:
 *   delete:
 *     summary: Remove students from a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Students removed successfully
 */
router.delete("/:groupId/students", asyncHandler(GroupsController.deleteStudents));

// -------------------------
// DINÁMICAS al final
// -------------------------

/**
 * @swagger
 * /groups/{groupId}:
 *   get:
 *     summary: Get group by id
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group details
 *       404:
 *         description: Group not found
 */
router.get("/:groupId", asyncHandler(GroupsController.findById));

/**
 * @swagger
 * /groups/{groupId}:
 *   put:
 *     summary: Update group name
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group updated
 */
router.put("/:groupId", asyncHandler(GroupsController.update));

/**
 * @swagger
 * /groups/{groupId}:
 *   delete:
 *     summary: Delete a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group deleted
 */
router.delete("/:groupId", asyncHandler(GroupsController.delete));


export default router;
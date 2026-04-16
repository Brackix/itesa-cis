import { Router } from "express";
import multer from "multer";
import { StudentController } from "../controllers/students.controller";
import { authenticate } from "../middlewares/auth.middleware"
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - list_number
 *         - name
 *         - last_name
 *         - section
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated UUID of the student
 *         list_number:
 *           type: integer
 *           description: Roll/List number
 *         name:
 *           type: string
 *         last_name:
 *           type: string
 *         section:
 *           type: string
 *           description: Section letter (e.g. A, B)
 *         image_url:
 *           type: string
 *         alt_text:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management endpoints
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Returns the list of all students
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *         description: Filter by section
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or last_name
 *     responses:
 *       200:
 *         description: The list of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 */
router.get("/", asyncHandler(StudentController.getStudents));

/**
 * @swagger
 * /students/upload/preview:
 *   post:
 *     summary: Parse Excel file statelessly and return structure preview mapping
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Succesfully extracted student JSON arrays statelessly.
 */
router.post("/upload/preview", upload.single("file"), asyncHandler(StudentController.uploadExcelPreview));

/**
 * @swagger
 * /students/upload/confirm:
 *   post:
 *     summary: Bulk create students officially by sending explicitly approved JSON arrays
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               students:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: Successfully bulk inserted verified payload array
 */
router.post("/upload/confirm", asyncHandler(StudentController.confirmExcelUpload));

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: The student was successfully created
 *       400:
 *         description: Missing required fields
 */
router.post("/", asyncHandler(StudentController.createStudent));

/**
 * @swagger
 * /students/template:
 *   get:
 *     summary: Download blank exact Excel template format
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: Generates a blank XLSX formatted template buffer output explicitly.
 */
router.get("/template", asyncHandler(StudentController.downloadTemplate));

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get the student by id
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student id
 *     responses:
 *       200:
 *         description: The student description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: The student was not found
 */
router.get("/:id", asyncHandler(StudentController.getStudentById));

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update the student by the id
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: The student was updated
 *       404:
 *         description: The student was not found
 */
router.put("/:id", asyncHandler(StudentController.updateStudent));

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Remove the student by id
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student id
 *     responses:
 *       204:
 *         description: The student was deleted
 *       404:
 *         description: The student was not found
 */
router.delete("/:id", asyncHandler(StudentController.deleteStudent));

/**
 * @swagger
 * /students/{id}/details:
 *   get:
 *     summary: Get advanced comprehensive dashboard details of a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student id
 *     responses:
 *       200:
 *         description: Composite object containing group, role, project, and progress
 *       404:
 *         description: The student was not found
 */
router.get("/:id/details", asyncHandler(StudentController.getStudentDetails));

export default router;

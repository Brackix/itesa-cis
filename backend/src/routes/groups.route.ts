import { Router } from "express";
import { GroupsController } from "../controllers/groups.controller";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// -------------------------
// GROUPS
// -------------------------

router.get("/", asyncHandler(GroupsController.findAll));
router.post("/", asyncHandler(GroupsController.create));

// -------------------------
// STUDENTS (específicas primero)
// -------------------------

router.get("/students", asyncHandler(GroupsController.findStudentsInGroups));
router.get("/:groupId/students", asyncHandler(GroupsController.getStudentsFromGroup));
router.post("/:groupId/students", asyncHandler(GroupsController.addStudents));
router.patch("/:groupId/coordinator/:studentId", asyncHandler(GroupsController.setCoordinator));
router.delete("/:groupId/students", asyncHandler(GroupsController.deleteStudents));

// -------------------------
// DINÁMICAS al final
// -------------------------

router.get("/:groupId", asyncHandler(GroupsController.findById));
router.put("/:groupId", asyncHandler(GroupsController.update));
router.delete("/:groupId", asyncHandler(GroupsController.delete));

export default router;
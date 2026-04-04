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
router.post("/:id/students/:replaceCoordinator", asyncHandler(GroupsController.addStudents));
router.patch("/:id/coordinator/:studentId", asyncHandler(GroupsController.setCoordinator));
router.delete("/:groupId/students", asyncHandler(GroupsController.deleteStudents));

// -------------------------
// DINÁMICAS al final
// -------------------------

router.get("/:id", asyncHandler(GroupsController.findById));
router.put("/:id", asyncHandler(GroupsController.update));
router.delete("/:id", asyncHandler(GroupsController.delete));

export default router;
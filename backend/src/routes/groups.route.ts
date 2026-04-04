import { Router } from "express";
import { GroupsController } from "../controllers/groups.controller";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// 🔐 proteger todo
router.use(authenticate);

// -------------------------
// GROUPS
// -------------------------

router.get("/", asyncHandler(GroupsController.findAll));
router.get("/:id", asyncHandler(GroupsController.findById));
router.post("/", asyncHandler(GroupsController.create));
router.put("/:id", asyncHandler(GroupsController.update));
router.delete("/:id", asyncHandler(GroupsController.delete));

// -------------------------
// STUDENTS
// -------------------------

router.post(
    "/:id/students/:replaceCoordinator",
    asyncHandler(GroupsController.addStudents)
);

router.patch(
    "/:id/coordinator/:studentId",
    asyncHandler(GroupsController.setCoordinator)
);

router.delete(
    "/:groupId/students",
    asyncHandler(GroupsController.deleteStudents)
);

export default router;
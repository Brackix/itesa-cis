// backend/src/routes/projects.route.ts

import { Router } from "express";
import { ProjectsController } from "../controllers/projects.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler.middleware"; // Importar asyncHandler

const router = Router();

router.use(authenticate);

// Usar asyncHandler en cada ruta
router.get("/", asyncHandler(ProjectsController.findAll));
router.get("/:id", asyncHandler(ProjectsController.findById));
router.post("/", asyncHandler(ProjectsController.create));
router.put("/:id", asyncHandler(ProjectsController.update));
router.delete("/:id", asyncHandler(ProjectsController.delete));
router.get("/:id/matrix", asyncHandler(ProjectsController.getMatrix));

export default router;

import { Router } from "express";
import { ProjectCriteriaController } from "../controllers/project_criteria.controller";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

const router = Router();

router.get("/", asyncHandler(ProjectCriteriaController.findAll));
router.get("/:id", asyncHandler(ProjectCriteriaController.findById));
router.post("/", asyncHandler(ProjectCriteriaController.create));
router.put("/:id", asyncHandler(ProjectCriteriaController.update));
router.delete("/:id", asyncHandler(ProjectCriteriaController.delete));

export default router;

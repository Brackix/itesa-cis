import { Router } from "express";
import { ProjectCriteriaController } from "../controllers/project_criteria.controller";

const router = Router();

router.get("/", ProjectCriteriaController.findAll);
router.get("/:id", ProjectCriteriaController.findById);
router.post("/", ProjectCriteriaController.create);
router.put("/:id", ProjectCriteriaController.update);
router.delete("/:id", ProjectCriteriaController.delete);

export default router;

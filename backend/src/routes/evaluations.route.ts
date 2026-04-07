import { Router } from "express";
import { EvaluationsController } from "../controllers/evaluations.controller";

const router = Router();

router.get("/", EvaluationsController.findAll);
router.get("/:id", EvaluationsController.findById);
router.put("/:id", EvaluationsController.update);

export default router;

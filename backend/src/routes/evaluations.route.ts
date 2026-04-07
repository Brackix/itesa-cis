import { Router } from "express";
import { EvaluationsController } from "../controllers/evaluations.controller";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";


const router = Router();

router.get("/", asyncHandler(EvaluationsController.findAll));
router.get("/:id", asyncHandler(EvaluationsController.findById));
router.put("/:id", asyncHandler(EvaluationsController.update));

export default router;

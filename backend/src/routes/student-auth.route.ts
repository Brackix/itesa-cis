import { Router } from "express";
import { StudentAuthController } from "../controllers/studentAuth.controller";

const router = Router();
const controller = new StudentAuthController();

router.get("/sections", controller.getSections);
router.post("/signup/request-code", controller.requestSignupCode);
router.post("/signup/verify", controller.verifySignup);
router.post("/login", controller.login);

export default router;

import { Router, Request, Response } from "express";
import { UserService } from "../services/User/user.service";

const router = Router();
const userService = new UserService();

router.post("/", async (req: Request, res: Response) => {
    try {
        const user = await userService.create(req.body);
        res.status(201).json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get("/", async (req: Request, res: Response) => {
    try {
        const users = await userService.findAll();
        res.status(200).json(users);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    try {
        const user = await userService.findById(req.params.id as string);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.put("/:id", async (req: Request, res: Response) => {
    try {
        const user = await userService.update(req.params.id as string, req.body);
        res.status(200).json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.delete("/:id", async (req: Request, res: Response) => {
    try {
        await userService.delete(req.params.id as string);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;

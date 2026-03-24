import { Request, Response } from "express";
import { UserService } from "../services/User/user.service";

export class UserController {
    private readonly userService = new UserService();

    create = async (req: Request, res: Response) => {
        try {
            const user = await this.userService.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    findAll = async (_req: Request, res: Response) => {
        try {
            const users = await this.userService.findAll();
            res.status(200).json(users);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    findById = async (req: Request, res: Response) => {
        try {
            const id = this.ensureIdParam(req.params.id);
            const user = await this.userService.findById(id);
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.status(200).json(user);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const id = this.ensureIdParam(req.params.id);
            const user = await this.userService.update(id, req.body);
            res.status(200).json(user);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            const id = this.ensureIdParam(req.params.id);
            await this.userService.delete(id);
            res.status(204).send();
        } catch (error) {
            this.handleError(res, error);
        }
    };

    private handleError(res: Response, error: unknown): void {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(400).json({ error: "Bad request" });
    }

    private ensureIdParam(value: string | string[] | undefined): string {
        if (typeof value === "string" && value.trim()) {
            return value;
        }
        throw new Error("Invalid user id");
    }
}

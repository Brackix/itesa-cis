import { Request, Response } from "express";
import { StudentAuthError } from "../services/Student/studentAuth.errors";
import { StudentAuthService } from "../services/Student/studentAuth.service";

export class StudentAuthController {
    private readonly authService = new StudentAuthService();

    getSections = async (_req: Request, res: Response) => {
        try {
            const sections = await this.authService.getAvailableSections();
            res.status(200).json(sections);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    requestSignupCode = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.requestSignupCode(req.body?.email, req.ip);
            res.status(202).json(result);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    verifySignup = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.verifySignup(req.body, req.ip);
            res.status(result.created ? 201 : 200).json(result);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    login = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.login(req.body?.email, req.body?.password, req.ip);
            res.status(200).json(result);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    private handleError(res: Response, error: unknown): void {
        if (error instanceof StudentAuthError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.code,
            });
            return;
        }

        if (error instanceof Error) {
            res.status(500).json({
                error: error.message,
                code: "INTERNAL_SERVER_ERROR",
            });
            return;
        }

        res.status(500).json({ error: "Error interno", code: "INTERNAL_SERVER_ERROR" });
    }
}

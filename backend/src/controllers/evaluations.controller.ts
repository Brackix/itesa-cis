import { Request, Response } from "express";
import { EvaluationsService } from "../services/evaluations.service";

export class EvaluationsController {
    static findAll = async (req: Request, res: Response) => {
        const data = await EvaluationsService.findAll();
        return res.json({ success: true, data });
    };

    static findById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const data = await EvaluationsService.findById(id as string);
        if (!data) return res.status(404).json({ error: "EVALUATION_NOT_FOUND" });
        return res.json({ success: true, data });
    };

    static update = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { status, notes, start_date, end_date } = req.body;

        const data = await EvaluationsService.updateEvaluation(id as string, { status, notes, start_date, end_date });
        return res.json({ success: true, data });
    };
}

import { Request, Response } from "express";
import { ProjectCriteriaService } from "../services/project_criteria.service";

export class ProjectCriteriaController {
    static findAll = async (req: Request, res: Response) => {
        const data = await ProjectCriteriaService.findAll();
        return res.json({ success: true, data });
    };

    static findById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const data = await ProjectCriteriaService.findById(id as string);
        if (!data) return res.status(404).json({ error: "CRITERION_NOT_FOUND" });
        return res.json({ success: true, data });
    };

    static create = async (req: Request, res: Response) => {
        const { name, description, phase } = req.body;
        if (!name) return res.status(400).json({ error: "NAME_REQUIRED" });

        const data = await ProjectCriteriaService.createCriterion({ name, description, phase });
        return res.status(201).json({ success: true, data });
    };

    static update = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, description, phase } = req.body;

        const data = await ProjectCriteriaService.updateCriterion(id as string, { name, description, phase });
        return res.json({ success: true, data });
    };

    static delete = async (req: Request, res: Response) => {
        const { id } = req.params;
        const data = await ProjectCriteriaService.deleteCriterion(id as string);
        return res.json({ success: true, data });
    };
}

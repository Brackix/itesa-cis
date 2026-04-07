import { Request, Response } from "express";
import { ProjectService } from "../services/projects.service";

export class ProjectsController {

    static findAll = async (req: Request, res: Response) => {
        const data = await ProjectService.findAll();
        return res.json({ success: true, data });
    };

    static findById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const data = await ProjectService.findById(id as string);

        if (!data) {
            return res.status(404).json({ error: "PROJECT_NOT_FOUND" });
        }

        return res.json({ success: true, data });
    };

    static create = async (req: Request, res: Response) => {
        const { name, description, group_id } = req.body;

        if (!name || !group_id) {
            return res.status(400).json({ error: "NAME_AND_GROUP_ID_REQUIRED" });
        }

        const data = await ProjectService.createProject({ name, description, group_id });
        return res.status(201).json({ success: true, data });
    };

    static update = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, description, group_id } = req.body;

        const data = await ProjectService.updateProject(id as string, { name, description, group_id });
        return res.json({ success: true, data });
    };

    static delete = async (req: Request, res: Response) => {
        const { id } = req.params;
        const data = await ProjectService.deleteProject(id as string);
        return res.json({ success: true, data });
    };

    static getMatrix = async (req: Request, res: Response) => {
        const { id } = req.params;
        const data = await ProjectService.getMatrix(id as string);
        return res.json({ success: true, data });
    };
}

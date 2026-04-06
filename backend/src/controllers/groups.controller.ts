import { Request, Response } from "express";
import { groupsService } from "../services/groups.service";

export class GroupsController {

    static findAll = async (req: Request, res: Response) => {
        const data = await groupsService.findAll();
        return res.json({ success: true, data });
    };

    static findById = async (req: Request, res: Response) => {
        const { groupId } = req.params;
        if (!groupId) return res.status(400).json({ error: "GROUP_ID_NOT_SPECIFIED" });

        const data = await groupsService.findById(groupId as string);

        if (!data) {
            return res.status(404).json({ error: "GROUP_NOT_FOUIND" })
        }

        return res.json({ success: true, data });
    };

    static create = async (req: Request, res: Response) => {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "GROUP_NAME_REQUIRED" });
        }

        const data = await groupsService.create(name);

        return res.status(201).json({ success: true, data });
    };

    static update = async (req: Request, res: Response) => {
        const { groupId } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "GROUP_NAME_REQUIRED" });
        }

        const data = await groupsService.update(groupId as string, name);

        return res.json({ success: true, data });
    };

    static delete = async (req: Request, res: Response) => {
        const { groupId } = req.params;

        const data = await groupsService.delete(groupId as string);

        return res.json({ success: true, data });
    };

    // -------------------------
    // STUDENTS
    // -------------------------

    static findStudentsInGroups = async (req: Request, res: Response) => {
        const data = await groupsService.findStudentsInGroups();
        return res.json({ success: true, data });
    };

    static getStudentsFromGroup = async (req: Request, res: Response) => {
        const { groupId } = req.params;

        if (!groupId) return res.status(400).json({ error: "GROUP_ID_NOT_SPECIFIED" });

        const result = await groupsService.getStudentsFromGroup(groupId as string);

        return res.json(result);
    };


    static addStudents = async (req: Request, res: Response) => {
        const { groupId } = req.params;
        const { students, replaceCoordinator } = req.body;

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ error: "INVALID_STUDENTS_ARRAY" });
        }

        const result = await groupsService.addStudentsToGroup(
            groupId as string,
            students,
            !!replaceCoordinator
        );

        return res.json(result);
    };

    static setCoordinator = async (req: Request, res: Response) => {
        const { groupId, studentId } = req.params;

        const result = await groupsService.setNewCoordinator(
            studentId as string,
            groupId as string
        );

        return res.json(result);
    };

    static deleteStudents = async (req: Request, res: Response) => {
        const { groupId } = req.params;
        const { studentIds } = req.body;

        if (!Array.isArray(studentIds)) {
            return res.status(400).json({ error: "INVALID_STUDENTS_IDS" });
        }

        // Enviar solo el array de strings al servicio
        const result = await groupsService.deleteStudentFromGroup(
            studentIds,
            groupId as string
        );

        return res.json(result);
    };
}
import { Request, Response } from "express";
import { groupsService } from "../services/groups.service";
import { AppError } from "../utils/appError.util";

export class GroupsController {

    static findAll = async (req: Request, res: Response) => {
        const data = await groupsService.findAll();
        return res.json({ success: true, data });
    };

    static findById = async (req: Request, res: Response) => {
        const id = req.params.id as string;

        const data = await groupsService.findById(id);

        if (!data) {
            throw new AppError("GROUP_NOT_FOUND", 404);
        }

        return res.json({ success: true, data });
    };

    static create = async (req: Request, res: Response) => {
        const { name } = req.body;

        if (!name) {
            throw new AppError("GROUP_NAME_REQUIRED", 400);
        }

        const data = await groupsService.create(name);

        return res.status(201).json({ success: true, data });
    };

    static update = async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const { name } = req.body;

        if (!name) {
            throw new AppError("GROUP_NAME_REQUIRED", 400);
        }

        const data = await groupsService.update(id, name);

        return res.json({ success: true, data });
    };

    static delete = async (req: Request, res: Response) => {
        const id = req.params.id as string;

        const data = await groupsService.delete(id);

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

        if (!groupId) throw new AppError("NO_GROUP_SPECIFIED", 400);

        const result = await groupsService.getStudentsFromGroup(groupId as string);

        return res.json(result);
    };


    static addStudents = async (req: Request, res: Response) => {
        const { id, replaceCoordinator } = req.params;
        const { students } = req.body;

        if (!Array.isArray(students) || students.length === 0) {
            throw new AppError("INVALID_STUDENTS_ARRAY", 400);
        }

        // ⚠️ convertir string → boolean
        const replace = replaceCoordinator === "true";

        const result = await groupsService.addStudentsToGroup(
            id as string,
            students,
            replace
        );

        return res.json(result);
    };

    static setCoordinator = async (req: Request, res: Response) => {
        const { id, studentId } = req.params;

        const result = await groupsService.setNewCoordinator(
            studentId as string,
            id as string
        );

        return res.json(result);
    };

    static deleteStudents = async (req: Request, res: Response) => {
        const groupId = req.params.groupId as string;
        const { studentIds } = req.body;

        if (!Array.isArray(studentIds)) {
            throw new AppError("INVALID_STUDENT_IDS", 400);
        }

        const result = await groupsService.deleteStudentFromGroup(
            studentIds,
            groupId
        );

        return res.json(result);
    };
}
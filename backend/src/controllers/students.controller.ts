import { Request, Response } from "express";
import { sections } from "@prisma/client";
import { StudentService } from "../services/students.service";

export class StudentController {
    static async getStudents(req: Request, res: Response) {
        try {
            const { section, search } = req.query;
            const filters = {
                section: section as sections,
                search: search as string | undefined,
            };
            const students = await StudentService.getStudents(filters);
            res.json(students);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
        }
    }

    static async getStudentById(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const student = await StudentService.getStudentById(id);
            if (!student) {
                return res.status(404).json({ error: "STUDENT_NOT_FOUND" });
            }
            res.json(student);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
        }
    }

    static async createStudent(req: Request, res: Response) {
        try {
            // Simplified explicit validation
            const { list_number, name, last_name, section, image_url, alt_text } = req.body;

            if (list_number === undefined || !name || !last_name || !section) {
                return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS: list_number, name, last_name, section" });
            }

            const student = await StudentService.createStudent({
                list_number: Number(list_number),
                name,
                last_name,
                section,
                image_url,
                alt_text
            });

            res.status(201).json(student);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
        }
    }

    static async updateStudent(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const data = req.body;

            // Optional explicit check for numeric translation if string was passed
            if (data.list_number !== undefined) {
                data.list_number = Number(data.list_number);
            }

            const student = await StudentService.updateStudent(id, data);
            res.json(student);
        } catch (error) {
            console.error(error);
            // Quick check for Prisma not found
            if ((error as { code?: string }).code === 'P2025') {
                return res.status(404).json({ error: "STUDENT_NOT_FOUND" });
            }
            res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
        }
    }

    static async deleteStudent(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await StudentService.deleteStudent(id);
            res.status(204).send();
        } catch (error) {
            console.error(error);
            if ((error as { code?: string }).code === 'P2025') {
                return res.status(404).json({ error: "STUDENT_NOT_FOUND" });
            }
            res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
        }
    }

    static async getStudentDetails(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const details = await StudentService.getStudentDetails(id);
            if (!details) {
                return res.status(404).json({ error: "STUDENT_NOT_FOUND" });
            }
            res.json(details);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
        }
    }
}

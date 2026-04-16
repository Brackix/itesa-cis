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
            if ((error as { code?: string }).code === 'P2002') {
                return res.status(409).json({ error: "STUDENT_ALREADY_EXISTS_IN_SECTION" });
            }
            res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
        }
    }

    static async updateStudent(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { list_number, name, last_name, section, image_url, alt_text } = req.body;

            const updateData: any = {};
            if (list_number !== undefined) updateData.list_number = Number(list_number);
            if (name !== undefined) updateData.name = name;
            if (last_name !== undefined) updateData.last_name = last_name;
            if (section !== undefined) updateData.section = section;
            if (image_url !== undefined) updateData.image_url = image_url;
            if (alt_text !== undefined) updateData.alt_text = alt_text;

            const student = await StudentService.updateStudent(id, updateData);
            res.json(student);
        } catch (error) {
            console.error(error);
            if ((error as { code?: string }).code === 'P2002') {
                return res.status(409).json({ error: "STUDENT_ALREADY_EXISTS_IN_SECTION" });
            }
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

    static async uploadExcelPreview(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No se proporcionó ningún archivo." });
            }
            const buffer = req.file.buffer;
            
            const result = await StudentService.parseExcelPreview(buffer);
            res.json(result);
        } catch (error) {
            console.error("Excel upload preview error:", error);
            res.status(500).json({ error: "Error procesando el archivo de previsualización." });
        }
    }

    static async confirmExcelUpload(req: Request, res: Response) {
        try {
            const { students } = req.body;
            if (!students || !Array.isArray(students)) {
                return res.status(400).json({ error: "No se proporcionó la estructura de estudiantes verificada." });
            }

            const result = await StudentService.executeMassInsert(students);
            res.json(result);
        } catch (error) {
            console.error("Excel upload confirm error:", error);
            res.status(500).json({ error: "Error al confirmar e insertar masivamente los estudiantes." });
        }
    }

    static async downloadTemplate(req: Request, res: Response) {
        try {
            const buffer = await StudentService.generateTemplateBuffer();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="Listados_Plantilla.xlsx"');
            res.send(buffer);
        } catch (error) {
            console.error("Template generation error:", error);
            res.status(500).json({ error: "Error al generar la plantilla Excel." });
        }
    }
}

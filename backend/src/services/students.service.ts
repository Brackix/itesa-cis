import prisma from "../config/prisma.config";
import { CryptoUtil } from "../utils/crypto.util";
import { Prisma, sections } from "@prisma/client";

export class StudentService {
    static async getStudents(filters: { section?: sections; search?: string }) {
        const whereClause: Prisma.studentsWhereInput = {};

        if (filters.section) {
            whereClause.section = filters.section;
        }

        if (filters.search) {
            whereClause.OR = [
                { name: { contains: filters.search, mode: "insensitive" } },
                { last_name: { contains: filters.search, mode: "insensitive" } },
            ];
        }

        return await prisma.students.findMany({
            where: whereClause,
            orderBy: [{ section: 'asc' }, { list_number: 'asc' }],
        });
    }

    static async getStudentById(id: string) {
        return await prisma.students.findUnique({
            where: { id },
        });
    }

    static async createStudent(data: {
        list_number: number;
        name: string;
        last_name: string;
        section: sections;
        image_url?: string;
        alt_text?: string;
    }) {
        const studentId = CryptoUtil.generateUUID();
        return await prisma.students.create({
            data: {
                id: studentId,
                list_number: data.list_number,
                name: data.name,
                last_name: data.last_name,
                section: data.section,
                image_url: data.image_url,
                alt_text: data.alt_text,
            } as Prisma.studentsUncheckedCreateInput,
        });
    }

    static async updateStudent(id: string, data: Partial<{
        list_number: number;
        name: string;
        last_name: string;
        section: sections;
        image_url: string;
        alt_text: string;
    }>) {
        return await prisma.students.update({
            where: { id },
            data,
        });
    }

    static async deleteStudent(id: string) {
        return await prisma.$transaction(async (tx) => {
            await tx.groups_students.deleteMany({
                where: { student_id: id }
            });

            return await tx.students.delete({
                where: { id }
            });
        });
    }

    static async getStudentDetails(id: string) {
        const student = await prisma.students.findUnique({
            where: { id },
            include: {
                groups_students: {
                    include: {
                        groups: {
                            include: {
                                projects: {
                                    include: {
                                        project_criterion_evaluations: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!student) return null;

        const relation = student.groups_students[0];
        const { groups_students: _groups_students, ...studentData } = student;

        if (!relation) {
            return { student: studentData, group: null, role: null, project: null, progress: 0 };
        }

        const group = relation.groups;
        const role = relation.is_coordinator ? "coordinator" : "member";
        const project = group.projects[0] || null;

        let progress = 0;
        if (project && project.project_criterion_evaluations.length > 0) {
            const achievedCount = project.project_criterion_evaluations.filter(
                (e) => e.status === "achieved"
            ).length;
            progress = Math.round((achievedCount / project.project_criterion_evaluations.length) * 100);
        }

        const { projects: _projects, ...groupData } = group;
        let projectData = null;
        if (project) {
            const { project_criterion_evaluations: _, ...pData } = project;
            projectData = pData;
        }

        return { student: studentData, group: groupData, role, project: projectData, progress };
    }

    static async parseExcelPreview(buffer: Buffer) {
        const XLSX = await import('xlsx');
        const wb = XLSX.read(buffer, { type: 'buffer' });
        const sheetNames = wb.SheetNames;
        
        let previewData: any[] = [];

        for (const sheetName of sheetNames) {
            const sectionStr = sheetName.replace('6', '').trim();
            if (!['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(sectionStr)) continue;

            const sheet = wb.Sheets[sheetName];
            const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            const studentRows = rows.slice(7);

            for (const row of studentRows) {
                if (!row || row.length < 3) continue;

                const listNumber = Number(row[0]);
                const last_name = String(row[1]).trim();
                const name = String(row[2]).trim();

                if (!listNumber || isNaN(listNumber) || !name || !last_name) continue;

                previewData.push({
                    list_number: listNumber,
                    name: name,
                    last_name: last_name,
                    section: sectionStr as sections,
                });
            }
        }
        
        return { success: true, count: previewData.length, data: previewData };
    }

    static async executeMassInsert(studentsParams: { list_number: number, name: string, last_name: string, section: sections }[]) {
        let upsertedCount = 0;

        for (const stu of studentsParams) {
            await prisma.students.upsert({
                where: {
                    list_number_section: {
                        list_number: stu.list_number,
                        section: stu.section
                    }
                },
                create: {
                    id: CryptoUtil.generateUUID(),
                    list_number: stu.list_number,
                    name: stu.name,
                    last_name: stu.last_name,
                    section: stu.section,
                },
                update: {
                    name: stu.name,
                    last_name: stu.last_name,
                }
            });
            upsertedCount++;
        }

        return { success: true, count: upsertedCount };
    }

    static async generateTemplateBuffer(): Promise<Buffer> {
        const XLSX = await import('xlsx');
        const wb = XLSX.utils.book_new();

        const sheetNames = ['6A', '6B', '6C', '6D', '6E', '6F', '6G'];

        for (const name of sheetNames) {
            const data = [
                ["INSTITUTO TECNICO SALESIANO"],
                ["2025-2026"],
                [`LISTA DEL CURSO M${name}  (EQ. ELO)`],
                ["PROFESOR: (A) "],
                ["MATERIA: "],
                [],
                ["NO.", "APELLIDOS", "NOMBRES"]
            ];
            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, name);
        }

        return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }
}
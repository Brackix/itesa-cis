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
}
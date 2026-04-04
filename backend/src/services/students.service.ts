import prisma from "../config/prisma.config";
import { CryptoUtil } from "../utils/crypto.util";
import { Prisma } from "@prisma/client";

export class StudentService {
    static async getStudents(filters: { section?: string; search?: string }) {
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
        section: string;
        image_url?: string;
        alt_text?: string;
    }) {
        const studentId = CryptoUtil.generateUUID();
        return await prisma.students.create({
            data: {
                id: studentId,
                ...data,
            },
        });
    }

    static async updateStudent(id: string, data: Partial<{
        list_number: number;
        name: string;
        last_name: string;
        section: string;
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
            // First delete relations to fulfill business rule #4 (manual cascade)
            await tx.groups_students.deleteMany({
                where: { student_id: id }
            });

            // Then delete the student
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

        if (!student) {
            return null;
        }

        const relation = student.groups_students[0]; // Assuming rule #1 restricts to 1 group

        // Build base student object excluding populated relations
        const { groups_students: _groups_students, ...studentData } = student;

        if (!relation) {
            return {
                student: studentData,
                group: null,
                role: null,
                project: null,
                progress: 0
            };
        }

        const group = relation.groups;
        const role = relation.is_coordinator ? "coordinator" : "member";
        const project = group.projects[0] || null;

        let progress = 0;
        if (project && project.project_criterion_evaluations.length > 0) {
            const achievedCount = project.project_criterion_evaluations.filter(
                (evalItem: { status: string }) => evalItem.status === "achieved"
            ).length;
            const totalCount = project.project_criterion_evaluations.length;
            progress = Math.round((achievedCount / totalCount) * 100);
        }

        // Clean up nesting
        const { projects: _projects, ...groupData } = group;
        let projectData = null;
        if (project) {
            const { project_criterion_evaluations: _project_criterion_evaluations, ...pData } = project;
            projectData = pData;
        }

        return {
            student: studentData,
            group: groupData,
            role,
            project: projectData,
            progress
        };
    }
}

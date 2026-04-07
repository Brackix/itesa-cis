import prisma from "../config/prisma.config";
import { CryptoUtil } from "../utils/crypto.util";
import { evaluation_phase } from "@prisma/client";
import { CreateProject, UpdateProject, ProjectMatrix, MatrixItem } from "../models/projects.model"
import { AppError } from "../utils/appError.util"


export class ProjectService {
    static async findAll() {
        return await prisma.projects.findMany();
    }

    static async findById(id: string) {
        return await prisma.projects.findUnique({ where: { id } });
    }

    static async createProject(data: CreateProject) {
        const group = await prisma.groups.findUnique({ where: { id: data.group_id } });
        if (!group) throw new AppError("GROUP_NOT_FOUND", 404);

        return await prisma.projects.create({
            data: {
                id: CryptoUtil.generateUUID(),
                ...data
            }
        });
    }

    static async updateProject(project_id: string, data: UpdateProject) {
        const group = await prisma.groups.findUnique({ where: { id: data.group_id } });
        if (!group) throw new AppError("GROUP_NOT_FOUND", 404);

        return await prisma.projects.update({
            where: { id: project_id },
            data: data
        });
    }

    static async deleteProject(project_id: string) {
        return await prisma.projects.delete({ where: { id: project_id } });
    }

    static async getMatrix(projectId: string): Promise<ProjectMatrix> {
        const project = await prisma.projects.findUnique({
            where: { id: projectId },
            include: {
                groups: true,
                project_criterion_evaluations: {
                    include: {
                        project_criteria: true
                    }
                }
            }
        });

        if (!project) throw new AppError("PROJECT_NOT_FOUND", 404);

        const matrix = {
            preparation: [] as MatrixItem[],
            fair: [] as MatrixItem[]
        };

        project.project_criterion_evaluations.forEach(evaluation => {
            const item: MatrixItem = {
                criterion: evaluation.project_criteria.name,
                evaluation: {
                    id: evaluation.id,
                    status: evaluation.status,
                    start_date: evaluation.start_date,
                    end_date: evaluation.end_date,
                    notes: evaluation.notes
                }
            };

            if (evaluation.project_criteria.phase === evaluation_phase.preparation) {
                matrix.preparation.push(item);
            } else if (evaluation.project_criteria.phase === evaluation_phase.fair) {
                matrix.fair.push(item);
            }
        });

        return {
            project: {
                id: project.id,
                name: project.name,
                description: project.description
            },
            group: {
                id: project.groups.id,
                group_name: project.groups.group_name
            },
            matrix
        };
    }
}

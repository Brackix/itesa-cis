import prisma from "../config/prisma.config";
import { CryptoUtil } from "../utils/crypto.util";
import { CreateProjectCriterion, UpdateProjectCriterion } from "../models/project_criteria.model";

export class ProjectCriteriaService {
    static async findAll() {
        return await prisma.project_criteria.findMany({
            orderBy: { name: 'asc' }
        });
    }

    static async findById(id: string) {
        return await prisma.project_criteria.findUnique({ where: { id } });
    }

    static async createCriterion(data: CreateProjectCriterion) {
        const criterion_id = CryptoUtil.generateUUID();
        
        // Fetch all active projects to attach this new criteria (Milestone)
        const projects = await prisma.projects.findMany();

        return await prisma.project_criteria.create({
            data: {
                id: criterion_id,
                ...data,
                project_criterion_evaluations: {
                    create: projects.map(p => ({
                        id: CryptoUtil.generateUUID(),
                        project_id: p.id,
                        status: 'in_progress'
                    }))
                }
            }
        });
    }

    static async updateCriterion(id: string, data: UpdateProjectCriterion) {
        return await prisma.project_criteria.update({
            where: { id },
            data
        });
    }

    static async deleteCriterion(id: string) {
        return await prisma.project_criteria.delete({ where: { id } });
    }
}

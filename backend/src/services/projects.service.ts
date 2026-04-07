import prisma from "../config/prisma.config";
import { CryptoUtil } from "../utils/crypto.util";
import { Prisma } from "@prisma/client";
import { CreateProject, UpdateProject } from "../models/projects.model"
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
        return await prisma.groups.delete({ where: { id: project_id } });
    }
}

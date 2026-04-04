import { user_roles } from "@prisma/client";
import bcrypt from 'bcryptjs';
import prisma from "../config/prisma.config";

const COST_FACTOR: number = parseInt(process.env.BYCRIPT_COST_FACTOR || '12');

const safeSelect = {
    id: true,
    username: true,
    role: true,
} as const;

export const usersService = {
    async findAll() {
        return prisma.users.findMany({ select: safeSelect });
    },

    async findById(id: string) {
        return prisma.users.findUnique({ where: { id }, select: safeSelect });
    },

    async create(username: string, password: string, role: user_roles) {
        const password_hash = await bcrypt.hash(password, COST_FACTOR);
    }
}
import bcrypt from 'bcryptjs';
import prisma from "../config/prisma.config";
import { user_roles } from '@prisma/client';
import { CryptoUtil } from "../utils/crypto.util";

import { userCreateModel, userUpdateModel } from "../models/user.models";

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

    async create(data: userCreateModel) {
        const password_hash = await bcrypt.hash(data.password, COST_FACTOR);
        return prisma.users.create({
            data: { id: CryptoUtil.generateUUID(), username: data.username, password_hash, role: data.role },
            select: safeSelect,
        });
    },

    async update(id: string, data: userUpdateModel) {
        const updateData: any = {};
        if (data.username) updateData.username = data.username;
        if (data.role) updateData.role = data.role;
        if (data.password) updateData.password_hash = await bcrypt.hash(data.password, COST_FACTOR);

        return prisma.users.update({ where: { id }, data: updateData, select: safeSelect })
    },

    async delete(id: string) {
        return prisma.users.delete({ where: { id }, select: safeSelect });
    },

    async isBrackix(id: string) {
        const user = await prisma.users.findUnique({ where: { id }, select: { role: true } });
        return user?.role === user_roles.brackix;
    },

    async countBrackix() {
        return prisma.users.count({ where: { role: user_roles.brackix } });
    },
}
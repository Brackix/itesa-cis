import { Prisma } from "@prisma/client";
import prisma from "../../../prisma/prisma.instance";

export class UserService {
    async create(data: Prisma.UserCreateInput) {
        return await prisma.user.create({ data });
    }

    async findAll() {
        return await prisma.user.findMany();
    }

    async findById(id: string) {
        return await prisma.user.findUnique({ where: { id } });
    }

    async update(id: string, data: Prisma.UserUpdateInput) {
        return await prisma.user.update({ where: { id }, data });
    }

    async delete(id: string) {
        return await prisma.user.delete({ where: { id } });
    }
}

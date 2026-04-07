import { Request, Response } from 'express';
import { usersService } from '../services/users.service';
import { user_roles } from '@prisma/client'
import { userCreateModel, userUpdateModel } from '../models/users.models';

export const usersController = {
    async findAll(req: Request, res: Response) {
        const users = await usersService.findAll();
        return res.json({ users });
    },

    async findById(req: Request, res: Response) {
        const id = req.params.id as string;
        const user = await usersService.findById(id);
        if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
        return res.json({ user });
    },

    async create(req: Request, res: Response) {
        const data = req.body as userCreateModel;
        if (!data.username || !data.password || !data.role) {
            return res.status(400).json({ error: 'USERNAME_PASSWORD_ROLE_REQUIRED' });
        }
        if (!Object.values(user_roles).includes(data.role)) {
            return res.status(400).json({ error: 'INVALID_ROLE' });
        }

        try {
            const user = await usersService.create(data);
            return res.status(201).json({ user });
        } catch (err: any) {
            if (err.code === 'P2002') {
                return res.status(400).json({ error: 'USERNAME_ALREADY_EXISTS' });
            }
            return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
        }
    },

    async update(req: Request, res: Response) {
        const id = req.params.id as string;
        const data = req.body as userUpdateModel;

        if (data.role && data.role !== user_roles.brackix && req.user!.sub === id) {
            return res.status(403).json({ error: 'CANNOT_DEGRADE_OWN_ROLE' });
        }

        try {
            const user = await usersService.update(id, data);
            return res.json({ user });
        } catch (err: any) {
            if (err.code === 'P2025') return res.status(404).json({ error: 'USER_NOT_FOUND' });
            if (err.code === 'P2002') return res.status(409).json({ error: 'USERNAME_ALREADY_EXISTS' });
            return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
        }
    },

    async delete(req: Request, res: Response) {
        const id = req.params.id as string;

        const target = await usersService.findById(id);
        if (!target) return res.status(404).json({ error: "USER_NOT_FOUND" });

        if (target.role === user_roles.brackix) {
            const count = await usersService.countBrackix();
            if (count <= 1) return res.status(403).json({ error: "CANNOT_DELETE_LAST_ADMIN" });
        }

        await usersService.delete(id);
        return res.status(204).send();
    }
}
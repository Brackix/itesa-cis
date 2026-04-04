import { Request, Response } from 'express';
import { usersService } from '../services/users.service';
import { user_roles } from '@prisma/client'
import { userCreateModel, userUpdateModel } from '../models/user.models';

export const usersController = {
    async findAll(req: Request, res: Response) {
        const users = await usersService.findAll();
        return res.json({ users });
    },

    async findById(req: Request, res: Response) {
        const id = req.params.id as string;
        const user = await usersService.findById(id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
        return res.json({ user });
    },

    async create(req: Request, res: Response) {
        const data = req.body as userCreateModel;
        if (!data.username || !data.password || !data.role) {
            return res.status(400).json({ error: 'Nombre de usuario, contraseña y rol son requeridos.' });
        }
        if (!Object.values(user_roles).includes(data.role)) {
            return res.status(400).json({ error: 'Rol inválido.' });
        }

        try {
            const user = await usersService.create(data);
            return res.status(201).json({ user });
        } catch (err: any) {
            if (err.code === 'P2002') {
                return res.status(400).json({ error: 'El nombre de usuario ya existe.' });
            }
            return res.status(500).json({ error: 'Error interno.' });
        }
    },

    async update(req: Request, res: Response) {
        const id = req.params.id as string;
        const data = req.body as userUpdateModel;

        if (data.role && data.role !== user_roles.brackix && req.user!.sub === id) {
            return res.status(403).json({ error: 'No puedes degradar tu propio rol.' });
        }

        try {
            const user = await usersService.update(id, data);
            return res.json({ user });
        } catch (err: any) {
            if (err.code === 'P2025') return res.status(404).json({ error: 'Usuario no encontrado' });
            if (err.code === 'P2002') return res.status(409).json({ error: 'Nombre de usuario ya existe' });
            return res.status(500).json({ error: 'Error interno' });
        }
    },

    async delete(req: Request, res: Response) {
        const id = req.params.id as string;

        const target = await usersService.findById(id);
        if (!target) return res.status(404).json({ error: "Usuario no encontrado" });

        if (target.role === user_roles.brackix) {
            const count = await usersService.countBrackix();
            if (count <= 1) return res.status(403).json({ error: "No se puede eliminar el último usuario brackix." });
        }

        await usersService.delete(id);
        return res.status(204).send();
    }
}
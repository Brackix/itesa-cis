import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class authController {
    static async login(req: Request, res: Response) {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: "Usuario y contraseña son requeridos." });

        try {
            const result = await authService.login(username, password)
            return res.json(result);
        } catch (err: any) {
            if (err.message === 'INVALID_CREDENTIALS') {
                return res.status(400).json({ error: "Credenciales invalidas." });
            }
            return res.status(500).json({ error: "Error interno del servidor." });
        }
    }

    static async me(req: Request, res: Response) {
        const user = await authService.me(req.user!.sub);

        if (!user) {
            return res.status(400).json({ error: "Usuario no encontrado." });
        }

        return res.json({ user });
    }
}
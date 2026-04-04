import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    const token = header.split(' ')[1];

    try {
        req.user = authService.verifyToken(token);
        next();
    } catch {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.user?.role !== 'brackix') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
}
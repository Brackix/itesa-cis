import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.config';
import { JwtPayload } from '../types/auth.type';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';
const COST_FACTOR: number = parseInt(process.env.BYCRIPT_COST_FACTOR || '12');

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

export const authService = {
    async login(username: string, password: string) {
        const user = await prisma.users.findUnique({ where: { username } });
        if (!user) throw new Error('INVALID_CREDENTIALS');

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) throw new Error('INVALID_CREDENTIALS');

        const payload: JwtPayload = {
            sub: user.id,
            username: user.username,
            role: user.role,
        };

        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
        });

        return {
            token,
            user: { id: user.id, username: user.username, role: user.role },
        };
    },

    async hashPassword(plain: string): Promise<string> {
        return bcrypt.hash(plain, COST_FACTOR);
    },

    async me(id: string) {
        return await prisma.users.findUnique({
            where: { id },
            select: { id: true, username: true, role: true },
        });
    },

    verifyToken(token: string): JwtPayload {
        return jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    },
};
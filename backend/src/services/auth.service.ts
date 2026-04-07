import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.config';
import { JwtPayload } from '../types/auth.type';
import "dotenv/config"

export const ENV = {
    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h',
    BCRYPT_COST_FACTOR: parseInt(process.env.BCRYPT_COST_FACTOR || process.env.BYCRIPT_COST_FACTOR || '12')
}

if (!ENV.JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
}


export class authService {
    static async login(username: string, password: string) {
        const user = await prisma.users.findUnique({ where: { username } });
        if (!user) throw new Error('INVALID_CREDENTIALS');

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) throw new Error('INVALID_CREDENTIALS');

        const payload: JwtPayload = {
            sub: user.id,
            username: user.username,
            role: user.role,
        };

        const token = jwt.sign(payload, ENV.JWT_SECRET, {
            expiresIn: ENV.JWT_EXPIRES_IN as SignOptions['expiresIn'],
        });

        return {
            token,
            user: { id: user.id, username: user.username, role: user.role },
        };
    }

    static async hashPassword(plain: string): Promise<string> {
        return bcrypt.hash(plain, ENV.BCRYPT_COST_FACTOR);
    }

    static async me(id: string) {
        return await prisma.users.findUnique({
            where: { id },
            select: { id: true, username: true, role: true },
        });
    }

    static verifyToken(token: string): JwtPayload {
        return jwt.verify(token, ENV.JWT_SECRET) as unknown as JwtPayload;
    }
};
import { user_roles } from '@prisma/client';

export interface JwtPayload {

    sub: string;
    username: string;
    role: user_roles;
    iat?: number;
    exp?: number;

}
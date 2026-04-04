import { user_roles } from '@prisma/client';

export interface userCreateModel {
    username: string;
    password: string;
    role: user_roles;
}

export interface userUpdateModel {
    username?: string;
    password?: string;
    role?: user_roles;
}
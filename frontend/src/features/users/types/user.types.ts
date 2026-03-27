export type UserRole = 'brackix' | 'user';

export interface User {
    id: string;
    username: string;
    password_hash: string;
    role: UserRole;
}

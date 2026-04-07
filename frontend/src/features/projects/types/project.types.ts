export interface Project {
    id: string;
    name: string;
    description?: string;
    group_id: string;
    groups?: { id: string; group_name: string };
}

export type CreateProjectInput = Omit<Project, 'id'>;

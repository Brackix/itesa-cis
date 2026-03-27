export interface Project {
    id: string;
    name: string;
    description?: string;
    group_id: string;
}

export type CreateProjectInput = Omit<Project, 'id'>;

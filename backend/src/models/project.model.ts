export interface CreateProject {
    name: string;
    description?: string;
    group_id: string;
}

export interface UpdateProject {
    name: string;
    description: string;
    group_id: string;
}
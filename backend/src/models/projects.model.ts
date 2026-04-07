import { project_criterion_status } from "@prisma/client";

export interface CreateProject {
    name: string;
    description?: string;
    group_id: string;
}

export interface UpdateProject {
    name?: string;
    description?: string | null;
    group_id?: string;
}

export interface MatrixItem {
    criterion: string;
    evaluation: {
        id: string;
        status: project_criterion_status;
        start_date: Date | null;
        end_date: Date | null;
        notes: string | null;
    };
}

export interface ProjectMatrix {
    project: {
        id: string;
        name: string;
        description: string | null;
    };
    group: {
        id: string;
        group_name: string;
    };
    matrix: {
        preparation: MatrixItem[];
        fair: MatrixItem[];
    };
}
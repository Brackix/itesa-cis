export interface Group {
    id: string;
    group_name: string;
}

export interface GroupStudent {
    id: string;
    group_id: string;
    student_id: string;
    is_coordinator: boolean;
}

export interface CreateGroupInput {
    group_name: string;
    students?: { id: string; isCoordinator: boolean }[];
}

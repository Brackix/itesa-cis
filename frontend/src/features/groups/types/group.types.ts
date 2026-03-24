export interface Group {
    id: string;
    group_name: string;
    project_name: string;
    project_desc: string;
    student_id: string; // References the leader or a member?
}

export type CreateGroupInput = Omit<Group, 'id'>;

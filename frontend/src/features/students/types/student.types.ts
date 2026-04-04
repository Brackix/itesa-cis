export interface Student {
    id: string;
    list_number: number;
    name: string;
    last_name: string;
    section: string;
    in_group: boolean;
    image_url?: string;
    alt_text?: string;
}

export type CreateStudentInput = Omit<Student, 'id' | 'in_group'>;

export interface StudentDetails {
    student: Student;
    group: {
        id: string;
        group_name: string;
    } | null;
    role: "coordinator" | "member" | null;
    project: {
        id: string;
        name: string;
        description: string | null;
    } | null;
    progress: number;
}

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

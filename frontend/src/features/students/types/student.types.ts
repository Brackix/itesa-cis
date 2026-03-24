export interface Student {
    id: string;
    listNumber: number;
    name: string;
    lastname: string;
    section: string;
    in_group: boolean;
    image_url?: string;
    alt_text?: string;
}

export type CreateStudentInput = Omit<Student, 'id' | 'in_group'>;

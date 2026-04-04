import { api } from '@/src/services/api';
import { Student, CreateStudentInput, StudentDetails } from '../types/student.types';

export class StudentService {
    static async getStudents(filters?: { section?: string; search?: string }): Promise<Student[]> {
        const response = await api.get('/students', { params: filters });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return response.data.map((student: any) => ({
            ...student,
            in_group: !!student.groups_students?.length, // Fallback check or false if backend doesn't embed it naturally
        }));
    }

    static async getStudentById(id: string): Promise<Student> {
        const response = await api.get(`/students/${id}`);
        return response.data;
    }

    static async createStudent(data: CreateStudentInput): Promise<Student> {
        const response = await api.post('/students', data);
        return response.data;
    }

    static async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
        const response = await api.put(`/students/${id}`, data);
        return response.data;
    }

    static async deleteStudent(id: string): Promise<void> {
        await api.delete(`/students/${id}`);
    }

    static async getStudentDetails(id: string): Promise<StudentDetails> {
        const response = await api.get(`/students/${id}/details`);
        return response.data;
    }
}

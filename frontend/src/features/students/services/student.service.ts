import { api } from '@/src/services/api';
import { Student, CreateStudentInput, StudentDetails } from '../types/student.types';

export class StudentService {
    static async getStudents(filters?: { section?: string; search?: string }): Promise<Student[]> {
        const response = await api.get('/students', { params: filters });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const studentList = response.data.data || response.data;
        return studentList.map((student: any) => ({
            ...student,
            in_group: !!student.groups_students?.length, 
        }));
    }

    static async getStudentById(id: string): Promise<Student> {
        const response = await api.get(`/students/${id}`);
        return response.data.data || response.data;
    }

    static async createStudent(data: CreateStudentInput): Promise<Student> {
        const response = await api.post('/students', data);
        return response.data.data || response.data;
    }

    static async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
        const response = await api.put(`/students/${id}`, data);
        return response.data.data || response.data;
    }

    static async deleteStudent(id: string): Promise<void> {
        await api.delete(`/students/${id}`);
    }

    static async getStudentDetails(id: string): Promise<StudentDetails> {
        const response = await api.get(`/students/${id}/details`);
        return response.data;
    }

    static async uploadExcelPreview(file: File): Promise<{ success: boolean; count: number; data: Student[] }> {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post('/students/upload/preview', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    static async confirmExcelUpload(students: any[]): Promise<{ success: boolean; count: number }> {
        const response = await api.post('/students/upload/confirm', { students });
        return response.data;
    }

    static async downloadTemplate(): Promise<void> {
        const response = await api.get('/students/template', {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Plantilla_Estudiantes.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
}

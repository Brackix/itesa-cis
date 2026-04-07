import { create } from 'zustand';
import { Student, CreateStudentInput } from '../types/student.types';

interface StudentStore {
    students: Student[];
    loading: boolean;
    error: string | null;
    fetchStudents: (filters?: { section?: string; search?: string }) => void;
    addStudent: (data: CreateStudentInput) => void;
    updateStudent: (student: Student) => void;
    deleteStudent: (id: string) => void;
    uploadExcelPreview: (file: File) => Promise<{ success: boolean; count: number; data: any[] }>;
    confirmExcelUpload: (students: any[]) => Promise<{ success: boolean; count: number }>;
}

import { StudentService } from '../services/student.service';

export const useStudentStore = create<StudentStore>((set) => ({
    students: [],
    loading: false,
    error: null,
    fetchStudents: async (filters) => {
        set({ loading: true, error: null });
        try {
            const students = await StudentService.getStudents(filters);
            set({ students, loading: false });
        } catch (error: unknown) {
            set({ error: error instanceof Error ? error.message : 'Error ocurred', loading: false });
        }
    },
    addStudent: async (data) => {
        set({ loading: true, error: null });
        try {
            const newStudent = await StudentService.createStudent(data);
            set((state) => ({ students: [...state.students, newStudent], loading: false }));
        } catch (error: any) {
            const msg = error.response?.data?.error || error.message;
            set({ error: msg, loading: false });
            throw new Error(msg);
        }
    },
    updateStudent: async (student) => {
        set({ loading: true, error: null });
        try {
            const updated = await StudentService.updateStudent(student.id, student);
            set((state) => ({
                students: state.students.map((s) => (s.id === student.id ? updated : s)),
                loading: false
            }));
        } catch (error: any) {
            const msg = error.response?.data?.error || error.message;
            set({ error: msg, loading: false });
            throw new Error(msg);
        }
    },
    deleteStudent: async (id) => {
        set({ loading: true, error: null });
        try {
            await StudentService.deleteStudent(id);
            set((state) => ({
                students: state.students.filter((s) => s.id !== id),
                loading: false
            }));
        } catch (error: any) {
            const msg = error.response?.data?.error || error.message;
            set({ error: msg, loading: false });
            throw new Error(msg);
        }
    },
    uploadExcelPreview: async (file: File) => {
        set({ loading: true, error: null });
        try {
            const result = await StudentService.uploadExcelPreview(file);
            set({ loading: false });
            return result;
        } catch (error: any) {
            const msg = error.response?.data?.error || "Error al previsualizar el Excel.";
            set({ error: msg, loading: false });
            throw new Error(msg);
        }
    },
    confirmExcelUpload: async (students: any[]) => {
        set({ loading: true, error: null });
        try {
            const result = await StudentService.confirmExcelUpload(students);
            set({ loading: false });
            return result;
        } catch (error: any) {
            const msg = error.response?.data?.error || "Error al insertar la carga masiva.";
            set({ error: msg, loading: false });
            throw new Error(msg);
        }
    }
}));

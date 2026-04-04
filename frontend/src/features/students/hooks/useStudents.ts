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
        } catch (error: unknown) {
            set({ error: error instanceof Error ? error.message : 'Error ocurred', loading: false });
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
        } catch (error: unknown) {
            set({ error: error instanceof Error ? error.message : 'Error ocurred', loading: false });
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
        } catch (error: unknown) {
            set({ error: error instanceof Error ? error.message : 'Error ocurred', loading: false });
        }
    }
}));

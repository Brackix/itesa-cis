import { create } from 'zustand';
import { Student, CreateStudentInput } from '../types/student.types';

interface StudentStore {
    students: Student[];
    loading: boolean;
    error: string | null;
    fetchStudents: () => void;
    addStudent: (data: CreateStudentInput) => void;
    updateStudent: (student: Student) => void;
    deleteStudent: (id: string) => void;
}

const mockStudents: Student[] = [
    { id: '1', listNumber: 1, name: 'Ana', lastname: 'García', section: 'A', in_group: false },
    { id: '2', listNumber: 2, name: 'Carlos', lastname: 'López', section: 'B', in_group: true },
];

export const useStudentStore = create<StudentStore>((set) => ({
    students: mockStudents,
    loading: false,
    error: null,
    fetchStudents: () => {
        // Mock fetch
        set({ loading: true });
        setTimeout(() => set({ students: mockStudents, loading: false }), 500);
    },
    addStudent: (data) => {
        const newStudent: Student = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            in_group: false
        };
        set((state) => ({ students: [...state.students, newStudent] }));
    },
    updateStudent: (student) => {
        set((state) => ({
            students: state.students.map((s) => (s.id === student.id ? student : s))
        }));
    },
    deleteStudent: (id) => {
        set((state) => ({
            students: state.students.filter((s) => s.id !== id)
        }));
    }
}));

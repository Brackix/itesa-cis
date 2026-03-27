import { create } from 'zustand';
import { Project, CreateProjectInput } from '../types/project.types';

interface ProjectStore {
    projects: Project[];
    loading: boolean;
    error: string | null;
    fetchProjects: () => void;
    addProject: (data: CreateProjectInput) => void;
    updateProject: (project: Project) => void;
    deleteProject: (id: string) => void;
}

const mockProjects: Project[] = [
    { id: '1', name: 'ITESA CIS Dashboard', description: 'Desarrollo de un dashboard con PrimeReact y Next.js', group_id: '1' },
];

export const useProjectStore = create<ProjectStore>((set) => ({
    projects: mockProjects,
    loading: false,
    error: null,
    fetchProjects: () => {
        set({ loading: true });
        setTimeout(() => set({ projects: mockProjects, loading: false }), 500);
    },
    addProject: (data) => {
        const newProject: Project = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
    },
    updateProject: (project) => {
        set((state) => ({
            projects: state.projects.map((p) => (p.id === project.id ? project : p))
        }));
    },
    deleteProject: (id) => {
        set((state) => ({
            projects: state.projects.filter((p) => p.id !== id)
        }));
    }
}));

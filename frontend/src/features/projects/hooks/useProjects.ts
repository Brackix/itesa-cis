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

import { ProjectService } from '../services/project.service';

export const useProjectStore = create<ProjectStore>((set) => ({
    projects: [],
    loading: false,
    error: null,
    fetchProjects: async () => {
        set({ loading: true, error: null });
        try {
            const data = await ProjectService.getProjects();
            set({ projects: data, loading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.error || error.message, loading: false });
        }
    },
    addProject: async (data) => {
        set({ loading: true, error: null });
        try {
            const result = await ProjectService.createProject(data);
            set((state) => ({ projects: [...state.projects, result], loading: false }));
        } catch (error: any) {
            set({ error: error.response?.data?.error || error.message, loading: false });
        }
    },
    updateProject: async (project) => {
        set({ loading: true, error: null });
        try {
            const result = await ProjectService.updateProject(project.id, {
                name: project.name,
                description: project.description,
                group_id: project.group_id
            });
            set((state) => ({
                projects: state.projects.map((p) => (p.id === project.id ? { ...p, ...result } : p)),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.error || error.message, loading: false });
        }
    },
    deleteProject: async (id) => {
        set({ loading: true, error: null });
        try {
            await ProjectService.deleteProject(id);
            set((state) => ({
                projects: state.projects.filter((p) => p.id !== id),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.error || error.message, loading: false });
        }
    }
}));

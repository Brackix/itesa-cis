import { api } from '@/src/services/api';
import { Project, CreateProjectInput } from '../types/project.types';

export class ProjectService {
    static async getProjects(): Promise<Project[]> {
        const response = await api.get('/projects');
        return response.data.data;
    }

    static async getProjectById(id: string): Promise<Project> {
        const response = await api.get(`/projects/${id}`);
        return response.data.data;
    }

    static async createProject(data: CreateProjectInput): Promise<Project> {
        const response = await api.post('/projects', data);
        return response.data.data;
    }

    static async updateProject(id: string, data: Partial<CreateProjectInput>): Promise<Project> {
        const response = await api.put(`/projects/${id}`, data);
        return response.data.data;
    }

    static async deleteProject(id: string): Promise<void> {
        await api.delete(`/projects/${id}`);
    }

    static async getProjectMatrix(id: string) {
        const response = await api.get(`/projects/${id}/matrix`);
        return response.data.data;
    }
}

import { create } from 'zustand';
import { Group, CreateGroupInput } from '../types/group.types';

interface GroupStore {
    groups: Group[];
    loading: boolean;
    error: string | null;
    fetchGroups: () => void;
    addGroup: (data: CreateGroupInput) => void;
    updateGroup: (group: Group) => void;
    deleteGroup: (id: string) => void;
}

import { api } from '@/src/services/api';

export const useGroupStore = create<GroupStore>((set) => ({
    groups: [],
    loading: false,
    error: null,
    fetchGroups: async () => {
        set({ loading: true, error: null });
        try {
            const res = await api.get('/groups');
            set({ groups: res.data.data, loading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.error || error.message, loading: false });
        }
    },
    addGroup: async (data) => {
        set({ loading: true, error: null });
        try {
            // Group route requires { name }
            const res = await api.post('/groups', { name: data.group_name });
            const newGroup = res.data.data;
            
            if (data.students && data.students.length > 0) {
                await api.post(`/groups/${newGroup.id}/students`, {
                    students: data.students
                });
            }
            
            set((state) => ({ groups: [...state.groups, newGroup], loading: false }));
        } catch (error: any) {
            set({ error: error.response?.data?.error || error.message, loading: false });
        }
    },
    updateGroup: async (group) => {
        set({ loading: true, error: null });
        try {
            const res = await api.put(`/groups/${group.id}`, { name: group.group_name });
            set((state) => ({
                groups: state.groups.map((g) => (g.id === group.id ? res.data.data : g)),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.error || error.message, loading: false });
        }
    },
    deleteGroup: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/groups/${id}`);
            set((state) => ({
                groups: state.groups.filter((g) => g.id !== id),
                loading: false
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.error || error.message, loading: false });
        }
    }
}));

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

const mockGroups: Group[] = [
    { id: '1', group_name: 'Grupo A', project_name: 'ITESA CIS Dashboard', project_desc: 'Desarrollo de un dashboard con PrimeReact y Next.js', student_id: '1' },
];

export const useGroupStore = create<GroupStore>((set) => ({
    groups: mockGroups,
    loading: false,
    error: null,
    fetchGroups: () => {
        set({ loading: true });
        setTimeout(() => set({ groups: mockGroups, loading: false }), 500);
    },
    addGroup: (data) => {
        const newGroup: Group = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
        };
        set((state) => ({ groups: [...state.groups, newGroup] }));
    },
    updateGroup: (group) => {
        set((state) => ({
            groups: state.groups.map((g) => (g.id === group.id ? group : g))
        }));
    },
    deleteGroup: (id) => {
        set((state) => ({
            groups: state.groups.filter((g) => g.id !== id)
        }));
    }
}));

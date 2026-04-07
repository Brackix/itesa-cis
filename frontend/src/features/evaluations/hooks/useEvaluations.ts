import { create } from 'zustand';
import { ProjectCriterionEvaluation, ProjectCriterion } from '../types/evaluation.types';

interface EvaluationStore {
    evaluations: ProjectCriterionEvaluation[];
    criteria: ProjectCriterion[];
    loading: boolean;
    error: string | null;
    fetchEvaluations: () => void;
    fetchCriteria: () => void;
    updateEvaluation: (evaluation: ProjectCriterionEvaluation) => void;
}

import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const useEvaluationStore = create<EvaluationStore>((set) => ({
    evaluations: [],
    criteria: [],
    loading: false,
    error: null,
    fetchEvaluations: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get(`${API_URL}/evaluations`);
            set({ evaluations: res.data.data, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },
    fetchCriteria: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get(`${API_URL}/project_criteria`);
            set({ criteria: res.data.data, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },
    updateEvaluation: async (evaluation) => {
        try {
            const updatePayload = {
                status: evaluation.status,
                notes: evaluation.notes
            };
            const res = await axios.put(`${API_URL}/evaluations/${evaluation.id}`, updatePayload);
            set((state) => ({
                evaluations: state.evaluations.map((e) => (e.id === evaluation.id ? res.data.data : e))
            }));
        } catch (error: any) {
            console.error("Failed to update evaluation", error);
        }
    }
}));

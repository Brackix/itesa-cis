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

const mockCriteria: ProjectCriterion[] = [
    { id: '1', name: 'Funcionalidad', description: 'El proyecto cumple con los requisitos funcionales' },
    { id: '2', name: 'Diseño', description: 'El proyecto tiene un diseño atractivo y usable' },
];

const mockEvaluations: ProjectCriterionEvaluation[] = [
    {
        id: '1',
        project_id: '1',
        criterion_id: '1',
        phase: 'preparation',
        status: 'in_progress',
    },
];

export const useEvaluationStore = create<EvaluationStore>((set) => ({
    evaluations: mockEvaluations,
    criteria: mockCriteria,
    loading: false,
    error: null,
    fetchEvaluations: () => {
        set({ loading: true });
        setTimeout(() => set({ evaluations: mockEvaluations, loading: false }), 500);
    },
    fetchCriteria: () => {
        set({ loading: true });
        setTimeout(() => set({ criteria: mockCriteria, loading: false }), 500);
    },
    updateEvaluation: (evaluation) => {
        set((state) => ({
            evaluations: state.evaluations.map((e) => (e.id === evaluation.id ? evaluation : e))
        }));
    }
}));

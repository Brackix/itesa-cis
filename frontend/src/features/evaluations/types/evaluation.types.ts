export type ProjectCriterionStatus = 'in_progress' | 'achieved' | 'not_achieved' | 'late';
export type EvaluationPhase = 'preparation' | 'fair';

export interface ProjectCriterion {
    id: string;
    name: string;
    description?: string;
}

export interface ProjectCriterionEvaluation {
    id: string;
    project_id: string;
    criterion_id: string;
    phase: EvaluationPhase;
    start_date?: string;
    end_date?: string;
    status: ProjectCriterionStatus;
    notes?: string;
}

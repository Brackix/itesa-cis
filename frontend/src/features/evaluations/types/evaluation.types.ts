export type ProjectCriterionStatus = 'in_progress' | 'achieved' | 'not_achieved' | 'late';
export type EvaluationPhase = 'preparation' | 'fair';

export type StudentSection = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface ProjectCriterion {
    id: string;
    name: string;
    description?: string | null;
    phase?: EvaluationPhase;
}

export interface ProjectCriterionEvaluation {
    id: string;
    project_id: string;
    criterion_id: string;
    start_date?: string | null;
    end_date?: string | null;
    status: ProjectCriterionStatus;
    notes?: string | null;
    
    project_criteria?: ProjectCriterion;
    projects?: {
        id: string;
        name: string;
        groups: {
            id: string;
            group_name: string;
            groups_students: Array<{
                students: {
                    section: StudentSection;
                }
            }>;
        }
    };
}

import { project_criterion_status } from "@prisma/client";

export interface UpdateEvaluation {
    status?: project_criterion_status;
    notes?: string | null;
    start_date?: Date | null;
    end_date?: Date | null;
}

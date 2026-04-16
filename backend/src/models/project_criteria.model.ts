import { evaluation_phase } from "@prisma/client";

export interface CreateProjectCriterion {
    name: string;
    description?: string;
    phase?: evaluation_phase;
}

export interface UpdateProjectCriterion {
    name?: string;
    description?: string | null;
    phase?: evaluation_phase;
}

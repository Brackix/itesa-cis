import prisma from "../config/prisma.config";
import { UpdateEvaluation } from "../models/evaluations.model";

export class EvaluationsService {
    static async findAll() {
        return await prisma.project_criterion_evaluations.findMany({
            include: {
                project_criteria: true,
                projects: {
                    include: {
                        groups: {
                            include: {
                                groups_students: {
                                    include: {
                                        students: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    static async findById(id: string) {
        return await prisma.project_criterion_evaluations.findUnique({
            where: { id },
            include: {
                project_criteria: true,
                projects: { include: { groups: true } }
            }
        });
    }

    static async updateEvaluation(id: string, data: UpdateEvaluation) {
        return await prisma.project_criterion_evaluations.update({
            where: { id },
            data,
            include: {
                project_criteria: true,
                projects: {
                    include: {
                        groups: {
                            include: {
                                groups_students: {
                                    include: {
                                        students: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
}

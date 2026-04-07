import prisma from "../config/prisma.config";
import { project_criterion_status } from "@prisma/client";

export class DashboardService {
    static async getOverview() {
        const totalStudents = await prisma.students.count();
        const totalGroups = await prisma.groups.count();
        const totalProjects = await prisma.projects.count();

        // Count evaluations by status
        const statuses = await prisma.project_criterion_evaluations.groupBy({
            by: ['status'],
            _count: {
                status: true,
            },
        });

        const metrics = {
            achieved: 0,
            in_progress: 0,
            not_achieved: 0,
            late: 0,
            total_evaluations: 0,
        };

        statuses.forEach((s) => {
            metrics[s.status as project_criterion_status] = s._count.status;
            metrics.total_evaluations += s._count.status;
        });

        // 5 Groups Needing Attention (Groups with the most 'late' or 'not_achieved' criteria)
        // Since Prisma groupBy doesn't allow deep relations easily, we'll fetch late evaluations and aggregate in JS or manually map
        const problematicEvals = await prisma.project_criterion_evaluations.findMany({
            where: {
                status: {
                    in: [project_criterion_status.late, project_criterion_status.not_achieved]
                }
            },
            include: {
                projects: {
                    include: {
                        groups: true
                    }
                },
                project_criteria: true
            },
            take: 10,
        });

        // Recent Activity: order by start_date desc if possible
        const recentActivity = await prisma.project_criterion_evaluations.findMany({
            where: {
                start_date: { not: null }
            },
            take: 5,
            orderBy: {
                start_date: 'desc'
            },
            include: {
                projects: true,
                project_criteria: true
            }
        });

        return {
            totalStudents,
            totalGroups,
            totalProjects,
            metrics,
            problematicEvals,
            recentActivity
        };
    }
}

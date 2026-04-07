import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
    static async getDashboardMetrics(req: Request, res: Response) {
        try {
            const data = await DashboardService.getOverview();
            return res.json(data);
        } catch (error) {
            console.error("Dashboard error:", error);
            return res.status(500).json({ error: "No se pudieron cargar las métricas de la feria." });
        }
    }
}

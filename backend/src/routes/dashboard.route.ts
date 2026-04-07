import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard aggregate metrics for the fair evaluation system
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved
 */
router.get('/', asyncHandler(DashboardController.getDashboardMetrics));

export default router;

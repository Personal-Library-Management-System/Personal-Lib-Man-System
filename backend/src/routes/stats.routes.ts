import { Router, RequestHandler } from 'express';
import { getStats } from '../controllers/stats.controller';

const statsRouter = Router();

/**
 * @openapi
 * /api/v1/stats:
 *   get:
 *     summary: Get user reading and watching statistics
 *     tags:
 *     - Statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserStatistics'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
statsRouter.get('/', getStats as RequestHandler);

export default statsRouter;

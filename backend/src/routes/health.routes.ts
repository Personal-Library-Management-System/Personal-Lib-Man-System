import express from 'express';
import healthController from '../controllers/health.controller';

const healthRouter = express.Router();

/**
 * @openapi
 * /api/v1/health:
 *  get:
 *      summary: Check system health and database connection
 *      description: |
 *        Performs a deep health check by verifying the database connection.
 *        Returns 200 if the system is healthy, and 503 if the database is disconnected.
 *      tags:
 *      - Health
 *      responses:
 *          200:
 *              description: System is healthy
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: "ok"
 *                    example: "development"
 *                    timeStamp:
 *                      type: string
 *                      format: date-time
 *          503:
 *              description: Service Unavailable (Database disconnected)
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                        example: "degraded"
 *                      environment:
 *                        type: string
 *                        example: "development"
 *                      timeStamp:
 *                        type: string
 *                        format: date-time
 */

healthRouter.get('/', healthController.healthCheckController);

export default healthRouter;

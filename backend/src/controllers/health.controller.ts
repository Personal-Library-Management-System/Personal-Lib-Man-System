import { Request, Response } from 'express';
import healthService from '../services/health.service';

const healthCheckController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const isDbConnected = healthService.checkDatabaseConnection();

    const responsePayload = {
        status: isDbConnected ? 'ok' : 'degraded',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
    };
    const responseStatus = isDbConnected ? 200 : 503;
    return res.status(responseStatus).json(responsePayload);
};

export default { healthCheckController };

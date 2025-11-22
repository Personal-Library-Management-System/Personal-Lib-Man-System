import { Request, Response } from 'express';
import healthService from '../services/health.service';
import { IHealthCheckResponsePayload } from '../types/healt.types';
import { StatusCodes } from 'http-status-codes';

const healthCheckController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const isDbConnected = healthService.checkDatabaseConnection();

    const responsePayload = {
        status: isDbConnected ? 'ok' : 'degraded',
        environment: process.env.NODE_ENV || 'development',
        timeStamp: new Date().toISOString(),
    } as IHealthCheckResponsePayload;

    const responseStatus = isDbConnected
        ? StatusCodes.OK
        : StatusCodes.SERVICE_UNAVAILABLE;
        
    return res.status(responseStatus).json(responsePayload);
};

export default { healthCheckController };

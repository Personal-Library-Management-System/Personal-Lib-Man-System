import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { StatusCodes } from 'http-status-codes';
import { getUserStatistics } from '../services/stats.service';
import { handleControllerError } from '../utils/appError';

export const getStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const googleId = req.user.id;

        const stats = await getUserStatistics(googleId);

        return res.status(StatusCodes.OK).json(stats);
    } catch (err) {
        return handleControllerError(res, err);
    }
};

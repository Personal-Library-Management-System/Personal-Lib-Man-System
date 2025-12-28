import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { AppError, handleControllerError } from '../utils/appError';
import {
    RecommendationOptionsSchema,
    recommendationOptionsSchema,
} from '../validators/recommendation.validator';
import { StatusCodes } from 'http-status-codes';
import { getRecommendationsForUser } from '../services/recommendation.service';

export const validateRecommendationOptions = (input: unknown): RecommendationOptionsSchema => {
    if (!input) {
        throw new AppError('recommendationOptions is required', StatusCodes.BAD_REQUEST);
    }

    const parsed = recommendationOptionsSchema.safeParse(input);
    if (!parsed.success) {
        throw new AppError(
            parsed.error.issues.map((i) => i.message).join(', '),
            StatusCodes.BAD_REQUEST
        );
    }
    return parsed.data;
};

export const getRecommendations = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const userDoc = req.userDoc;
        const rawRecommendationOptions = req.body.recommendationOptions;

        const recommendationOptions = validateRecommendationOptions(rawRecommendationOptions);
        const generatedRecommendations = await getRecommendationsForUser(
            userDoc,
            recommendationOptions
        );

        return res.status(StatusCodes.OK).json({
            message: 'Recommendations generated successfully.',
            recommendations: generatedRecommendations,
        });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

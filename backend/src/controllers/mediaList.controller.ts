import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../types/express';
import { Response } from 'express';
import { validateCreateListPayload } from '../validators/mediaList.validator';
import { createMediaListForUser } from '../services/mediaList.service';
import { handleControllerError } from '../utils/appError';

export const createList = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const googleId = req.user.id;
        const payload = req.body;

        const errors = validateCreateListPayload(payload);
        if (errors) {
            return res.status(StatusCodes.BAD_REQUEST).json({ errors });
        }

        const mediaList = await createMediaListForUser(
            googleId,
            {
                title: payload.title,
                color: payload.color,
                mediaType: payload.mediaType,
                items: payload.items
            }
        );
        return res.status(StatusCodes.OK).json({
            message: `Media list ${mediaList.title} created successfully.`,
            list: mediaList,
        });
    } catch (err: any) {
        return handleControllerError(res, err);
    }
};

export const getAllLists = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'not implemented yet' });
};

export const getListById = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'not implemented yet' });
};

export const deleteSingleList = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'not implemented yet' });
};

export const deleteMultipleLists = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'not implemented yet' });
};

export const updateList = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'not implemented yet' });
};

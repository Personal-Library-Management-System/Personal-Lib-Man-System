import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../types/express';
import { Response } from 'express';
import { validateCreateListPayload } from '../validators/mediaList.validator';
import {
    createMediaListForUser,
    deleteMultipleListsOfUser,
    deleteSingleMediaListOfUser,
    getAllMediaListsOfUser,
    getMediaListOfUser,
} from '../services/mediaList.service';
import { AppError, handleControllerError } from '../utils/appError';
import { Types } from 'mongoose';

export const createList = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userDoc = req.userDoc;
        const payload = req.body;

        const errors = validateCreateListPayload(payload);
        if (errors) {
            return res.status(StatusCodes.BAD_REQUEST).json({ errors });
        }

        const mediaList = await createMediaListForUser(userDoc, {
            title: payload.title,
            color: payload.color,
            mediaType: payload.mediaType,
            items: payload.items,
        });
        return res.status(StatusCodes.CREATED).json({
            message: `Media list ${mediaList.title} created successfully.`,
            list: mediaList,
        });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const getAllLists = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userDoc = req.userDoc;

        const mediaLists = await getAllMediaListsOfUser(userDoc);

        return res.status(StatusCodes.OK).json({
            message: 'Media lists of the user have been fetched successfully.',
            lists: mediaLists,
        });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const getListById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userDoc = req.userDoc;
        const mediaListId = req.params.id;

        if (!Types.ObjectId.isValid(mediaListId)) {
            throw new AppError(`Media list ID ${mediaListId} is invalid.`, StatusCodes.BAD_REQUEST);
        }

        const mediaList = await getMediaListOfUser(userDoc, new Types.ObjectId(mediaListId));
        return res.status(StatusCodes.OK).json({
            message: `Media list "${mediaList.title}" has been fetched successfully.`,
            list: mediaList,
        });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const deleteSingleList = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const userDoc = req.userDoc;
        const mediaListId = req.params.id;

        if (!Types.ObjectId.isValid(mediaListId)) {
            throw new AppError(`Media list ID ${mediaListId} is invalid.`, StatusCodes.BAD_REQUEST);
        }

        const deletedMediaList = await deleteSingleMediaListOfUser(
            userDoc,
            new Types.ObjectId(mediaListId)
        );

        return res.status(StatusCodes.OK).json({
            message: `Media list ${deletedMediaList.title} has been deleted successfully.`,
            list: deletedMediaList,
        });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const deleteMultipleLists = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const userDoc = req.userDoc;
        const mediaListIds = req.body.mediaLists;

        if (!Array.isArray(mediaListIds) || mediaListIds.length === 0) {
            throw new AppError('mediaLists must be a non-empty array.', StatusCodes.BAD_REQUEST);
        }

        const invalidMediaListIds = mediaListIds.filter(
            (mediaListId) => typeof mediaListId !== 'string' || !Types.ObjectId.isValid(mediaListId)
        );
        if (invalidMediaListIds.length > 0) {
            throw new AppError(
                `Invalid media list ID(s): ${invalidMediaListIds.join(', ')}`,
                StatusCodes.BAD_REQUEST
            );
        }

        const mediaListObjectIds = (mediaListIds as string[]).map(
            (mediaListId) => new Types.ObjectId(mediaListId)
        );
        const deletedMediaLists = await deleteMultipleListsOfUser(userDoc, mediaListObjectIds);

        return res.status(StatusCodes.OK).json({
            message: 'Media lists have been deleted successfully.',
            lists: deletedMediaLists,
        });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const updateList = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'not implemented yet' });
};

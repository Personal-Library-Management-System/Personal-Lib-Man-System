import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../types/express';
import { Response } from 'express';
import { validateCreateListPayload } from '../validators/mediaList.validator';
import {
    addMediaItemsToMediaList,
    createMediaListForUser,
    deleteMediaItemsFromMediaList,
    deleteMultipleListsOfUser,
    deleteSingleMediaListOfUser,
    getAllMediaListsOfUser,
    getMediaListOfUser,
    reorderMediaItemsOfListOfUser
} from '../services/mediaList.service';
import { AppError, handleControllerError } from '../utils/appError';
import {
    validateAndConvertObjectId,
    validateAndConvertObjectIdArray,
} from '../utils/validation.utils';

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

        const mediaListObjectId = validateAndConvertObjectId(mediaListId, 'Media list');
        const mediaList = await getMediaListOfUser(userDoc, mediaListObjectId);
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

        const mediaListObjectId = validateAndConvertObjectId(mediaListId, 'Media list');
        const deletedMediaList = await deleteSingleMediaListOfUser(userDoc, mediaListObjectId);

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

        const mediaListObjectIds = validateAndConvertObjectIdArray(mediaListIds, 'mediaLists');
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
    return res
        .status(StatusCodes.NOT_IMPLEMENTED)
        .json({ error: 'update list not implemented yet' });
};

export const addMediaItemsToList = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const userDoc = req.userDoc;
        const mediaListId = req.params.id;
        const mediaItemIdList = req.body?.items;

        const mediaListObjectId = validateAndConvertObjectId(mediaListId, 'Media list');
        const mediaItemObjectIds = validateAndConvertObjectIdArray(mediaItemIdList, 'items');

        const updatedMediaList = await addMediaItemsToMediaList(
            userDoc,
            mediaListObjectId,
            mediaItemObjectIds
        );
        return res.status(StatusCodes.OK).json({
            message: `Items have been added to ${updatedMediaList.title} list.`,
            list: updatedMediaList,
        });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const removeMediaItemsFromList = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const userDoc = req.userDoc;
        const mediaItemIdList = req.body?.items;
        const mediaListId = req.params.id;

        const mediaItemObjectIds = validateAndConvertObjectIdArray(mediaItemIdList, 'items');
        const mediaListObjectId = validateAndConvertObjectId(mediaListId, 'Media list');

        const updatedMediaList = await deleteMediaItemsFromMediaList(
            userDoc,
            mediaListObjectId,
            mediaItemObjectIds
        );
        return res.status(StatusCodes.OK).json({
            message: `Media items have been deleted from ${updatedMediaList.title} list.`,
            list: updatedMediaList,
        });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const reorderMediaItemsOfList = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const userDoc = req.userDoc;
        const mediaListId = req.params.id;
        const mediaItemIdList = req.body?.items;

        const mediaListObjectId = validateAndConvertObjectId(mediaListId, 'Media list');
        const mediaItemObjectIds = validateAndConvertObjectIdArray(mediaItemIdList, 'Media list');

        const reorderedMediaList = await reorderMediaItemsOfListOfUser(
            userDoc,
            mediaListObjectId,
            mediaItemObjectIds
        );

        return res.status(StatusCodes.OK).json({
            message: `Media items in list ${reorderedMediaList.title} have been re-ordered.`,
            list: reorderedMediaList
        });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

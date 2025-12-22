import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { isValidMediaStatus, isValidMediaType, ITEM_STATUSES, MEDIA_TYPES } from '../models/mediaItem.model';
import { StatusCodes } from 'http-status-codes';
import {
    createMediaItemForUser,
    deleteMediaItemForUser,
    deleteMultipleMediaItemsForUser,
    getAllMediaItemsForUser,
    getMediaItemForUser,
    getMediaItemsByTypeforUser,
    updateMediaItemForUser,
    addTagsToMediaItem,
    removeTagFromMediaItem,
    getMediaItemsByStatusForUser,
} from '../services/mediaItem.service';
import { handleControllerError } from '../utils/appError';

export const createMediaItem = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const googleId = req.user.id;
        const payload = req.body;

        if (!payload.mediaType || !MEDIA_TYPES.includes(payload.mediaType)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: "Invalid or missing 'mediaType'.",
            });
        }

        const newItem = await createMediaItemForUser(googleId, payload);

        return res.status(StatusCodes.CREATED).json({
            message: 'Media item created successfully',
            item: newItem,
        });
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Validation Error',
                details: messages,
            });
        }

        console.error('Error creating media item:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal Server Error',
        });
    }
};

export const deleteMediaItem = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const googleId = req.user.id;
        const mediaItemId = req.params.id;

        const deletedItem = await deleteMediaItemForUser(googleId, mediaItemId);

        return deletedItem
            ? res.status(StatusCodes.OK).json({
                  message: 'Media item deleted successfully',
                  item: deletedItem,
              })
            : res.status(StatusCodes.NOT_FOUND).json({
                  error: 'Media item not found for this user.',
              });
    } catch (error) {
        console.error('Error deleting media item:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal Server Error',
        });
    }
};

export const deleteMultipleMediaItems = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const googleId = req.user.id;
        const mediaItemIds = req.body.mediaItemIds as string[];

        if (!Array.isArray(mediaItemIds) || mediaItemIds.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'mediaItemIds must be a non-empty array of ids.',
            });
        }

        const { deletedIds, notDeletedIds } = await deleteMultipleMediaItemsForUser(
            googleId,
            mediaItemIds
        );

        return deletedIds.length === 0
            ? res.status(StatusCodes.NOT_FOUND).json({
                  error: 'No media items were deleted for this user.',
                  deletedIds,
                  notDeletedIds,
              })
            : res.status(StatusCodes.OK).json({
                  message: 'Media items deleted successfully',
                  deletedIds,
                  notDeletedIds,
              });
    } catch (error) {
        console.error('Error in deleteMultipleMediaItems:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'An internal server error occurred while deleting media items.',
        });
    }
};

export const getMediaItem = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const googleId = req.user.id;
        const mediaItemId = req.params.id;

        const item = await getMediaItemForUser(googleId, mediaItemId);
        return res.status(StatusCodes.OK).json({ item });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const getAllMediaItems = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const googleId = req.user.id;

        const filters = {
            tagIds: req.query.tagIds as string,
            match: req.query.match as 'any' | 'all',
        };
        const items = await getAllMediaItemsForUser(googleId, filters);

        return res.status(StatusCodes.OK).json({
            count: items.length,
            items,
        });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const getMediaItemsByType = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const googleId = req.user.id;
        const mediaType = req.params.mediaType;

        if (!isValidMediaType(mediaType)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: `Invalid mediaType. Allowed: ${MEDIA_TYPES.join(', ')}`,
            });
        }

        const filters = {
            tagIds: req.query.tagIds as string,
            match: req.query.match as 'any' | 'all',
        };

        const mediaItems = await getMediaItemsByTypeforUser(googleId, mediaType, filters);
        return res.status(StatusCodes.OK).json({
            items: mediaItems,
        });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const updateMediaItem = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const googleId = req.user.id;
        const mediaItemId = req.params.id;
        const updates = req.body;

        const updatedItem = await updateMediaItemForUser(googleId, mediaItemId, updates);

        return res.status(StatusCodes.OK).json({
            message: 'Media item updated successfully',
            item: updatedItem,
        });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const addTags = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const googleId = req.user.id;
        const { id } = req.params; // Media Item ID
        const { tagIds } = req.body; // Array of Tag IDs

        if (!Array.isArray(tagIds)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'tagIds must be an array.' });
        }

        const updatedItem = await addTagsToMediaItem(googleId, id, tagIds);

        return res.status(StatusCodes.OK).json(updatedItem);
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const removeTag = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const googleId = req.user.id;
        const { id, tagId } = req.params; // id=mediaId, tagId=tagToRemove

        const updatedItem = await removeTagFromMediaItem(googleId, id, tagId);

        return res.status(StatusCodes.OK).json(updatedItem);
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const getMediaItemsByStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userDoc = req.userDoc;
        const status = req.params.status;

        if(!isValidMediaStatus(status)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: `Invalid media item status. Allowed: ${ITEM_STATUSES.join(', ')}`
            });
        }

        const mediaItems = await getMediaItemsByStatusForUser(userDoc, status);

        return res.status(StatusCodes.OK).json({
            message: `Media items of status ${status} retrieved successfully.`,
            items: mediaItems
        });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

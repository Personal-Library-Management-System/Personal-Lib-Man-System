import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { isValidMediaType, MEDIA_TYPES } from '../models/mediaItem.model';
import { StatusCodes } from 'http-status-codes';
import {
    createMediaItemForUser,
    deleteMediaItemForUser,
    deleteMultipleMediaItemsForUser,
    getAllMediaItemsForUser,
    getMediaItemForUser,
    getMediaItemsByTypeforUser,
    updateMediaItemForUser
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
            const messages = Object.values(error.errors).map(
                (err: any) => err.message
            );
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

        const { deletedIds, notDeletedIds } =
            await deleteMultipleMediaItemsForUser(googleId, mediaItemIds);

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

export const getMediaItem = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const googleId = req.user.id;
        const mediaItemId = req.params.id;

        const item = await getMediaItemForUser(googleId, mediaItemId);
        return res.status(StatusCodes.OK).json({ item });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const getAllMediaItems = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const googleId = req.user.id;
        const items = await getAllMediaItemsForUser(googleId);

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
) => {
    try {
        const googleId = req.user.id;
        const mediaType = req.params.mediaType;

        if (!isValidMediaType(mediaType)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: `Invalid mediaType. Allowed: ${MEDIA_TYPES.join(', ')}`,
            });
        }

        const mediaItems = await getMediaItemsByTypeforUser(
            googleId,
            mediaType
        );
        return res.status(StatusCodes.OK).json({
            items: mediaItems,
        });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const updateMediaItem = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const googleId = req.user.id;
        const mediaItemId = req.params.id;
        const updates = req.body;

        const updatedItem = await updateMediaItemForUser(googleId, mediaItemId, updates);

        return res.status(StatusCodes.OK).json({
            message: 'Media item updated successfully',
            item: updatedItem
        });
    } catch (err) {
        return handleControllerError(res, err);
    }
};

import { Types } from 'mongoose';
import {
    MEDIA_TYPES,
    MediaItemDoc,
    MediaItemModel,
    MediaType,
    BOOK_SPECIFIC_FIELDS,
    MOVIE_SPECIFIC_FIELDS
} from '../models/mediaItem.model';
import User from '../models/user.model';
import { AppError } from '../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { MediaListModel } from '../models/mediaList.model';
import { TagModel } from '../models/tag.model';

interface CreateMediaItemPayload {
    mediaType: (typeof MEDIA_TYPES)[number];
    [key: string]: any;
}

export interface MediaFilterOptions {
    tagIds?: string; 
    match?: 'any' | 'all';
}

export const createMediaItemForUser = async (
    googleId: string,
    payload: CreateMediaItemPayload
) => {
    const newItem = await MediaItemModel.create(payload);

    await User.findOneAndUpdate(
        { googleId },
        { $push: { mediaItems: newItem._id } },
        { new: true }
    );

    return newItem;
};

export const deleteMediaItemForUser = async (
    googleId: string,
    mediaItemId: string
): Promise<MediaItemDoc | null> => {
    if (!Types.ObjectId.isValid(mediaItemId)) return null;

    const itemObjectId = new Types.ObjectId(mediaItemId);

    const updateResult = await User.updateOne(
        { googleId, mediaItems: itemObjectId },
        { $pull: { mediaItems: itemObjectId } }
    );

    if (updateResult.modifiedCount === 0) return null;

    const deletedItem = await MediaItemModel.findByIdAndDelete(mediaItemId);
    if (!deletedItem) return null;

    await MediaListModel.updateMany(
        { items: itemObjectId },
        { $pull: { items: itemObjectId } }
    );
    return deletedItem;
};

export const deleteMultipleMediaItemsForUser = async (
    googleId: string,
    mediaItemIds: string[]
) => {
    const validObjIds = mediaItemIds
        .filter(Types.ObjectId.isValid)
        .map((id) => new Types.ObjectId(id));

    if (!validObjIds.length)
        return { deletedIds: [], notDeletedIds: mediaItemIds };

    const user = await User.findOne({ googleId }, { mediaItems: 1 }).lean();
    if (!user?.mediaItems.length)
        return { deletedIds: [], notDeletedIds: mediaItemIds };

    const userMediaSet = new Set(user.mediaItems.map(String));

    const confirmedObjIds = validObjIds.filter((oid) =>
        userMediaSet.has(oid.toString())
    );
    if (!confirmedObjIds.length)
        return { deletedIds: [], notDeletedIds: mediaItemIds };

    await Promise.all([
        MediaItemModel.deleteMany({ _id: { $in: confirmedObjIds } }),
        User.updateOne(
            { googleId },
            { $pull: { mediaItems: { $in: confirmedObjIds } } }
        ),
        MediaListModel.updateMany(
            { items: { $in: confirmedObjIds } },
            { $pull: { items: { $in: confirmedObjIds } } }
        ),
    ]);
    const deletedIds = confirmedObjIds.map((oid) => oid.toString());

    return {
        deletedIds,
        notDeletedIds: mediaItemIds.filter((id) => !deletedIds.includes(id)),
    };
};

export const getMediaItemForUser = async (
    googleId: string,
    mediaItemId: string
): Promise<MediaItemDoc> => {
    if (!Types.ObjectId.isValid(mediaItemId)) {
        throw new AppError('Invalid media item id.', StatusCodes.BAD_REQUEST);
    }

    const hasItem = await User.exists({
        googleId,
        mediaItems: mediaItemId,
    });

    if (!hasItem) {
        throw new AppError(
            'Media item not found for this user.',
            StatusCodes.NOT_FOUND
        );
    }

    const item = await MediaItemModel.findById(mediaItemId).populate('tags');

    if (!item) {
        throw new AppError('Media item not found.', StatusCodes.NOT_FOUND);
    }

    return item;
};

export const getAllMediaItemsForUser = async (
    googleId: string,
    filters?: MediaFilterOptions
): Promise<MediaItemDoc[]> => {
    const user = await User.findOne({ googleId }, { mediaItems: 1 });
    if (!user) {
        throw new AppError('User not found.', StatusCodes.NOT_FOUND);
    }

    if (!user.mediaItems || !user.mediaItems.length) {
        return [];
    }

    const query: any = {
        _id: { $in: user.mediaItems },
    };

    if (filters?.tagIds) {
        const tagIdArray = filters.tagIds.split(',').map((id) => id.trim());
        const validTagObjectIds = tagIdArray
            .filter((id) => Types.ObjectId.isValid(id))
            .map((id) => new Types.ObjectId(id));

        if (validTagObjectIds.length > 0) {
            if (filters.match === 'all') {
                // Reason: AND logic - Item must have ALL specified tags
                query.tags = { $all: validTagObjectIds };
            } else {
                // Reason: OR logic (default) - Item must have AT LEAST ONE of the specified tags
                query.tags = { $in: validTagObjectIds };
            }
        }
    }

    const items = await MediaItemModel.find(query).populate('tags');
    return items;
};

export const getMediaItemsByTypeforUser = async (
    googleId: string,
    mediaType: MediaType,
    filters?: MediaFilterOptions
): Promise<MediaItemDoc[]> => {
    const user = await User.findOne({ googleId }, { mediaItems: 1 });

    if (!user || !user.mediaItems.length) {
        return [];
    }

    const query: any = {
        _id: { $in: user.mediaItems },
        mediaType,
    };

    if (filters?.tagIds) {
        const tagIdArray = filters.tagIds.split(',').map((id) => id.trim());
        const validTagObjectIds = tagIdArray
            .filter((id) => Types.ObjectId.isValid(id))
            .map((id) => new Types.ObjectId(id));

        if (validTagObjectIds.length > 0) {
            if (filters.match === 'all') {
                query.tags = { $all: validTagObjectIds };
            } else {
                query.tags = { $in: validTagObjectIds };
            }
        }
    }

    const items = await MediaItemModel.find(query).populate('tags');

    return items;
};

export const updateMediaItemForUser = async (
    googleId: string,
    mediaItemId: string,
    updates: any
) => {
    if (!Types.ObjectId.isValid(mediaItemId)) {
        throw new AppError('Invalid media item id.', StatusCodes.BAD_REQUEST);
    }

    const userHasItem = await User.exists({ googleId, mediaItems: mediaItemId });
    if (!userHasItem) {
        throw new AppError('Media item not found for this user.', StatusCodes.NOT_FOUND);
    }

    const existingItem = await MediaItemModel.findById(mediaItemId);
    if (!existingItem) {
        throw new AppError('Item not found.', StatusCodes.NOT_FOUND);
    }

    const updateKeys = Object.keys(updates);

    if (existingItem.mediaType === 'Book') {
        const invalidFields = updateKeys.filter(key => MOVIE_SPECIFIC_FIELDS.includes(key));
        
        if (invalidFields.length > 0) {
            throw new AppError(
                `Invalid fields for a Book: ${invalidFields.join(', ')}`, 
                StatusCodes.BAD_REQUEST
            );
        }
    }

    if (existingItem.mediaType === 'Movie') {
        const invalidFields = updateKeys.filter(key => BOOK_SPECIFIC_FIELDS.includes(key));
        
        if (invalidFields.length > 0) {
            throw new AppError(
                `Invalid fields for a Movie: ${invalidFields.join(', ')}`, 
                StatusCodes.BAD_REQUEST
            );
        }
    }

    delete updates.mediaType; 
    delete updates._id;      
    
    const updatedItem = await MediaItemModel.findByIdAndUpdate(
        mediaItemId,
        { $set: updates },
        { new: true, runValidators: true }
    );

    return updatedItem;
};

export const addTagsToMediaItem = async (
    googleId: string,
    mediaItemId: string,
    tagIds: string[]
): Promise<MediaItemDoc> => {
    if (!Types.ObjectId.isValid(mediaItemId)) {
        throw new AppError('Invalid media item ID.', StatusCodes.BAD_REQUEST);
    }
    
    const validTagIds = tagIds
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));

    if (validTagIds.length === 0) {
        throw new AppError('No valid tag IDs provided.', StatusCodes.BAD_REQUEST);
    }
    // Verify User Existence and Media Item Ownership
    const user = await User.findOne({ googleId });
    if (!user) {
        throw new AppError('User not found.', StatusCodes.NOT_FOUND);
    }

    // Check if the user owns this media item (it must be in their mediaItems array)
    const hasMediaItem = user.mediaItems.some(
        (id) => id.toString() === mediaItemId
    );

    if (!hasMediaItem) {
        throw new AppError('Media item not found for this user.', StatusCodes.NOT_FOUND);
    }

    const validTagsCount = await TagModel.countDocuments({
        _id: { $in: validTagIds },
        userId: user._id,
    });

    if (validTagsCount !== validTagIds.length) {
        throw new AppError(
            'One or more tags do not belong to this user or do not exist.',
            StatusCodes.FORBIDDEN
        );
    }

    const updatedItem = await MediaItemModel.findByIdAndUpdate(
        mediaItemId,
        { $addToSet: { tags: { $each: validTagIds } } },
        { new: true }
    ).populate('tags'); // Return with populated tag details

    if (!updatedItem) {
        throw new AppError('Media item not found.', StatusCodes.NOT_FOUND);
    }

    return updatedItem;
};

export const removeTagFromMediaItem = async (
    googleId: string,
    mediaItemId: string,
    tagId: string
): Promise<MediaItemDoc> => {
    if (!Types.ObjectId.isValid(mediaItemId) || !Types.ObjectId.isValid(tagId)) {
        throw new AppError('Invalid ID(s).', StatusCodes.BAD_REQUEST);
    }

    const user = await User.findOne({ googleId });
    if (!user) {
        throw new AppError('User not found.', StatusCodes.NOT_FOUND);
    }

    const hasMediaItem = user.mediaItems.some(
        (id) => id.toString() === mediaItemId
    );

    if (!hasMediaItem) {
        throw new AppError('Media item not found for this user.', StatusCodes.NOT_FOUND);
    }

    const updatedItem = await MediaItemModel.findByIdAndUpdate(
        mediaItemId,
        { $pull: { tags: new Types.ObjectId(tagId) } },
        { new: true }
    ).populate('tags');

    if (!updatedItem) {
        throw new AppError('Media item not found.', StatusCodes.NOT_FOUND);
    }

    return updatedItem;
};
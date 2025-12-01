import { Types } from 'mongoose';
import {
    MEDIA_TYPES,
    MediaItemDoc,
    MediaItemModel,
} from '../models/mediaItem.model';
import User from '../models/user.model';
import { AppError } from '../utils/appError';
import { StatusCodes } from 'http-status-codes';

interface CreateMediaItemPayload {
    mediaType: (typeof MEDIA_TYPES)[number];
    [key: string]: any;
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
) => {
    if (!Types.ObjectId.isValid(mediaItemId)) return null;

    const itemObjectId = new Types.ObjectId(mediaItemId);

    const updateResult = await User.updateOne(
        { googleId, mediaItems: itemObjectId },
        { $pull: { mediaItems: itemObjectId } }
    );

    if (updateResult.modifiedCount === 0) return null;

    const deletedItem = await MediaItemModel.findByIdAndDelete(mediaItemId);
    return deletedItem ?? null;
};

export const deleteMultipleMediaItemsForUser = async (
    googleId: string,
    mediaItemIds: string[]
) => {
    const validIds = mediaItemIds.filter((id) => Types.ObjectId.isValid(id));
    if (!validIds.length)
        return { deletedIds: [], notDeletedIds: mediaItemIds };

    const user = await User.findOne({ googleId }, { mediaItems: 1 }).lean();
    if (!user?.mediaItems?.length)
        return { deletedIds: [], notDeletedIds: mediaItemIds };

    const userMediaSet = new Set(user.mediaItems.map((id) => id.toString()));
    const confirmedIds = validIds.filter((id) => userMediaSet.has(id));

    if (!confirmedIds.length)
        return { deletedIds: [], notDeletedIds: mediaItemIds };

    await Promise.all([
        MediaItemModel.deleteMany({ _id: { $in: confirmedIds } }),
        User.updateOne(
            { googleId },
            { $pull: { mediaItems: { $in: confirmedIds } } }
        ),
    ]);

    return {
        deletedIds: confirmedIds,
        notDeletedIds: mediaItemIds.filter((id) => !confirmedIds.includes(id)),
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

    const item = await MediaItemModel.findById(mediaItemId);

    if (!item) {
        throw new AppError('Media item not found.', StatusCodes.NOT_FOUND);
    }

    return item;
};

export const getAllMediaItemsForUser = async (
    googleId: string
): Promise<MediaItemDoc[]> => {
    const user = await User.findOne({ googleId }, { mediaItems: 1 });
    if (!user) {
        throw new AppError('User not found.', StatusCodes.NOT_FOUND);
    }

    if (!user.mediaItems || user.mediaItems.length === 0) {
        return [];
    }

    const items = await MediaItemModel.find({
        _id: { $in: user.mediaItems },
    });

    return items;
};

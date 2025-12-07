import { StatusCodes } from 'http-status-codes';
import {
    MediaList,
    MediaListDoc,
    MediaListModel,
} from '../models/mediaList.model';
import User from '../models/user.model';
import { MediaItemModel } from '../models/mediaItem.model';
import { AppError } from '../utils/appError';
import { Types } from 'mongoose';

export const createMediaListForUser = async (
    googleId: string,
    mediaListPayload: MediaList
): Promise<MediaListDoc> => {
    const user = await User.findOne({ googleId }).select('mediaItems lists');
    if (!user) {
        throw new AppError(
            'User not found for the given googleId.',
            StatusCodes.NOT_FOUND
        );
    }

    const items = mediaListPayload.items ?? [];
    if (items.length === 0) {
        const mediaList = await MediaListModel.create(mediaListPayload);
        user.lists.push(mediaList._id);
        await user.save();
        return mediaList;
    }

    const userItemIdSet = new Set(
        (user.mediaItems as typeof items).map((id: any) => id.toString())
    );

    const notOwned = items
        .map((id) => id.toString())
        .filter((id) => !userItemIdSet.has(id));

    if (notOwned.length > 0) {
        const notOwnedItemsList = notOwned.join(', ');
        throw new AppError(
            `User does not own the following media item ID(s): ${notOwnedItemsList}.`,
            StatusCodes.BAD_REQUEST
        );
    }

    const mediaItems = await MediaItemModel.find({
        _id: { $in: items },
    }).select('_id mediaType');

    const mismatched = mediaItems
        .filter((item) => item.mediaType !== mediaListPayload.mediaType)
        .map((item) => item._id.toString());

    if (mismatched.length > 0) {
        const listMediaType = mediaListPayload.mediaType;
        const mismatchedMediaItems = mismatched.join(', ');
        throw new AppError(
            `The following media item ID(s) do not match the list media type '${listMediaType}': ${mismatchedMediaItems}.`,
            StatusCodes.BAD_REQUEST
        );
    }

    const mediaList = await MediaListModel.create(mediaListPayload);
    user.lists.push(mediaList._id);
    await user.save();

    return mediaList;
};

export const getAllMediaListsOfUser = async (
    googleId: string
): Promise<MediaListDoc[]> => {
    const user = await User.findOne({ googleId }).select('lists');
    if (!user) {
        throw new AppError(
            'User not found for the given googleId.',
            StatusCodes.NOT_FOUND
        );
    }

    if (!user.lists || user.lists.length === 0) {
        return [];
    }

    const mediaLists = await MediaListModel.find({
        _id: { $in: user.lists },
    }).sort({ createdAt: -1 });
    return mediaLists;
};

export const getMediaListOfUser = async (
    googleId: string,
    mediaListId: string
): Promise<MediaListDoc> => {
    const user = await User.findOne({ googleId }).select('lists');
    if (!user) {
        throw new AppError(
            'User not found for the given googleId.',
            StatusCodes.NOT_FOUND
        );
    }

    const mediaListObjectId = new Types.ObjectId(mediaListId);
    const ownsList = user.lists.some((id) => id.equals(mediaListObjectId));
    if (!ownsList) {
        throw new AppError(
            `User does not own the list ${mediaListId}`,
            StatusCodes.FORBIDDEN
        );
    }

    const mediaList = await MediaListModel.findById(mediaListObjectId)
        .populate('items')
        .exec();

    if (!mediaList) {
        throw new AppError('Media list not found.', StatusCodes.NOT_FOUND);
    }
    return mediaList;
};

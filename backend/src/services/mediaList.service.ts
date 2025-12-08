import { StatusCodes } from 'http-status-codes';
import { MediaList, MediaListDoc, MediaListModel } from '../models/mediaList.model';
import { UserDoc } from '../models/user.model';
import { MediaItemModel, MediaType } from '../models/mediaItem.model';
import { AppError } from '../utils/appError';
import { Types } from 'mongoose';

const ensureUserOwnsMediaList = (user: UserDoc, mediaListId: Types.ObjectId): void => {
    const ownsList = user.lists.some((id) => id.equals(mediaListId));
    if (!ownsList) {
        throw new AppError(`User does not own the list ${mediaListId}.`, StatusCodes.FORBIDDEN);
    }
};

const validateMediaItemsForList = async (
    user: UserDoc,
    mediaItemIds: Types.ObjectId[],
    listMediaType: MediaType
): Promise<void> => {
    const notOwnedItems = mediaItemIds.filter(
        (itemId) => !user.mediaItems.some((ownedId) => ownedId.equals(itemId))
    );
    if (notOwnedItems.length > 0) {
        throw new AppError(
            `User does not own the following media item ID(s): ${notOwnedItems.join(', ')}.`,
            StatusCodes.FORBIDDEN
        );
    }

    const mediaItems = await MediaItemModel.find({
        _id: { $in: mediaItemIds },
    }).select('_id mediaType');

    const missingItems = mediaItemIds.filter(
        (id) => !mediaItems.some((item) => item._id.equals(id))
    );
    if (missingItems.length > 0) {
        throw new AppError(
            `The following media item ID(s) were not found: ${missingItems.join(', ')}.`,
            StatusCodes.NOT_FOUND
        );
    }

    const mismatchedMediaItems = mediaItems
        .filter((item) => item.mediaType !== listMediaType)
        .map((item) => item._id.toString());

    if (mismatchedMediaItems.length > 0) {
        const mismatchedMediaItemIdList = mismatchedMediaItems.join(', ');
        throw new AppError(
            `The following media item ID(s) do not match the list media type '${listMediaType}': ${mismatchedMediaItemIdList}.`,
            StatusCodes.BAD_REQUEST
        );
    }
};

export const createMediaListForUser = async (
    user: UserDoc,
    mediaListPayload: MediaList
): Promise<MediaListDoc> => {
    const items = mediaListPayload.items ?? [];

    if (items.length > 0) {
        await validateMediaItemsForList(user, items, mediaListPayload.mediaType);
    }

    const mediaList = await MediaListModel.create(mediaListPayload);
    user.lists.push(mediaList._id);
    await user.save();

    return mediaList;
};

export const getAllMediaListsOfUser = async (user: UserDoc): Promise<MediaListDoc[]> => {
    if (user.lists.length === 0) {
        return [];
    }

    const mediaLists = await MediaListModel.find({
        _id: { $in: user.lists },
    }).sort({ createdAt: -1 });
    return mediaLists;
};

export const getMediaListOfUser = async (
    user: UserDoc,
    mediaListId: Types.ObjectId
): Promise<MediaListDoc> => {
    ensureUserOwnsMediaList(user, mediaListId);

    const mediaList = await MediaListModel.findById(mediaListId).populate('items').exec();
    if (!mediaList) {
        throw new AppError(`Media list ${mediaListId} not found.`, StatusCodes.NOT_FOUND);
    }
    return mediaList;
};

export const deleteSingleMediaListOfUser = async (user: UserDoc, mediaListId: Types.ObjectId) => {
    ensureUserOwnsMediaList(user, mediaListId);

    user.lists = user.lists.filter((id) => !id.equals(mediaListId));
    await user.save();

    const deletedMediaList = await MediaListModel.findByIdAndDelete(mediaListId);
    if (!deletedMediaList) {
        throw new AppError(`Media list ${mediaListId} not found.`, StatusCodes.NOT_FOUND);
    }
    return deletedMediaList;
};

export const deleteMultipleListsOfUser = async (
    user: UserDoc,
    targetMediaListIds: Types.ObjectId[]
): Promise<MediaListDoc[]> => {
    const notOwnedMediaLists = targetMediaListIds.filter(
        (targetId) => !user.lists.some((ownedId) => ownedId.equals(targetId))
    );

    if (notOwnedMediaLists.length > 0) {
        throw new AppError(
            `User does not own the following list ID(s): ${notOwnedMediaLists.join(', ')}.`,
            StatusCodes.FORBIDDEN
        );
    }

    const mediaLists = await MediaListModel.find({
        _id: { $in: targetMediaListIds },
    });

    const missingMediaLists = targetMediaListIds.filter(
        (id) => !mediaLists.some((list) => list._id.equals(id))
    );

    if (missingMediaLists.length > 0) {
        throw new AppError(
            `The following media list ID(s) were not found: ${missingMediaLists.join(', ')}.`,
            StatusCodes.NOT_FOUND
        );
    }

    user.lists = user.lists.filter(
        (ownedId) => !targetMediaListIds.some((targetId) => targetId.equals(ownedId))
    );
    await user.save();

    await MediaListModel.deleteMany({
        _id: { $in: targetMediaListIds },
    });

    return mediaLists;
};

export const addMediaItemsToMediaList = async (
    user: UserDoc,
    mediaListId: Types.ObjectId,
    mediaItemIds: Types.ObjectId[]
): Promise<MediaListDoc> => {
    ensureUserOwnsMediaList(user, mediaListId);

    const mediaList = await MediaListModel.findById(mediaListId);
    if (!mediaList) {
        throw new AppError(`Media list ${mediaListId} not found.`, StatusCodes.NOT_FOUND);
    }

    await validateMediaItemsForList(user, mediaItemIds, mediaList.mediaType);

    const newItemsToAdd = mediaItemIds.filter(
        (id) => !mediaList.items.some((existingId) => existingId.equals(id))
    );

    if (newItemsToAdd.length > 0) {
        mediaList.items.push(...newItemsToAdd);
        await mediaList.save();
    }

    await mediaList.populate('items');
    return mediaList as MediaListDoc;
};

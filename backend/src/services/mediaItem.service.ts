import { Types } from 'mongoose';
import { MEDIA_TYPES, MediaItemModel } from '../models/mediaItem.model';
import User from '../models/user.model';

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
    if (!validIds.length) return { deletedIds: [], notDeletedIds: mediaItemIds };

    const user = await User.findOne({ googleId }, { mediaItems: 1 }).lean();
    if (!user?.mediaItems?.length) return { deletedIds: [], notDeletedIds: mediaItemIds };

    const userMediaSet = new Set(user.mediaItems.map((id) => id.toString()));
    const confirmedIds = validIds.filter((id) => userMediaSet.has(id));

    if (!confirmedIds.length) return { deletedIds: [], notDeletedIds: mediaItemIds };

    await Promise.all([
        MediaItemModel.deleteMany({ _id: { $in: confirmedIds } }),
        User.updateOne({ googleId }, { $pull: { mediaItems: { $in: confirmedIds } } })
    ]);

    return {
        deletedIds: confirmedIds,
        notDeletedIds: mediaItemIds.filter((id) => !confirmedIds.includes(id)),
    };
};

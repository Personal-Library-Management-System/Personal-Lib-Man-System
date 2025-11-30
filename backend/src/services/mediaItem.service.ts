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

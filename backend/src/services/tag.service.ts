import { Types } from 'mongoose';
import { TagModel, TagDoc } from '../models/tag.model';
import { MediaItemModel } from '../models/mediaItem.model';
import { AppError } from '../utils/appError';
import { StatusCodes } from 'http-status-codes';
import User from '../models/user.model';

const getUserIdFromGoogleId = async (googleId: string): Promise<Types.ObjectId> => {
    const user = await User.findOne({ googleId });
    if (!user) {
        throw new AppError('User not found.', StatusCodes.NOT_FOUND);
    }
    return user._id as Types.ObjectId;
};

export const getUserTags = async (googleId: string): Promise<TagDoc[]> => {
    const user = await getUserIdFromGoogleId(googleId);
    return await TagModel.find({ userId: user }).sort({ name: 1 });
};

export const createTagForUser = async (
    googleId: string,
    payload: { name: string; color?: string }
): Promise<TagDoc> => {
    try {
        const userId = await getUserIdFromGoogleId(googleId);
        const newTag = await TagModel.create({
            ...payload,
            userId,
        });
        return newTag;
    } catch (error: any) {
        // Duplicate key error (E11000) check
        if (error.code === 11000) {
            throw new AppError('A tag with this name already exists.', StatusCodes.CONFLICT);
        }
        throw error;
    }
};

export const updateTag = async (
    googleId: string,
    tagId: string,
    payload: { name?: string; color?: string }
): Promise<TagDoc> => {
    if (!Types.ObjectId.isValid(tagId)) {
        throw new AppError('Invalid tag ID.', StatusCodes.BAD_REQUEST);
    }

    const userId = await getUserIdFromGoogleId(googleId);

    try {
        const updatedTag = await TagModel.findOneAndUpdate(
            { _id: tagId, userId },
            { $set: payload },
            { new: true, runValidators: true }
        );

        if (!updatedTag) {
            throw new AppError('Tag not found or access denied.', StatusCodes.NOT_FOUND);
        }

        return updatedTag;

    } catch (error: any) {
        if (error.code === 11000) {
            throw new AppError('A tag with this name already exists.', StatusCodes.CONFLICT);
        }
        throw error;
    }
};

export const deleteTag = async (googleId: string, tagId: string): Promise<void> => {
    if (!Types.ObjectId.isValid(tagId)) {
        throw new AppError('Invalid tag ID.', StatusCodes.BAD_REQUEST);
    }
    const userId = await getUserIdFromGoogleId(googleId);

    const deletedTag = await TagModel.findOneAndDelete({ _id: tagId, userId });

    if (!deletedTag) {
        throw new AppError('Tag not found or access denied.', StatusCodes.NOT_FOUND);
    }

    await MediaItemModel.updateMany(
        { tags: tagId },
        { $pull: { tags: tagId } }
    );
};


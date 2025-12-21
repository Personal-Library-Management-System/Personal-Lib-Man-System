import { UserDoc, IPopulatedUser } from '../models/user.model';
import User from '../models/user.model';
import { MediaListModel } from '../models/mediaList.model';
import { MediaItemModel } from '../models/mediaItem.model';
import { AppError } from '../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { ILibraryImportData } from '../types/library.types';
import { Types } from 'mongoose';

export const getLibraryDataOfUser = async (user: UserDoc): Promise<IPopulatedUser> => {
    const populatedUser = (await User.findById(user._id)
        .select('-__v')
        .populate({
            path: 'mediaItems',
            model: MediaItemModel,
            select: '-__v',
        })
        .populate({
            path: 'lists',
            model: MediaListModel,
            select: '-ownerId -__v',
        })
        .lean()) as IPopulatedUser | null;

    if (!populatedUser) {
        throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    return populatedUser;
};

export const importLibraryDataToUser = async (
    user: UserDoc,
    libraryData: ILibraryImportData
): Promise<IPopulatedUser> => {
    const { mediaItems, lists } = libraryData;

    const oldNewMediaItemObjectIdMap = new Map<Types.ObjectId, Types.ObjectId>();
    const existingMediaItems = await MediaItemModel.find({ _id: { $in: user.mediaItems } });
    for (const mediaItem of mediaItems) {
        const existingMediaItem = existingMediaItems.find(
            (item) => item.title.trim().toLowerCase() === mediaItem.title.trim().toLowerCase()
        );

        if (existingMediaItem) {
            oldNewMediaItemObjectIdMap.set(mediaItem._id, existingMediaItem._id);
            const { lists, _id, ...updateData } = mediaItem;
            await MediaItemModel.findByIdAndUpdate(
                existingMediaItem._id,
                { $set: updateData },
                { new: true, runValidators: true }
            );
        } else {
            const { _id, ...createData } = mediaItem;
            const newMediaItem = await MediaItemModel.create({ ...createData, lists: [] });
            oldNewMediaItemObjectIdMap.set(mediaItem._id, newMediaItem._id);
            user.mediaItems.push(newMediaItem._id);
        }
    }

    for (const list of lists) {
        list.items = list.items.map((oldId) => {
            const updatedId = oldNewMediaItemObjectIdMap.get(oldId);
            return updatedId ?? oldId;
        });
    }

    const oldNewMediaListObjectIdMap = new Map<Types.ObjectId, Types.ObjectId>();
    const existingLists = await MediaListModel.find({ _id: { $in: user.lists } });
    for (const list of lists) {
        const existingList = existingLists.find(
            (l) => l.title.trim().toLowerCase() === list.title.trim().toLowerCase()
        );
        if (existingList) {
            oldNewMediaListObjectIdMap.set(list._id, existingList._id);
            const combinedItems = [...existingList.items, ...list.items];
            const uniqueItemIds = Array.from(new Set(combinedItems.map((id) => id.toString()))).map(
                (id) => new Types.ObjectId(id)
            );

            const { items, _id, ...updateData } = list;
            await MediaListModel.findByIdAndUpdate(
                existingList._id,
                { $set: { ...updateData, items: uniqueItemIds } },
                { new: true, runValidators: true }
            );
        } else {
            const { _id, ...createData } = list;
            const newList = await MediaListModel.create({ ...createData, ownerId: user._id });
            oldNewMediaListObjectIdMap.set(list._id, newList._id);
            user.lists.push(newList._id);
        }
    }

    for (const mediaItem of mediaItems) {
        const updatedMediaItemId = oldNewMediaItemObjectIdMap.get(mediaItem._id);
        
        if (!updatedMediaItemId) continue;

        const newResolvedListIds = mediaItem.lists
            .map((oldListId) => oldNewMediaListObjectIdMap.get(oldListId))
            .filter((id): id is Types.ObjectId => id !== undefined);

        if (newResolvedListIds.length > 0) {
            await MediaItemModel.findByIdAndUpdate(
                updatedMediaItemId,
                { 
                    $addToSet: { lists: { $each: newResolvedListIds } } 
                },
                { runValidators: true }
            );
        }
    }

    await user.save();
    return await getLibraryDataOfUser(user);
};

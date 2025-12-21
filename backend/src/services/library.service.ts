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

    const oldNewMediaItemMap = new Map<string, Types.ObjectId>();
    const existingMediaItems = await MediaItemModel.find({ _id: { $in: user.mediaItems } });

    for (const mediaItem of mediaItems) {
        const existingMediaItem = existingMediaItems.find(
            (item) => item.title.trim().toLowerCase() === mediaItem.title.trim().toLowerCase()
        );

        if (existingMediaItem) {
            oldNewMediaItemMap.set(mediaItem._id.toString(), existingMediaItem._id);
            const { lists: _, _id, ...updateData } = mediaItem;
            await MediaItemModel.findByIdAndUpdate(
                existingMediaItem._id,
                { $set: updateData },
                { runValidators: true }
            );
        } else {
            const { _id, ...createData } = mediaItem;
            const newMediaItem = await MediaItemModel.create({ ...createData, lists: [] });
            oldNewMediaItemMap.set(mediaItem._id.toString(), newMediaItem._id);
            user.mediaItems.push(newMediaItem._id);
        }
    }

    for (const list of lists) {
        list.items = list.items.map((oldId) => {
            const updatedId = oldNewMediaItemMap.get(oldId.toString());
            return updatedId ?? oldId;
        });
    }

    const oldNewMediaListMap = new Map<string, Types.ObjectId>();
    const existingLists = await MediaListModel.find({ _id: { $in: user.lists } });

    for (const list of lists) {
        const existingList = existingLists.find(
            (l) => l.title.trim().toLowerCase() === list.title.trim().toLowerCase()
        );

        if (existingList) {
            oldNewMediaListMap.set(list._id.toString(), existingList._id);
            
            const combinedItems = [...existingList.items, ...list.items].map(id => id.toString());
            const uniqueItemIds = Array.from(new Set(combinedItems)).map(id => new Types.ObjectId(id));

            const { items, _id, ...updateData } = list;
            await MediaListModel.findByIdAndUpdate(
                existingList._id,
                { $set: { ...updateData, items: uniqueItemIds } },
                { runValidators: true }
            );
        } else {
            const { _id, ...createData } = list;
            const newList = await MediaListModel.create({ ...createData, ownerId: user._id });
            oldNewMediaListMap.set(list._id.toString(), newList._id);
            user.lists.push(newList._id);
        }
    }

    for (const mediaItem of mediaItems) {
        const updatedMediaItemId = oldNewMediaItemMap.get(mediaItem._id.toString());
        if (!updatedMediaItemId) continue;

        const newResolvedListIds = mediaItem.lists
            .map((oldListId) => oldNewMediaListMap.get(oldListId.toString()))
            .filter((id): id is Types.ObjectId => id !== undefined);

        if (newResolvedListIds.length > 0) {
            await MediaItemModel.findByIdAndUpdate(
                updatedMediaItemId,
                { $addToSet: { lists: { $each: newResolvedListIds } } },
                { runValidators: true }
            );
        }
    }

    await user.save();
    return await getLibraryDataOfUser(user);
};
import { UserDoc, IPopulatedUser } from "../models/user.model";
import User from "../models/user.model";
import { MediaListModel } from "../models/mediaList.model";
import { MediaItemModel } from "../models/mediaItem.model";
import { AppError } from "../utils/appError";
import { StatusCodes } from "http-status-codes";

export const getLibraryDataOfUser = async (user: UserDoc): Promise<IPopulatedUser> => {
    const populatedUser = await User.findById(user._id)
        .select('-__v')
        .populate({
            path: 'mediaItems',
            model: MediaItemModel,
            select: '-__v'
        })
        .populate({
            path: 'lists',
            model: MediaListModel,
            select: '-ownerId -__v'
        })
        .lean() as IPopulatedUser | null;

    if (!populatedUser) {
        throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    return populatedUser;
}

export const importLibraryDataToUser = async (user: UserDoc, libraryData: any): Promise<any> => {

}

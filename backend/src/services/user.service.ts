import { DEFAULT_MEDIA_LISTS, MediaListModel } from '../models/mediaList.model';
import { DEFAULT_TAGS,TagModel } from '../models/tag.model';
import User, { IUser } from '../models/user.model';
import { IGoogleUserPayload } from '../types/auth.types';

const getOrCreateUser = async (userPayload: IGoogleUserPayload): Promise<IUser> => {
    const googleSubId = userPayload.sub;

    let existingUser = await User.findOne({ googleId: googleSubId });
    if (existingUser) {
        return existingUser;
    }

    const newUser = await User.create({
        googleId: googleSubId,
        name: userPayload.name,
        email: userPayload.email,
        picture: userPayload.picture,
    });

    const createdLists = await MediaListModel.insertMany(
        DEFAULT_MEDIA_LISTS.map((defaultList) => ({
            title: defaultList.title,
            mediaType: defaultList.mediaType,
            ownerId: newUser._id,
        }))
    );

    await TagModel.insertMany(
        DEFAULT_TAGS.map((defaultTag) => ({
            name: defaultTag.name,
            color: defaultTag.color,
            userId: newUser._id,
        }))
    );

    newUser.lists = createdLists.map((list) => list._id);
    await newUser.save();
    return newUser;
};

const getUserByEmail = async (email: string): Promise<IUser | null> => {
    const user = await User.findOne({ email: email });
    return user;
};

const userService = {
    getOrCreateUser,
    getUserByEmail,
};

export default userService;

import User, { IUser } from "../models/user.model";
import { IGoogleUserPayload } from "../types/auth.types";

const getOrCreateUser = async (
    userPayload: IGoogleUserPayload
): Promise<IUser> => {
    const googleSubId = userPayload.sub;

    let user = await User.findOne({ googleId: googleSubId });
    if (!user) {
        user = await User.create({
            googleId: googleSubId,
            name: userPayload.name,
            email: userPayload.email,
            picture: userPayload.picture,
        });
    }
    return user;
};

const getUserByEmail = async (email: string): Promise<IUser | null> => {
    const user = await User.findOne({ email: email });
    return user;
};

const userService ={
    getOrCreateUser,
    getUserByEmail,
};

export default userService;

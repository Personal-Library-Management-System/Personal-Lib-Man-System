import { Schema, model, Document, Types, HydratedDocument } from 'mongoose';
import { MediaItem } from './mediaItem.model';
import { MediaList } from './mediaList.model';

export interface IUser extends Document {
    googleId: string;
    name: string;
    email: string;
    picture?: string | null;
    mediaItems: Types.ObjectId[];
    lists: Types.ObjectId[];
}
export type UserDoc = HydratedDocument<IUser>;

export interface IPopulatedUser extends Omit<IUser, 'mediaItems' | 'lists'> {
    mediaItems: MediaItem[];
    lists: Omit<MediaList, 'ownerId'>[];
}

const UserSchema = new Schema<IUser>(
    {
        googleId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        picture: { type: String, default: null },
        mediaItems: {
            type: [{ type: Schema.Types.ObjectId, ref: 'MediaItem' }],
            default: [],
        },
        lists: {
            type: [{ type: Schema.Types.ObjectId, ref: 'MediaList' }],
            default: [],
        },
    },
    { timestamps: true }
);

const User = model<IUser>('User', UserSchema);

export default User;

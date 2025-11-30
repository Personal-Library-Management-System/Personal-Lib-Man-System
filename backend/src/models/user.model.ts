import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
    googleId: string;
    name: string;
    email: string;
    picture?: string | null;
    mediaItems: Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
    {
        googleId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        picture: { type: String, default: null },
        mediaItems: [
            {
                type: Schema.Types.ObjectId,
                ref: 'MediaItem',
            },
        ],
    },
    { timestamps: true }
);

const User = model<IUser>('User', UserSchema);

export default User;

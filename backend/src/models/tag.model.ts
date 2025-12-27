import { Schema, model, Model, HydratedDocument, Types } from 'mongoose';
import { HEX_COLOR_REGEX } from '../utils/constants';

export interface Tag {
    userId: Types.ObjectId;
    name: string;
    color?: string; 
    createdAt?: Date;
    updatedAt?: Date;
}

export type TagDoc = HydratedDocument<Tag>;
export interface TagModelType extends Model<Tag> {}

export const DEFAULT_TAGS: Array<Pick<Tag, 'name' | 'color'>> = [
    { name: 'Favorites', color: '#FF0000' },       // Kırmızı
    { name: 'Highly Recommended', color: '#00FF00' }, // Yeşil
    { name: 'Did Not Finish', color: '#000000' },     // Siyah
    { name: 'Wishlist', color: '#0000FF' }           // Mavi
];

const tagSchema = new Schema<Tag, TagModelType>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true, 
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        color: {
            type: String,
            trim: true,
            default: '#FFFFFF',
            set: (value: string) => value?.toUpperCase(),
            validate: {
                validator: (value: string) => HEX_COLOR_REGEX.test(value),
                message: (props: any) =>
                    `"${props.value}" is not a valid hex color (expected #RGB or #RRGGBB).`,
            },
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

tagSchema.index(
    { userId: 1, name: 1 },
    {
        unique: true,
        collation: { locale: 'en', strength: 2 },
    }
);

export const TagModel = model<Tag, TagModelType>('Tag', tagSchema);
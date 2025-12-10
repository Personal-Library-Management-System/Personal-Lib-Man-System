import { Schema, model, HydratedDocument, Types } from 'mongoose';
import { MEDIA_TYPES, MediaType } from './mediaItem.model';

export interface MediaList {
    title: string;
    color: string;
    mediaType: MediaType;
    items: Types.ObjectId[];
}
export type MediaListDoc = HydratedDocument<MediaList>;

export const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const mediaListSchema = new Schema<MediaList>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        color: {
            type: String,
            trim: true,
            default: "#FFFFFF",
            set: (value: string) => value?.toUpperCase(),
            validate: {
                validator: (value: string) => HEX_COLOR_REGEX.test(value),
                message: (props: any) =>
                    `"${props.value}" is not a valid hex color (expected #RGB or #RRGGBB).`,
            },
        },
        mediaType: {
            type: String,
            required: true,
            enum: MEDIA_TYPES,
        },
        items: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'MediaItem',
                },
            ],
            default: [],
        },
    },
    {
        timestamps: true,
        strict: true,
    }
);

mediaListSchema.index({ mediaType: 1 });

export const MediaListModel = model<MediaList>('MediaList', mediaListSchema);

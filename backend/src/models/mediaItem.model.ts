import { Schema, model, Model, HydratedDocument } from 'mongoose';

export const MEDIA_TYPES = ['Book', 'Movie'] as const;
export type MediaType = typeof MEDIA_TYPES[number];

export interface MediaItem {
    title: string;
    publishedDate?: Date | null;
    averageRating?: number | null;
    ratingCount?: number | null;
    categories: string[];
    description?: string | null;
    coverPhoto?: string | null;
    language?: string | null;
    author?: string | null;
    mediaType: MediaType;
}

export type MediaItemDoc = HydratedDocument<MediaItem>;
export interface MediaItemModel extends Model<MediaItem> {}

const mediaItemSchema = new Schema<MediaItem, MediaItemModel>(
    {
        title: { type: String, required: true, trim: true },
        publishedDate: { type: Date },
        averageRating: { type: Number, min: 0, max: 5 },
        ratingCount: { type: Number, min: 0 },
        categories: [{ type: String, trim: true }],
        description: { type: String },
        coverPhoto: { type: String },
        language: {
            type: String,
            trim: true,
            set: (value: string) => value?.toUpperCase(),
        },
        author: { type: String, trim: true },
        mediaType: {
            type: String,
            required: true,
            enum: MEDIA_TYPES,
        },
    },
    { discriminatorKey: 'mediaType' }
);

mediaItemSchema.index({ mediaType: 1 });

export const MediaItemModel = model<MediaItem, MediaItemModel>(
    'MediaItem',
    mediaItemSchema
);

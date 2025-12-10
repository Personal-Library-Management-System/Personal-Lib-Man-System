import { Schema, model, HydratedDocument, Types } from 'mongoose';

export const MOVIE_SPECIFIC_FIELDS = ['actors', 'awards', 'runtime', 'director', 'imdbID'];
export const BOOK_SPECIFIC_FIELDS = ['ISBN', 'pageCount', 'publisher'];

export const MEDIA_TYPES = ['Book', 'Movie'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const ITEM_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const isValidMediaType = (value: any): value is MediaType =>
    MEDIA_TYPES.includes(value);

export interface Rating {
    source: string;
    value: string;
}

export interface MediaItem {
    title: string;
    publishedDate?: Date | null;
    ratings?: Rating[] | null;
    ratingCount?: number | null;
    categories: string[];
    description?: string | null;
    coverPhoto?: string | null;
    language?: string | null;
    author?: string | null;
    lists: Types.ObjectId[],
    status: ItemStatus;
    myRating?: number | null;
    progress?: number | null;
    personalNotes?: string | null;

    mediaType: MediaType;
}

export type MediaItemDoc = HydratedDocument<MediaItem>;

const mediaItemSchema = new Schema<MediaItem>(
    {
        title: { type: String, required: true, trim: true },
        publishedDate: { type: Date },
        ratings: {
            type: [
                {
                    _id: false,
                    source: { type: String, required: true, trim: true },
                    value: { type: String, required: true, trim: true },
                },
            ],
            default: null,
        },
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
        lists: {
            type: [Schema.Types.ObjectId],
            ref: 'MediaList',
            default: []
        },
        mediaType: {
            type: String,
            required: true,
            enum: MEDIA_TYPES,
        },
        myRating: { type: Number, min: 0, max: 5 },
        personalNotes: { type: String, trim: true ,default: ''},
        progress: { type: Number, min: 0 ,default: 0},
        status: {
            type: String,
            enum: ITEM_STATUSES,
            required: true,
            default: 'PLANNED',
        },
    },
    {
        discriminatorKey: 'mediaType',
        timestamps: true,
        strict: true
    }
);

mediaItemSchema.index({ mediaType: 1 });

export const MediaItemModel = model<MediaItem>(
    'MediaItem',
    mediaItemSchema
);

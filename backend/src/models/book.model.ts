import { HydratedDocument, InferSchemaType, Model, Schema } from 'mongoose';
import { MediaItem, MediaItemModel } from './mediaItem.model';

const bookSchema = new Schema(
    {
        ISBN: { type: String, trim: true },
        pageCount: { type: Number, min: 1 },
        publisher: { type: String, trim: true },
    },
    { _id: false }
);

export type Book = MediaItem & InferSchemaType<typeof bookSchema>;
export type BookDoc = HydratedDocument<Book>;

export const BookModel: Model<Book> = MediaItemModel.discriminator<Book>(
    'Book',
    bookSchema
);

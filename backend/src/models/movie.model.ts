import { Schema, Model, HydratedDocument } from "mongoose";
import { MediaItem, MediaItemModel } from "./mediaItem.model";

export interface Movie extends MediaItem {
    actors?: string[] | null;
    awards?: string | null;
    runtime?: number | null;
    director?: string | null;
    imdbID?: string | null;
}

export type MovieDoc = HydratedDocument<Movie>;
export interface MovieModelType extends Model<Movie> {}

const movieSchema = new Schema<Movie, MovieModelType>(
    {
        actors: [{ type: String, trim: true }],
        awards: { type: String },
        runtime: { type: Number, min: 0 },
        director: { type: String, trim: true },
        imdbID: { type: String, trim: true },
    },
    { _id: false }
);

export const MovieModel = MediaItemModel.discriminator<Movie, MovieModelType>(
    "Movie",
    movieSchema
);

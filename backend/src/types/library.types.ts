import { MediaItem } from '../models/mediaItem.model';
import { MediaList } from '../models/mediaList.model';
import { Types } from 'mongoose';

export interface ILibraryImportData {
    mediaItems: (MediaItem & { _id: Types.ObjectId })[];
    lists: (Omit<MediaList, 'ownerId'> & { _id: Types.ObjectId })[];
}


import { RequestHandler, Router } from 'express';
import {
    createMediaItem,
    deleteMediaItem,
    deleteMultipleMediaItems,
    getAllMediaItems,
    getMediaItem,
} from '../controllers/mediaItem.controller';

const mediaItemRouter = Router();

mediaItemRouter.post('/', createMediaItem as RequestHandler);
mediaItemRouter.delete('/:id', deleteMediaItem as RequestHandler);
mediaItemRouter.delete('/', deleteMultipleMediaItems as RequestHandler);
mediaItemRouter.get('/:id', getMediaItem as RequestHandler);
mediaItemRouter.get('/', getAllMediaItems as RequestHandler);

export default mediaItemRouter;

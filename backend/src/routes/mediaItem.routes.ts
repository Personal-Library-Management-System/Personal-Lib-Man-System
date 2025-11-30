import { RequestHandler, Router } from 'express';
import {
    createMediaItem,
    deleteMediaItem,
    deleteMultipleMediaItems,
} from '../controllers/mediaItem.controller';

const mediaItemRouter = Router();

mediaItemRouter.post('/', createMediaItem as RequestHandler);
mediaItemRouter.delete('/:id', deleteMediaItem as RequestHandler);
mediaItemRouter.delete('/', deleteMultipleMediaItems as RequestHandler);

export default mediaItemRouter;

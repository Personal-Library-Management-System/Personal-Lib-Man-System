import { RequestHandler, Router } from 'express';
import { createMediaItem, deleteMediaItem } from '../controllers/mediaItem.controller';

const mediaItemRouter = Router();

mediaItemRouter.post('/', createMediaItem as RequestHandler);
mediaItemRouter.delete('/:id', deleteMediaItem as RequestHandler);

export default mediaItemRouter;

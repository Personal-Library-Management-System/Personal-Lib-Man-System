import { RequestHandler, Router } from 'express';
import { createMediaItem } from '../controllers/mediaItem.controller';

const mediaItemRouter = Router();

mediaItemRouter.post('/', createMediaItem as RequestHandler);
mediaItemRouter.delete('/', );

export default mediaItemRouter;

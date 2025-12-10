import { RequestHandler, Router } from 'express';
import {
    addMediaItemsToList,
    createList,
    deleteMultipleLists,
    deleteSingleList,
    getAllLists,
    getListById,
    removeMediaItemsFromList,
    updateList,
} from '../controllers/mediaList.controller';

const mediaListRouter = Router();

mediaListRouter.post('/', createList as RequestHandler);
mediaListRouter.get('/', getAllLists as RequestHandler);
mediaListRouter.get('/:id', getListById as RequestHandler);
mediaListRouter.delete('/:id', deleteSingleList as RequestHandler);
mediaListRouter.delete('/', deleteMultipleLists as RequestHandler);
mediaListRouter.patch('/:id', updateList as RequestHandler);

mediaListRouter.post('/:id/items', addMediaItemsToList as RequestHandler);
mediaListRouter.delete('/:id/items', removeMediaItemsFromList as RequestHandler);

export default mediaListRouter;

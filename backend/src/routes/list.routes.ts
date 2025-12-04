import { RequestHandler, Router } from 'express';
import {
    createList,
    deleteMultipleLists,
    deleteSingleList,
    getAllLists,
    getListById,
    updateList,
} from '../controllers/list.controller';

const listRouter = Router();

listRouter.post('/', createList as RequestHandler);
listRouter.get('/', getAllLists as RequestHandler);
listRouter.get('/:id', getListById as RequestHandler);
listRouter.delete('/:id', deleteSingleList as RequestHandler);
listRouter.delete('/', deleteMultipleLists as RequestHandler);
listRouter.patch('/:id', updateList as RequestHandler);

export default listRouter;

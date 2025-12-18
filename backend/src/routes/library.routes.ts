import { RequestHandler, Router } from "express";
import { exportLibrary, importLibrary } from "../controllers/library.controller";

const libraryRouter = Router();

libraryRouter.get('/export', exportLibrary as RequestHandler);
libraryRouter.post('/import', importLibrary as RequestHandler);

export default libraryRouter;

import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { handleControllerError } from '../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { getLibraryDataOfUser, importLibraryDataToUser } from '../services/library.service';

export const exportLibrary = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try{
        const userDoc = req.userDoc;
        const userLibrary = await getLibraryDataOfUser(userDoc);
        return res.status(StatusCodes.OK).json({
            message: "Library data exported successfully",
            library: userLibrary
        });
    }catch(err)  {
        return handleControllerError(res, err);
    }
};

export const importLibrary = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try{
        const userDoc = req.userDoc;
        const libraryData = req.body;

        const updatedUserLibrary = await importLibraryDataToUser(userDoc, libraryData);
        return res.status(StatusCodes.OK).json({
            message: "",
            library: updatedUserLibrary
        });
    } catch(err) {
        return handleControllerError(res, err);
    }
};

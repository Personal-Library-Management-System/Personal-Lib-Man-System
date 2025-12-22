import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { handleControllerError } from '../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { getLibraryDataOfUser, importLibraryDataToUser } from '../services/library.service';
import { validateLibraryData } from '../validators/library.validator';

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

        const validationErrors = validateLibraryData(libraryData);
        if (validationErrors) {
            return res.status(StatusCodes.BAD_REQUEST).json({ errors: validationErrors });
        }

        const updatedUserLibrary = await importLibraryDataToUser(userDoc, libraryData);
        return res.status(StatusCodes.OK).json({
            message: "Library data imported successfully.",
            updaedUser: updatedUserLibrary
        });
    } catch(err) {
        return handleControllerError(res, err);
    }
};

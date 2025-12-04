import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../types/express";
import { Response } from "express";


export const createList = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "not implemented yet" });
};

export const getAllLists = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "not implemented yet" });

};

export const getListById = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "not implemented yet" });

};

export const deleteSingleList = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "not implemented yet" });

};

export const deleteMultipleLists = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "not implemented yet" });

};

export const updateList = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "not implemented yet" });

};

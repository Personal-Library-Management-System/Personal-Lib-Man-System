// src/controllers/tag.controller.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express'; 
import { StatusCodes } from 'http-status-codes';
import { handleControllerError } from '../utils/appError';
import * as TagService from '../services/tag.service';

export const getTags = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const googleId = req.user.id;
        const tags = await TagService.getUserTags(googleId);
        return res.status(StatusCodes.OK).json(tags);
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const createTag = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const googleId = req.user.id;
        const newTag = await TagService.createTagForUser(googleId, req.body);
        return res.status(StatusCodes.CREATED).json(newTag);
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const updateTag = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const googleId = req.user.id;
        const tagId = req.params.id;
        const updatedTag = await TagService.updateTag(googleId, tagId, req.body);
        return res.status(StatusCodes.OK).json(updatedTag);
    } catch (err) {
        return handleControllerError(res, err);
    }
};

export const deleteTag = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const googleId = req.user.id;
        const tagId = req.params.id;
        await TagService.deleteTag(googleId, tagId);
        return res.status(StatusCodes.OK).json({ message: 'Tag deleted successfully.' });
    } catch (err) {
        return handleControllerError(res, err);
    }
};


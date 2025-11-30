import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { MEDIA_TYPES, MediaItemModel } from "../models/mediaItem.model";
import User from "../models/user.model";
import { StatusCodes } from "http-status-codes";

const createMediaItem = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const googleId = req.user.id;
        const payload = req.body;

        if (!payload.mediaType || !MEDIA_TYPES.includes(payload.mediaType)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: "Invalid or missing 'mediaType'."
            });
        }

        const newItem = await MediaItemModel.create(payload);

        await User.findOneAndUpdate(
            { googleId: googleId },
            { $push: { items: newItem._id } },
            { new: true }
        );

        return res.status(StatusCodes.CREATED).json({
            message: "Media item created successfully",
            item: newItem
        });

    } catch (error: any) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: "Validation Error",
                details: messages
            });
        }

        console.error("Error creating media item:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error"
        });
    }
}

export { createMediaItem };

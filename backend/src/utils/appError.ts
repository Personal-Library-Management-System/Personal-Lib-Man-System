import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
    readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export const handleControllerError = (
    res: Response,
    err: unknown
): Response => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }

    console.error('Unhandled error:', err);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
    });
};

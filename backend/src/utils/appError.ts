import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Error as MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";

export class AppError extends Error {
    readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export const handleControllerError = (res: Response, err: unknown): Response => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }

    if (err instanceof MongooseError.ValidationError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: "Validation failed.",
            details: Object.values(err.errors).map(e => e.message),
        });
    }

    if (err instanceof MongooseError.CastError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: `Invalid value for field "${err.path}".`,
            details: err.message,
        });
    }

    if (err instanceof MongoServerError && err.code === 11000) {
        return res.status(StatusCodes.CONFLICT).json({
            error: "Duplicate key error.",
            details: err.keyValue,
        });
    }

    console.error("Unhandled error:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Internal Server Error",
    });
};

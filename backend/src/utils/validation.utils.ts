import { Types } from 'mongoose';
import { AppError } from '../utils/appError';
import { StatusCodes } from 'http-status-codes';

export const validateAndConvertObjectId = (value: unknown, fieldName: string) => {
    if(typeof value !== "string" || !Types.ObjectId.isValid(value)) {
        throw new AppError(`${fieldName} ID ${value} is invalid.`, StatusCodes.BAD_REQUEST);
    }
    return new Types.ObjectId(value);
}

export const validateAndConvertObjectIdArray = (
    value: unknown,
    fieldName: string
): Types.ObjectId[] => {
    if (!Array.isArray(value) || value.length === 0) {
        throw new AppError(
            `${fieldName} must be a non-empty array of IDs.`,
            StatusCodes.BAD_REQUEST
        );
    }

    const invalid = value.filter((id) => typeof id !== 'string' || !Types.ObjectId.isValid(id));

    if (invalid.length > 0) {
        throw new AppError(
            `The following values in '${fieldName}' are not valid IDs: ${invalid.join(', ')}`,
            StatusCodes.BAD_REQUEST
        );
    }

    return (value as string[]).map((id) => new Types.ObjectId(id));
};

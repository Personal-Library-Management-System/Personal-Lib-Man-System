import { isValidMediaType } from '../models/mediaItem.model';
import { Types } from 'mongoose';
import { HEX_COLOR_REGEX } from '../models/mediaList.model';

export const validateCreateListPayload = (payload: any): string[] | null => {
    const errors: string[] = [];

    if (typeof payload.title !== 'string' || !payload.title.trim()) {
        errors.push('Title of the list must be a non-empty string.');
    }

    if (payload.color != null && !HEX_COLOR_REGEX.test(String(payload.color))) {
        errors.push(
            `Invalid color "${payload.color}". Expected hex format: #FFF or #FFFFFF.`
        );
    }

    if (!isValidMediaType(payload.mediaType)) {
        errors.push('Media type of the list is not allowed.');
    }

    if (payload.items !== undefined) {
        if (!Array.isArray(payload.items)) {
            errors.push('Media item list must be an array.');
        } else {
            const invalidIds = payload.items.filter(
                (id: any) => !Types.ObjectId.isValid(id)
            );

            if (invalidIds.length > 0) {
                errors.push(
                    `Invalid media item ID(s): ${invalidIds.join(', ')}`
                );
            }
        }
    }
    return errors.length > 0 ? errors : null;
};

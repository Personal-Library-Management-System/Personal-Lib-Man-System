import { Types } from 'mongoose';
import { isValidMediaType, ITEM_STATUSES, ItemStatus, MediaType } from '../models/mediaItem.model';
import { HEX_COLOR_REGEX } from '../models/mediaList.model';

const isValidStringField = (value: any): boolean => {
    return typeof value === 'string' && value.trim() !== '';
};

const isValidOptionalString = (value: any): boolean => {
    return typeof value === 'string';
};

const isValidHexColor = (value: any): boolean => {
    return typeof value === 'string' && HEX_COLOR_REGEX.test(value);
};
const isValidURL = (value: any): boolean => {
    return typeof value === 'string' && /^https?:\/\/.+$/.test(value);
};

const isValidObjectIdArray = (value: any): boolean => {
    return (
        Array.isArray(value) &&
        value.every(
            (id: any) =>
                (typeof id === 'string' && Types.ObjectId.isValid(id)) ||
                id instanceof Types.ObjectId
        )
    );
};

const isValidRating = (value: any): boolean => {
    return isValidNumber(value) && value >= 0 && value <= 5;
};

const isValidPositiveNumber = (value: any): boolean => {
    return isValidNumber(value) && value > 0;
};

const isValidNonNegativeNumber = (value: any): boolean => {
    return isValidNumber(value) && value >= 0;
};

const isValidNumber = (value: any): boolean => {
    return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value);
};

const isValidDate = (value: any): boolean => {
    if (value instanceof Date) return !isNaN(value.getTime());
    if (typeof value === 'string') {
        const date = new Date(value);
        return !isNaN(date.getTime());
    }
    return false;
};

const isValidRatingArray = (value: any): boolean => {
    return (
        Array.isArray(value) &&
        value.every(
            (rating: any) =>
                typeof rating === 'object' &&
                rating !== null &&
                typeof rating.source === 'string' &&
                rating.source.trim() !== '' &&
                typeof rating.value === 'string' &&
                rating.value.trim() !== ''
        )
    );
};

const isValidItemStatus = (value: any): boolean => {
    return typeof value === 'string' && ITEM_STATUSES.includes(value as ItemStatus);
};

const isValidStringArray = (value: any): boolean => {
    return Array.isArray(value) && value.every((item: any) => isValidStringField(item));
};

const validateMediaItemFields = (mediaItem: any, index: number): string[] => {
    const errors: string[] = [];

    if (!isValidStringField(mediaItem.title)) {
        errors.push(`Media item at index ${index} has an invalid title.`);
    }
    if (mediaItem.author && !isValidOptionalString(mediaItem.author)) {
        errors.push(`Media item at index ${index} has an invalid author.`);
    }
    if (mediaItem.coverPhoto && !isValidURL(mediaItem.coverPhoto)) {
        errors.push(`Media item at index ${index} has an invalid cover photo.`);
    }
    if (mediaItem.description && !isValidOptionalString(mediaItem.description)) {
        errors.push(`Media item at index ${index} has an invalid description.`);
    }
    if (mediaItem.language && !isValidOptionalString(mediaItem.language)) {
        errors.push(`Media item at index ${index} has an invalid language.`);
    }
    if (!Array.isArray(mediaItem.categories)) {
        errors.push(`Media item at index ${index} has invalid categories - must be an array.`);
    } else if (
        mediaItem.categories.length > 0 &&
        !mediaItem.categories.every((cat: any) => typeof cat === 'string')
    ) {
        errors.push(
            `Media item at index ${index} has invalid categories - all items must be strings.`
        );
    }
    if (mediaItem.tags && !isValidObjectIdArray(mediaItem.tags)) {
        errors.push(`Media item at index ${index} has invalid tags.`);
    }
    if (!isValidObjectIdArray(mediaItem.lists)) {
        errors.push(`Media item at index ${index} has invalid lists.`);
    }
    if (!isValidMediaType(mediaItem.mediaType)) {
        errors.push(`Media item at index ${index} has an invalid media type.`);
    }
    if (mediaItem.myRating && !isValidRating(mediaItem.myRating)) {
        errors.push(`Media item at index ${index} has an invalid my rating.`);
    }
    if (mediaItem.personalNotes !== undefined && !isValidOptionalString(mediaItem.personalNotes)) {
        errors.push(`Media item at index ${index} has invalid personal notes.`);
    }
    if (mediaItem.progress !== undefined && !isValidNonNegativeNumber(mediaItem.progress)) {
        errors.push(`Media item at index ${index} has an invalid progress.`);
    }
    if (mediaItem.publishedDate && !isValidDate(mediaItem.publishedDate)) {
        errors.push(`Media item at index ${index} has an invalid published date.`);
    }
    if (mediaItem.ratingCount && !isValidNonNegativeNumber(mediaItem.ratingCount)) {
        errors.push(`Media item at index ${index} has an invalid rating count.`);
    }
    if (mediaItem.ratings && !isValidRatingArray(mediaItem.ratings)) {
        errors.push(`Media item at index ${index} has an invalid ratings.`);
    }
    if (!isValidItemStatus(mediaItem.status)) {
        errors.push(`Media item at index ${index} has an invalid status.`);
    }
    return errors;
};

const validateBookFields = (mediaItem: any, index: number): string[] => {
    const errors: string[] = [];

    if (mediaItem.ISBN && !isValidStringField(mediaItem.ISBN)) {
        errors.push(`Media item at index ${index} has an invalid ISBN.`);
    }
    if (mediaItem.pageCount && !isValidPositiveNumber(mediaItem.pageCount)) {
        errors.push(`Media item at index ${index} has an invalid page count.`);
    }
    if (mediaItem.publisher && !isValidOptionalString(mediaItem.publisher)) {
        errors.push(`Media item at index ${index} has an invalid publisher.`);
    }
    return errors;
};
const validateMovieFields = (mediaItem: any, index: number): string[] => {
    const errors: string[] = [];
    if (mediaItem.actors && !isValidStringArray(mediaItem.actors)) {
        errors.push(`Media item at index ${index} has invalid actors.`);
    }
    if (mediaItem.awards && !isValidOptionalString(mediaItem.awards)) {
        errors.push(`Media item at index ${index} has invalid awards.`);
    }
    if (mediaItem.runtime !== undefined && !isValidNonNegativeNumber(mediaItem.runtime)) {
        errors.push(`Media item at index ${index} has an invalid runtime.`);
    }
    if (mediaItem.director && !isValidOptionalString(mediaItem.director)) {
        errors.push(`Media item at index ${index} has invalid director.`);
    }
    if (mediaItem.imdbID && !isValidOptionalString(mediaItem.imdbID)) {
        errors.push(`Media item at index ${index} has invalid imdbID.`);
    }
    return errors;
};

const mediaTypeValidators = {
    Book: validateBookFields,
    Movie: validateMovieFields,
};

const validateMediaItem = (mediaItem: any, index: number): string[] => {
    const errors: string[] = [];

    if (!mediaItem || typeof mediaItem !== 'object') {
        errors.push(`Media item at index ${index} is not an object.`);
    } else {
        const itemErrors = validateMediaItemFields(mediaItem, index);
        errors.push(...itemErrors);
        if (mediaItem.mediaType && isValidMediaType(mediaItem.mediaType)) {
            const mediaTypeSpecificErrors = mediaTypeValidators[mediaItem.mediaType as MediaType](
                mediaItem,
                index
            );
            errors.push(...mediaTypeSpecificErrors);
        }
    }
    return errors;
};

const validateList = (list: any, index: number): string[] => {
    const errors: string[] = [];

    if(!list || typeof list !== 'object') {
        errors.push(`List at index ${index} is not an object.`);
        return errors;
    }

    if (!isValidStringField(list.title)) {
        errors.push(`List at index ${index} has an invalid title.`);
    }
    if (!isValidHexColor(list.color)) {
        errors.push(`List at index ${index} has an invalid color.`);
    }
    if (!isValidMediaType(list.mediaType)) {
        errors.push(`List at index ${index} has an invalid media type.`);
    }
    if (!isValidObjectIdArray(list.items)) {
        errors.push(`List at index ${index} has invalid items.`);
    }

    return errors;
};

const validateMediaItemListReferences = (data: any): string[] => {
    const errors: string[] = [];

    const listIds = new Set<string>();
    if (Array.isArray(data.lists)) {
        data.lists.forEach((list: any) => {
            if (list && list._id) {
                listIds.add(list._id.toString());
            }
        });
    }

    if (Array.isArray(data.mediaItems)) {
        data.mediaItems.forEach((mediaItem: any, itemIndex: number) => {
            if (mediaItem && Array.isArray(mediaItem.lists)) {
                mediaItem.lists.forEach((listId: any, listRefIndex: number) => {
                    const idString = listId.toString();
                    if (!listIds.has(idString)) {
                        errors.push(
                            `Media item at index ${itemIndex} contains list reference at index ${listRefIndex} (${idString}) that does not exist in lists array.`
                        );
                    }
                });
            }
        });
    }

    return errors;
};

const validateListItemReferences = (data: any): string[] => {
    const errors: string[] = [];

    const mediaItemMap = new Map<string, { mediaType: string }>();
    if (Array.isArray(data.mediaItems)) {
        data.mediaItems.forEach((item: any) => {
            if (item && item._id) {
                mediaItemMap.set(item._id.toString(), {
                    mediaType: item.mediaType
                });
            }
        });
    }

    if (Array.isArray(data.lists)) {
        data.lists.forEach((list: any, listIndex: number) => {
            if (list && Array.isArray(list.items)) {
                list.items.forEach((itemId: any, itemIndex: number) => {
                    const idString = itemId.toString();
                    const mediaItem = mediaItemMap.get(idString);
                    
                    if (!mediaItem) {
                        errors.push(
                            `List at index ${listIndex} contains item reference at index ${itemIndex} (${idString}) that does not exist in mediaItems array.`
                        );
                    } else if (mediaItem.mediaType !== list.mediaType) {
                        errors.push(
                            `List at index ${listIndex} (mediaType: ${list.mediaType}) contains item at index ${itemIndex} with mismatched mediaType: ${mediaItem.mediaType}.`
                        );
                    }
                });
            }
        });
    }

    return errors;
};

export const validateLibraryData = (data: any): string[] | null => {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
        errors.push('Library data must be an object.');
        return errors;
    }

    if (!Array.isArray(data.mediaItems)) {
        errors.push('Media items must be an array.');
    } else {
        data.mediaItems.forEach((mediaItem: any, index: number) => {
            const itemErrors = validateMediaItem(mediaItem, index);
            errors.push(...itemErrors);
        });
    }

    if (!Array.isArray(data.lists)) {
        errors.push('Lists must be an array.');
    } else {
        data.lists.forEach((list: any, index: number) => {
            const listErrors = validateList(list, index);
            errors.push(...listErrors);
        });
    }

    const mediaItemReferenceErrors = validateMediaItemListReferences(data);
    errors.push(...mediaItemReferenceErrors);

    const listReferenceErrors = validateListItemReferences(data);
    errors.push(...listReferenceErrors);

    return errors.length > 0 ? errors : null;
};

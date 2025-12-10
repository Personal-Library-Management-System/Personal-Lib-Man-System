import { MediaItemDoc } from '../models/mediaItem.model';

/**
 * Reason: Calculates frequency of items in a list and returns top N items.
 * Moved here to keep the service layer clean.
 */
export const getTopFrequentItems = (
    items: MediaItemDoc[], 
    field: keyof MediaItemDoc, 
    limit: number = 5
): { name: string; count: number }[] => {
    
    const frequencyMap: Record<string, number> = {};

    items.forEach((item) => {
        const value = item[field];

        if (!value) return;

        if (Array.isArray(value)) {
            value.forEach((val: string) => {
                frequencyMap[val] = (frequencyMap[val] || 0) + 1;
            });
        } else {
            frequencyMap[String(value)] = (frequencyMap[String(value)] || 0) + 1;
        }
    });

    return Object.entries(frequencyMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
};

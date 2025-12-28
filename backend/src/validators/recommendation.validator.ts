import { z } from 'zod';

export const recommendationOptionsSchema = z.object({
    useHistory: z.boolean().default(false),
    useRatings: z.boolean().default(false),
    useComments: z.boolean().default(false),
    customPrompt: z.string().trim().default(''),
}).refine(
    (data: { useHistory: boolean; useRatings: boolean; useComments: boolean; customPrompt: string }) =>
        data.useHistory ||
        data.useRatings ||
        data.useComments ||
        data.customPrompt.length > 0,
    {
        message: 'At least one recommendation option must be enabled.',
    }
);
export type RecommendationOptionsSchema = z.infer<typeof recommendationOptionsSchema>;

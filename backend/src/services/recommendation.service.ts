import { MediaItemDoc, MediaItemModel } from '../models/mediaItem.model';
import { UserDoc } from '../models/user.model';
import { RecommendationMediaItem, RecommendationResult } from '../types/recommendation.types';
import { RecommendationOptionsSchema } from '../validators/recommendation.validator';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRecommendationModel } from '../clients/gemini.clients';
import { AppError } from '../utils/appError';
import { StatusCodes } from 'http-status-codes';

const promptTemplate = fs.readFileSync(
    path.join(__dirname, '../prompts/recommendation.txt'),
    'utf-8'
);

const buildRecommendationPrompt = (
    promptTemplate: string,
    mediaItems: RecommendationMediaItem[],
    options: RecommendationOptionsSchema
): string => {
    const { useRatings, useComments, customPrompt } = options;
    const contextParts: string[] = [];

    if (mediaItems.length > 0) {
        const formattedItems = mediaItems.map((item) => {
            const parts: string[] = [];

            parts.push(`Title: ${item.title}`);

            if (item.publishedDate) {
                parts.push(`Published: ${item.publishedDate.toISOString().slice(0, 10)}`);
            }

            if (item.categories?.length) {
                parts.push(`Categories: ${item.categories.join(', ')}`);
            }

            if (useRatings && item.myRating != null) {
                parts.push(`My Rating: ${item.myRating}`);
            }

            if (useComments && item.personalNotes) {
                parts.push(`Notes: ${item.personalNotes}`);
            }
            return parts.join(' | ');
        });

        contextParts.push(`User media history:\n${formattedItems.join('\n')}`);
    }

    if (customPrompt) {
        contextParts.push(`User request:\n${customPrompt}`);
    }
    return [promptTemplate.trim(), ...contextParts].join('\n\n');
};

const parseAIJson = <T>(input: string): T => {
    const cleaned = input
        .replace(/```json\s*/i, '')
        .replace(/```/g, '')
        .trim();

    return JSON.parse(cleaned);
};

export const getRecommendationsForUser = async (
    user: UserDoc,
    options: RecommendationOptionsSchema
): Promise<RecommendationResult[]> => {
    const recommendationModel = getRecommendationModel();
    if (!recommendationModel) {
        throw new AppError(
            'Recommendation service is currently unavailable.',
            StatusCodes.SERVICE_UNAVAILABLE
        );
    }

    const { useHistory, useRatings, useComments } = options;
    let mediaItems: RecommendationMediaItem[] = [];

    if (useHistory && user.mediaItems.length > 0) {
        const projection = {
            title: 1,
            publishedDate: 1,
            categories: 1,
            ...(useRatings && { myRating: 1 }),
            ...(useComments && { personalNotes: 1 }),
        } as const;

        mediaItems = await MediaItemModel.find(
            { _id: { $in: user.mediaItems } },
            projection
        ).lean();
    }

    const finalPrompt = buildRecommendationPrompt(
        promptTemplate,
        mediaItems,
        options
    );

    let rawResponse: string;
    try {
        const result = await recommendationModel.generateContent(finalPrompt);
        rawResponse = result.response.text();
    } catch (err) {
        console.error('AI generation error:', err);
        throw new AppError(
            'Recommendation service is temporarily unavailable.',
            StatusCodes.SERVICE_UNAVAILABLE
        );
    }

    try {
        const parsed = parseAIJson<{ results: RecommendationResult[] }>(rawResponse);
        if (!Array.isArray(parsed.results)) {
            throw new Error('Missing results array');
        }
        return parsed.results;
    } catch (err) {
        console.error('Invalid AI response format:', rawResponse);
        throw new AppError(
            'Upstream recommendation service returned an invalid response.',
            StatusCodes.BAD_GATEWAY
        );
    }
};

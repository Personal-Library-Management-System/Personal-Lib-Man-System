import { GoogleGenerativeAI } from '@google/generative-ai';

let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

export const getRecommendationModel = () => {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return null;
    }

    if (!model) {
        const genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
        });
    }
    return model;
};

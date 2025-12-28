import { RequestHandler, Router } from "express"
import { getRecommendations } from "../controllers/recommendation.controller";

const recommendationRouter = Router();
/**
 * @openapi
 * /api/v1/recommendations:
 *   post:
 *     summary: Get AI-generated recommendations
 *     description: Generates personalized media recommendations based on user history, ratings, and custom prompts using Gemini AI.
 *     tags:
 *       - Recommendations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recommendationOptions
 *             properties:
 *               recommendationOptions:
 *                 $ref: '#/components/schemas/RecommendationOptions'
 *     responses:
 *       200:
 *         description: Recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Recommendations generated successfully.
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RecommendationResult'
 *       400:
 *         description: Invalid recommendation options (e.g., none enabled)
 *       401:
 *         description: Unauthorized
 *       502:
 *         description: Upstream service error (AI provider returned invalid response)
 *       503:
 *         description: Recommendation service unavailable
 *       500:
 *         description: Internal server error
 */
recommendationRouter.post('/', getRecommendations as RequestHandler);

export default recommendationRouter;

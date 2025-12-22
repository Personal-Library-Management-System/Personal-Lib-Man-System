import { Router } from 'express';
import { googleLoginController } from '../controllers/auth.controller';
import { refreshTokenController } from '../controllers/auth.controller';
import { getUserProfileController } from '../controllers/auth.controller';
import authMiddleware from '../middleware/auth.middleware';

const authRouter = Router();

/**
 * @openapi
 * /api/v1/auth/google:
 *   post:
 *     summary: Authenticate a user using a Google ID token
 *     description: |
 *       Accepts a Google ID token, verifies it using Google APIs,
 *       creates the user if necessary, generates access/refresh tokens, and stores them in HTTP-only cookies.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID token from Google Sign-In
 *           example:
 *             idToken: "eyJhbGc...example"
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Authentication successful"
 *       400:
 *         description: Missing or invalid ID token
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid ID token"
 *       500:
 *         description: Unexpected server error
 */
authRouter.post('/google', googleLoginController);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh tokens using existing refresh cookie
 *     description: |
 *       Reads the `refreshToken` HTTP-only cookie, verifies it, and issues new access/refresh tokens as cookies.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Tokens refreshed successfully"
 *       401:
 *         description: Missing or invalid refresh token
 *         content:
 *           application/json:
 *             examples:
 *               missing:
 *                 value: { "error": "Refresh token not provided" }
 *               invalid:
 *                 value: { "error": "Invalid or expired refresh token" }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: "User not found"
 *       500:
 *         description: Server error
 */
authRouter.post('/refresh', refreshTokenController);

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: |
 *       Returns the profile information of the currently authenticated user.
 *       Requires valid authentication cookies (access token).
 *     tags:
 *       - Authentication
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     googleId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     picture:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *             example:
 *               user:
 *                 id: "507f1f77bcf86cd799439011"
 *                 googleId: "1234567890"
 *                 name: "John Doe"
 *                 email: "john@example.com"
 *                 picture: "https://example.com/photo.jpg"
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 updatedAt: "2024-01-01T00:00:00.000Z"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             example:
 *               error: "User not authenticated"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: "User not found"
 *       500:
 *         description: Server error
 */
authRouter.get('/me', authMiddleware, getUserProfileController);

export default authRouter;

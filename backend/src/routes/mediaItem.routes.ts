import { RequestHandler, Router } from 'express';
import {
    createMediaItem,
    deleteMediaItem,
    deleteMultipleMediaItems,
    getAllMediaItems,
    getMediaItem,
} from '../controllers/mediaItem.controller';

const mediaItemRouter = Router();

/**
 * @openapi
 * /api/v1/mediaItems:
 *   post:
 *     summary: Create a media item
 *     tags:
 *       - Media Items
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MediaItem'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 item:
 *                   $ref: '#/components/schemas/MediaItem'
 *       400:
 *         description: Invalid mediaType or validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
mediaItemRouter.post('/', createMediaItem as RequestHandler);

/**
 * @openapi
 * /api/v1/mediaItems/{id}:
 *   delete:
 *     summary: Delete a media item
 *     tags:
 *       - Media Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 item:
 *                   $ref: '#/components/schemas/MediaItem'
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
mediaItemRouter.delete('/:id', deleteMediaItem as RequestHandler);

/**
 * @openapi
 * /api/v1/mediaItems:
 *   delete:
 *     summary: Delete multiple media items
 *     tags:
 *       - Media Items
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mediaItemIds
 *             properties:
 *               mediaItemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Deletion result (at least one item was deleted)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                 notDeletedIds:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No media items were deleted for this user
 *       500:
 *         description: Server error
 */
mediaItemRouter.delete('/', deleteMultipleMediaItems as RequestHandler);

/**
 * @openapi
 * /api/v1/mediaItems/{id}:
 *   get:
 *     summary: Get a media item by ID
 *     tags:
 *       - Media Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/MediaItem'
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
mediaItemRouter.get('/:id', getMediaItem as RequestHandler);

/**
 * @openapi
 * /api/v1/mediaItems:
 *   get:
 *     summary: Get all media items for the authenticated user
 *     tags:
 *       - Media Items
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MediaItem'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
mediaItemRouter.get('/', getAllMediaItems as RequestHandler);

export default mediaItemRouter;

import { RequestHandler, Router } from 'express';
import {
    createMediaItem,
    deleteMediaItem,
    deleteMultipleMediaItems,
    getAllMediaItems,
    getMediaItem,
    getMediaItemsByType,
    updateMediaItem,
    addTags,
    removeTag
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
 *     summary: Get all media items
 *     tags:
 *       - Media Items
 *     parameters:
 *       - in: query
 *         name: tagIds
 *         schema:
 *           type: string
 *         description: Comma-separated list of Tag IDs to filter by (e.g. "id1,id2")
 *         required: false
 *       - in: query
 *         name: match
 *         schema:
 *           type: string
 *           enum: [any, all]
 *           default: any
 *         description: Filter logic. 'any' returns items with at least one tag, 'all' returns items with all tags.
 *         required: false
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

/**
 * @openapi
 * /api/v1/mediaItems/type/{mediaType}:
 *   get:
 *     summary: Get media items of a specific type
 *     tags:
 *       - Media Items
 *     parameters:
 *       - in: path
 *         name: mediaType
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/MediaType'
 *         description: Type of media items to retrieve
 *       - in: query
 *         name: tagIds
 *         schema:
 *           type: string
 *         description: Comma-separated list of Tag IDs to filter by
 *         required: false
 *       - in: query
 *         name: match
 *         schema:
 *           type: string
 *           enum: [any, all]
 *           default: any
 *         description: Filter logic (any/all)
 *         required: false
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MediaItem'
 *       400:
 *         description: Invalid mediaType
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
mediaItemRouter.get('/type/:mediaType', getMediaItemsByType as RequestHandler);

/**
 * @openapi
 * /api/v1/mediaItems/{id}:
 *   patch:
 *     summary: Update a media item
 *     tags:
 *       - Media Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MediaItem'
 *     responses:
 *       200:
 *         description: Updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Item not found
 */
mediaItemRouter.patch('/:id', updateMediaItem as RequestHandler);

/**
 * @openapi
 * /api/v1/mediaItems/{id}/tags:
 *  post:
 *   summary: Add tags to a media item
 *   description: Attach one or more existing tags to a specific book or movie.
 *   tags:
 *     - Media Items
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Media Item ID
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           required:
 *             - tagIds
 *           properties:
 *             tagIds:
 *               type: array
 *               items:
 *                 type: string
 *               description: Array of Tag IDs to attach
 *   responses:
 *     200:
 *       description: Tags added successfully
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MediaItem'
 *     403:
 *       description: Forbidden - One or more tags do not belong to the user
 *     404:
 *       description: Media item not found
 */
mediaItemRouter.post('/:id/tags', addTags as RequestHandler);

/**
 * @openapi
 * /api/v1/mediaItems/{id}/tags/{tagId}:
 *   delete:
 *     summary: Remove a tag from a media item
 *     description: Detach a specific tag from a book or movie.
 *     tags:
 *       - Media Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media Item ID
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag ID to remove
 *     responses:
 *       200:
 *         description: Tag removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaItem'
 *       404:
 *         description: Media item not found
 */
mediaItemRouter.delete('/:id/tags/:tagId', removeTag as RequestHandler);


export default mediaItemRouter;

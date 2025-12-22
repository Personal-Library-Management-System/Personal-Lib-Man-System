import { RequestHandler, Router } from 'express';
import {
    addMediaItemsToList,
    createList,
    deleteMultipleLists,
    deleteSingleList,
    getAllLists,
    getListById,
    removeMediaItemsFromList,
    reorderMediaItemsOfList,
    updateList,
} from '../controllers/mediaList.controller';

const mediaListRouter = Router();

/**
 * @openapi
 * /api/v1/mediaLists:
 *   post:
 *     summary: Create a media list
 *     tags:
 *       - Media Lists
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MediaListCreate'
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
 *                 list:
 *                   $ref: '#/components/schemas/MediaList'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               errors:
 *                 - "Title of the list must be a non-empty string."
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Items not owned by user
 *       404:
 *         description: One or more media items not found
 *       500:
 *         description: Server error
 */
mediaListRouter.post('/', createList as RequestHandler);

/**
 * @openapi
 * /api/v1/mediaLists:
 *   get:
 *     summary: Get all media lists for the authenticated user
 *     tags:
 *       - Media Lists
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 lists:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MediaList'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
mediaListRouter.get('/', getAllLists as RequestHandler);

/**
 * @openapi
 * /api/v1/mediaLists/{id}:
 *   get:
 *     summary: Get a media list by ID
 *     tags:
 *       - Media Lists
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
 *                 message:
 *                   type: string
 *                 list:
 *                   $ref: '#/components/schemas/MediaList'
 *       400:
 *         description: Invalid media list ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: List does not belong to the user
 *       404:
 *         description: Media list not found
 *       500:
 *         description: Server error
 */
mediaListRouter.get('/:id', getListById as RequestHandler);

/**
 * @openapi
 * /api/v1/mediaLists/{id}:
 *   delete:
 *     summary: Delete a media list
 *     tags:
 *       - Media Lists
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
 *                 list:
 *                   $ref: '#/components/schemas/MediaList'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: List does not belong to the user
 *       404:
 *         description: Media list not found
 *       500:
 *         description: Server error
 */
mediaListRouter.delete('/:id', deleteSingleList as RequestHandler);

/**
 * @openapi
 * /api/v1/mediaLists:
 *   delete:
 *     summary: Delete multiple media lists
 *     tags:
 *       - Media Lists
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mediaLists
 *             properties:
 *               mediaLists:
 *                 type: array
 *                 items:
 *                   type: string
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
 *                 lists:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MediaList'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: One or more lists do not belong to the user
 *       404:
 *         description: One or more media lists not found
 *       500:
 *         description: Server error
 */
mediaListRouter.delete('/', deleteMultipleLists as RequestHandler);

/**
 * @openapi
 * /api/v1/mediaLists/{id}:
 *   patch:
 *     summary: Update a media list (not implemented yet)
 *     tags:
 *       - Media Lists
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       501:
 *         description: Not implemented
 *         content:
 *           application/json:
 *             example:
 *               error: update list not implemented yet
 */
mediaListRouter.patch('/:id', updateList as RequestHandler);

/**
 * @openapi
 * /api/v1/mediaLists/{id}/items:
 *   post:
 *     summary: Add media items to a list
 *     tags:
 *       - Media Lists
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
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Items added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 list:
 *                   $ref: '#/components/schemas/MediaList'
 *       400:
 *         description: Invalid media item IDs or mismatched mediaType
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: List does not belong to the user
 *       404:
 *         description: Media list or media item not found
 *       500:
 *         description: Server error
 */
mediaListRouter.post('/:id/items', addMediaItemsToList as RequestHandler);

/**
 * @openapi
 * /api/v1/mediaLists/{id}/items:
 *   delete:
 *     summary: Remove media items from a list
 *     tags:
 *       - Media Lists
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
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Items removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 list:
 *                   $ref: '#/components/schemas/MediaList'
 *       400:
 *         description: Invalid IDs or items not part of the list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: List does not belong to the user
 *       404:
 *         description: Media list or media item not found
 *       500:
 *         description: Server error
 */
mediaListRouter.delete('/:id/items', removeMediaItemsFromList as RequestHandler);

/**
 * @openapi
 * /api/v1/mediaLists/{id}/order:
 *   patch:
 *     summary: Reorder media items in a media list
 *     tags:
 *       - Media Lists
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media list ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 description: The full list of media item IDs in the new order (must match the list length and contain no duplicates).
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Items reordered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 list:
 *                   $ref: '#/components/schemas/MediaList'
 *       400:
 *         description: Invalid media list ID or invalid request body (length mismatch, duplicates, or IDs not in list)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: List does not belong to the user
 *       404:
 *         description: Media list not found
 *       500:
 *         description: Server error
 */
mediaListRouter.patch('/:id/order', reorderMediaItemsOfList as RequestHandler);


export default mediaListRouter;

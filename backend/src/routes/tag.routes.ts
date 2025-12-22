import { Router, RequestHandler } from 'express';
import {
    createTag,
    deleteTag,
    getTags,
    updateTag,
} from '../controllers/tag.controller';

const tagRouter = Router();

/**
 * @openapi
 * /api/v1/tags:
 *   get:
 *     summary: Get all tags for the authenticated user
 *     description: Retrieves a list of all custom tags created by the currently authenticated user, sorted alphabetically.
 *     tags:
 *       - Tags
 *     responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Tag'
 *      401:
 *        description: Unauthorized - User not logged in
 *      500:
 *        description: Server error
 */
tagRouter.get('/', getTags as RequestHandler);

/**
 * @openapi
 * /api/v1/tags:
 *   post:
 *     summary: Create a new tag
 *     description: Creates a new custom tag for the user. The tag name must be unique for the user.
 *     tags:
 *       - Tags
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the tag (max 50 chars)
 *                 example: "Sci-Fi"
 *               color:
 *                 type: string
 *                 description: Hex color code for the tag (optional)
 *                 example: "#FF5733"
 *     responses:
 *      201:
 *        description: Created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Tag'
 *     400:
 *        description: Validation error (e.g., missing name, invalid color)
 *     409:
 *        description: Conflict - A tag with this name already exists
 *     401:
 *        description: Unauthorized
 *     500:
 *        description: Server error
 */
tagRouter.post('/', createTag as RequestHandler);

/**
 * @openapi
 * /api/v1/tags/{id}:
 *   patch:
 *     summary: Update an existing tag
 *     description: Updates the name or color of a specific tag. Only provided fields will be updated.
 *     tags:
 *       - Tags
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the tag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the tag
 *                 example: "Science Fiction"
 *               color:
 *                 type: string
 *                 description: New hex color code
 *                 example: "#0000FF"
 *     responses:
 *      200:
 *        description: Tag updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Tag'
 *      400:
 *        description: Invalid Tag ID or validation error
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Tag not found or does not belong to user
 *      500:
 *        description: Server error
 */
tagRouter.patch('/:id', updateTag as RequestHandler);

/**
 * @openapi
 * /api/v1/tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     description: Deletes a tag by ID. This action will also remove this tag from all associated books and movies (Cascading Delete).
 *     tags:
 *       - Tags
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the tag to delete
 *     responses:
 *      200:
 *        description: Tag deleted successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Tag deleted successfully."
 *      400:
 *        description: Invalid Tag ID
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Tag not found or does not belong to user
 *      500:
 *        description: Server error
 */
tagRouter.delete('/:id', deleteTag as RequestHandler);

export default tagRouter;
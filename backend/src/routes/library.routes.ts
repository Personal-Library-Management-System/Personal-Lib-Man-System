import { RequestHandler, Router } from "express";
import { exportLibrary, importLibrary } from "../controllers/library.controller";

const libraryRouter = Router();

/**
 * @openapi
 * /api/v1/library/export:
 *   get:
 *     summary: Export user's complete library data
 *     description: |
 *       Retrieves all library data for the authenticated user including profile information,
 *       media items, and lists.
 *     tags:
 *       - Library
 *     responses:
 *       200:
 *         description: Library data exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 library:
 *                   $ref: '#/components/schemas/LibraryExport'
 *       401:
 *         description: Unauthorized - user not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
libraryRouter.get('/export', exportLibrary as RequestHandler);

libraryRouter.post('/import', importLibrary as RequestHandler);

export default libraryRouter;

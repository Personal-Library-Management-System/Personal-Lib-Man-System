/**
 * @openapi
 * components:
 *   schemas:
 *     MediaItemBase:
 *       type: object
 *       required:
 *         - title
 *         - mediaType
 *       properties:
 *         id:
 *           type: string
 *           description: Mongo document identifier
 *           readOnly: true
 *         title:
 *           type: string
 *         mediaType:
 *           type: string
 *           enum: [Book, Movie]
 *         publishedDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         averageRating:
 *           type: number
 *           nullable: true
 *         ratingCount:
 *           type: number
 *           nullable: true
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *         description:
 *           type: string
 *           nullable: true
 *         coverPhoto:
 *           type: string
 *           nullable: true
 *         language:
 *           type: string
 *           nullable: true
 *         author:
 *           type: string
 *           nullable: true
 *     BookMediaItem:
 *       allOf:
 *         - $ref: '#/components/schemas/MediaItemBase'
 *         - type: object
 *           properties:
 *             ISBN:
 *               type: string
 *               nullable: true
 *             pageCount:
 *               type: number
 *               nullable: true
 *               minimum: 1
 *             publisher:
 *               type: string
 *               nullable: true
 *     MovieMediaItem:
 *       allOf:
 *         - $ref: '#/components/schemas/MediaItemBase'
 *         - type: object
 *           properties:
 *             actors:
 *               type: array
 *               items:
 *                 type: string
 *               nullable: true
 *             awards:
 *               type: string
 *               nullable: true
 *             runtime:
 *               type: number
 *               nullable: true
 *               minimum: 0
 *             director:
 *               type: string
 *               nullable: true
 *             imdbID:
 *               type: string
 *               nullable: true
 *     MediaItem:
 *       description: A media item that can be either a book or a movie.
 *       oneOf:
 *         - $ref: '#/components/schemas/BookMediaItem'
 *         - $ref: '#/components/schemas/MovieMediaItem'
 *       discriminator:
 *         propertyName: mediaType
 *         mapping:
 *           Book: '#/components/schemas/BookMediaItem'
 *           Movie: '#/components/schemas/MovieMediaItem'
 */

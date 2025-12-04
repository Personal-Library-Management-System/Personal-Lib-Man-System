/**
 * @openapi
 * components:
 *   schemas:
 *     MediaType:
 *       type: string
 *       description: Type of media item
 *       enum: [Book, Movie]
 *
 *     Rating:
 *       type: object
 *       required:
 *         - source
 *         - value
 *       properties:
 *         source:
 *           type: string
 *         value:
 *           type: string
 *
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
 *           $ref: '#/components/schemas/MediaType'
 *         publishedDate:
 *           type: string
 *           format: date
 *           nullable: true
 *
 *         ratings:
 *           type: array
 *           description: External ratings (no _id field)
 *           nullable: true
 *           items:
 *             $ref: '#/components/schemas/Rating'
 *
 *         ratingCount:
 *           type: number
 *           nullable: true
 *
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *
 *         description:
 *           type: string
 *           nullable: true
 *
 *         coverPhoto:
 *           type: string
 *           nullable: true
 *
 *         language:
 *           type: string
 *           nullable: true
 *
 *         author:
 *           type: string
 *           nullable: true
 *
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
 *
 *     MovieMediaItem:
 *       allOf:
 *         - $ref: '#/components/schemas/MediaItemBase'
 *         - type: object
 *           properties:
 *             actors:
 *               type: array
 *               nullable: true
 *               items:
 *                 type: string
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
 *
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

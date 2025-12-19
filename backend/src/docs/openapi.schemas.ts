/**
 * @openapi
 * components:
 *   schemas:
 *     MediaType:
 *       type: string
 *       description: Type of media item
 *       enum: [Book, Movie]
 * 
 *     ItemStatus:
 *       type: string
 *       description: User's status for the media item
 *       enum: [PLANNED, IN_PROGRESS, COMPLETED]
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
 *     Tag:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the tag
 *         name:
 *           type: string
 *           description: Name of the tag (unique per user)
 *         color:
 *           type: string
 *           description: Hex color code for the tag
 *           example: "#FF5733"
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
 *         lists:
 *           type: array
 *           description: IDs of media lists that contain this item
 *           readOnly: true
 *           items:
 *             type: string
 *         tags:
 *           type: array
 *           description: List of tags attached to this item
 *           items:
 *             $ref: '#/components/schemas/Tag'
 *         status:
 *           type: string
 *           description: User's status for the media item
 *           enum: [PLANNED, IN_PROGRESS, COMPLETED]
 * 
 *         myRating:
 *           type: number
 *           description: User's personal rating for the media item
 *           nullable: true
 *           minimum: 0
 *           maximum: 5
 * 
 *         progress:
 *           type: number
 *           description: User's progress for the media item
 *           nullable: true
 *           minimum: 0
 * 
 *         personalNotes:
 *           type: string
 *           description: User's personal notes for the media item
 *           trim: true
 *           default: ''
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
 *
 *     MediaListCreate:
 *       type: object
 *       required:
 *         - title
 *         - mediaType
 *       properties:
 *         title:
 *           type: string
 *           description: Name of the list
 *         color:
 *           type: string
 *           description: Hex color in #RGB or #RRGGBB format
 *           example: '#FFAA00'
 *         mediaType:
 *           $ref: '#/components/schemas/MediaType'
 *         items:
 *           type: array
 *           description: Optional list of media item IDs to include
 *           items:
 *             type: string
 *
 *     MediaList:
 *       type: object
 *       description: A user-defined list of media items
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
 *         color:
 *           type: string
 *           description: Hex color in #RGB or #RRGGBB format
 *         mediaType:
 *           $ref: '#/components/schemas/MediaType'
 *         items:
 *           type: array
 *           description: Media items contained in this list
 *           items:
 *             $ref: '#/components/schemas/MediaItem'
 * 
 *     UserStatistics:
 *       type: object
 *       description: Aggregated user reading and watching statistics
 *       properties:
 *         userId:
 *           type: string
 *           description: The user's unique ID
 *         totalReadBooks:
 *           type: integer
 *           description: Total number of books marked as read/owned
 *         totalReadPages:
 *           type: integer
 *           description: Sum of page counts of all books
 *         totalWatchedMovies:
 *           type: integer
 *           description: Total number of movies marked as watched/owned
 *         totalWatchedMinutes:
 *           type: integer
 *           description: Sum of runtimes of all movies
 *         top5Authors:
 *           type: array
 *           description: Top 5 most frequent authors
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               count:
 *                 type: integer
 *         top5Directors:
 *           type: array
 *           description: Top 5 most frequent directors
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               count:
 *                 type: integer
 *         top5BookCategories:
 *           type: array
 *           description: Top 5 most frequent book categories
 *           items:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               count:
 *                 type: integer
 *         top5MovieCategories:
 *           type: array
 *           description: Top 5 most frequent movie categories
 *           items:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               count:
 *                 type: integer
 */

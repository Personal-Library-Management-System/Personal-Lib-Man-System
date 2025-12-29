import { Types } from 'mongoose';
import User from '../models/user.model';
import { MediaItemDoc } from '../models/mediaItem.model';
import { AppError } from '../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { UserStatisticsDto } from '../types/stats.types';
import { getTopFrequentItems } from '../utils/stats.utils';

export const getUserStatistics = async (googleId: string): Promise<UserStatisticsDto> => {
    const user = await User.findOne({ googleId }).populate('mediaItems');

    if (!user) {
        throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    const allItems = user.mediaItems as unknown as MediaItemDoc[];

    const books = allItems.filter(item => item.mediaType === 'Book' && item.status === 'COMPLETED');
    const movies = allItems.filter(item => item.mediaType === 'Movie' && item.status === 'COMPLETED');

    const totalReadPages = books.reduce((sum, book: any) => sum + (book.pageCount || 0), 0);
    const totalWatchedMinutes = movies.reduce((sum, movie: any) => sum + (movie.runtime || 0), 0);

    const topAuthorsRaw = getTopFrequentItems(books, 'author');
    const topDirectorsRaw = getTopFrequentItems(movies, 'director' as any);
    const topBookCategoriesRaw = getTopFrequentItems(books, 'categories');
    const topMovieCategoriesRaw = getTopFrequentItems(movies, 'categories');

    return {
        userId: (user._id as Types.ObjectId).toString(),
        totalReadBooks: books.length,
        totalReadPages,
        totalWatchedMovies: movies.length,
        totalWatchedMinutes,
        top5Authors: topAuthorsRaw,
        top5Directors: topDirectorsRaw,
        top5BookCategories: topBookCategoriesRaw.map(i => ({ category: i.name, count: i.count })),
        top5MovieCategories: topMovieCategoriesRaw.map(i => ({ category: i.name, count: i.count })),
    };
};
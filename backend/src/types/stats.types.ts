export interface TopListItem {
    name?: string;     
    category?: string; 
    count: number;
}

export interface UserStatisticsDto {
    userId: string;
    totalReadBooks: number;
    totalReadPages: number;
    totalWatchedMovies: number;
    totalWatchedMinutes: number;
    top5Authors: TopListItem[];
    top5Directors: TopListItem[];
    top5BookCategories: TopListItem[];
    top5MovieCategories: TopListItem[];
}
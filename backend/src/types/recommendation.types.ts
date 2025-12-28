export type RecommendationMediaItem = {
    title: string;
    publishedDate?: Date | null;
    categories: string[];
    myRating?: number | null;
    personalNotes?: string | null;
};

export type RecommendationResult =
    | {
          type: 'movie';
          title: string;
          director: string;
          releaseDate: string;
      }
    | {
          type: 'book';
          title: string;
          writer: string;
          releasedDate: string;
      };

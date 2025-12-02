export interface Book {
  id: string; // API'den string geliyor
  title: string;
  authors?: string[]; // API'de dizi olarak geliyor
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
  };
  publishedDate?: string;
  publisher?: string;
  pageCount?: number;
  averageRating?: number;
  ratingsCount?: number;
  categories?: string[];
  description?: string;
  language?: string;
  ISBN?: string;
  status: 'read' | 'reading' | 'want-to-read';
}

export interface Movie {
  id: number;
  title: string;
  director: string;
  imageUrl: string;
  releaseDate: string;
  duration: number;
  rating: number;
  status: 'watched' | 'want-to-watch';
  description: string;
}

// movie
//   actors
//   awards
//   runtime
//   director
//   imbdID
//   Released
//   imdbRating
//   imdbVotes
//   genre
//   Plot
//   Poster
//   Language
//   Writer
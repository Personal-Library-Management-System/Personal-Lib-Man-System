export interface Book {
  id: string;
  title: string;
  authors?: string[];
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
  currentPage?: number;
  tags?: string[];
  status: 'read' | 'reading' | 'want-to-read';
  ratings?: Rating[]; // Backend'den gelen ratings
  ratingCount?: number | null;
  myRating?: number;
  personalNotes?: string;
}

export interface Rating {
  source: string; // Backend'de "source" olarak geliyor
  value: string;  // Backend'de "value" olarak geliyor
}

export interface Movie {
  id: string;
  title: string;
  director: string;
  imageUrl: string;
  releaseDate: string;
  runtime: number; // Backend'de "runtime" olarak tutuluyor
  imdbRating?: string;
  imdbVotes?: string;
  genre?: string[];
  plot: string;
  language?: string;
  writer?: string;
  actors?: string[];
  awards?: string;
  ratings?: Rating[]; // Backend'den gelen ratings
  ratingCount?: number | null; // IMDb vote count
  status: 'watched' | 'want-to-watch';
  myRating?: number;
  personalNotes?: string;
}

export interface User {
  id: string;
  googleId: string;
  name: string;
  email: string;
  picture?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

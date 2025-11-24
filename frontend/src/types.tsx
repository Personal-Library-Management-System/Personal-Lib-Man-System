export interface Book {
    id: number;
    title: string;
    author: string;
    imageUrl: string;
    publishedDate: string;
    pageCount: number;
    rating: number;
    status: 'read' | 'reading' | 'want-to-read';
    description: string;
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
  
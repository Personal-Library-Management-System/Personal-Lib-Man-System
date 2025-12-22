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
  currentPage?: number;
  tags?: string[];
  status: 'read' | 'reading' | 'want-to-read';
}

export interface Rating {
  Source: string;
  Value: string;
}

export interface Movie {
  id: string; // IMDb ID string olarak kullanılıyor (örn: "tt1234567")
  title: string;
  director: string;
  imageUrl: string; // Poster URL
  releaseDate: string; // Released date
  runtime: number; // Dakika cinsinden süre
  imdbRating: string; // IMDb puanı
  imdbVotes?: string; // IMDb oy sayısı
  genre?: string[]; // Film türleri
  plot: string; // Film açıklaması
  language?: string;
  writer?: string;
  actors?: string[];
  awards?: string;
  ratings?: Rating[]; // Farklı kaynaklardan puanlar
  status: 'watched' | 'want-to-watch';
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
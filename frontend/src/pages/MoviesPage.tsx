import React, { useState } from 'react';
import { Badge, useDisclosure } from '@chakra-ui/react';
import { type Movie } from '../types';
import mockMoviesData from '../mock-data/movie-data.json';
import ResourcePageLayout from '../components/ui/views/resource-page-layout';
import MovieModal from '../components/ui/modals/movie-modal'; 
import AddMedia, { type SearchState } from '../components/ui/add-media';

const getStatusBadge = (status: string) => {
  const statusConfig: Record<Movie['status'], { text: string; colorScheme: string }> = {
    'watched': { text: 'İzlendi', colorScheme: 'green' },
    'want-to-watch': { text: 'İzlenecek', colorScheme: 'yellow' }
  };
  if (status in statusConfig) {
    const config = statusConfig[status as Movie['status']];
    return <Badge colorScheme={config.colorScheme} variant="subtle" size="sm">{config.text}</Badge>;
  }
  return null;
};

const filters = [
  { key: 'all', label: 'Tümü' },
  { key: 'watched', label: 'İzlendi' },
  { key: 'want-to-watch', label: 'İzlenecek' }
];

const OMDb_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

const MoviesPage = () => {
  const [isMovieModalOpen, setMovieModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!OMDb_API_KEY) {
    console.error('OMDb API anahtarı bulunamadı. Lütfen .env dosyanıza VITE_OMDB_API_KEY ekleyin.');
  }

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setMovieModalOpen(true);
  };

  // AddMedia için state yönetimi
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);

  const handleAddSearch = async (payload: { query: string; extras: Record<string, string> }) => {
    if (!OMDb_API_KEY) {
      console.error('OMDb API anahtarı bulunamadı.');
      setSearchState('error');
      return;
    }

    setSearchState('loading');
    setSearchResults([]);

    // OMDb API'si için sorgu oluşturma
    let apiUrl = `https://www.omdbapi.com/?apikey=${OMDb_API_KEY}&s=${encodeURIComponent(payload.query)}`;
    if (payload.extras.year) {
      apiUrl += `&y=${payload.extras.year}`;
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('OMDb API isteği başarısız oldu');

      const data = await response.json();
      if (data.Response === 'True') {
        // OMDb'den gelen veriyi Movie formatına dönüştür
        const movies: Movie[] = await Promise.all(
          data.Search.map(async (movie: any) => {
            // Her film için detaylı bilgi al
            const detailResponse = await fetch(
              `https://www.omdbapi.com/?apikey=${OMDb_API_KEY}&i=${movie.imdbID}`
            );
            const detailData = await detailResponse.json();

            return {
              id: parseInt(movie.imdbID.replace(/\D/g, '')) || Date.now(),
              title: movie.Title,
              director: detailData.Director || 'Bilinmiyor',
              imageUrl: movie.Poster !== 'N/A' ? movie.Poster : '',
              releaseDate: movie.Year,
              duration: parseInt(detailData.Runtime) || 0,
              rating: parseFloat(detailData.imdbRating) || 0,
              status: 'want-to-watch' as const,
              description: detailData.Plot || 'Açıklama bulunmuyor'
            };
          })
        );

        setSearchResults(movies);
        setSearchState(movies.length > 0 ? 'success' : 'no-results');
      } else {
        setSearchResults([]);
        setSearchState('no-results');
      }
    } catch (error) {
      console.error('OMDb Arama Hatası:', error);
      setSearchState('error');
    }
  };

  return (
    <>
      <ResourcePageLayout
        pageTitle="🎬 Film Arşivim"
        activeItem="filmarsivi"
        mockData={mockMoviesData as Movie[]}
        filters={filters}
        getStatusBadge={getStatusBadge}
        itemType="movie"
        addItemButtonText="+ Film Ekle"
        onAddItem={onOpen}
        emptyStateIcon="🎬"
        emptyStateText="Bu kategoride film bulunamadı."
        onItemClick={handleMovieClick}
      />

      <AddMedia
        mediaType="movie"
        isOpen={isOpen}
        onClose={onClose}
        onSearch={handleAddSearch}
        searchState={searchState}
        searchResults={searchResults}
        onItemSelect={item => {
          // AddMedia modalını KAPATMA, sadece film detay modalını aç
          setSelectedMovie(item);
          setMovieModalOpen(true);
          // onClose() çağrısını KALDIRDIK
        }}
        optionalFields={[
          { name: 'director', label: 'Yönetmen', placeholder: 'Örn. Christopher Nolan' },
          { name: 'year', label: 'Çıkış Yılı', placeholder: 'Örn. 2021' }
        ]}
      />

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieModal
          isOpen={isMovieModalOpen}
          onClose={() => {
            setMovieModalOpen(false);
            setSelectedMovie(null);
            // MovieModal kapatıldığında AddMedia hala açık kalacak
          }}
          movie={selectedMovie}
        />
      )}
    </>
  );
};

export default MoviesPage;

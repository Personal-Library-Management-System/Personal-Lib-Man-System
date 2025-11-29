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
  const {
    isOpen: isMovieModalOpen,
    onOpen: openMovieModal,
    onClose: closeMovieModal
  } = useDisclosure();
  const {
    isOpen: isAddOpen,
    onOpen: openAddModal,
    onClose: closeAddModal
  } = useDisclosure();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    openMovieModal();
  };

  const handleCloseModal = () => {
    closeMovieModal();
    setSelectedMovie(null);
  };

  // AddMedia için state yönetimi
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleAddSearch = async (payload: { query: string; extras: Record<string, string> }) => {
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
        // OMDb'den gelen veriyi BookSearchResult formatına dönüştürelim
        const formattedResults = data.Search.map((movie: any) => ({
          id: movie.imdbID,
          title: movie.Title,
          publishedDate: movie.Year, // Ortak alan adı
          // Poster "N/A" ise null ata, aksi halde poster URL'ini kullan.
          // Bu, fallback mekanizmasının devreye girmesini sağlar.
          imageLinks: { thumbnail: movie.Poster === 'N/A' ? null : movie.Poster },
        }));

        setSearchResults(formattedResults);
        setSearchState('success');
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
        onAddItem={openAddModal}
        emptyStateIcon="🎬"
        emptyStateText="Bu kategoride film bulunamadı."
        onItemClick={handleMovieClick}
      />
      {selectedMovie && (
        <MovieModal
          isOpen={isMovieModalOpen}
          onClose={handleCloseModal}
          movie={selectedMovie}
        />
      )}

      <AddMedia
        mediaType="movie"
        isOpen={isAddOpen}
        onClose={closeAddModal}
        onSearch={handleAddSearch}
        searchState={searchState}
        searchResults={searchResults}
        onItemSelect={item => {
          console.log('Seçilen Film:', item);
          // Burada seçilen filmi ekleme formu açılabilir veya direkt arşive eklenebilir.
        }}
        optionalFields={[
          { name: 'director', label: 'Yönetmen', placeholder: 'Örn. Christopher Nolan' },
          { name: 'year', label: 'Çıkış Yılı', placeholder: 'Örn. 2021' }
        ]}
      />
    </>
  );
};

export default MoviesPage;

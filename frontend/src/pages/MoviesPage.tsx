import React, { useState } from 'react';
import { Badge, useDisclosure } from '@chakra-ui/react';
import { type Movie } from '../types';
import mockMoviesData from '../mock-data/movie-data.json';
import ResourcePageLayout from '../components/ui/resource-page-layout';
import MovieModal from '../components/ui/movie-modal';
import AddMedia from '../components/ui/add-media';

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
        onSearch={payload => {
          console.log('Film araması:', payload);
        }}
        title="Film arama paneli"
        description="İsme ek olarak yönetmen ve çıkış yılı ile filtre uygulayabilirsin."
        optionalFields={[
          { name: 'director', label: 'Yönetmen', placeholder: 'Örn. Christopher Nolan' },
          { name: 'year', label: 'Çıkış Yılı', placeholder: 'Örn. 2021' }
        ]}
      />
    </>
  );
};

export default MoviesPage;

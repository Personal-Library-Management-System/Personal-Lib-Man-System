import React from 'react';
import { Badge } from '@chakra-ui/react';
import { type Movie } from '../types';
import mockMoviesData from '../mock-data/movie-data.json';
import ResourcePageLayout from '../components/ui/resource-page-layout';

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
  return (
    <ResourcePageLayout
      pageTitle="🎬 Film Arşivim"
      activeItem="filmarsivi"
      mockData={mockMoviesData as Movie[]}
      filters={filters}
      getStatusBadge={getStatusBadge}
      itemType="movie"
      addItemButtonText="+ Film Ekle"
      emptyStateIcon="🎬"
      emptyStateText="Bu kategoride film bulunamadı."
    />
  );
};

export default MoviesPage;
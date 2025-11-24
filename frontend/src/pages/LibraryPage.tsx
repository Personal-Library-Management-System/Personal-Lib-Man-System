import React from 'react';
import { Badge } from '@chakra-ui/react';
import { type Book } from '../types';
import mockBooksData from '../mock-data/book-data.json';
import ResourcePageLayout from '../components/ui/resource-page-layout';

const getStatusBadge = (status: string) => {
  const statusConfig: Record<Book['status'], { text: string; colorScheme: string }> = {
    'read': { text: 'Okundu', colorScheme: 'green' },
    'reading': { text: 'Okunuyor', colorScheme: 'blue' },
    'want-to-read': { text: 'Okunacak', colorScheme: 'yellow' }
  };
  if (status in statusConfig) {
    const config = statusConfig[status as Book['status']];
    return <Badge colorScheme={config.colorScheme} variant="subtle" size="sm">{config.text}</Badge>;
  }
  return null;
};

const filters = [
  { key: 'all', label: 'Tümü' },
  { key: 'read', label: 'Okundu' },
  { key: 'reading', label: 'Okunuyor' },
  { key: 'want-to-read', label: 'Okunacak' }
];

const LibraryPage = () => {
  return (
    <ResourcePageLayout
      pageTitle="📚 Kitaplığım"
      activeItem="kitaplik"
      mockData={mockBooksData as Book[]}
      filters={filters}
      getStatusBadge={getStatusBadge}
      itemType="book"
      addItemButtonText="+ Kitap Ekle"
      emptyStateIcon="📚"
      emptyStateText="Bu kategoride kitap bulunamadı."
    />
  );
};

export default LibraryPage;
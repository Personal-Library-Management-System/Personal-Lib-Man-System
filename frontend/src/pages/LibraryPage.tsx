import React, { useState } from 'react';
import { Badge, useDisclosure } from '@chakra-ui/react';
import { type Book } from '../types';
import mockBooksData from '../mock-data/book-data.json';
import ResourcePageLayout from '../components/ui/views/resource-page-layout';
import BookModal from '../components/ui/modals/book-modal'; 
import AddMedia, { type SearchState } from '../components/ui/add-media';

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

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

const LibraryPage = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!GOOGLE_BOOKS_API_KEY) {
    console.error(
      'Google Books API anahtarı bulunamadı. Lütfen .env dosyanıza VITE_GOOGLE_BOOKS_API_KEY ekleyin.'
    );
  }
  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBook(null);
  };

  // AddMedia için state yönetimi
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleAddSearch = async (payload: { query: string; extras: Record<string, string> }) => {
    if (!GOOGLE_BOOKS_API_KEY) {
      console.error(
        'Google Books API anahtarı bulunamadı. Lütfen .env dosyanıza VITE_GOOGLE_BOOKS_API_KEY ekleyin.'
      );
      setSearchState('error');
      return;
    }

    setSearchState('loading');
    setSearchResults([]);

    let apiQuery = `intitle:${payload.query}`;
    if (payload.extras.author) {
      apiQuery += `+inauthor:${payload.extras.author}`;
    }
    if (payload.extras.publisher) {
      apiQuery += `+inpublisher:${payload.extras.publisher}`;
    }
    if (payload.extras.year) {
      // Google Books API'de yıl aralığı daha iyi çalışabilir, ama şimdilik direkt yıl alalım
      // apiQuery += `&as_publication_year=${payload.extras.year}`; // Bu parametre desteklenmiyor
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          apiQuery
        )}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=20`
      );
      if (!response.ok) {
        throw new Error('API isteği başarısız oldu');
      }
      const data = await response.json();
      const rawItems = data.items || [];
      const uniqueItems = rawItems
        .map((item: any) => ({ id: item.id, ...item.volumeInfo }))
        .reduce((acc: any[], current: any) => {
          if (!acc.find(item => item.id === current.id)) {
            acc.push(current);
          }
          return acc;
        }, []);
      setSearchResults(uniqueItems);
      setSearchState(uniqueItems.length > 0 ? 'success' : 'no-results');
    } catch (error) {
      console.error('Arama hatası:', error);
      setSearchState('error');
    }
  };

  return (
    <>
      <ResourcePageLayout
        pageTitle="📚 Kitaplığım"
        activeItem="kitaplik"
        mockData={mockBooksData as Book[]}
        filters={filters}
        getStatusBadge={getStatusBadge}
        itemType="book"
        addItemButtonText="+ Kitap Ekle"
        onAddItem={onOpen}
        emptyStateIcon="📚"
        emptyStateText="Bu kategoride kitap bulunamadı."
        onItemClick={handleBookClick} // Artık uyumlu
      />

      {/* Book Details Modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}

      <AddMedia
        mediaType="book"
        isOpen={isOpen}
        onClose={onClose}
        onSearch={handleAddSearch}
        searchState={searchState}
        searchResults={searchResults}
        onItemSelect={item => {
          console.log('Seçilen Kitap:', item);
          // Burada seçilen kitabı ekleme formu açılabilir veya direkt kütüphaneye eklenebilir.
        }}
        optionalFields={[
          { name: 'author', label: 'Yazar', placeholder: 'Örn. Orhan Pamuk' },
          { name: 'publisher', label: 'Yayınevi', placeholder: 'Örn. Can Yayınları' },
        ]}
      />
    </>
  );
};

export default LibraryPage;

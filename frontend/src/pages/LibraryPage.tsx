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

  // AddMedia için state yönetimi
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleAddSearch = async (payload: { query: string; extras: Record<string, string> }) => {
    if (!GOOGLE_BOOKS_API_KEY) {
      console.error('Google Books API anahtarı bulunamadı.');
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
      
      // API response'unu doğrudan Book tipine map et
      const books: Book[] = rawItems.map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors,
        imageLinks: item.volumeInfo.imageLinks,
        publishedDate: item.volumeInfo.publishedDate,
        publisher: item.volumeInfo.publisher,
        pageCount: item.volumeInfo.pageCount,
        averageRating: item.volumeInfo.averageRating,
        ratingsCount: item.volumeInfo.ratingsCount,
        categories: item.volumeInfo.categories,
        description: item.volumeInfo.description,
        language: item.volumeInfo.language,
        ISBN: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
        status: 'want-to-read' // Varsayılan status
    }));

    // Duplicate kontrolü
    const uniqueBooks = books.reduce((acc: Book[], current: Book) => {
      if (!acc.find(book => book.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, []);

    setSearchResults(uniqueBooks);
    setSearchState(uniqueBooks.length > 0 ? 'success' : 'no-results');
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

      <AddMedia
        mediaType="book"
        isOpen={isOpen}
        onClose={onClose}
        onSearch={handleAddSearch}
        searchState={searchState}
        searchResults={searchResults}
        onItemSelect={item => {
          // AddMedia modalını KAPATMA, sadece kitap detay modalını aç
          setSelectedBook(item);
          setModalOpen(true);
          // onClose() çağrısını KALDIRDIK
        }}
        optionalFields={[
          { name: 'author', label: 'Yazar', placeholder: 'Örn. Orhan Pamuk' },
          { name: 'publisher', label: 'Yayınevi', placeholder: 'Örn. Can Yayınları' },
        ]}
      />

      {/* Book Details Modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          isOpen={isModalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedBook(null);
            // BookModal kapatıldığında AddMedia hala açık kalacak
          }}
        />
      )}
    </>
  );
};

export default LibraryPage;

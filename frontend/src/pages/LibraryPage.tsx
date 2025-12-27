import React, { useState, useEffect } from 'react';
import { Badge, useDisclosure } from '@chakra-ui/react';
import { type Book, statusFromBackend } from '../types';
import ResourcePageLayout from '../components/ui/views/resource-page-layout';
import BookModal from '../components/ui/modals/book-modal'; 
import AddMedia, { type SearchState } from '../components/ui/add-media';

const getStatusBadge = (status: string) => {
  const statusNormalized = String(status ?? '').toLowerCase();
  const statusConfig: Record<string, { text: string; colorScheme: string }> = {
    'want-to-read': { text: 'Want to Read', colorScheme: 'yellow' },
    reading: { text: 'Reading', colorScheme: 'blue' },
    read: { text: 'Read', colorScheme: 'green' }
  };
  const config = statusConfig[statusNormalized];
  return config ? <Badge colorScheme={config.colorScheme} variant="subtle" size="sm">{config.text}</Badge> : null;
};
 
const filters = [
  { key: 'all', label: 'All' },
  { key: 'want-to-read', label: 'Want to Read' },
  { key: 'reading', label: 'Reading' },
  { key: 'read', label: 'Read' }
];

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

const LibraryPage = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // AddMedia için state yönetimi
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  // Backend olarak çekilen kitaplar
  const [items, setItems] = useState<Book[]>([]);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/v1/mediaItems/type/Book');
      if (!res.ok) throw new Error('Failed to fetch books');
      const data = await res.json();
      const normalizeStatus = (s: any, def: ItemStatus): ItemStatus => {
        const v = String(s ?? '').toLowerCase().replace('_', '-');
        const allowed: ItemStatus[] = ['want-to-read','reading','read','want-to-watch','watched'];
        return allowed.includes(v as ItemStatus) ? (v as ItemStatus) : def;
      };

      const mapped: Book[] = (data || []).map((b: any) => ({
        id: b._id ?? b.id,
        title: b.title,
        authors: b.author ? [b.author] : b.authors ?? [],
        imageLinks: b.coverPhoto ? { thumbnail: b.coverPhoto, smallThumbnail: b.coverPhoto } : b.imageLinks ?? undefined,
        publishedDate: b.publishedDate ?? undefined,
        publisher: b.publisher ?? '',
        pageCount: b.pageCount ?? undefined,
        averageRating: b.ratings && b.ratings.length ? parseFloat(b.ratings[0].value) || undefined : undefined,
        ratingsCount: b.ratingCount ?? undefined,
        categories: b.categories ?? [],
        description: b.description ?? '',
        language: b.language ?? '',
        ISBN: b.ISBN ?? '',
        // map backend enum -> frontend ItemStatus
        status: statusFromBackend(b.status),
      }));
      setItems(mapped);
    } catch (err) {
      console.error('Fetch books error', err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddSearch = async (payload: { query: string; extras: Record<string, string> }) => {
    if (!GOOGLE_BOOKS_API_KEY) {
      console.error('Google Books API key not found.');
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
        throw new Error('API request failed');
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
    console.error('Search error:', error);
    setSearchState('error');
  }
  };

  return (
    <>
      <ResourcePageLayout
        pageTitle="📚 My Library"
        activeItem="kitaplik"
        mockData={items}
        filters={filters}
        getStatusBadge={getStatusBadge}
        itemType="book"
        addItemButtonText="+ Add Book"
        onAddItem={onOpen}
        emptyStateIcon="📚"
        emptyStateText="No books found in this category."
        onItemClick={handleBookClick}
      />

      <AddMedia
        mediaType="book"
        isOpen={isOpen}
        onClose={onClose}
        onSearch={handleAddSearch}
        searchState={searchState}
        searchResults={searchResults}
        onItemSelect={item => {
          const mapped: Book = {
            id: (item as any)._id ?? (item as any).id,
            title: item.title,
            authors: item.authors ?? (item.author ? [item.author] : []),
            imageLinks: item.imageLinks ?? (item.coverPhoto ? { thumbnail: item.coverPhoto, smallThumbnail: item.coverPhoto } : undefined),
            publishedDate: item.publishedDate ?? undefined,
            publisher: (item as any).publisher ?? '',
            pageCount: (item as any).pageCount ?? undefined,
            averageRating: item.ratings && item.ratings.length ? parseFloat(item.ratings[0].value) || undefined : undefined,
            ratingsCount: item.ratingCount ?? undefined,
            categories: item.categories ?? [],
            description: item.description ?? '',
            language: item.language ?? '',
            ISBN: (item as any).ISBN ?? '',
            status: statusFromBackend((item as any).status ?? (item as any).status),
          };
          setItems(prev => [mapped, ...prev]);
          setSelectedBook(mapped);
          setModalOpen(true);
        }}
        optionalFields={[
          { name: 'author', label: 'Author', placeholder: 'e.g. George Orwell' },
          { name: 'publisher', label: 'Publisher', placeholder: 'e.g. Penguin Books' },
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
          }}
        />
      )}
    </>
  );
};

export default LibraryPage;

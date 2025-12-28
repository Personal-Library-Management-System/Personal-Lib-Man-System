import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../lib/apiFetch'
import { Badge, useDisclosure, useToast } from '@chakra-ui/react';
import { type Book } from '../types';
import ResourcePageLayout from '../components/ui/views/resource-page-layout';
import BookModal from '../components/ui/modals/book-modal';
import AddMedia, { type SearchState } from '../components/ui/add-media';
import * as libraryApi from '../services/library.service';

const getStatusBadge = (status: string) => {
    const statusConfig: Record<Book['status'], { text: string; colorScheme: string }> = {
        read: { text: 'Read', colorScheme: 'green' },
        reading: { text: 'Reading', colorScheme: 'blue' },
        'want-to-read': { text: 'Want to Read', colorScheme: 'yellow' },
    };
    if (status in statusConfig) {
        const config = statusConfig[status as Book['status']];
        return (
            <Badge colorScheme={config.colorScheme} variant="subtle" size="sm">
                {config.text}
            </Badge>
        );
    }
    return null;
};

const filters = [
    { key: 'all', label: 'All' },
    { key: 'read', label: 'Read' },
    { key: 'reading', label: 'Reading' },
    { key: 'want-to-read', label: 'Want to Read' },
];

const LibraryPage = () => {
    const toast = useToast();
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Mevcut kitap ID'lerini Map olarak hazırla (Google Books ID -> Backend ID mapping)
    const existingBookIdsMap = useMemo(() => {
        const map = new Map<string, string>(); // Google Books ID -> Backend ID
        books.forEach(book => {
            // Backend ID'yi sakla
            map.set(book.id, book.id);
            // ISBN varsa onu da mapping'e ekle
            if (book.ISBN) {
                map.set(book.ISBN, book.id);
            }
            // Google Books ID'si varsa (externalId olarak saklanan)
            if ((book as any).externalId) {
                map.set((book as any).externalId, book.id);
            }
        });
        return map;
    }, [books]);

    const existingBookIds = useMemo(() => {
        return new Set(existingBookIdsMap.keys());
    }, [existingBookIdsMap]);

    // Kitapları fetch et
    const fetchBooks = async () => {
        setIsLoading(true);
        try {
            const response = await apiFetch('/mediaItems/type/Book');
            if (!response.ok) {
                throw new Error('Failed to fetch books');
            }
            const data = await response.json();
            
            console.log('Fetched data:', data);
            
            const booksArray = Array.isArray(data) ? data : (data.items || data.data || []);
            
            // Backend'den gelen veriyi düzgün formata çevir
            const mappedBooks: Book[] = booksArray.map((book: any) => ({
                id: book._id || book.id, // MongoDB _id kullanıyorsa
                title: book.title,
                authors: book.author ? [book.author] : (book.authors || []),
                imageLinks: book.coverPhoto ? { thumbnail: book.coverPhoto } : (book.imageLinks || {}),
                publishedDate: book.publishedDate,
                publisher: book.publisher,
                pageCount: book.pageCount,
                averageRating: book.averageRating || (book.ratings?.[0]?.value ? parseFloat(book.ratings[0].value) : undefined),
                ratingsCount: book.ratingCount,
                categories: book.categories || [],
                description: book.description,
                language: book.language,
                ISBN: book.ISBN,
                status: book.status === 'PLANNED' ? 'want-to-read' : 
                        book.status === 'IN_PROGRESS' ? 'reading' : 
                        book.status === 'COMPLETED' ? 'read' : 'want-to-read',
                // Google Books ID'sini sakla (eğer varsa)
                ...(book.externalId && { externalId: book.externalId })
            } as any));
            
            // Duplicate kontrolü
            const uniqueBooks = mappedBooks.reduce((acc: Book[], current: Book) => {
                if (!acc.find(book => book.id === current.id)) {
                    acc.push(current);
                }
                return acc;
            }, []);
            
            if (mappedBooks.length !== uniqueBooks.length) {
                console.warn(`Removed ${mappedBooks.length - uniqueBooks.length} duplicate books`);
            }
            
            console.log('Unique books with IDs:', uniqueBooks.map(b => ({ id: b.id, title: b.title })));
            
            setBooks(uniqueBooks);
        } catch (error) {
            console.error('Error fetching books:', error);
            setBooks([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleBookClick = (book: Book) => {
        setSelectedBook(book);
        setModalOpen(true);
    };

    // AddMedia için state yönetimi
    const [searchState, setSearchState] = useState<SearchState>('idle');
    const [searchResults, setSearchResults] = useState<Book[]>([]);

    const handleAddSearch = async (payload: { query: string; extras: Record<string, string> }) => {
        setSearchState('loading');
        setSearchResults([]);

        let query = payload.query;
        if (payload.extras.author) {
            query += ` ${payload.extras.author}`;
        }
        if (payload.extras.publisher) {
            query += ` ${payload.extras.publisher}`;
        }

        try {
            const response = await apiFetch(`/google-books?q=${encodeURIComponent(query)}&maxResults=20`);
            if (!response.ok) {
                throw new Error('API request failed');
            }
            const data = await response.json();
            const rawItems = data.items || [];

            const apiBooks: Book[] = rawItems.map((item: any) => ({
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
                status: 'want-to-read',
            }));

            const uniqueBooks = apiBooks.reduce((acc: Book[], current: Book) => {
                if (!acc.find((book) => book.id === current.id)) {
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

    const handleAddBook = async (item: Book | any) => {
        // Type guard: Sadece Book tipinde itemları kabul et
        if (!('authors' in item || 'ISBN' in item)) {
            console.error('Invalid item type for book addition');
            return;
        }
        
        const book = item as Book;
        
        // Ratings array oluştur - Google Books'tan gelen averageRating'i kullan
        const ratings: { source: string; value: string }[] = [];
        if (book.averageRating != null && book.averageRating > 0) {
            ratings.push({
                source: "Google Books",
                value: book.averageRating.toString()
            });
        }

        const payload = {
            mediaType: "Book",
            title: book.title,
            publishedDate: book.publishedDate || new Date().toISOString().split('T')[0],
            ratings: ratings,
            ratingCount: book.ratingsCount || 0,
            categories: book.categories || [],
            description: book.description || "",
            coverPhoto: book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail || "",
            language: book.language || "en",
            author: book.authors?.join(', ') || "Unknown",
            tags: [],
            status: "PLANNED",
            myRating: 0,
            progress: 0,
            personalNotes: "",
            ISBN: book.ISBN || "",
            pageCount: book.pageCount || 1,
            publisher: book.publisher || "",
            externalId: book.id // Google Books ID'sini externalId olarak sakla
        };

        const response = await apiFetch('/mediaItems', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add book');
        }

        // Arka planda listeyi güncelle
        await fetchBooks();
    };

    const handleRemoveBook = async (googleBooksId: string) => {
        // Google Books ID'den backend ID'yi bul
        const backendId = existingBookIdsMap.get(googleBooksId);
        
        if (!backendId) {
            console.error('Backend ID not found for Google Books ID:', googleBooksId);
            throw new Error('Book not found in library');
        }

        console.log('Removing book - Google Books ID:', googleBooksId, 'Backend ID:', backendId);

        const response = await apiFetch(`/mediaItems/${backendId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to remove book');
        }

        // Arka planda listeyi güncelle
        await fetchBooks();
    };

    return (
        <>
            <ResourcePageLayout
                pageTitle="📚 My Library"
                activeItem="kitaplik"
                mockData={books}
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
                onItemAdd={handleAddBook}
                optionalFields={[
                    { name: 'author', label: 'Author', placeholder: 'e.g. George Orwell' },
                    { name: 'publisher', label: 'Publisher', placeholder: 'e.g. Penguin Books' },
                ]}
                existingItemIds={existingBookIds}
            />

            {selectedBook && (
                <BookModal
                    book={selectedBook}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedBook(null);
                    }}
                    onDelete={(bookId) => {
                        setBooks(prev => prev.filter(b => b.id !== bookId));
                        setModalOpen(false);
                        setSelectedBook(null);
                    }}
                />
            )}
        </>
    );
};

export default LibraryPage;

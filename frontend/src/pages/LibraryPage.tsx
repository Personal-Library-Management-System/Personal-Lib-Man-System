import React, { useState, useEffect } from 'react';
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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const LibraryPage = () => {
    const toast = useToast();
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    // Backend'den gelen kitaplar
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoadingBooks, setIsLoadingBooks] = useState(true);

    // Backend'den kitapları çek
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setIsLoadingBooks(true);
                const library = await libraryApi.exportLibrary();
                
                // MediaItems'dan sadece Book olanları filtrele ve Book tipine dönüştür
                const bookItems = library.mediaItems
                    .filter((item: any) => item.mediaType === 'Book')
                    .map((item: any) => ({
                        id: item._id,
                        title: item.title,
                        authors: item.author ? [item.author] : [],
                        imageLinks: item.coverPhoto ? { thumbnail: item.coverPhoto } : undefined,
                        publishedDate: item.publishedDate,
                        pageCount: item.progress || 0,
                        averageRating: item.ratings?.[0]?.value ? parseFloat(item.ratings[0].value) : undefined,
                        categories: item.categories || [],
                        description: item.description || '',
                        language: item.language,
                        status: mapBackendStatus(item.status),
                        rating: item.myRating,
                        personalNote: item.personalNotes,
                    }));
                
                setBooks(bookItems);
            } catch (error) {
                console.error('Error fetching books:', error);
                toast({
                    title: 'Error loading books',
                    description: 'Could not load your library. Please try again.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setIsLoadingBooks(false);
            }
        };

        fetchBooks();
    }, [toast]);

    // Backend status'unu frontend status'una dönüştür
    const mapBackendStatus = (status: string): Book['status'] => {
        const statusMap: Record<string, Book['status']> = {
            'COMPLETED': 'read',
            'IN_PROGRESS': 'reading',
            'PLANNED': 'want-to-read',
        };
        return statusMap[status] || 'want-to-read';
    };

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

        let apiQuery = `intitle:${payload.query}`;
        if (payload.extras.author) {
            apiQuery += `+inauthor:${payload.extras.author}`;
        }
        if (payload.extras.publisher) {
            apiQuery += `+inpublisher:${payload.extras.publisher}`;
        }

        try {
            const response = await fetch(
                `${BACKEND_URL}/google-books?q=${encodeURIComponent(apiQuery)}`,
                {
                    credentials: 'include',
                }
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
                status: 'want-to-read', // Varsayılan status
            }));

            // Duplicate kontrolü
            const uniqueBooks = books.reduce((acc: Book[], current: Book) => {
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
                onItemSelect={(item) => {
                    // Tip kontrolü: item'in Book olduğundan emin ol
                    if ('authors' in item || typeof item.id === 'string') {
                        setSelectedBook(item as Book);
                        setModalOpen(true);
                    }
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

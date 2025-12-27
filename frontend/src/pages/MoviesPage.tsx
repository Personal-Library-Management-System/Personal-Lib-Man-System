import { useState } from 'react';
import { Badge, useDisclosure } from '@chakra-ui/react';
import { type Movie } from '../types';
import mockMoviesData from '../mock-data/movie-data.json';
import ResourcePageLayout from '../components/ui/views/resource-page-layout';
import MovieModal from '../components/ui/modals/movie-modal';
import AddMedia, { type SearchState } from '../components/ui/add-media';

const getStatusBadge = (status: string) => {
    const statusConfig: Record<Movie['status'], { text: string; colorScheme: string }> = {
        watched: { text: 'Watched', colorScheme: 'green' },
        'want-to-watch': { text: 'Want to Watch', colorScheme: 'yellow' },
    };
    if (status in statusConfig) {
        const config = statusConfig[status as Movie['status']];
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
    { key: 'watched', label: 'Watched' },
    { key: 'want-to-watch', label: 'Want to Watch' },
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MoviesPage = () => {
    const [isMovieModalOpen, setMovieModalOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleMovieClick = (movie: Movie) => {
        setSelectedMovie(movie);
        setMovieModalOpen(true);
    };

    const [searchState, setSearchState] = useState<SearchState>('idle');
    const [searchResults, setSearchResults] = useState<Movie[]>([]);

    const handleAddSearch = async (payload: { query: string; extras: Record<string, string> }) => {

        setSearchState('loading');
        setSearchResults([]);

        // Build query for OMDb API
        let apiUrl = `${BACKEND_URL}/omdb?s=${encodeURIComponent(payload.query)}`;
        if (payload.extras.year) {
            apiUrl += `&y=${payload.extras.year}`;
        }

        try {
            const response = await fetch(apiUrl, {
                credentials: 'include',
            });
            if (!response.ok) throw new Error('OMDb API request failed');

            const data = await response.json();
            if (data.Response === 'True') {
                // Benzersiz IMDb ID'leri için Set kullan
                const uniqueMovieIds = new Set<string>();

                // OMDb'den gelen veriyi Movie formatına dönüştür
                const moviePromises = data.Search.filter((movie: any) => {
                    // Duplicate kontrolü
                    if (uniqueMovieIds.has(movie.imdbID)) {
                        return false;
                    }
                    uniqueMovieIds.add(movie.imdbID);
                    return true;
                }).map(async (movie: any) => {
                    try {
                        // Her film için detaylı bilgi al
                        const detailResponse = await fetch(
                            `${BACKEND_URL}/omdb?i=${movie.imdbID}`,
                            {
                                credentials: 'include',
                            }
                        );
                        const detailData = await detailResponse.json();

                        return {
                            id: movie.imdbID, // IMDb ID'yi doğrudan string olarak kullan
                            title: movie.Title,
                            director: detailData.Director || 'Unknown',
                            imageUrl: movie.Poster !== 'N/A' ? movie.Poster : '',
                            releaseDate: movie.Year,
                            duration: parseInt(detailData.Runtime) || 0,
                            rating: parseFloat(detailData.imdbRating) || 0,
                            status: 'want-to-watch' as const,
                            description: detailData.Plot || 'No description available',
                        };
                    } catch (error) {
                        console.error(`Could not fetch movie details: ${movie.Title}`, error);
                        return null;
                    }
                });

                const movies = (await Promise.all(moviePromises)).filter(
                    (movie): movie is Movie => movie !== null
                );

                setSearchResults(movies);
                setSearchState(movies.length > 0 ? 'success' : 'no-results');
            } else {
                setSearchResults([]);
                setSearchState('no-results');
            }
        } catch (error) {
            console.error('OMDb Search Error:', error);
            setSearchState('error');
        }
    };

    return (
        <>
            <ResourcePageLayout
                pageTitle="🎬 My Movies"
                activeItem="filmarsivi"
                mockData={mockMoviesData as Movie[]}
                filters={filters}
                getStatusBadge={getStatusBadge}
                itemType="movie"
                addItemButtonText="+ Add Movie"
                onAddItem={onOpen}
                emptyStateIcon="🎬"
                emptyStateText="No movies found in this category."
                onItemClick={handleMovieClick}
            />

            <AddMedia
                mediaType="movie"
                isOpen={isOpen}
                onClose={onClose}
                onSearch={handleAddSearch}
                searchState={searchState}
                searchResults={searchResults}
                onItemSelect={(item) => {
                    // Tip kontrolü: item'in Movie olduğundan emin ol
                    if ('director' in item || typeof item.id === 'string') {
                        setSelectedMovie(item as Movie);
                        setMovieModalOpen(true);
                    }
                }}
                optionalFields={[
                    { name: 'director', label: 'Director', placeholder: 'e.g. Christopher Nolan' },
                    { name: 'year', label: 'Release Year', placeholder: 'e.g. 2021' },
                ]}
            />

            {/* Movie Details Modal */}
            {selectedMovie && (
                <MovieModal
                    isOpen={isMovieModalOpen}
                    onClose={() => {
                        setMovieModalOpen(false);
                        setSelectedMovie(null);
                    }}
                    movie={selectedMovie}
                />
            )}
        </>
    );
};

export default MoviesPage;

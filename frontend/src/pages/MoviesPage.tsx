import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../lib/apiFetch';
import { Badge, useDisclosure, useToast } from '@chakra-ui/react';
import { type Movie } from '../types';
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
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();

    // Mevcut film ID'lerini Map olarak hazırla (IMDb ID -> Backend ID mapping)
    const existingMovieIdsMap = useMemo(() => {
        const map = new Map<string, string>(); // IMDb ID -> Backend ID
        movies.forEach(movie => {
            // Backend ID'yi sakla
            map.set(movie.id, movie.id);
            // IMDb ID varsa (externalId olarak saklanan)
            if ((movie as any).externalId) {
                map.set((movie as any).externalId, movie.id);
            }
        });
        return map;
    }, [movies]);

    const existingMovieIds = useMemo(() => {
        return new Set(existingMovieIdsMap.keys());
    }, [existingMovieIdsMap]);

    // Filmleri fetch et
    const fetchMovies = async () => {
        setIsLoading(true);
        try {
            const response = await apiFetch('/mediaItems/type/Movie');
            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }
            const data = await response.json();
            
            console.log('Fetched movies:', data);
            
            const moviesArray = Array.isArray(data) ? data : (data.items || data.data || []);
            
            // Backend'den gelen veriyi düzgün formata çevir
            const mappedMovies: Movie[] = moviesArray.map((movie: any) => ({
                id: movie._id || movie.id,
                title: movie.title,
                director: movie.director || 'Unknown',
                imageUrl: movie.coverPhoto || '',
                releaseDate: movie.releaseDate || movie.publishedDate,
                runtime: movie.runtime || movie.duration || 0,
                ratings: movie.ratings || [],
                ratingCount: movie.ratingCount,
                status: movie.status === 'PLANNED' ? 'want-to-watch' : 
                        movie.status === 'COMPLETED' ? 'watched' : 'want-to-watch',
                plot: movie.description || 'No description available',
                genre: movie.categories || movie.genre || [],
                imdbRating: movie.ratings?.find((r: any) => r.source === 'IMDb' || r.source === 'Internet Movie Database')?.value,
                // IMDb ID'sini sakla (eğer varsa)
                ...(movie.externalId && { externalId: movie.externalId })
            } as any));
            
            // Duplicate kontrolü
            const uniqueMovies = mappedMovies.reduce((acc: Movie[], current: Movie) => {
                if (!acc.find(movie => movie.id === current.id)) {
                    acc.push(current);
                }
                return acc;
            }, []);
            
            if (mappedMovies.length !== uniqueMovies.length) {
                console.warn(`Removed ${mappedMovies.length - uniqueMovies.length} duplicate movies`);
            }
            
            console.log('Unique movies with IDs:', uniqueMovies.map(m => ({ id: m.id, title: m.title })));
            
            setMovies(uniqueMovies);
        } catch (error) {
            console.error('Error fetching movies:', error);
            setMovies([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

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
                            id: movie.imdbID, // IMDb ID
                            title: movie.Title,
                            director: detailData.Director || 'Unknown',
                            imageUrl: movie.Poster !== 'N/A' ? movie.Poster : '',
                            releaseDate: movie.Year,
                            runtime: detailData.Runtime ? parseInt(detailData.Runtime) : 0,
                            status: 'want-to-watch' as const,
                            plot: detailData.Plot || 'No description available',
                            genre: detailData.Genre ? detailData.Genre.split(', ') : [],
                            imdbRating: detailData.imdbRating || '0',
                            imdbVotes: detailData.imdbVotes || '',
                            ratings: detailData.Ratings || [],
                            ratingCount: detailData.imdbVotes ? parseInt(detailData.imdbVotes.replace(/,/g, '')) : 0,
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

    const handleAddMovie = async (item: Movie | any) => {
        // Type guard: Sadece Movie tipinde itemları kabul et
        if (!('director' in item)) {
            console.error('Invalid item type for movie addition');
            return;
        }
        
        const movie = item as Movie;
        
        // OMDb'den gelen ratings array'ini backend formatına çevir
        const ratings: { source: string; value: string }[] = [];
        
        // OMDb Ratings array'i varsa (Source, Value formatında)
        if (movie.ratings && Array.isArray(movie.ratings)) {
            movie.ratings.forEach((rating: any) => {
                if (rating.Source && rating.Value) {
                    ratings.push({
                        source: rating.Source, // "Internet Movie Database", "Rotten Tomatoes", "Metacritic"
                        value: rating.Value
                    });
                }
            });
        }

        const payload = {
            mediaType: "Movie",
            title: movie.title,
            director: movie.director,
            publishedDate: movie.releaseDate || new Date().toISOString().split('T')[0],
            releaseDate: movie.releaseDate,
            ratings: ratings,
            ratingCount: movie.ratingCount || 0,
            categories: movie.genre || [],
            description: movie.plot || "",
            coverPhoto: movie.imageUrl || "",
            language: "en",
            tags: [],
            status: "PLANNED", // want-to-watch = PLANNED
            myRating: 0,
            progress: 0,
            personalNotes: "",
            runtime: movie.runtime || 0, // Backend'de "runtime" olarak tutuluyor
            externalId: movie.id // IMDb ID'sini externalId olarak sakla
        };

        console.log('Movie payload:', payload);

        const response = await apiFetch('/mediaItems', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(errorData.message || 'Failed to add movie');
        }

        const result = await response.json();
        console.log('Movie added successfully:', result);

        // Arka planda listeyi güncelle
        await fetchMovies();
    };

    return (
        <>
            <ResourcePageLayout
                pageTitle="🎬 My Movies"
                activeItem="filmarsivi"
                mockData={movies}
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
                onItemAdd={handleAddMovie}
                optionalFields={[
                    { name: 'director', label: 'Director', placeholder: 'e.g. Christopher Nolan' },
                    { name: 'year', label: 'Release Year', placeholder: 'e.g. 2021' },
                ]}
                existingItemIds={existingMovieIds}
            />

            {selectedMovie && (
                <MovieModal
                    isOpen={isMovieModalOpen}
                    onClose={() => {
                        setMovieModalOpen(false);
                        setSelectedMovie(null);
                    }}
                    movie={selectedMovie}
                    onDelete={(movieId) => {
                        setMovies(prev => prev.filter(m => m.id !== movieId));
                        setMovieModalOpen(false);
                        setSelectedMovie(null);
                    }}
                />
            )}
        </>
    );
};

export default MoviesPage;

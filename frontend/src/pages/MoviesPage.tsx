import { useState, useEffect, useMemo } from 'react';
import { Badge, useDisclosure } from '@chakra-ui/react';
import { type Movie, statusFromBackend } from '../types';
import ResourcePageLayout from '../components/ui/views/resource-page-layout';
import MovieModal from '../components/ui/modals/movie-modal'; 
import AddMedia, { type SearchState } from '../components/ui/add-media';

const getStatusBadge = (status: string) => {
  const statusNormalized = String(status ?? '').toLowerCase();
  const statusConfig: Record<string, { text: string; colorScheme: string }> = {
    'want-to-watch': { text: 'Want to Watch', colorScheme: 'yellow' },
    watched: { text: 'Watched', colorScheme: 'green' }
  };
  const config = statusConfig[statusNormalized];
  return config ? <Badge colorScheme={config.colorScheme} variant="subtle" size="sm">{config.text}</Badge> : null;
};

const filters = [
  { key: 'all', label: 'All' },
  { key: 'want-to-watch', label: 'Want to Watch' },
  { key: 'watched', label: 'Watched' }
];

const OMDb_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

const MoviesPage = () => {
  const [isMovieModalOpen, setMovieModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // AddMedia için state yönetimi
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);

  // Backend olarak çekilen filmler
  const [items, setItems] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const existingMovieIds = useMemo(() => {
    const ids = new Set<string>();
    items.forEach(movie => {
      // ID bazlı kontrol
      ids.add(movie.id);
      if ((movie as any).externalId) ids.add((movie as any).externalId);
      
      // İçerik bazlı kontrol: başlık + yönetmen + yıl (normalize edilmiş)
      const normalizedTitle = movie.title.toLowerCase().trim().replace(/[^\w\s]/g, '');
      const director = (movie.director ?? '').toLowerCase().trim();
      const year = movie.publishedDate ? (() => {
        try { return String(new Date(movie.publishedDate).getFullYear()); }
        catch { return String(movie.publishedDate).match(/\d{4}/)?.[0] ?? ''; }
      })() : '';
      
      if (normalizedTitle) {
        // Format: "title|director|year"
        const contentKey = `${normalizedTitle}|${director}|${year}`;
        ids.add(contentKey);
      }
    });
    return ids;
  }, [items]);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE ?? '';
      const res = await fetch(`${API_BASE}/api/v1/mediaItems/type/Movie`, { credentials: 'include' });
      if (!res.ok) {
        const ct = res.headers.get('content-type') ?? '';
        const body = ct.includes('application/json') ? await res.json() : await res.text();
        throw new Error(`Failed to fetch movies: ${res.status} ${res.statusText} - ${typeof body === 'string' ? body.slice(0,200) : JSON.stringify(body)}`);
      }

      const ct = res.headers.get('content-type') ?? '';
      if (!ct.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Expected JSON response but got: ${text.slice(0,200)}`);
      }

      const data = await res.json();
      console.debug('fetchMovies response', data);
      const list: any[] = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : Array.isArray((data as any).data) ? (data as any).data : [];

      const mapped: Movie[] = list.map((m: any) => ({
        id: m._id ?? m.id,
        title: m.title,
        director: m.director ?? m.author ?? '',
        coverPhoto: m.coverPhoto ?? '',
        publishedDate: m.publishedDate ?? undefined,
        runtime: m.runtime ?? 0,
        ratings: Array.isArray(m.ratings) ? m.ratings : (m.ratings ? [m.ratings] : []),
        status: statusFromBackend(m.status),
        description: m.description ?? '',
        categories: m.categories ?? [],
        language: m.language ?? '',
        mediaType: 'Movie'
      }));
     
     // Debug: duplicateleri kontrol et
     const idCounts = mapped.reduce((acc, movie) => {
       acc[movie.id] = (acc[movie.id] || 0) + 1;
       return acc;
     }, {} as Record<string, number>);
     const duplicates = Object.entries(idCounts).filter(([_, count]) => count > 1);
     if (duplicates.length > 0) {
       console.warn('Duplicate movie IDs found:', duplicates);
       console.table(mapped.filter(m => duplicates.some(([id]) => id === m.id)));
     }
     
      setItems(mapped);
    } catch (err) {
      console.error('Fetch movies error', err);
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

  const handleAddSearch = async (payload: { query: string; extras: Record<string, string> }) => {
    if (!OMDb_API_KEY) {
      console.error('OMDb API key not found.');
      setSearchState('error');
      return;
    }

    setSearchState('loading');
    setSearchResults([]);

    // Build query for OMDb API
    let apiUrl = `https://www.omdbapi.com/?apikey=${OMDb_API_KEY}&s=${encodeURIComponent(payload.query)}`;
    if (payload.extras.year) {
      apiUrl += `&y=${payload.extras.year}`;
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('OMDb API request failed');

      const data = await response.json();
      if (data.Response === 'True') {
        // Benzersiz IMDb ID'leri için Set kullan
        const uniqueMovieIds = new Set<string>();
        
        // OMDb'den gelen veriyi Movie formatına dönüştür
        const moviePromises = data.Search
          .filter((movie: any) => {
            // Duplicate kontrolü
            if (uniqueMovieIds.has(movie.imdbID)) {
              return false;
            }
            uniqueMovieIds.add(movie.imdbID);
            return true;
          })
          .map(async (movie: any) => {
            try {
              // Her film için detaylı bilgi al
              const detailResponse = await fetch(
                `https://www.omdbapi.com/?apikey=${OMDb_API_KEY}&i=${movie.imdbID}`
              );
              const detailData = await detailResponse.json();
              console.log('OMDb detail response for', movie.Title, ':', detailData);

              // Extract ratings from OMDb
              const ratings: { source: string; value: string }[] = [];
              if (detailData.imdbRating && detailData.imdbRating !== 'N/A') {
                ratings.push({ source: 'imdb', value: detailData.imdbRating });
              }
              if (Array.isArray(detailData.Ratings)) {
                detailData.Ratings.forEach((r: any) => {
                  const source = String(r.Source ?? '').toLowerCase();
                  if (source.includes('rotten')) {
                    ratings.push({ source: 'rotten tomatoes', value: r.Value });
                  } else if (source.includes('metacritic')) {
                    ratings.push({ source: 'metacritic', value: r.Value });
                  }
                });
              }

              return {
                id: movie.imdbID,
                title: movie.Title,
                director: detailData.Director || 'Unknown',
                coverPhoto: movie.Poster !== 'N/A' ? movie.Poster : '',
                publishedDate: movie.Year,
                runtime: parseInt(detailData.Runtime) || 0,
                ratings,
                status: 'want-to-watch' as const,
                description: detailData.Plot || 'No description available',
                categories: detailData.Genre ? detailData.Genre.split(', ') : [],
                language: detailData.Language || '',
                mediaType: 'Movie'
              };
            } catch (error) {
              console.error(`Could not fetch movie details: ${movie.Title}`, error);
              return null;
            }
          });

        const movies = (await Promise.all(moviePromises)).filter((movie): movie is Movie => movie !== null);

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

  const handleCloseAddMedia = () => {
    onClose();
    fetchMovies(); // Listeyi yenile
  };

  return (
    <>
      <ResourcePageLayout
        pageTitle="🎬 My Movies"
        activeItem="filmarsivi"
        mockData={items}
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
        onClose={handleCloseAddMedia}
        onSearch={handleAddSearch}
        searchState={searchState}
        searchResults={searchResults}
        onItemSelect={() => {}}
        optionalFields={[
          { name: 'director', label: 'Director', placeholder: 'e.g. Christopher Nolan' },
          { name: 'year', label: 'Release Year', placeholder: 'e.g. 2021' }
        ]}
        existingItemIds={existingMovieIds}
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
         onDelete={(movieId) => {
           setItems(prev => prev.filter(m => m.id !== movieId));
         }}
        />
      )}
    </>
  );
};

export default MoviesPage;

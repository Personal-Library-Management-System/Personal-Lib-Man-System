import { useState, useEffect } from 'react';
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

  const fetchMovies = async () => {
    try {
      const res = await fetch('/api/v1/mediaItems/type/Movie');
      if (!res.ok) throw new Error('Failed to fetch movies');
      const data = await res.json();
      
      const normalizeStatus = (s: any, def: ItemStatus): ItemStatus => {
        const v = String(s ?? '').toLowerCase().replace('_', '-');
        const allowed: ItemStatus[] = ['want-to-read','reading','read','want-to-watch','watched'];
        return allowed.includes(v as ItemStatus) ? (v as ItemStatus) : def;
      };

      // map backend shape -> frontend Movie shape used here
      const mapped: Movie[] = (data || []).map((m: any) => ({
        id: m._id ?? m.id,
        title: m.title,
        director: m.director ?? m.author ?? '',
        imageUrl: m.coverPhoto ?? '',
        releaseDate: m.publishedDate ? String(new Date(m.publishedDate).getFullYear()) : '',
        duration: m.runtime ?? 0,
        // ratings is an array of { source, value }
        ratings: Array.isArray(m.ratings) ? m.ratings : (m.ratings ? [m.ratings] : []),
        status: statusFromBackend(m.status),
        description: m.description ?? '',
      }));
      setItems(mapped);
    } catch (err) {
      console.error('Fetch movies error', err);
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

              return {
                id: movie.imdbID, // IMDb ID'yi doğrudan string olarak kullan
                title: movie.Title,
                director: detailData.Director || 'Unknown',
                imageUrl: movie.Poster !== 'N/A' ? movie.Poster : '',
                releaseDate: movie.Year,
                duration: parseInt(detailData.Runtime) || 0,
                ratings: detailData.imdbRating ? [{ source: 'imdb', value: String(detailData.imdbRating) }] : [],
                status: 'want-to-watch' as const,
                description: detailData.Plot || 'No description available'
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
        onClose={onClose}
        onSearch={handleAddSearch}
        searchState={searchState}
        searchResults={searchResults}
        onItemSelect={item => {
          // backend'den create edilen item geldiğinde mediaType Book/Movie olacak
          // add to local list and open modal
          const mapped: Movie = {
            id: (item as any)._id ?? (item as any).id,
            title: item.title,
            director: (item as any).director ?? (item as any).author ?? '',
            coverPhoto: (item as any).coverPhoto ?? '',
            publishedDate: item.publishedDate ? String(new Date(item.publishedDate).getFullYear()) : '',
            runtime: (item as any).runtime ?? 0,
            ratings: Array.isArray(item.ratings) ? item.ratings : (item.ratings ? [item.ratings] : []),
            status: statusFromBackend((item as any).status ?? (item as any).status),
            description: item.description ?? '',
          };
          setItems(prev => [mapped, ...prev]);
          setSelectedMovie(mapped);
          setMovieModalOpen(true);
        }}
        optionalFields={[
          { name: 'director', label: 'Director', placeholder: 'e.g. Christopher Nolan' },
          { name: 'year', label: 'Release Year', placeholder: 'e.g. 2021' }
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

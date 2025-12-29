import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Image,
  Stack,
  HStack,
  Spinner,
  IconButton,
  useToast,
  Tooltip
} from '@chakra-ui/react';
import { FaBook, FaList, FaChartBar } from 'react-icons/fa';
import { FiPlus, FiCheck } from 'react-icons/fi';
import AiRecommendation from '../components/ui/ai-recommendation';
import apiFetch from '../lib/apiFetch';
import type { Movie } from '../types';
import Layout from '../components/ui/layout';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Book {
  id: string;
  title: string;
  authors: string[];
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
  };
  publishedDate?: string;
  publisher?: string;
  pageCount?: number;
  averageRating?: number;
  ratingsCount?: number;
  categories?: string[];
  description?: string;
  language?: string;
  ISBN?: string;
  status?: string;
}

interface AIRecommendation {
  type: 'movie' | 'book';
  title: string;
  director?: string;
  writer?: string;
  releaseDate?: string;
  releasedDate?: string;
}

const MainPage = () => {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.300');

  // Store enriched results (books and movies with full details)
  const [aiResults, setAiResults] = useState<Array<Movie | Book>>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Track existing library items to prevent duplicates
  const [existingItems, setExistingItems] = useState<Set<string>>(new Set());
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  // Loading UX states
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingIntervalRef = useRef<number | null>(null);

  const MASTER_LOADING_STEPS = {
    step1: 'Decoding your cultural footprint...',
    step2: 'Calibrating taste profile based on your ratings...',
    step3: "Processing semantic nuances in your notes...",
    step4: 'Curating bespoke recommendations...',
    step5: 'Finalizing your collection...'
  };
  
  const activeLoadingStepsRef = useRef<string[]>([]);
  const pendingResultsRef = useRef<Array<Movie | Book> | null>(null);
  const responseReadyRef = useRef(false);

  // Fetch existing library items on mount
  useEffect(() => {
    const fetchExistingItems = async () => {
      try {
        const [booksRes, moviesRes] = await Promise.all([
          apiFetch('/mediaItems/type/Book'),
          apiFetch('/mediaItems/type/Movie')
        ]);

        const bookIds = new Set<string>();
        const movieIds = new Set<string>();

        if (booksRes.ok) {
          const books = await booksRes.json();
          const booksArray = Array.isArray(books) ? books : (books.items || books.data || []);
          booksArray.forEach((book: any) => {
            if (book.externalId) bookIds.add(book.externalId); // Google Books ID
            if (book.ISBN) bookIds.add(book.ISBN);
            if (book._id) bookIds.add(book._id);
          });
        }

        if (moviesRes.ok) {
          const movies = await moviesRes.json();
          const moviesArray = Array.isArray(movies) ? movies : (movies.items || movies.data || []);
          moviesArray.forEach((movie: any) => {
            if (movie.imdbID) movieIds.add(movie.imdbID);
            if (movie._id) movieIds.add(movie._id);
          });
        }

        setExistingItems(new Set([...bookIds, ...movieIds]));
      } catch (error) {
        console.error('Error fetching existing items:', error);
      }
    };

    fetchExistingItems();
  }, []);

  const startLoadingCycle = (opts?: { useHistory?: boolean; useRatings?: boolean; useComments?: boolean }) => {
    const steps: string[] = [];
    steps.push(MASTER_LOADING_STEPS.step1);
    if (opts?.useRatings) steps.push(MASTER_LOADING_STEPS.step2);
    if (opts?.useComments) steps.push(MASTER_LOADING_STEPS.step3);
    steps.push(MASTER_LOADING_STEPS.step4);
    steps.push(MASTER_LOADING_STEPS.step5);

    activeLoadingStepsRef.current = steps;
    setLoadingMessageIndex(0);
    setLoading(true);

    const skippedSteps = 
      (!opts?.useRatings ? 1 : 0) + 
      (!opts?.useComments ? 1 : 0);
    const interval = 2000 + (skippedSteps * 600);

    if (loadingIntervalRef.current) {
      window.clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }

    loadingIntervalRef.current = window.setInterval(() => {
      setLoadingMessageIndex((prev) => {
        const next = prev + 1;
        if (next >= activeLoadingStepsRef.current.length - 1) {
          if (loadingIntervalRef.current) {
            window.clearInterval(loadingIntervalRef.current);
            loadingIntervalRef.current = null;
          }
          if (responseReadyRef.current && pendingResultsRef.current) {
            setAiResults(pendingResultsRef.current);
            pendingResultsRef.current = null;
            responseReadyRef.current = false;
            setLoading(false);
            setTimeout(() => {
              resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }
          return activeLoadingStepsRef.current.length - 1;
        }
        return next;
      });
    }, interval);
  };

  const stopLoadingCycle = () => {
    if (loadingIntervalRef.current) {
      window.clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
    activeLoadingStepsRef.current = [];
    setLoading(false);
    setLoadingMessageIndex(0);
    pendingResultsRef.current = null;
    responseReadyRef.current = false;
  };

  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) {
        window.clearInterval(loadingIntervalRef.current);
      }
    };
  }, []);

  // Fetch book details from Google Books
  const fetchBookDetails = async (title: string, writer: string): Promise<Book | null> => {
    try {
      const query = `${title} ${writer}`.trim();
      const response = await apiFetch(`/google-books?q=${encodeURIComponent(query)}&maxResults=1`);
      
      if (!response.ok) {
        console.error('Google Books API request failed for:', title);
        return null;
      }

      const data = await response.json();
      const items = data.items || [];
      
      if (items.length === 0) return null;

      const item = items[0];
      const volumeInfo = item.volumeInfo;

      return {
        id: item.id,
        title: volumeInfo.title,
        authors: volumeInfo.authors || [writer],
        imageLinks: volumeInfo.imageLinks,
        publishedDate: volumeInfo.publishedDate,
        publisher: volumeInfo.publisher,
        pageCount: volumeInfo.pageCount,
        averageRating: volumeInfo.averageRating,
        ratingsCount: volumeInfo.ratingsCount,
        categories: volumeInfo.categories,
        description: volumeInfo.description,
        language: volumeInfo.language,
        ISBN: volumeInfo.industryIdentifiers?.[0]?.identifier,
        status: 'want-to-read',
      };
    } catch (error) {
      console.error('Error fetching book details:', title, error);
      return null;
    }
  };

  // Fetch movie details from OMDB
  const fetchMovieDetails = async (title: string, releaseYear?: string): Promise<Movie | null> => {
    try {
      let apiUrl = `${BACKEND_URL}/omdb?t=${encodeURIComponent(title)}`;
      if (releaseYear) {
        apiUrl += `&y=${releaseYear}`;
      }

      const response = await fetch(apiUrl, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('OMDB API request failed for:', title);
        return null;
      }

      const data = await response.json();
      
      if (data.Response === 'False') {
        console.error('OMDB returned error for:', title, data.Error);
        return null;
      }

      return {
        id: data.imdbID,
        title: data.Title,
        director: data.Director || 'Unknown',
        imageUrl: data.Poster !== 'N/A' ? data.Poster : '',
        releaseDate: data.Year,
        runtime: data.Runtime ? parseInt(data.Runtime) : 0,
        status: 'want-to-watch' as const,
        plot: data.Plot || 'No description available',
        genre: data.Genre ? data.Genre.split(', ') : [],
        imdbRating: data.imdbRating || '0',
        imdbVotes: data.imdbVotes || '',
        ratings: data.Ratings || [],
        ratingCount: data.imdbVotes ? parseInt(data.imdbVotes.replace(/,/g, '')) : 0,
        language: data.Language || '',
        writer: data.Writer || '',
        actors: data.Actors ? data.Actors.split(', ') : [],
        awards: data.Awards || '',
      };
    } catch (error) {
      console.error('Error fetching movie details:', title, error);
      return null;
    }
  };

  // Enrich AI recommendations with details from external APIs
  const enrichRecommendations = async (recommendations: AIRecommendation[]): Promise<Array<Movie | Book>> => {
    const enrichedResults = await Promise.all(
      recommendations.map(async (rec) => {
        if (rec.type === 'book') {
          const releaseYear = rec.releasedDate ? rec.releasedDate.split('-')[0] : '';
          return await fetchBookDetails(rec.title, rec.writer || '');
        } else if (rec.type === 'movie') {
          const releaseYear = rec.releaseDate ? rec.releaseDate.split('-')[0] : '';
          return await fetchMovieDetails(rec.title, releaseYear);
        }
        return null;
      })
    );

    return enrichedResults.filter((result): result is Movie | Book => result !== null);
  };

  // Add book to library
  const handleAddBook = async (book: Book) => {
    try {
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
        externalId: book.id
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

      // Mark as added
      setAddedItems(prev => new Set(prev).add(book.id));
      
      toast({
        title: 'Book added',
        description: `"${book.title}" has been added to your library.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding book:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add book',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Add movie to library
  const handleAddMovie = async (movie: Movie) => {
    try {
      const ratings: { source: string; value: string }[] = [];
      
      if (movie.ratings && Array.isArray(movie.ratings)) {
        movie.ratings.forEach((rating: any) => {
          if (rating.Source && rating.Value) {
            ratings.push({
              source: rating.Source,
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
        status: "PLANNED",
        myRating: 0,
        progress: 0,
        personalNotes: "",
        runtime: movie.runtime || 0,
        imdbID: movie.id
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
        throw new Error(errorData.message || 'Failed to add movie');
      }

      // Mark as added
      setAddedItems(prev => new Set(prev).add(movie.id));
      
      toast({
        title: 'Movie added',
        description: `"${movie.title}" has been added to your library.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding movie:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add movie',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Check if item is already in library or was added
  const isItemAdded = (item: Movie | Book): boolean => {
    const itemId = item.id;
    const isBook = 'authors' in item;
    const book = isBook ? (item as Book) : null;
    
    return addedItems.has(itemId) || 
           existingItems.has(itemId) ||
           (book?.ISBN ? existingItems.has(book.ISBN) : false);
  };

  return (
    <Layout activeItem="anasayfa">
      <Box textAlign="center">
        <Heading 
          size="xl" 
          mb={4} 
          color={useColorModeValue('blue.600', 'blue.300')}
        >
          Welcome! 📚
        </Heading>
        
        <Text fontSize="lg" color={subtitleColor} mb={8}>
          Start managing your library.
        </Text>

        {/* Feature Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {/* Kitaplarım Card */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            shadow="md"
            border="1px"
            borderColor={cardBorder}
            _hover={{
              transform: 'translateY(-4px)',
              shadow: 'xl',
              borderColor: 'blue.300'
            }}
            transition="all 0.3s"
            cursor="pointer"
          >
            <Box
              w={16}
              h={16}
              bg="blue.500"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={4}
            >
              <Icon as={FaBook} color="white" boxSize={7} />
            </Box>
            <Heading size="md" mb={3} color={textColor}>
              My Books
            </Heading>
            <Text fontSize="sm" color={subtitleColor}>
              Manage your personal book collection
            </Text>
          </Box>

          {/* Okuma Listesi Card */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            shadow="md"
            border="1px"
            borderColor={cardBorder}
            _hover={{
              transform: 'translateY(-4px)',
              shadow: 'xl',
              borderColor: 'purple.300'
            }}
            transition="all 0.3s"
            cursor="pointer"
          >
            <Box
              w={16}
              h={16}
              bg="purple.500"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={4}
            >
              <Icon as={FaList} color="white" boxSize={7} />
            </Box>
            <Heading size="md" mb={3} color={textColor}>
              Reading List
            </Heading>
            <Text fontSize="sm" color={subtitleColor}>
              Plan the books you want to read
            </Text>
          </Box>

          {/* İstatistikler Card */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            shadow="md"
            border="1px"
            borderColor={cardBorder}
            _hover={{
              transform: 'translateY(-4px)',
              shadow: 'xl',
              borderColor: 'green.300'
            }}
            transition="all 0.3s"
            cursor="pointer"
          >
            <Box
              w={16}
              h={16}
              bg="green.500"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={4}
            >
              <Icon as={FaChartBar} color="white" boxSize={7} />
            </Box>
            <Heading size="md" mb={3} color={textColor}>
              Statistics
            </Heading>
            <Text fontSize="sm" color={subtitleColor}>
              Track your reading habits
            </Text>
          </Box>
        </SimpleGrid>

        {/* AI Recommendation Component */}
        <Box mt={8} mb={6} w="full" display="flex" justifyContent="center" flexDirection="column" alignItems="center">
          <AiRecommendation
            onSubmit={async (data) => {
              try {
                console.log('Sending to backend recommendation API:', data);
                startLoadingCycle({ 
                  useHistory: data.useHistory, 
                  useRatings: data.useRatings, 
                  useComments: data.useComments 
                });

                // Reset added items for new search
                setAddedItems(new Set());

                // Call backend recommendation endpoint
                const response = await apiFetch('/recommendations', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    recommendationOptions: {
                      useHistory: data.useHistory,
                      useRatings: data.useRatings,
                      useComments: data.useComments,
                      customPrompt: data.customPrompt,
                    }
                  }),
                });

                if (!response.ok) {
                  throw new Error('Recommendation API request failed');
                }

                const result = await response.json();
                console.log('Backend response:', result);

                const recommendations: AIRecommendation[] = result.recommendations || [];

                // Enrich recommendations with external API data
                const enrichedResults = await enrichRecommendations(recommendations);

                pendingResultsRef.current = enrichedResults;
                responseReadyRef.current = true;

                const lastIndex = activeLoadingStepsRef.current.length - 1;
                if (!loading || loadingMessageIndex === lastIndex) {
                  setAiResults(enrichedResults);
                  stopLoadingCycle();
                  setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                }
              } catch (err) {
                stopLoadingCycle();
                console.error('Recommendation request failed:', err);
                toast({
                  title: 'Error',
                  description: 'Failed to get recommendations. Please try again.',
                  status: 'error',
                  duration: 3000,
                  isClosable: true,
                });
              }
            }}
          />

          {/* Loading UX */}
          {loading && (
            <Box mt={4} display="flex" alignItems="center" gap={3}>
              <Spinner thickness="3px" speed="0.8s" size="md" />
              <Text fontSize="sm" color={subtitleColor}>
                {activeLoadingStepsRef.current[loadingMessageIndex] ?? MASTER_LOADING_STEPS.step1}
              </Text>
            </Box>
          )}
        </Box>
 
        {/* AI Results Display */}
        {aiResults.length > 0 && (
          <Box ref={resultsRef} mt={4} mb={6} textAlign="left">
            <Heading size="md" mb={4} color={textColor}>AI Recommendations</Heading>
            <Stack spacing={4}>
              {aiResults.map((item, i) => {
                const isBook = 'authors' in item;
                const book = isBook ? (item as Book) : null;
                const movie = !isBook ? (item as Movie) : null;
                const alreadyAdded = isItemAdded(item);

                return (
                  <Box
                    key={item.id || i}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={cardBorder}
                    bg={cardBg}
                    position="relative"
                  >
                    {/* Add Button - Top Left */}
                    <Tooltip label={alreadyAdded ? "Already in library" : "Add to library"}>
                      <IconButton
                        aria-label={alreadyAdded ? "Already added" : "Add to library"}
                        icon={alreadyAdded ? <FiCheck /> : <FiPlus />}
                        size="sm"
                        position="absolute"
                        top={2}
                        left={2}
                        colorScheme={alreadyAdded ? "green" : "blue"}
                        isDisabled={alreadyAdded}
                        onClick={() => {
                          if (isBook && book) {
                            handleAddBook(book);
                          } else if (movie) {
                            handleAddMovie(movie);
                          }
                        }}
                        zIndex={1}
                      />
                    </Tooltip>

                    <HStack align="start" spacing={4}>
                      {isBook ? (
                        book?.imageLinks?.thumbnail ? (
                          <Image
                            src={book.imageLinks.thumbnail}
                            alt={book.title}
                            w="80px"
                            h="120px"
                            objectFit="cover"
                            borderRadius="md"
                            flexShrink={0}
                          />
                        ) : (
                          <Box 
                            w="80px" 
                            h="120px" 
                            bg="gray.100" 
                            borderRadius="md" 
                            flexShrink={0}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="3xl"
                          >
                            📚
                          </Box>
                        )
                      ) : (
                        movie?.imageUrl ? (
                          <Image
                            src={movie.imageUrl}
                            alt={movie.title}
                            w="80px"
                            h="120px"
                            objectFit="cover"
                            borderRadius="md"
                            flexShrink={0}
                          />
                        ) : (
                          <Box 
                            w="80px" 
                            h="120px" 
                            bg="gray.100" 
                            borderRadius="md" 
                            flexShrink={0}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="3xl"
                          >
                            🎬
                          </Box>
                        )
                      )}

                      <Box flex="1">
                        <HStack mb={1}>
                          <Heading size="sm" color={textColor}>
                            {item.title}
                          </Heading>
                          <Box
                            px={2}
                            py={0.5}
                            borderRadius="md"
                            bg={isBook ? 'blue.100' : 'purple.100'}
                            color={isBook ? 'blue.700' : 'purple.700'}
                            fontSize="xs"
                            fontWeight="semibold"
                          >
                            {isBook ? 'Book' : 'Movie'}
                          </Box>
                        </HStack>

                        {isBook && book ? (
                          <>
                            <Text fontSize="xs" color={subtitleColor} mb={2}>
                              {book.authors?.join(', ') || '—'} • {book.publishedDate || '—'}
                              {book.averageRating ? ` • Rating: ${book.averageRating}` : ''}
                            </Text>
                            <Text fontSize="sm" mb={2} color={textColor} noOfLines={3}>
                              {book.description || 'No description.'}
                            </Text>
                            {book.categories && book.categories.length > 0 && (
                              <Text fontSize="xs" color={subtitleColor}>
                                Categories: {book.categories.join(', ')}
                              </Text>
                            )}
                            {book.pageCount && (
                              <Text fontSize="xs" color={subtitleColor}>
                                Pages: {book.pageCount}
                              </Text>
                            )}
                          </>
                        ) : movie ? (
                          <>
                            <Text fontSize="xs" color={subtitleColor} mb={2}>
                              {movie.genre?.join(', ') || '—'} • {movie.runtime} min • IMDb {movie.imdbRating || '—'}
                            </Text>
                            <Text fontSize="sm" mb={2} color={textColor} noOfLines={3}>
                              {movie.plot || 'No description.'}
                            </Text>
                            <Text fontSize="xs" color={subtitleColor}>
                              Director: {movie.director || '—'}
                            </Text>
                            {movie.actors && movie.actors.length > 0 && (
                              <Text fontSize="xs" color={subtitleColor} noOfLines={1}>
                                Actors: {movie.actors.join(', ')}
                              </Text>
                            )}
                          </>
                        ) : null}
                      </Box>
                    </HStack>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}
  
        {/* Alt Bilgi */}
        <Box
          mt={8}
          p={4}
          bg={useColorModeValue('blue.50', 'blue.900')}
          borderRadius="md"
          border="1px"
          borderColor={useColorModeValue('blue.200', 'blue.600')}
        >
          <Text 
            fontSize="xs" 
            color={useColorModeValue('blue.600', 'blue.200')}
          >
            🚀 These features will be available soon. PLMS v1.0.0 - Demo Version
          </Text>
        </Box>
      </Box>
    </Layout>
  );
};

export default MainPage;
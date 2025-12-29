import React, { useState, useRef, useEffect } from 'react';
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
  Badge
} from '@chakra-ui/react';
import { FaBook, FaList, FaChartBar } from 'react-icons/fa';
import AiRecommendation from '../components/ui/ai-recommendation';
import { getRecommendations } from '../services/recommendation.service';
import { apiFetch } from '../lib/apiFetch';
import type { Movie, Book } from '../types';
import Layout from '../components/ui/layout';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

const MainPage = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.300');

  // Store AI results (both books and movies)
  const [aiResults, setAiResults] = useState<(Movie | Book)[]>([]);
  // Ref to scroll to results section smoothly
  const resultsRef = useRef<HTMLDivElement>(null);

  // Loading UX states for AI request
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingIntervalRef = useRef<number | null>(null);

  // master loading step templates
  const MASTER_LOADING_STEPS = {
    step1: 'Decoding your cultural footprint...',
    step2: 'Calibrating taste profile based on your ratings...',
    step3: "Processing semantic nuances in your notes...",
    step4: 'Curating bespoke recommendations...',
    step5: 'Finalizing your collection...'
  };
  
  // active sequence for the current request (depends on flags)
  const activeLoadingStepsRef = useRef<string[]>([]);
  // when response arrives before sequence finishes we hold it here until final step shown
  const pendingResultsRef = useRef<(Movie | Book)[] | null>(null);
  const responseReadyRef = useRef(false);

  const startLoadingCycle = (opts?: { useHistory?: boolean; useRatings?: boolean; useComments?: boolean }) => {
    // build sequence: always start with step1, optionally include 2 & 3, then 4, then final step5
    const steps: string[] = [];
    steps.push(MASTER_LOADING_STEPS.step1);
    if (opts?.useRatings) steps.push(MASTER_LOADING_STEPS.step2);
    if (opts?.useComments) steps.push(MASTER_LOADING_STEPS.step3);
    steps.push(MASTER_LOADING_STEPS.step4);
    // finalizing is the last step — when reached we stop advancing and wait for the response
    steps.push(MASTER_LOADING_STEPS.step5);

    activeLoadingStepsRef.current = steps;
    setLoadingMessageIndex(0);
    setLoading(true);

    const skippedSteps = 
      (!opts?.useRatings ? 1 : 0) + 
      (!opts?.useComments ? 1 : 0);
    const interval = 2000 + (skippedSteps * 600);

    // clear any previous interval
    if (loadingIntervalRef.current) {
      window.clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }

    // advance through steps but stop advancing when last index reached (wait for response)
    loadingIntervalRef.current = window.setInterval(() => {
      setLoadingMessageIndex((prev) => {
        const next = prev + 1;
        if (next >= activeLoadingStepsRef.current.length - 1) {
          // reached final step index -> stop advancing, keep showing final message
          if (loadingIntervalRef.current) {
            window.clearInterval(loadingIntervalRef.current);
            loadingIntervalRef.current = null;
          }
          // if the response already arrived while we were cycling, finalize now
          if (responseReadyRef.current && pendingResultsRef.current) {
            // show results and stop loading
            setAiResults(pendingResultsRef.current);
            pendingResultsRef.current = null;
            responseReadyRef.current = false;
            setLoading(false);
            // smooth scroll to results
            setTimeout(() => {
              resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }
          return activeLoadingStepsRef.current.length - 1;
        }
        return next;
      });
    }, interval); // dynamic interval based on skipped steps
  };

  const stopLoadingCycle = () => {
    if (loadingIntervalRef.current) {
      window.clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
    activeLoadingStepsRef.current = [];
    setLoading(false);
    setLoadingMessageIndex(0);
    // clear pending if any (used when explicitly cancelling)
    pendingResultsRef.current = null;
    responseReadyRef.current = false;
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) {
        window.clearInterval(loadingIntervalRef.current);
      }
    };
  }, []);

  const parseAiResponse = (text: string) => {
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json.results)) {
        return json.results.slice(0, 5);
      }
      // fallback if top-level array was returned
      if (Array.isArray(json)) return json.slice(0, 5);
    } catch (e) {
      // try to extract JSON substring (robustness)
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          const json = JSON.parse(m[0]);
          if (Array.isArray(json.results)) return json.results.slice(0, 5);
        } catch (_) {}
      }
    }
    return [];
  };

  // Fetch movie details from OMDB
  const fetchMovieDetails = async (title: string, director: string, releaseYear: string): Promise<Movie | null> => {
    try {
      // Search by title first
      const searchResponse = await fetch(
        `${BACKEND_URL}/omdb?s=${encodeURIComponent(title)}&y=${releaseYear}`,
        { credentials: 'include' }
      );
      const searchData = await searchResponse.json();

      if (searchData.Response === 'True' && searchData.Search?.length > 0) {
        // Get detailed info for first result
        const imdbID = searchData.Search[0].imdbID;
        const detailResponse = await fetch(
          `${BACKEND_URL}/omdb?i=${imdbID}`,
          { credentials: 'include' }
        );
        const detailData = await detailResponse.json();

        if (detailData.Response === 'True') {
          return {
            id: detailData.imdbID,
            imdbID: detailData.imdbID,
            title: detailData.Title,
            director: detailData.Director || director,
            imageUrl: detailData.Poster !== 'N/A' ? detailData.Poster : '',
            releaseDate: detailData.Year || releaseYear,
            runtime: detailData.Runtime ? parseInt(detailData.Runtime) : 0,
            status: 'want-to-watch',
            plot: detailData.Plot || 'No description available',
            genre: detailData.Genre ? detailData.Genre.split(', ') : [],
            imdbRating: detailData.imdbRating || '0',
            imdbVotes: detailData.imdbVotes || '',
            ratings: detailData.Ratings || [],
            ratingCount: detailData.imdbVotes ? parseInt(detailData.imdbVotes.replace(/,/g, '')) : 0,
            language: detailData.Language || '',
            writer: detailData.Writer || '',
            actors: detailData.Actors ? detailData.Actors.split(', ') : [],
            awards: detailData.Awards || '',
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  };

  // Fetch book details from Google Books
  const fetchBookDetails = async (title: string, author: string): Promise<Book | null> => {
    try {
      const query = `${title} ${author}`;
      const response = await apiFetch(`/google-books?q=${encodeURIComponent(query)}&maxResults=1`);
      
      if (!response.ok) {
        throw new Error('Google Books API request failed');
      }
      
      const data = await response.json();
      const item = data.items?.[0];
      
      if (item) {
        return {
          id: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors || [author],
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
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching book details:', error);
      return null;
    }
  };

  // Process recommendations by type
  const processRecommendations = async (recommendations: any[]): Promise<(Movie | Book)[]> => {
    const promises = recommendations.map(async (rec) => {
      if (rec.type === 'movie') {
        const year = rec.releaseDate?.split('-')[0] || new Date().getFullYear().toString();
        return fetchMovieDetails(rec.title, rec.director, year);
      } else if (rec.type === 'book') {
        return fetchBookDetails(rec.title, rec.writer);
      }
      return null;
    });

    const results = await Promise.all(promises);
    return results.filter((item): item is Movie | Book => item !== null);
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
        <Box mt={12} mb={6} w="full"> {/* Changed mt from 8 to 12 for more space */}
          <AiRecommendation
            onSubmit={async (data) => {
              try {
                console.log('Sending to backend (request):', data);
                startLoadingCycle({ useHistory: data.useHistory, useRatings: data.useRatings, useComments: data.useComments });

                const response = await getRecommendations({
                  useHistory: data.useHistory,
                  useRatings: data.useRatings,
                  useComments: data.useComments,
                  customPrompt: data.customPrompt
                });
                
                console.log('Backend response:', response);
                
                // Backend'den results array gelir
                const results = response.recommendations || [];
                
                // Type'a göre ayır
                const movieRecs = results.filter((rec: any) => rec.type === 'movie');
                const bookRecs = results.filter((rec: any) => rec.type === 'book');
                
                console.log('Movie recommendations:', movieRecs);
                console.log('Book recommendations:', bookRecs);

                // Movie detaylarını OMDB'den çek (LibraryPage ve MoviesPage'deki gibi)
                const moviePromises = movieRecs.map(async (rec: any) => {
                  try {
                    const year = rec.releaseDate?.split('-')[0] || '';
                    // Search by title
                    const searchResponse = await fetch(
                      `${BACKEND_URL}/omdb?s=${encodeURIComponent(rec.title)}${year ? `&y=${year}` : ''}`,
                      { credentials: 'include' }
                    );
                    const searchData = await searchResponse.json();

                    if (searchData.Response === 'True' && searchData.Search?.length > 0) {
                      const imdbID = searchData.Search[0].imdbID;
                      // Get detailed info
                      const detailResponse = await fetch(
                        `${BACKEND_URL}/omdb?i=${imdbID}`,
                        { credentials: 'include' }
                      );
                      const detailData = await detailResponse.json();

                      if (detailData.Response === 'True') {
                        return {
                          id: detailData.imdbID,
                          imdbID: detailData.imdbID,
                          title: detailData.Title,
                          director: detailData.Director || rec.director,
                          imageUrl: detailData.Poster !== 'N/A' ? detailData.Poster : '',
                          releaseDate: detailData.Year || rec.releaseDate,
                          runtime: detailData.Runtime ? parseInt(detailData.Runtime) : 0,
                          status: 'want-to-watch',
                          plot: detailData.Plot || 'No description available',
                          genre: detailData.Genre ? detailData.Genre.split(', ') : [],
                          imdbRating: detailData.imdbRating || '0',
                          imdbVotes: detailData.imdbVotes || '',
                          ratings: detailData.Ratings || [],
                          ratingCount: detailData.imdbVotes ? parseInt(detailData.imdbVotes.replace(/,/g, '')) : 0,
                          language: detailData.Language || '',
                          writer: detailData.Writer || '',
                          actors: detailData.Actors ? detailData.Actors.split(', ') : [],
                          awards: detailData.Awards || '',
                        };
                      }
                    }
                    return null;
                  } catch (error) {
                    console.error(`Error fetching movie: ${rec.title}`, error);
                    return null;
                  }
                });

                // Book detaylarını Google Books'tan çek (LibraryPage'deki gibi)
                const bookPromises = bookRecs.map(async (rec: any) => {
                  try {
                    const query = `${rec.title} ${rec.writer || ''}`;
                    const response = await apiFetch(`/google-books?q=${encodeURIComponent(query)}&maxResults=1`);
                    
                    if (!response.ok) {
                      throw new Error('Google Books API request failed');
                    }
                    
                    const data = await response.json();
                    const item = data.items?.[0];
                    
                    if (item) {
                      return {
                        id: item.id,
                        title: item.volumeInfo.title,
                        authors: item.volumeInfo.authors || [rec.writer],
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
                      };
                    }
                    return null;
                  } catch (error) {
                    console.error(`Error fetching book: ${rec.title}`, error);
                    return null;
                  }
                });

                // Tüm istekleri paralel çalıştır
                const [movieResults, bookResults] = await Promise.all([
                  Promise.all(moviePromises),
                  Promise.all(bookPromises)
                ]);

                // Null olmayan sonuçları filtrele ve birleştir
                const movies = movieResults.filter((m): m is Movie => m !== null);
                const books = bookResults.filter((b): b is Book => b !== null);
                const allResults = [...movies, ...books];

                console.log('Processed results:', allResults);

                pendingResultsRef.current = allResults;
                responseReadyRef.current = true;

                const lastIndex = activeLoadingStepsRef.current.length - 1;
                if (!loading || loadingMessageIndex === lastIndex) {
                  setAiResults(allResults);
                  stopLoadingCycle();
                  setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                }
              } catch (err) {
                stopLoadingCycle();
                console.error('Backend recommendation call failed:', err);
              }
            }}
          />
          
          {/* Loading UX */}
          {loading && (
              <Box 
                  mt={6}
                  p={4}
                  bg={cardBg}
                  borderRadius="lg"
                  border="1px"
                  borderColor={cardBorder}
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  gap={3}
              >
                  <Spinner thickness="3px" speed="0.8s" size="md" color="blue.500" />
                  <Text fontSize="sm" color={subtitleColor}>
                      {activeLoadingStepsRef.current[loadingMessageIndex] ?? MASTER_LOADING_STEPS.step1}
                  </Text>
              </Box>
          )}
        </Box>
 
        {/* AI results displayed as detailed list */}
        {aiResults.length > 0 && (
          <Box ref={resultsRef} mt={4} mb={6} textAlign="left">
            <Heading size="md" mb={4} color={textColor}>AI Recommendations</Heading>
            <Stack spacing={4}>
              {aiResults.map((item, i) => {
                const isMovie = 'director' in item;
                const isBook = 'authors' in item;
                
                return (
                  <Box
                    key={item.id || i}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={cardBorder}
                    bg={cardBg}
                  >
                    <HStack align="start" spacing={4}>
                      {/* Image handling for both types */}
                      {isMovie && (item as Movie).imageUrl ? (
                        <Image
                          src={(item as Movie).imageUrl}
                          alt={item.title}
                          boxSize="100px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                      ) : isBook && (item as Book).imageLinks?.thumbnail ? (
                        <Image
                          src={(item as Book).imageLinks.thumbnail}
                          alt={item.title}
                          boxSize="100px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                      ) : (
                        <Box w="100px" h="140px" bg="gray.100" borderRadius="md" />
                      )}

                      <Box flex="1">
                        <HStack mb={2}>
                          <Heading size="sm" color={textColor}>{item.title}</Heading>
                          <Badge colorScheme={isMovie ? 'purple' : 'green'} fontSize="xs">
                            {isMovie ? '🎬 Movie' : '📚 Book'}
                          </Badge>
                        </HStack>

                        {/* Movie-specific info */}
                        {isMovie && (
                          <>
                            <Text fontSize="xs" color={subtitleColor} mb={2}>
                              {Array.isArray((item as Movie).genre) && (item as Movie).genre.length 
                                ? (item as Movie).genre.join(', ') 
                                : '—'}{' '}
                              {(item as Movie).runtime ? `• ${(item as Movie).runtime} min` : ''} 
                              • IMDb {(item as Movie).imdbRating || '—'}
                            </Text>

                            <Text fontSize="sm" mb={2} color={textColor} noOfLines={3}>
                              {(item as Movie).plot || 'No description.'}
                            </Text>

                            <Text fontSize="xs" color={subtitleColor}>
                              Director: <Text as="span" color={textColor}>{(item as Movie).director || '—'}</Text>
                            </Text>

                            {Array.isArray((item as Movie).actors) && (item as Movie).actors.length > 0 && (
                              <Text fontSize="xs" color={subtitleColor}>
                                Actors: <Text as="span" color={textColor}>{(item as Movie).actors.slice(0, 3).join(', ')}</Text>
                              </Text>
                            )}

                            {(item as Movie).language && (
                              <Text fontSize="xs" color={subtitleColor}>
                                Language: <Text as="span" color={textColor}>{(item as Movie).language}</Text>
                              </Text>
                            )}
                          </>
                        )}

                        {/* Book-specific info */}
                        {isBook && (
                          <>
                            <Text fontSize="xs" color={subtitleColor} mb={2}>
                              {(item as Book).authors?.join(', ') || '—'}
                              {(item as Book).publisher ? ` • ${(item as Book).publisher}` : ''}
                              {(item as Book).pageCount ? ` • ${(item as Book).pageCount} pages` : ''}
                            </Text>

                            <Text fontSize="sm" mb={2} color={textColor} noOfLines={3}>
                              {(item as Book).description || 'No description.'}
                            </Text>

                            {(item as Book).categories && (item as Book).categories.length > 0 && (
                              <Text fontSize="xs" color={subtitleColor}>
                                Categories: <Text as="span" color={textColor}>{(item as Book).categories.join(', ')}</Text>
                              </Text>
                            )}

                            {(item as Book).averageRating && (
                              <Text fontSize="xs" color={subtitleColor}>
                                Rating: <Text as="span" color={textColor}>{(item as Book).averageRating.toFixed(1)} ⭐</Text>
                              </Text>
                            )}
                          </>
                        )}
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
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
  Spinner
} from '@chakra-ui/react';
import { FaBook, FaList, FaChartBar } from 'react-icons/fa';
import AiRecommendation from '../components/ui/ai-recommendation';
import { generateWithGemini } from '../components/ui/helpers/gemini';
import type { Movie } from '../types';
import Layout from '../components/ui/layout';

const MainPage = () => {
  // Temporary debug - remove after testing
  console.log('ENV CHECK:', import.meta.env.VITE_GEMINI_API_KEY ? 'API key loaded ✓' : 'API key missing ✗');
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.300');

  // NEW: store AI results and show up to 5 media-item cards
  const [aiResults, setAiResults] = useState<any[]>([]);
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
  const pendingResultsRef = useRef<Movie[] | null>(null);
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

  // Map Gemini result objects to our Movie type expected by CardView
  const mapAiToMovies = (results: any[]): Movie[] => {
    return results.slice(0, 5).map((r, idx) => {
      const title =
        // prefer explicit title if provided
        r.title ||
        // fall back to first sentence of plot
        (typeof r.plot === 'string' ? r.plot.split('. ')[0] : undefined) ||
        `Recommendation ${idx + 1}`;

      // generate a stable-ish id
      const id =
        r.imdbID || r.id || `${title.replace(/\s+/g, '-').toLowerCase()}-${r.releaseDate || idx}`;

      const movie: Movie = {
        id: String(id),
        title,
        director: r.director || '',
        imageUrl: r.imageUrl || '',
        releaseDate: r.releaseDate || '',
        runtime: typeof r.runtime === 'number' ? r.runtime : 0,
        imdbRating: r.imdbRating || '',
        imdbVotes: r.imdbVotes,
        genre: Array.isArray(r.genre) ? r.genre : [],
        plot: r.plot || '',
        language: r.language || '',
        writer: r.writer || '',
        actors: Array.isArray(r.actors) ? r.actors : [],
        awards: r.awards || '',
        ratings: Array.isArray(r.ratings) ? r.ratings : [],
        status: 'want-to-watch', // default - user can change later
      };

      return movie;
    });
  };

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

  return (
    <Layout activeItem="anasayfa">
      <Box textAlign="center">
        <Heading 
          size="xl" 
          mb={4} 
          color={useColorModeValue('blue.600', 'blue.300')}
        >
          Hoş Geldiniz! 📚
        </Heading>
        
        <Text fontSize="lg" color={subtitleColor} mb={8}>
          Kütüphanenizi yönetmeye başlayabilirsiniz.
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
              Kitaplarım
            </Heading>
            <Text fontSize="sm" color={subtitleColor}>
              Kişisel kitap koleksiyonunuzu yönetin
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
              Okuma Listesi
            </Heading>
            <Text fontSize="sm" color={subtitleColor}>
              Okumak istediğiniz kitapları planlayın
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
              İstatistikler
            </Heading>
            <Text fontSize="sm" color={subtitleColor}>
              Okuma alışkanlıklarınızı takip edin
            </Text>
          </Box>
        </SimpleGrid>

        {/* AI Recommendation Component */}
        <Box mt={8} mb={6} w="full" display="flex" justifyContent="center" flexDirection="column" alignItems="center">
          <AiRecommendation
            onSubmit={async (data) => {
              try {
                console.log('Sending to Gemini (request):', data);
                // start loading UI with flags so 2/3 are included only when requested
                startLoadingCycle({ useHistory: data.useHistory, useRatings: data.useRatings, useComments: data.useComments });

                const text = await generateWithGemini(data.customPrompt);
                console.log('Gemini response (raw):', text);
                const parsed = parseAiResponse(text);
                const movies = mapAiToMovies(parsed);

               // store results; if we've already reached final loading step, show immediately,
               // otherwise wait until final step is displayed (prevents abrupt UI jump)
               pendingResultsRef.current = movies;
               responseReadyRef.current = true;

               const lastIndex = activeLoadingStepsRef.current.length - 1;
               if (!loading || loadingMessageIndex === lastIndex) {
                 // no loader running or already at final step -> display immediately
                 setAiResults(movies);
                 // stop loading cycle (cleans refs & interval)
                 stopLoadingCycle();
                 // smooth scroll to results
                 setTimeout(() => {
                   resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                 }, 100);
               }
                // otherwise we will finalize when the cycle reaches the final step
              } catch (err) {
                // ensure loader stops on error
                stopLoadingCycle();
                console.error('Gemini call failed:', err);
              }
            }}
          />

          {/* Loading UX: spinner + rotating messages */}
          {loading && (
            <Box mt={4} display="flex" alignItems="center" gap={3}>
              <Spinner thickness="3px" speed="0.8s" size="md" />
              <Text fontSize="sm" color={subtitleColor}>
                {activeLoadingStepsRef.current[loadingMessageIndex] ?? MASTER_LOADING_STEPS.step1}
              </Text>
            </Box>
          )}
        </Box>
 
        {/* NEW: AI results displayed as detailed list (no CardView) */}
        {aiResults.length > 0 && (
          <Box ref={resultsRef} mt={4} mb={6} textAlign="left">
            <Heading size="md" mb={4} color={textColor}>AI Recommendations</Heading>
            <Stack spacing={4}>
              {aiResults.map((m, i) => (
                <Box
                  key={m.id || i}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={cardBorder}
                  bg={cardBg}
                >
                  <HStack align="start" spacing={4}>
                    {m.imageUrl ? (
                      <Image
                        src={m.imageUrl}
                        alt={m.title}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    ) : (
                      <Box w="100px" h="140px" bg="gray.100" borderRadius="md" />
                    )}

                    <Box flex="1">
                      <Heading size="sm" mb={1} color={textColor}>
                        {m.title}
                      </Heading>

                      <Text fontSize="xs" color={subtitleColor} mb={2}>
                        {Array.isArray(m.genre) && m.genre.length ? m.genre.join(', ') : '—'}{' '}
                        {m.runtime ? `• ${m.runtime} min` : ''} • IMDb {m.imdbRating || '—'}
                      </Text>

                      <Text fontSize="sm" mb={2} color={textColor}>
                        {m.plot || 'Açıklama yok.'}
                      </Text>

                      <Text fontSize="xs" color={subtitleColor}>
                        Director: <Text as="span" color={textColor}>{m.director || '—'}</Text>
                      </Text>

                      <Text fontSize="xs" color={subtitleColor}>
                        Actors: <Text as="span" color={textColor}>{Array.isArray(m.actors) && m.actors.length ? m.actors.join(', ') : '—'}</Text>
                      </Text>

                      <Text fontSize="xs" color={subtitleColor}>
                        Language: <Text as="span" color={textColor}>{m.language || '—'}</Text>
                      </Text>

                      <Text fontSize="xs" color={subtitleColor}>
                        Awards: <Text as="span" color={textColor}>{m.awards || '—'}</Text>
                      </Text>

                      <Box mt={2}>
                        <Text fontSize="xs" color={subtitleColor} mb={1}>Ratings:</Text>
                        {Array.isArray(m.ratings) && m.ratings.length ? (
                          m.ratings.map((r: any, idx: number) => (
                            <Text key={idx} fontSize="xs" color={textColor}>
                              {r.Source || '—'}: {r.Value || '—'}
                            </Text>
                          ))
                        ) : (
                          <Text fontSize="xs" color={textColor}>—</Text>
                        )}
                      </Box>
                    </Box>
                  </HStack>
                </Box>
              ))}
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
            🚀 Bu özellikler yakında aktif olacak. PLMS v1.0.0 - Demo Sürüm
          </Text>
        </Box>
      </Box>
    </Layout>
  );
};

export default MainPage;
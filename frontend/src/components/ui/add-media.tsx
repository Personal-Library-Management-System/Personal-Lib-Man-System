import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Image,
  Center,
  FormControl,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  Text,
  Spinner,
  VStack,
  useColorModeValue,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  Badge,
} from '@chakra-ui/react';
import { SearchIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { type Book, type Movie, statusToBackend } from '../../types';

// -- Tipler --
interface OptionalField {
  name: string;
  label: string;
  placeholder?: string;
  helperText?: string;
}

export type SearchState = 'idle' | 'loading' | 'success' | 'no-results' | 'error';

type MediaItem = Book | Movie;

interface AddMediaProps {
  mediaType: 'book' | 'movie';
  isOpen: boolean;
  onClose: () => void;
  onSearch: (payload: { query: string; extras: Record<string, string> }) => Promise<void>;
  searchState: SearchState;
  searchResults: MediaItem[];
  onItemSelect: (item: MediaItem) => void;
  optionalFields: OptionalField[];
  searchPlaceholder?: string;
}

const SearchResultItem = ({ item, onSelect, mediaType }: { item: MediaItem; onSelect: () => void; mediaType: 'book' | 'movie' }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  const isBook = mediaType === 'book';
  const thumbnailUrl = item.coverPhoto;
  
  const subtitle = isBook
    ? (item as Book).author ?? 'Unknown author'
    : (item as Movie).director ?? 'Unknown director';
  
  const yearRaw = item.publishedDate;
  const yearDisplay = yearRaw ? (() => {
    try { return String(new Date(yearRaw).getFullYear()); } catch { return String(yearRaw).slice(0,4); }
  })() : undefined;

  const rating: number = (() => {
    const r = item.ratings && item.ratings.length > 0 ? parseFloat(item.ratings[0].value) : NaN;
    return Number.isFinite(r) ? r : 0;
  })();

  const genres = item.categories ? item.categories.slice(0, 2) : [];
  const fallbackIcon = isBook ? '📚' : '🎬';
  const hasImage = thumbnailUrl && thumbnailUrl !== 'N/A' && thumbnailUrl !== '';

  return (
    <HStack
      p={4}
      bg={cardBg}
      borderRadius="lg"
      spacing={4}
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'md',
        cursor: 'pointer',
      }}
      onClick={onSelect}
    >
      <Box w="100px" h="140px" bg="gray.200" borderRadius="md" flexShrink={0} display="flex" alignItems="center" justifyContent="center">
        {hasImage ? (
          <Image
            referrerPolicy="no-referrer"
            src={thumbnailUrl}
            alt={item.title}
            w="100px"
            h="140px"
            objectFit="cover"
            borderRadius="md"
            shadow="sm"
            bg="white"
          />
        ) : (
          <Text fontSize="4xl">{fallbackIcon}</Text>
        )}
      </Box>
      <VStack align="start" spacing={2} flex={1}>
        <Text fontWeight="bold" fontSize="md" color={textColor} noOfLines={2}>
          {item.title}
        </Text>
        <Text fontSize="sm" color={subtextColor} noOfLines={1}>
          {subtitle}
        </Text>
        
        {!isBook && genres && genres.length > 0 && (
          <HStack spacing={1} flexWrap="wrap">
            {genres.map((genre, idx) => (
              <Badge key={idx} colorScheme="purple" fontSize="xs" variant="subtle">
                {genre}
              </Badge>
            ))}
          </HStack>
        )}

        <HStack spacing={3} fontSize="sm" color={subtextColor}>
          {yearDisplay && (
            <Text>
              📅 {yearDisplay}
            </Text>
          )}
          {rating > 0 && (
            <Text>
              ⭐ {rating.toFixed(1)}
            </Text>
          )}
        </HStack>
      </VStack>
    </HStack>
  );
};

const AddMedia = ({
  mediaType,
  isOpen,
  onClose,
  onSearch,
  searchState,
  searchResults,
  onItemSelect,
  optionalFields,
  searchPlaceholder
}: AddMediaProps) => {
  const bgMain = useColorModeValue('gray.100', 'gray.900');
  const bgSearchSection = useColorModeValue('white', 'gray.800');
  const inputPlaceholderColor = useColorModeValue('gray.400', 'gray.500');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const defaultValues = useMemo(() => {
    return optionalFields.reduce<Record<string, string>>((acc, field) => {
      acc[field.name] = '';
      return acc;
    }, {});
  }, [optionalFields]);

  const [searchTerm, setSearchTerm] = useState('');
  const [extraValues, setExtraValues] = useState(defaultValues);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setExtraValues(defaultValues);
    }
  }, [isOpen, defaultValues]);

  const handleFieldChange = (field: string, value: string) => {
    setExtraValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const trimmedQuery = searchTerm.trim();
    if (!trimmedQuery) return;
    onSearch({ query: trimmedQuery, extras: extraValues });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      handleSubmit();
    }
  };

  const mainPlaceholder = searchPlaceholder ?? (mediaType === 'book' ? 'Enter book title...' : 'Enter movie title...');

  const createMediaFromItem = async (item: MediaItem) => {
    try {
      const isBook = mediaType === 'book';
      const title = item.title ?? '';
      const publishedDate = item.publishedDate
        ? new Date(item.publishedDate).toISOString()
        : new Date().toISOString();

      const ratingValue = item.ratings && item.ratings.length > 0
        ? (parseFloat(item.ratings[0].value) || 0)
        : 0;

      const ratings = ratingValue > 0
        ? [{ source: item.ratings?.[0]?.source ?? (isBook ? 'google' : 'imdb'), value: String(ratingValue) }]
        : [];

      const payload = {
         title,
         publishedDate,
         ratings,
         ratingCount: item.ratingCount ?? 0,
         categories: item.categories ?? [],
         description: item.description ?? '',
         coverPhoto: item.coverPhoto ?? '',
         language: item.language ?? '',
         author: item.author ?? '',
         tags: [],            // backend expects ObjectId[] — send empty for now
        // map frontend default -> backend enum
        status: statusToBackend(isBook ? 'want-to-read' : 'want-to-watch'),
         myRating: item.myRating ?? 0,
         progress: item.progress ?? 0,
         personalNotes: item.personalNotes ?? '',
         ISBN: isBook ? ((item as Book).ISBN ?? '') : undefined,
         pageCount: isBook ? ((item as Book).pageCount ?? 1) : ((item as Movie).runtime ?? 1),
         publisher: isBook ? ((item as Book).publisher ?? '') : undefined,
         mediaType: isBook ? 'Book' : 'Movie'
       };

      const res = await fetch('/api/v1/mediaItems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const created = await res.json();
      onItemSelect(created); // parent'e yeni item'i bildir
      onClose();
    } catch (err) {
      console.error('Failed to create media item', err);
      alert('Media creation failed');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="6xl" 
      scrollBehavior="inside"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(8px)" />
      
      <ModalContent 
        bg={bgMain} 
        borderRadius="2xl" 
        boxShadow="2xl" 
        minH="85vh"
        overflow="hidden"
      >
        <ModalCloseButton size="lg" mt={2} mr={2} zIndex={20} />

        <Box 
          bg={bgSearchSection}
          borderBottom="1px solid" 
          borderColor={borderColor} 
          pt={10}
          pb={6} 
          px={10}
          position="sticky"
          top={0}
          zIndex={10}
          boxShadow="sm"
        > 
          <InputGroup size="lg" alignItems="center">
            <InputLeftElement 
              pointerEvents="none" 
              height="100%" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              pl={2}
            >
              <Icon as={SearchIcon} color="gray.300" boxSize={6} />
            </InputLeftElement>

            <Input
              autoFocus
              variant="unstyled"
              placeholder={mainPlaceholder}
              fontSize="3xl"
              fontWeight="semibold"
              height="70px"
              pl={16}
              _placeholder={{ color: inputPlaceholderColor, fontWeight: 'medium' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            
            {searchTerm.trim() && (
              <InputRightElement h="100%" pr={4}>
                <IconButton
                  aria-label="Search"
                  icon={<ArrowForwardIcon />}
                  colorScheme="blue"
                  size="md"
                  isRound
                  onClick={handleSubmit}
                  variant="solid"
                  boxShadow="md"
                  fontSize="xl"
                />
              </InputRightElement>
            )}
          </InputGroup>

          {optionalFields.length > 0 && (
            <Box mt={6} pl={16} pr={4}>
              <SimpleGrid columns={[1, 2, 3]} spacing={6}>
                {optionalFields.map(field => (
                  <FormControl key={field.name}>
                    <HStack as="label" spacing={2} mb={2} htmlFor={field.name}>
                      <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                        {field.label}
                      </Text>
                      <Text fontSize="xs" color="gray.400" fontWeight="normal">
                        (Opsiyonel)
                      </Text>
                    </HStack>
                    <Input
                      variant="filled"
                      placeholder={field.placeholder || '...'}
                      value={extraValues[field.name]}
                      onChange={e => handleFieldChange(field.name, e.target.value)}
                      fontSize="sm"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.400' }}
                    />
                  </FormControl>
                ))}
              </SimpleGrid>
            </Box>
          )}
        </Box>

        <ModalBody p={0}>
          <Box p={10} minH="400px">
            {searchState === 'idle' && (
              <VStack spacing={4} justify="center" h="100%" pt={10} opacity={0.6}>
                <Icon as={SearchIcon} boxSize={16} color="gray.400" strokeWidth={1} />
                <Text fontSize="lg" fontWeight="medium" color="gray.500">
                  Sonuçları görmek için aramaya başlayın
                </Text>
              </VStack>
            )}

            {searchState === 'loading' && (
              <Center h="100%" pt={10}>
                <Spinner size="xl" color="blue.500" thickness="4px" />
              </Center>
            )}

            {searchState === 'no-results' && (
              <VStack spacing={4} justify="center" h="100%" pt={10} opacity={0.8}>
                <Icon as={SearchIcon} boxSize={16} color="yellow.400" strokeWidth={1} />
                <Text fontSize="lg" fontWeight="medium" color="gray.500">
                  No results found matching your search.
                </Text>
              </VStack>
            )}

            {searchState === 'error' && (
              <Alert status="error" borderRadius="lg" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
                <AlertIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                  An error occurred during search!
                </AlertTitle>
              </Alert>
            )}

            {searchState === 'success' && (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {searchResults.map(item => (
                  <SearchResultItem
                    key={item.id}
                    item={item}
                    mediaType={mediaType}
                    onSelect={() => createMediaFromItem(item)}
                  />
                ))}
              </SimpleGrid>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AddMedia;
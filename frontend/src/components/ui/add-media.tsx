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
} from '@chakra-ui/react';
import { SearchIcon, ArrowForwardIcon } from '@chakra-ui/icons';

// -- Tipler --
interface OptionalField {
  name: string;
  label: string;
  placeholder?: string;
  helperText?: string;
}

interface BookSearchResult {
  id: string;
  title: string;
  authors?: string[];
  publishedDate?: string;
  imageLinks?: { thumbnail?: string };
}

export type SearchState = 'idle' | 'loading' | 'success' | 'no-results' | 'error';

interface AddMediaProps {
  mediaType: 'book' | 'movie';
  isOpen: boolean;
  onClose: () => void;
  // Arama işlemini yürütecek olan asenkron fonksiyon.
  onSearch: (payload: { query: string; extras: Record<string, string> }) => Promise<void>;
  // Dışarıdan yönetilen state'ler
  searchState: SearchState;
  searchResults: BookSearchResult[]; // Şimdilik ortak bir tip kullanıyoruz, genişletilebilir.
  // Bir sonuç seçildiğinde tetiklenir.
  onItemSelect: (item: BookSearchResult) => void;
  optionalFields: OptionalField[];
  searchPlaceholder?: string;
}

const SearchResultItem = ({ item, onSelect }: { item: BookSearchResult, onSelect: () => void }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  const fallbackIcon = item.authors ? '📚' : '🎬';
  const thumbnailUrl = item.imageLinks?.thumbnail;
  // Eğer thumbnail URL'i yoksa veya "N/A" ise, resmi gösterme.
  const hasImage = thumbnailUrl && thumbnailUrl !== 'N/A';

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
      <Box w="100px" h="100px" bg="gray.200" borderRadius="md" flexShrink={0} display="flex" alignItems="center" justifyContent="center">
        {hasImage ? (
          <Image
            referrerPolicy="no-referrer"
            src={thumbnailUrl}
            alt={item.title}
            boxSize="100px"
            objectFit="contain"
            borderRadius="md"
            shadow="sm"
            bg="white"
          />
        ) : (
          <Text fontSize="4xl">{fallbackIcon}</Text>
        )}
      </Box>
      <VStack align="start" spacing={1} flex={1}>
        <Text fontWeight="bold" fontSize="md" color={textColor} noOfLines={2}>
          {item.title}
        </Text>
        {item.authors && item.authors.length > 0 && (
          <Text fontSize="sm" color={subtextColor}>
            {item.authors.join(', ')}
          </Text>
        )}
        {item.publishedDate && (
          <Text fontSize="xs" color={subtextColor}>
            {new Date(item.publishedDate).getFullYear()}
          </Text>
        )}
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
  // -- Renk Paleti --
  const bgMain = useColorModeValue('gray.100', 'gray.900'); // Ana zemin hafif gri
  const bgSearchSection = useColorModeValue('white', 'gray.800'); // Arama kısmı beyaz/öne çıkan
  const inputPlaceholderColor = useColorModeValue('gray.400', 'gray.500');
  const borderColor = useColorModeValue('gray.200', 'gray.700'); // Kenarlık rengi

  // -- State --
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

  const mainPlaceholder = searchPlaceholder ?? (mediaType === 'book' ? 'Kitap adı girin...' : 'Film adı girin...');

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

        {/* -- Üst Kısım: Arama ve Opsiyonel Filtreler -- */}
        <Box 
          bg={bgSearchSection}
          borderBottom="1px solid" 
          borderColor={borderColor} 
          pt={10} // Üstten biraz boşluk
          pb={6} 
          px={10}
          position="sticky"
          top={0}
          zIndex={10}
          boxShadow="sm"
        > 
          <InputGroup size="lg" alignItems="center">
            {/* İkon */}
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

            {/* Ana Input */}
            <Input
              autoFocus
              variant="unstyled"
              placeholder={mainPlaceholder}
              fontSize="3xl"
              fontWeight="semibold"
              height="70px"
              pl={16} // ÖNEMLİ: İkonun yazı üzerine binmemesi için soldan boşluk
              _placeholder={{ color: inputPlaceholderColor, fontWeight: 'medium' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            
            {/* Masaüstü için Ara Butonu (Opsiyonel, sadece doluysa gösterilebilir) */}
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

          {/* -- Detaylı Arama Alanı -- */}
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

        {/* -- Alt Kısım: Sonuç Alanı -- */}
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
                    Aramanızla eşleşen sonuç bulunamadı.
                  </Text>
                </VStack>
              )}
  
              {searchState === 'error' && (
                 <Alert status="error" borderRadius="lg" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
                  <AlertIcon boxSize="40px" mr={0} />
                  <AlertTitle mt={4} mb={1} fontSize="lg">
                    Arama sırasında bir hata oluştu!
                  </AlertTitle>
                </Alert>
              )}
  
              {searchState === 'success' && (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {searchResults.map(item => (
                    <SearchResultItem key={item.id} item={item} onSelect={() => onItemSelect(item)} />
                  ))}
                </SimpleGrid>
              )}
          </Box>
        </ModalBody>

        {/* Footer Tamamen Kaldırıldı */}
      </ModalContent>
    </Modal>
  );
};

export default AddMedia;
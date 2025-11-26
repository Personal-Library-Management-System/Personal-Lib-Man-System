import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  Collapse,
  IconButton,
} from '@chakra-ui/react';
import { SearchIcon, ArrowForwardIcon } from '@chakra-ui/icons';

// -- Tipler --
interface OptionalField {
  name: string;
  label: string;
  placeholder?: string;
  helperText?: string;
}

interface AddMediaProps {
  mediaType: 'book' | 'movie';
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (payload: {
    mediaType: 'book' | 'movie';
    query: string;
    extras: Record<string, string>;
  }) => void;
  optionalFields: OptionalField[];
  searchPlaceholder?: string;
  // title ve description proplarını sildik çünkü artık kullanmıyoruz
}

const AddMedia = ({
  mediaType,
  isOpen,
  onClose,
  onSearch,
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
      // Filtreler artık her zaman açık olduğu için kapatma işlemine gerek yok
    }
  }, [isOpen, defaultValues]);

  const handleFieldChange = (field: string, value: string) => {
    setExtraValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const trimmedQuery = searchTerm.trim();
    if (!trimmedQuery) return;

    onSearch?.({
      mediaType,
      query: trimmedQuery,
      extras: extraValues
    });
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
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} textTransform="uppercase">
                      {field.label}
                    </Text>
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
            {!searchTerm ? (
              // Empty State
              <VStack spacing={4} justify="center" h="100%" pt={10} opacity={0.6}>
                <Icon as={SearchIcon} boxSize={16} color="gray.400" strokeWidth={1} />
                <Text fontSize="lg" fontWeight="medium" color="gray.500">
                   Sonuçları görmek için aramaya başlayın
                </Text>
              </VStack>
            ) : (
              <Box>
                {/* BURAYA SearchResults Componenti Gelecek */}
                <Text color="gray.500">Sonuçlar burada listelenecek...</Text>
              </Box>
            )}
          </Box>
        </ModalBody>

        {/* Footer Tamamen Kaldırıldı */}
      </ModalContent>
    </Modal>
  );
};

export default AddMedia;
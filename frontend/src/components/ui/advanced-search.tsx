import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Collapse, 
  SimpleGrid, 
  Input, 
  FormControl, 
  FormLabel, 
  HStack,
  useColorModeValue
} from '@chakra-ui/react';
import { FaSearch, FaTimes } from 'react-icons/fa';

// Arama kriterlerinin veri yapısı
export interface SearchCriteria {
  title: string;
  creator: string; // Filmler için Yönetmen, Kitaplar için Yazar
  year: string;
}

interface AdvancedSearchProps {
  onSearch: (criteria: SearchCriteria) => void; // Arama yapıldığında çalışacak fonksiyon
  type: 'movie' | 'book'; // Hangi sayfada olduğumuzu belirtir
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, type }) => {
  // const [isOpen, setIsOpen] = useState(true); // Panelin açık/kapalı durumu
  const [criteria, setCriteria] = useState<SearchCriteria>({
    title: '',
    creator: '',
    year: ''
  });

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSearch = () => {
    onSearch(criteria);
  };

  const handleClear = () => {
    const empty = { title: '', creator: '', year: '' };
    setCriteria(empty);
    onSearch(empty);
  };

  return (
    <Box mb={6}>
      {/* Açma/Kapama Butonu - Modal içinde gerek yok, o yüzden gizliyoruz veya kaldırıyoruz */}
      {/* <Button 
        onClick={() => setIsOpen(!isOpen)} 
        rightIcon={isOpen ? <FaChevronUp /> : <FaChevronDown />}
        variant="ghost"
        size="sm"
        mb={2}
      >
        Detaylı Arama
      </Button> */}

      {/* Açılır Panel - Her zaman açık */}
      <Collapse in={true} animateOpacity>
        <Box 
          p={6} 
          bg={bg} 
          border="1px" 
          borderColor={borderColor} 
          borderRadius="md" 
          shadow="sm"
        >
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
            {/* Başlık Alanı */}
            <FormControl>
              <FormLabel fontSize="sm">Başlık</FormLabel>
              <Input 
                placeholder={type === 'movie' ? 'Film adı...' : 'Kitap adı...'}
                value={criteria.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCriteria({...criteria, title: e.target.value})}
              />
            </FormControl>

            {/* Yaratıcı Alanı (Yönetmen/Yazar) */}
            <FormControl>
              <FormLabel fontSize="sm">{type === 'movie' ? 'Yönetmen' : 'Yazar'}</FormLabel>
              <Input 
                placeholder={type === 'movie' ? 'Yönetmen adı...' : 'Yazar adı...'}
                value={criteria.creator}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCriteria({...criteria, creator: e.target.value})}
              />
            </FormControl>

            {/* Yıl Alanı */}
            <FormControl>
              <FormLabel fontSize="sm">Yıl</FormLabel>
              <Input 
                placeholder="Örn: 2023" 
                type="number"
                value={criteria.year}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCriteria({...criteria, year: e.target.value})}
              />
            </FormControl>
          </SimpleGrid>
          
          {/* Aksiyon Butonları */}
          <HStack justify="flex-end">
            <Button leftIcon={<FaTimes />} variant="ghost" onClick={handleClear} size="sm">
              Temizle
            </Button>
            <Button leftIcon={<FaSearch />} colorScheme="blue" onClick={handleSearch} size="sm">
              Ara ve Ekle
            </Button>
          </HStack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default AdvancedSearch;

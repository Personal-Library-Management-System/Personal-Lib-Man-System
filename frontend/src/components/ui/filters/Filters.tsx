import {
  Box,
  Flex,
  Button,
  Collapse,
  useDisclosure,
  useColorModeValue,
  IconButton,
  Tooltip,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { FaFilter, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import RatingFilter from './RatingFilter';
import YearFilter from './YearFilter';
import DurationFilter from './DurationFilter';
import PageCountFilter from './PageCountFilter';
import CategoryFilter from './CategoryFilter';
import SortSelect from './SortSelect';
import { type FilterState, type SortOption, type YearRangePreset, type DurationPreset, type PageCountPreset } from './types';

interface FiltersProps {
  type: 'book' | 'movie';
  filterState: FilterState;
  onFilterChange: (newState: FilterState) => void;
  availableCategories?: string[];
}

const Filters = ({ type, filterState, onFilterChange, availableCategories = [] }: FiltersProps) => {
  const { isOpen, onToggle } = useDisclosure();
  
  const bgCard = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Aktif filtre sayısını hesapla (sadece gelişmiş filtreler)
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filterState.rating && filterState.rating > 0) count++;
    if (filterState.imdbRating && filterState.imdbRating > 0) count++;
    if (filterState.yearRange && filterState.yearRange !== 'all') count++;
    if (filterState.durationRange && filterState.durationRange !== 'all') count++;
    if (filterState.pageCountRange && filterState.pageCountRange !== 'all') count++;
    if (filterState.categories && filterState.categories.length > 0) count++;
    if (filterState.sortBy && filterState.sortBy !== 'title-asc') count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  // Gelişmiş filtreleri sıfırla (tag/list hariç)
  const handleReset = () => {
    onFilterChange({
      ...filterState,
      rating: 0,
      imdbRating: 0,
      yearRange: 'all',
      durationRange: 'all',
      pageCountRange: 'all',
      categories: [],
      sortBy: 'title-asc',
    });
  };

  return (
    <Box mb={4}>
      {/* Filtre Toggle Butonu */}
      <Flex justify="space-between" align="center" mb={2}>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<FaFilter />}
          rightIcon={isOpen ? <FaChevronUp /> : <FaChevronDown />}
          onClick={onToggle}
          fontWeight="medium"
        >
          Advanced Filters
          {activeCount > 0 && (
            <Badge ml={2} colorScheme="blue" borderRadius="full">
              {activeCount}
            </Badge>
          )}
        </Button>

        {activeCount > 0 && (
          <Tooltip label="Reset Filters">
            <IconButton
              aria-label="Reset filters"
              icon={<FaTimes />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={handleReset}
            />
          </Tooltip>
        )}
      </Flex>

      {/* Filtre Paneli */}
      <Collapse in={isOpen} animateOpacity>
        <Box
          p={4}
          bg={bgCard}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <Flex gap={3} flexWrap="wrap" align="flex-start">
            {/* Sıralama */}
            <SortSelect
              type={type}
              value={filterState.sortBy || 'title-asc'}
              onChange={(value) => onFilterChange({ ...filterState, sortBy: value as SortOption })}
            />

            <Divider orientation="vertical" h="32px" display={{ base: 'none', md: 'block' }} />

            {/* Puan Filtresi */}
            <RatingFilter
              type={type}
              value={type === 'movie' ? (filterState.imdbRating || 0) : (filterState.rating || 0)}
              onChange={(value) => {
                if (type === 'movie') {
                  onFilterChange({ ...filterState, imdbRating: value });
                } else {
                  onFilterChange({ ...filterState, rating: value });
                }
              }}
            />

            {/* Yıl Filtresi */}
            <YearFilter
              value={filterState.yearRange || 'all'}
              onChange={(value) => onFilterChange({ ...filterState, yearRange: value as YearRangePreset })}
            />

            {/* Süre Filtresi - Sadece filmler */}
            {type === 'movie' && (
              <DurationFilter
                value={filterState.durationRange || 'all'}
                onChange={(value) => onFilterChange({ ...filterState, durationRange: value as DurationPreset })}
              />
            )}

            {/* Sayfa Sayısı Filtresi - Sadece kitaplar */}
            {type === 'book' && (
              <PageCountFilter
                value={filterState.pageCountRange || 'all'}
                onChange={(value) => onFilterChange({ ...filterState, pageCountRange: value as PageCountPreset })}
              />
            )}

            {/* Kategori Filtresi */}
            {availableCategories.length > 0 && (
              <CategoryFilter
                availableCategories={availableCategories}
                selectedCategories={filterState.categories || []}
                onChange={(categories) => onFilterChange({ ...filterState, categories })}
              />
            )}
          </Flex>
        </Box>
      </Collapse>
    </Box>
  );
};

export default Filters;

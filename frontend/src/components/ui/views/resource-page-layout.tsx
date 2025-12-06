import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  HStack,
  Center,
  IconButton,
  useColorModeValue,
  Tooltip,
  VStack,
  Text,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Checkbox,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { BsGrid3X3Gap, BsList } from 'react-icons/bs';
import { FaTags, FaList, FaChevronDown } from 'react-icons/fa';
import Layout from '../layout';
import CardView from './card-view';
import ListView from './list-view';
import Pagination from './pagination';
import { Filters, type FilterState, type ListItem } from '../filters';
import { type Book, type Movie } from '../../../types';
import listData from '../../../mock-data/list-data.json';

const ITEMS_PER_PAGE = 12;

type Item = Book | Movie;

interface ResourcePageLayoutProps<T extends Item> {
  pageTitle: string;
  activeItem: 'kitaplik' | 'filmarsivi';
  mockData: T[];
  filters: { key: string; label: string }[];
  getStatusBadge: (status: string) => React.ReactNode;
  itemType: 'book' | 'movie';
  addItemButtonText: string;
  onAddItem?: () => void;
  emptyStateIcon: string;
  emptyStateText: string;
  onItemClick?: (item: T) => void; // Generic tür kullanımı
}

const ResourcePageLayout = <T extends Item>({
  pageTitle,
  activeItem,
  mockData,
  filters,
  getStatusBadge,
  itemType,
  addItemButtonText,
  emptyStateIcon,
  emptyStateText,
  onItemClick,
  onAddItem,
}: ResourcePageLayoutProps<T>) => {
  const [items, setItems] = useState<Item[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterState, setFilterState] = useState<FilterState>({
    rating: 0,
    imdbRating: 0,
    yearRange: 'all',
    durationRange: 'all',
    pageCountRange: 'all',
    categories: [],
    sortBy: 'title-asc',
    tags: [],
    lists: [],
  });
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  // Mevcut kategorileri çıkar (kitaplar ve filmler için)
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    items.forEach((item) => {
      if ('categories' in item && item.categories) {
        item.categories.forEach((cat: string) => categories.add(cat));
      }
    });
    return Array.from(categories).sort();
  }, [items]);

  // Mevcut tag'leri çıkar
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach((item) => {
      if ('tags' in item && (item as any).tags) {
        ((item as any).tags as string[]).forEach((tag: string) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [items]);

  // Mevcut listeleri al (itemType'a göre filtrele)
  const availableLists = useMemo(() => {
    const typeKey = itemType === 'book' ? 'book' : 'movie';
    return (listData as ListItem[]).filter((list) =>
      list.items.some((item) => item.type === typeKey)
    );
  }, [itemType]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setItems(mockData);
      } catch (error) {
        console.error(`Error loading ${itemType}s:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [mockData, itemType]);

  // Filtreleme ve sıralama mantığı
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // 1. Status filtresi
    if (filterStatus !== 'all') {
      result = result.filter(item => item.status === filterStatus);
    }

    // 2. Puan filtresi
    if (itemType === 'movie' && filterState.imdbRating && filterState.imdbRating > 0) {
      result = result.filter(item => {
        if ('imdbRating' in item) {
          const rating = parseFloat(item.imdbRating || '0');
          return rating >= filterState.imdbRating!;
        }
        return true;
      });
    } else if (itemType === 'book' && filterState.rating && filterState.rating > 0) {
      result = result.filter(item => {
        if ('averageRating' in item) {
          return (item.averageRating || 0) >= filterState.rating!;
        }
        return true;
      });
    }

    // 3. Yıl filtresi
    if (filterState.yearRange && filterState.yearRange !== 'all') {
      result = result.filter(item => {
        let year: number;
        if ('releaseDate' in item) {
          // Film: "14 Oct 1994" formatından yılı çıkar
          const match = item.releaseDate?.match(/\d{4}/);
          year = match ? parseInt(match[0]) : 0;
        } else if ('publishedDate' in item) {
          // Kitap: "1949" veya "2020-01-15" formatından yılı çıkar
          const match = item.publishedDate?.match(/\d{4}/);
          year = match ? parseInt(match[0]) : 0;
        } else {
          return true;
        }

        switch (filterState.yearRange) {
          case '2020s': return year >= 2020;
          case '2010s': return year >= 2010 && year < 2020;
          case '2000s': return year >= 2000 && year < 2010;
          case 'classic': return year < 2000;
          default: return true;
        }
      });
    }

    // 4. Süre filtresi (sadece filmler)
    if (itemType === 'movie' && filterState.durationRange && filterState.durationRange !== 'all') {
      result = result.filter(item => {
        if ('runtime' in item) {
          const duration = item.runtime || 0;
          switch (filterState.durationRange) {
            case 'short': return duration < 90;
            case 'medium': return duration >= 90 && duration <= 150;
            case 'long': return duration > 150;
            default: return true;
          }
        }
        return true;
      });
    }

    // 5. Sayfa sayısı filtresi (sadece kitaplar)
    if (itemType === 'book' && filterState.pageCountRange && filterState.pageCountRange !== 'all') {
      result = result.filter(item => {
        if ('pageCount' in item) {
          const pages = item.pageCount || 0;
          switch (filterState.pageCountRange) {
            case 'short': return pages < 200;
            case 'medium': return pages >= 200 && pages <= 400;
            case 'long': return pages > 400;
            default: return true;
          }
        }
        return true;
      });
    }

    // 6. Kategori filtresi (kitaplar ve filmler için)
    if (filterState.categories && filterState.categories.length > 0) {
      result = result.filter(item => {
        if ('categories' in item && item.categories) {
          return filterState.categories!.some((cat: string) => item.categories!.includes(cat));
        }
        return false;
      });
    }

    // 7. Tag filtresi
    if (filterState.tags && filterState.tags.length > 0) {
      result = result.filter(item => {
        if ('tags' in item && (item as any).tags) {
          return filterState.tags!.some((tag: string) => ((item as any).tags as string[]).includes(tag));
        }
        return false;
      });
    }

    // 8. List filtresi
    if (filterState.lists && filterState.lists.length > 0) {
      const typeKey = itemType === 'book' ? 'book' : 'movie';
      const selectedListItems = new Set<string>();
      
      (listData as ListItem[])
        .filter((list) => filterState.lists!.includes(list.id))
        .forEach((list) => {
          list.items.forEach((listItem) => {
            if (listItem.type === typeKey) {
              selectedListItems.add(listItem.id);
            }
          });
        });

      result = result.filter(item => selectedListItems.has(item.id));
    }

    // 9. Sıralama
    if (filterState.sortBy) {
      result.sort((a, b) => {
        switch (filterState.sortBy) {
          case 'title-asc':
            return a.title.localeCompare(b.title, 'tr');
          case 'title-desc':
            return b.title.localeCompare(a.title, 'tr');
          case 'rating-high':
            if (itemType === 'movie') {
              const rA = 'imdbRating' in a ? parseFloat(a.imdbRating || '0') : 0;
              const rB = 'imdbRating' in b ? parseFloat(b.imdbRating || '0') : 0;
              return rB - rA;
            } else {
              const rA = 'averageRating' in a ? (a.averageRating || 0) : 0;
              const rB = 'averageRating' in b ? (b.averageRating || 0) : 0;
              return rB - rA;
            }
          case 'rating-low':
            if (itemType === 'movie') {
              const rA = 'imdbRating' in a ? parseFloat(a.imdbRating || '0') : 0;
              const rB = 'imdbRating' in b ? parseFloat(b.imdbRating || '0') : 0;
              return rA - rB;
            } else {
              const rA = 'averageRating' in a ? (a.averageRating || 0) : 0;
              const rB = 'averageRating' in b ? (b.averageRating || 0) : 0;
              return rA - rB;
            }
          case 'year-new':
          case 'year-old': {
            const getYear = (item: Item): number => {
              if ('releaseDate' in item) {
                const match = item.releaseDate?.match(/\d{4}/);
                return match ? parseInt(match[0]) : 0;
              } else if ('publishedDate' in item) {
                const match = item.publishedDate?.match(/\d{4}/);
                return match ? parseInt(match[0]) : 0;
              }
              return 0;
            };
            const yearA = getYear(a);
            const yearB = getYear(b);
            return filterState.sortBy === 'year-new' ? yearB - yearA : yearA - yearB;
          }
          case 'duration-short':
          case 'duration-long': {
            const dA = 'runtime' in a ? (a.runtime || 0) : 0;
            const dB = 'runtime' in b ? (b.runtime || 0) : 0;
            return filterState.sortBy === 'duration-short' ? dA - dB : dB - dA;
          }
          case 'pages-short':
          case 'pages-long': {
            const pA = 'pageCount' in a ? (a.pageCount || 0) : 0;
            const pB = 'pageCount' in b ? (b.pageCount || 0) : 0;
            return filterState.sortBy === 'pages-short' ? pA - pB : pB - pA;
          }
          default:
            return 0;
        }
      });
    }

    return result;
  }, [items, filterStatus, filterState, itemType]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredAndSortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterState]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleItemClick = (item: Item) => {
    console.log("Item clicked:", item);
    if (onItemClick) {
      onItemClick(item as T); // Tıklama olayını üst bileşene ilet
    }
  };

  return (
    <Layout activeItem={activeItem}>
      <Box p={6} bg={bg} minH="100vh">
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
          <Heading size="xl" color={useColorModeValue('blue.600', 'blue.300')}>
            {pageTitle}
          </Heading>
          <HStack spacing={2}>
            <HStack spacing={1} bg={cardBg} p={1} borderRadius="lg" shadow="sm">
              <Tooltip label="Kart Görünümü">
                <IconButton
                  icon={<Icon as={BsGrid3X3Gap} />}
                  size="sm"
                  variant={viewMode === 'card' ? 'solid' : 'ghost'}
                  colorScheme={viewMode === 'card' ? 'blue' : 'gray'}
                  onClick={() => setViewMode('card')}
                  aria-label="Kart görünümü"
                />
              </Tooltip>
              <Tooltip label="Liste Görünümü">
                <IconButton
                  icon={<Icon as={BsList} />}
                  size="sm"
                  variant={viewMode === 'list' ? 'solid' : 'ghost'}
                  colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
                  onClick={() => setViewMode('list')}
                  aria-label="Liste görünümü"
                />
              </Tooltip>
            </HStack>
            <Button
              colorScheme="blue"
              size="md"
              onClick={onAddItem}
              disabled={!onAddItem}
            >
              {addItemButtonText}
            </Button>
          </HStack>
        </Flex>

        {/* Status Filtresi + Tag/List Dropdown'ları */}
        <Box mb={4}>
          <Flex gap={4} flexWrap="wrap" align="center">
            {/* Status Butonları */}
            <HStack spacing={2} flexWrap="wrap">
              {filters.map(filter => (
                <Button
                  key={filter.key}
                  onClick={() => setFilterStatus(filter.key)}
                  variant={filterStatus === filter.key ? 'solid' : 'outline'}
                  colorScheme={filterStatus === filter.key ? 'blue' : 'gray'}
                  size="sm"
                >
                  {filter.label}
                </Button>
              ))}
            </HStack>

            <Divider orientation="vertical" h="32px" display={{ base: 'none', md: 'block' }} />

            {/* Etiketler Dropdown - Çoklu Seçim */}
            {availableTags.length > 0 && (
              <Menu closeOnSelect={false}>
                <MenuButton
                  as={Button}
                  size="sm"
                  variant="outline"
                  leftIcon={<FaTags />}
                  rightIcon={<FaChevronDown />}
                >
                  Etiketler
                  {(filterState.tags?.length || 0) > 0 && (
                    <Badge ml={2} colorScheme="teal" borderRadius="full">
                      {filterState.tags?.length}
                    </Badge>
                  )}
                </MenuButton>
                <MenuList maxH="300px" overflowY="auto">
                  {(filterState.tags?.length || 0) > 0 && (
                    <>
                      <MenuItem
                        onClick={() => setFilterState({ ...filterState, tags: [] })}
                        color="red.500"
                        fontWeight="medium"
                      >
                        Temizle
                      </MenuItem>
                      <MenuDivider />
                    </>
                  )}
                  {availableTags.map((tag) => (
                    <MenuItem
                      key={tag}
                      onClick={() => {
                        const currentTags = filterState.tags || [];
                        const newTags = currentTags.includes(tag)
                          ? currentTags.filter((t) => t !== tag)
                          : [...currentTags, tag];
                        setFilterState({ ...filterState, tags: newTags });
                      }}
                    >
                      <Checkbox
                        isChecked={filterState.tags?.includes(tag)}
                        pointerEvents="none"
                        mr={2}
                        colorScheme="teal"
                      />
                      {tag}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            )}

            {/* Listeler Dropdown - Tekli Seçim */}
            {availableLists.length > 0 && (
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  variant="outline"
                  leftIcon={<FaList />}
                  rightIcon={<FaChevronDown />}
                >
                  {filterState.lists && filterState.lists.length > 0
                    ? availableLists.find((l) => l.id === filterState.lists![0])?.name || 'Liste'
                    : 'Listeler'}
                </MenuButton>
                <MenuList maxH="300px" overflowY="auto">
                  <MenuItem
                    onClick={() => setFilterState({ ...filterState, lists: [] })}
                    fontWeight={filterState.lists?.length === 0 ? 'bold' : 'normal'}
                    bg={filterState.lists?.length === 0 ? 'blue.50' : undefined}
                    _dark={{ bg: filterState.lists?.length === 0 ? 'blue.900' : undefined }}
                  >
                    Tümü
                  </MenuItem>
                  <MenuDivider />
                  {availableLists.map((list) => (
                    <MenuItem
                      key={list.id}
                      onClick={() => setFilterState({ ...filterState, lists: [list.id] })}
                      fontWeight={filterState.lists?.includes(list.id) ? 'bold' : 'normal'}
                      bg={filterState.lists?.includes(list.id) ? 'purple.50' : undefined}
                      _dark={{ bg: filterState.lists?.includes(list.id) ? 'purple.900' : undefined }}
                    >
                      {list.name}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            )}
          </Flex>
        </Box>

        {/* Gelişmiş Filtreler */}
        <Filters
          type={itemType}
          filterState={filterState}
          onFilterChange={setFilterState}
          availableCategories={availableCategories}
        />

        {!isLoading && filteredAndSortedItems.length === 0 ? (
          <Center py={12}>
            <VStack spacing={4}>
              <Text fontSize="6xl">{emptyStateIcon}</Text>
              <Text color={subtextColor} fontSize="lg" textAlign="center">
                {emptyStateText}
              </Text>
              <Button
                colorScheme="blue"
                variant="outline"
                onClick={onAddItem}
                disabled={!onAddItem}
              >
                İlk {itemType === 'book' ? 'kitabını' : 'filmini'} ekle
              </Button>
            </VStack>
          </Center>
        ) : (
          viewMode === 'card' ? (
            <CardView
              items={paginatedItems}
              isLoading={isLoading}
              itemsPerPage={ITEMS_PER_PAGE}
              getStatusBadge={getStatusBadge}
              type={itemType}
              onItemClick={handleItemClick} // Prop olarak aktar
            />
          ) : (
            <ListView
              items={paginatedItems}
              isLoading={isLoading}
              itemsPerPage={ITEMS_PER_PAGE}
              getStatusBadge={getStatusBadge}
              type={itemType}
              onItemClick={handleItemClick} // Prop olarak aktar
            />
          )
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Box>
    </Layout>
  );
};

export default ResourcePageLayout;

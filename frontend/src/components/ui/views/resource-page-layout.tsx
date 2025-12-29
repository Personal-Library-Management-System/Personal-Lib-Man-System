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
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
} from '@chakra-ui/react';
import { BsGrid3X3Gap, BsList } from 'react-icons/bs';
import { FaTags, FaList, FaChevronDown } from 'react-icons/fa';
import { FiPlus, FiEdit, FiCheck, FiX, FiSearch } from 'react-icons/fi';
import Layout from '../layout';
import CardView from './card-view';
import ListView from './list-view';
import Pagination from './pagination';
import { Filters, type FilterState, type ListItem } from '../filters';
import { type Book, type Movie } from '../../../types';
import * as mediaListApi from '../../../services/mediaList.service';
import * as tagApi from '../../../services/tag.service';

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
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
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
  searchQuery: externalSearchQuery,
  onSearchChange,
}: ResourcePageLayoutProps<T>) => {
  const [items, setItems] = useState<Item[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
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
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editedListName, setEditedListName] = useState('');
  const [availableLists, setAvailableLists] = useState<ListItem[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [editingTagName, setEditingTagName] = useState<string | null>(null);
  const [editedTagName, setEditedTagName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [availableTagsFromApi, setAvailableTagsFromApi] = useState<tagApi.Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const toast = useToast();

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

  // Fetch available lists from API
  const fetchLists = async () => {
    setIsLoadingLists(true);
    try {
      const lists = await mediaListApi.getAllMediaLists();
      
      // Filter lists by itemType and transform to ListItem format
      const filtered = lists.filter((list) => list.mediaType === (itemType === 'book' ? 'Book' : 'Movie'));
      const transformed: ListItem[] = filtered.map((list) => ({
        id: list._id,
        name: list.title,
        color: list.color,
        items: list.items.map((itemId) => ({ type: itemType, id: itemId })),
      }));
      setAvailableLists(transformed);
    } catch (error) {
      console.error('Error fetching lists:', error);
      // Set empty array on error
      setAvailableLists([]);
    } finally {
      setIsLoadingLists(false);
    }
  };

  // Fetch available tags from API
  const fetchTags = async () => {
    setIsLoadingTags(true);
    try {
      const tags = await tagApi.getAllTags();
      setAvailableTagsFromApi(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setAvailableTagsFromApi([]);
    } finally {
      setIsLoadingTags(false);
    }
  };

  // Create new list handler
  const handleCreateList = async () => {
    const name = newListName.trim();
    if (!name) return;
    
    try {
      await mediaListApi.createMediaList({
        title: name,
        mediaType: itemType === 'book' ? 'Book' : 'Movie',
        items: [],
      });
      
      toast({
        title: 'List created',
        description: `"${name}" has been created successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setNewListName('');
      await fetchLists(); // Refresh the list
    } catch (error) {
      console.error('Error creating list:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      // Check if it's an authentication error
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to create lists',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error creating list',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Edit list handlers
  const handleStartEditList = (listId: string, currentName: string) => {
    setEditingListId(listId);
    setEditedListName(currentName);
  };

  const handleSaveEditList = async () => {
    const newName = editedListName.trim();
    const listId = editingListId;
    const originalList = availableLists.find(list => list.id === listId);
    const oldName = originalList?.name;
    
    if (!newName || !listId || !oldName || newName === oldName) {
      setEditingListId(null);
      setEditedListName('');
      return;
    }
    
    try {
      await mediaListApi.updateMediaList(listId, { title: newName });
      
      toast({
        title: 'List updated',
        description: `List "${oldName}" has been renamed to "${newName}"`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setEditingListId(null);
      setEditedListName('');
      await fetchLists(); // Refresh the list
    } catch (error) {
      console.error('Error updating list:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      setEditingListId(null);
      setEditedListName('');
      
      // Check if it's an authentication error
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to update lists',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error updating list',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleCancelEditList = () => {
    setEditingListId(null);
    setEditedListName('');
  };

  // Tag edit handlers
  const handleStartEditTag = (tagName: string) => {
    setEditingTagName(tagName);
    setEditedTagName(tagName);
  };

  const handleSaveEditTag = async () => {
    const newName = editedTagName.trim();
    const oldName = editingTagName;
    if (!newName || !oldName || newName === oldName) {
      setEditingTagName(null);
      setEditedTagName('');
      return;
    }
    
    try {
      // Find the tag ID from the available tags
      const tagToUpdate = availableTagsFromApi.find(tag => tag.name === oldName);
      if (!tagToUpdate) {
        throw new Error('Tag not found');
      }

      // Update tag via API
      await tagApi.updateTag(tagToUpdate._id, { name: newName });
      
      toast({
        title: 'Tag updated',
        description: `Tag "${oldName}" has been renamed to "${newName}"`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setEditingTagName(null);
      setEditedTagName('');
      await fetchTags(); // Refresh tags
    } catch (error) {
      console.error('Error updating tag:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      setEditingTagName(null);
      setEditedTagName('');
      
      // Check if it's an authentication error
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to update tags',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else if (errorMessage.includes('409') || errorMessage.includes('already exists')) {
        toast({
          title: 'Tag already exists',
          description: `A tag with the name "${newName}" already exists`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error updating tag',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleCancelEditTag = () => {
    setEditingTagName(null);
    setEditedTagName('');
  };

  const handleDeleteTag = async (tagName: string) => {
    try {
      // Find the tag ID from the available tags
      const tagToDelete = availableTagsFromApi.find(tag => tag.name === tagName);
      if (!tagToDelete) {
        throw new Error('Tag not found');
      }

      // Delete tag via API
      await tagApi.deleteTag(tagToDelete._id);
      
      // Remove tag from filterState if it was selected
      if (filterState.tags?.includes(tagName)) {
        setFilterState({
          ...filterState,
          tags: filterState.tags.filter((t: string) => t !== tagName)
        });
      }
      
      toast({
        title: 'Tag deleted',
        description: `Tag "${tagName}" has been deleted`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      await fetchTags(); // Refresh tags
    } catch (error) {
      console.error('Error deleting tag:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      // Check if it's an authentication error
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to delete tags',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error deleting tag',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Create new tag handler
  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    
    try {
      await tagApi.createTag({ name });
      
      toast({
        title: 'Tag created',
        description: `"${name}" has been created successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setNewTagName('');
      await fetchTags(); // Refresh the tags
    } catch (error) {
      console.error('Error creating tag:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      // Check if it's an authentication error
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to create tags',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else if (errorMessage.includes('409') || errorMessage.includes('already exists')) {
        toast({
          title: 'Tag already exists',
          description: `A tag with the name "${name}" already exists`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error creating tag',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Delete list handler
  const handleDeleteList = async (listId: string) => {
    try {
      await mediaListApi.deleteMediaList(listId);
      
      toast({
        title: 'List deleted',
        description: 'List has been deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // If the deleted list was selected, clear the filter
      if (filterState.lists?.includes(listId)) {
        setFilterState({ ...filterState, lists: [] });
      }
      
      await fetchLists(); // Refresh the list
    } catch (error) {
      console.error('Error deleting list:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      // Check if it's an authentication error
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to delete lists',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error deleting list',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

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
    fetchLists(); // Fetch lists when component mounts or itemType changes
    fetchTags(); // Fetch tags when component mounts
  }, [mockData, itemType]);

  // Filtreleme ve sıralama mantığı
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // 0. Search filter - title and author/director search
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(query);
        let authorMatch = false;
        
        if ('authors' in item && item.authors) {
          authorMatch = item.authors.some((author: string) => 
            author.toLowerCase().includes(query)
          );
        }
        if ('director' in item && item.director) {
          authorMatch = item.director.toLowerCase().includes(query);
        }
        
        return titleMatch || authorMatch;
      });
    }

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
      result = result.filter(item => {
        // Check if the item has a lists field and if any of the selected lists are in it
        if ('lists' in item && (item as any).lists) {
          const itemLists = (item as any).lists as string[];
          return filterState.lists!.some((listId: string) => itemLists.includes(listId));
        }
        return false;
      });
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
  }, [items, filterStatus, filterState, itemType, searchQuery]);

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
          <HStack spacing={3}>
            {/* Search Bar */}
            <InputGroup maxW="250px">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder={`Search ${itemType}s...`}
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onSearchChange) {
                    onSearchChange(value);
                  } else {
                    setInternalSearchQuery(value);
                  }
                }}
                bg={cardBg}
                borderRadius="lg"
                size="md"
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4299E1' }}
              />
            </InputGroup>
            <HStack spacing={1} bg={cardBg} p={1} borderRadius="lg" shadow="sm">
              <Tooltip label="Card View">
                <IconButton
                  icon={<Icon as={BsGrid3X3Gap} />}
                  size="sm"
                  variant={viewMode === 'card' ? 'solid' : 'ghost'}
                  colorScheme={viewMode === 'card' ? 'blue' : 'gray'}
                  onClick={() => setViewMode('card')}
                  aria-label="Card view"
                />
              </Tooltip>
              <Tooltip label="List View">
                <IconButton
                  icon={<Icon as={BsList} />}
                  size="sm"
                  variant={viewMode === 'list' ? 'solid' : 'ghost'}
                  colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
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
            <Menu closeOnSelect={false}>
              <MenuButton
                as={Button}
                size="sm"
                variant="outline"
                leftIcon={<FaTags />}
                rightIcon={<FaChevronDown />}
              >
                Tags
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
                        Clear
                      </MenuItem>
                      <MenuDivider />
                    </>
                  )}
                  {availableTagsFromApi.map((tag) => (
                    <Box
                      key={tag._id}
                      px={3}
                      py={2}
                      _hover={{ bg: useColorModeValue('gray.100', 'whiteAlpha.100') }}
                      cursor="pointer"
                    >
                      {editingTagName === tag.name ? (
                        <HStack spacing={2} width="100%">
                          <Input
                            value={editedTagName}
                            onChange={(e) => setEditedTagName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveEditTag();
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                handleCancelEditTag();
                              }
                            }}
                            size="sm"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <IconButton
                            aria-label="Save"
                            icon={<Icon as={FiCheck} />}
                            size="sm"
                            colorScheme="green"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEditTag();
                            }}
                          />
                        </HStack>
                      ) : (
                        <Flex justify="space-between" align="center" width="100%">
                          <HStack
                            flex="1"
                            onClick={() => {
                              const currentTags = filterState.tags || [];
                              const newTags = currentTags.includes(tag.name)
                                ? currentTags.filter((t) => t !== tag.name)
                                : [...currentTags, tag.name];
                              setFilterState({ ...filterState, tags: newTags });
                            }}
                          >
                            <Checkbox
                              isChecked={filterState.tags?.includes(tag.name)}
                              pointerEvents="none"
                              colorScheme="teal"
                            />
                            <Text>{tag.name}</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <IconButton
                              aria-label="Edit tag name"
                              icon={<Icon as={FiEdit} />}
                              size="xs"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditTag(tag.name);
                              }}
                            />
                            <IconButton
                              aria-label="Delete tag"
                              icon={<Icon as={FiX} />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTag(tag.name);
                              }}
                            />
                          </HStack>
                        </Flex>
                      )}
                    </Box>
                  ))}
                  <MenuDivider />
                  <Box px={3} py={2}>
                    <HStack spacing={2}>
                      <Input
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreateTag();
                          }
                        }}
                        placeholder="New tag name"
                        size="sm"
                      />
                      <IconButton
                        aria-label="Create tag"
                        icon={<Icon as={FiPlus} />}
                        size="sm"
                        colorScheme="teal"
                        onClick={handleCreateTag}
                      />
                    </HStack>
                  </Box>
                </MenuList>
              </Menu>

            {/* Listeler Dropdown - Tekli Seçim */}
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                variant="outline"
                leftIcon={<FaList />}
                rightIcon={<FaChevronDown />}
              >
                {filterState.lists && filterState.lists.length > 0
                  ? availableLists.find((l) => l.id === filterState.lists![0])?.name || 'List'
                  : 'Lists'}
              </MenuButton>
              <MenuList maxH="300px" overflowY="auto">
                {availableLists.length > 0 && (
                  <>
                    <MenuItem
                      onClick={() => setFilterState({ ...filterState, lists: [] })}
                      fontWeight={filterState.lists?.length === 0 ? 'bold' : 'normal'}
                      bg={filterState.lists?.length === 0 ? 'blue.50' : undefined}
                      _dark={{ bg: filterState.lists?.length === 0 ? 'blue.900' : undefined }}
                    >
                      All
                    </MenuItem>
                    <MenuDivider />
                  </>
                )}
                {availableLists.map((list) => (
                    <MenuItem
                      key={list.id}
                      fontWeight={filterState.lists?.includes(list.id) ? 'bold' : 'normal'}
                      bg={filterState.lists?.includes(list.id) ? 'purple.50' : undefined}
                      _dark={{ bg: filterState.lists?.includes(list.id) ? 'purple.900' : undefined }}
                      closeOnSelect={false}
                    >
                      {editingListId === list.id ? (
                        <HStack spacing={2} width="100%">
                          <Input
                            value={editedListName}
                            onChange={(e) => setEditedListName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveEditList();
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                handleCancelEditList();
                              }
                            }}
                            size="sm"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <IconButton
                            aria-label="Save"
                            icon={<Icon as={FiCheck} />}
                            size="sm"
                            colorScheme="green"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEditList();
                            }}
                          />
                        </HStack>
                      ) : (
                        <Flex justify="space-between" align="center" width="100%">
                          <Text
                            onClick={() => setFilterState({ ...filterState, lists: [list.id] })}
                            flex="1"
                          >
                            {list.name}
                          </Text>
                          <HStack spacing={1}>
                            <IconButton
                              aria-label="Edit list name"
                              icon={<Icon as={FiEdit} />}
                              size="xs"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditList(list.id, list.name);
                              }}
                            />
                            <IconButton
                              aria-label="Delete list"
                              icon={<Icon as={FiX} />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteList(list.id);
                              }}
                            />
                          </HStack>
                        </Flex>
                      )}
                    </MenuItem>
                  ))}
                  <MenuDivider />
                  <Box px={3} py={2}>
                    <HStack spacing={2}>
                      <Input
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreateList();
                          }
                        }}
                        placeholder="New list name"
                        size="sm"
                      />
                      <IconButton
                        aria-label="Create list"
                        icon={<Icon as={FiPlus} />}
                        size="sm"
                        colorScheme="teal"
                        onClick={handleCreateList}
                      />
                    </HStack>
                  </Box>
                </MenuList>
              </Menu>
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
                Add your first {itemType === 'book' ? 'book' : 'movie'}
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

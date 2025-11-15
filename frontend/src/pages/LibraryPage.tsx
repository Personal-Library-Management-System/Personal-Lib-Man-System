import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  Badge,
  HStack,
  Center,
  IconButton,
  useColorModeValue,
  Tooltip,
  VStack,
  Text,
  Icon
} from '@chakra-ui/react';
import { BsGrid3X3Gap, BsList } from 'react-icons/bs';
import Layout from '../components/ui/layout';
import CardView from '../components/ui/card-view';
import ListView from '../components/ui/list-view';
import Pagination from '../components/ui/pagination';
import mockBooksData from '../mock-data/book-data.json';

const ITEMS_PER_PAGE = 12;

const LibraryPage = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  // Data loading simulation
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setIsLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setBooks(mockBooksData);
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, []);

  const filteredBooks = filterStatus === 'all' 
    ? books 
    : books.filter(book => book.status === filterStatus);

  // Pagination logic
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { text: string; colorScheme: string }> = {
      'read': { text: 'Okundu', colorScheme: 'green' },
      'reading': { text: 'Okunuyor', colorScheme: 'blue' },
      'want-to-read': { text: 'Okunacak', colorScheme: 'yellow' }
    };
    const config = statusConfig[status] || { text: status, colorScheme: 'gray' };
    return <Badge colorScheme={config.colorScheme} variant="subtle" size="sm">{config.text}</Badge>;
  };

  const filters = [
    { key: 'all', label: 'Tümü' },
    { key: 'read', label: 'Okundu' },
    { key: 'reading', label: 'Okunuyor' },
    { key: 'want-to-read', label: 'Okunacak' }
  ];

  return (
    <Layout activeItem="kitaplik">
      <Box p={6} bg={bg} minH="100vh">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
          <Heading 
            size="xl" 
            color={useColorModeValue('blue.600', 'blue.300')}
          >
            📚 Kitaplığım
          </Heading>
          <HStack spacing={2}>
            {/* View Mode Toggle */}
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
            <Button colorScheme="blue" size="md">
              + Kitap Ekle
            </Button>
          </HStack>
        </Flex>

        {/* Filters */}
        <Box mb={6}>
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
        </Box>

        {/* Content */}
        {!isLoading && filteredBooks.length === 0 ? (
          <Center py={12}>
            <VStack spacing={4}>
              <Text fontSize="6xl">📚</Text>
              <Text color={subtextColor} fontSize="lg" textAlign="center">
                Bu kategoride kitap bulunamadı.
              </Text>
              <Button colorScheme="blue" variant="outline">
                İlk kitabını ekle
              </Button>
            </VStack>
          </Center>
        ) : (
          viewMode === 'card' ? (
            <CardView 
              items={paginatedBooks}
              isLoading={isLoading}
              itemsPerPage={ITEMS_PER_PAGE}
              getStatusBadge={getStatusBadge}
              type="book"
            />
          ) : (
            <ListView 
              items={paginatedBooks}
              isLoading={isLoading}
              itemsPerPage={ITEMS_PER_PAGE}
              getStatusBadge={getStatusBadge}
              type="book"
            />
          )
        )}

        {/* Pagination */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Box>
    </Layout>
  );
};

export default LibraryPage;
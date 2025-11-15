import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  SimpleGrid,
  Badge,
  Image,
  Text,
  VStack,
  HStack,
  Center,
  IconButton,
  useColorModeValue,
  Tooltip,
  Card,
  CardBody,
  Skeleton,
  SkeletonText,
  Icon
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { BsGrid3X3Gap, BsList } from 'react-icons/bs';
import Layout from '../components/ui/layout';
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
  const textColor = useColorModeValue('gray.800', 'white');
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

  // Card View Skeleton - Badge skeleton kaldırıldı
  const CardSkeleton = () => (
    <Card 
      bg={cardBg}
      overflow="hidden"
      h="auto"
      transition="all 0.3s ease"
    >
      <CardBody p={0}>
        <Box position="relative">
          <Skeleton height="360px" borderRadius="0" />
        </Box>
        <Box p={4}>
          <SkeletonText mt={0} noOfLines={2} spacing={2} skeletonHeight="16px" />
          <Skeleton height="14px" mt={2} width="60%" />
          <HStack justify="space-between" align="center" mt={3}>
            <Skeleton height="14px" width="50px" />
            <Skeleton height="20px" width="60px" borderRadius="full" />
          </HStack>
        </Box>
      </CardBody>
    </Card>
  );

  // List View Skeleton - Badge position değişti
  const ListSkeleton = () => (
    <Card bg={cardBg}>
      <CardBody>
        <Flex gap={4} align="center">
          <Skeleton width="60px" height="90px" borderRadius="md" flexShrink={0} />
          <Box flex="1" minW="0">
            <HStack mb={1} spacing={2}>
              <Skeleton height="24px" width="60%" />
              <Skeleton height="20px" width="60px" borderRadius="full" />
            </HStack>
            <Skeleton height="20px" mb={2} width="50%" />
            <SkeletonText noOfLines={2} spacing={2} skeletonHeight="14px" mb={2} />
            <HStack spacing={4} flexWrap="wrap" mt={2}>
              <Skeleton height="14px" width="80px" />
              <Skeleton height="14px" width="100px" />
              <Skeleton height="14px" width="60px" />
            </HStack>
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );

  // Card View - Badge pozisyonu değiştirildi
  const CardView = () => (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
      {isLoading
        ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <CardSkeleton key={index} />
          ))
        : paginatedBooks.map(book => (
            <Card
              key={book.id}
              bg={cardBg}
              cursor="pointer"
              transition="all 0.3s ease"
              _hover={{
                transform: 'translateY(-8px)',
                shadow: 'xl'
              }}
              overflow="hidden"
              h="auto"
              maxW="280px"
              mx="auto"
            >
              <CardBody p={0}>
                <Box position="relative">
                  <Image
                    src={book.imageUrl}
                    alt={book.title}
                    w="full"
                    h="360px"
                    objectFit="cover"
                    objectPosition="center top"
                    fallback={
                      <Box 
                        w="full" 
                        h="360px" 
                        bg="gray.200" 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                      >
                        <Text color="gray.500" fontSize="xl">📚</Text>
                      </Box>
                    }
                  />
                </Box>
                <Box p={4}>
                  <Heading size="sm" color={textColor} noOfLines={2} mb={2} minH="40px">
                    {book.title}
                  </Heading>
                  <Text color={subtextColor} fontSize="sm" mb={2} noOfLines={1}>
                    {book.author}
                  </Text>
                  <HStack justify="space-between" align="center">
                    <HStack spacing={1}>
                      <Text fontSize="sm">⭐</Text>
                      <Text fontSize="sm" color={subtextColor}>{book.rating}</Text>
                      <Text fontSize="xs" color={subtextColor}>
                        • {book.pageCount}s
                      </Text>
                    </HStack>
                    {getStatusBadge(book.status)}
                  </HStack>
                </Box>
              </CardBody>
            </Card>
          ))
      }
    </SimpleGrid>
  );

  // List View - Badge pozisyonu değiştirildi
  const ListView = () => (
    <VStack spacing={4} align="stretch">
      {isLoading
        ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <ListSkeleton key={index} />
          ))
        : paginatedBooks.map(book => (
            <Card
              key={book.id}
              bg={cardBg}
              cursor="pointer"
              transition="all 0.2s ease"
              _hover={{ shadow: 'md' }}
            >
              <CardBody>
                <Flex gap={4} align="center">
                  <Image
                    src={book.imageUrl}
                    alt={book.title}
                    w="60px"
                    h="90px"
                    objectFit="cover"
                    objectPosition="center top"
                    borderRadius="md"
                    flexShrink={0}
                    fallback={
                      <Box 
                        w="60px" 
                        h="90px" 
                        bg="gray.200" 
                        borderRadius="md"
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                      >
                        <Text color="gray.500" fontSize="sm">📚</Text>
                      </Box>
                    }
                  />
                  <Box flex="1" minW="0">
                    <HStack mb={1} spacing={2} align="center">
                      <Heading size="md" color={textColor} noOfLines={1}>
                        {book.title}
                      </Heading>
                      {getStatusBadge(book.status)}
                    </HStack>
                    <Text color={subtextColor} fontSize="md" mb={2}>
                      {book.author}
                    </Text>
                    <Text color={subtextColor} fontSize="sm" noOfLines={2} mb={2}>
                      {book.description}
                    </Text>
                    <HStack spacing={4} flexWrap="wrap">
                      <Text fontSize="sm" color={subtextColor}>
                        📅 {book.publishedDate}
                      </Text>
                      <Text fontSize="sm" color={subtextColor}>
                        📄 {book.pageCount} sayfa
                      </Text>
                      <HStack spacing={1}>
                        <Text fontSize="sm">⭐</Text>
                        <Text fontSize="sm" color={subtextColor}>{book.rating}</Text>
                      </HStack>
                    </HStack>
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          ))
      }
    </VStack>
  );

  // Pagination Component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <Flex justify="center" align="center" mt={8} gap={2}>
        <IconButton
          icon={<ChevronLeftIcon />}
          isDisabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          variant="outline"
          size="sm"
          aria-label="Önceki sayfa"
        />
        
        <HStack spacing={1}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <Button
              key={pageNum}
              size="sm"
              variant={currentPage === pageNum ? 'solid' : 'outline'}
              colorScheme={currentPage === pageNum ? 'blue' : 'gray'}
              onClick={() => setCurrentPage(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
        </HStack>

        <IconButton
          icon={<ChevronRightIcon />}
          isDisabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          variant="outline"
          size="sm"
          aria-label="Sonraki sayfa"
        />
      </Flex>
    );
  };

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
          viewMode === 'card' ? <CardView /> : <ListView />
        )}

        {/* Pagination */}
        <Pagination />
      </Box>
    </Layout>
  );
};

export default LibraryPage;
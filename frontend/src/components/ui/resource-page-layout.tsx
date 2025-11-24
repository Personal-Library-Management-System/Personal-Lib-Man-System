import React, { useState, useEffect } from 'react';
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
  Icon
} from '@chakra-ui/react';
import { BsGrid3X3Gap, BsList } from 'react-icons/bs';
import Layout from './layout';
import CardView from './card-view';
import ListView from './list-view';
import Pagination from './pagination';
import { type Book, type Movie } from '../../types';

const ITEMS_PER_PAGE = 12;

type Item = Book | Movie;

interface ResourcePageLayoutProps {
  pageTitle: string;
  activeItem: 'kitaplik' | 'filmarsivi';
  mockData: Item[];
  filters: { key: string; label: string }[];
  getStatusBadge: (status: string) => React.ReactNode;
  itemType: 'book' | 'movie';
  addItemButtonText: string;
  emptyStateIcon: string;
  emptyStateText: string;
}

const ResourcePageLayout: React.FC<ResourcePageLayoutProps> = ({
  pageTitle,
  activeItem,
  mockData,
  filters,
  getStatusBadge,
  itemType,
  addItemButtonText,
  emptyStateIcon,
  emptyStateText,
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

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

  const filteredItems = filterStatus === 'all'
    ? items
    : items.filter(item => item.status === filterStatus);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

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
            <Button colorScheme="blue" size="md">
              {addItemButtonText}
            </Button>
          </HStack>
        </Flex>

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

        {!isLoading && filteredItems.length === 0 ? (
          <Center py={12}>
            <VStack spacing={4}>
              <Text fontSize="6xl">{emptyStateIcon}</Text>
              <Text color={subtextColor} fontSize="lg" textAlign="center">
                {emptyStateText}
              </Text>
              <Button colorScheme="blue" variant="outline">
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
            />
          ) : (
            <ListView
              items={paginatedItems}
              isLoading={isLoading}
              itemsPerPage={ITEMS_PER_PAGE}
              getStatusBadge={getStatusBadge}
              type={itemType}
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
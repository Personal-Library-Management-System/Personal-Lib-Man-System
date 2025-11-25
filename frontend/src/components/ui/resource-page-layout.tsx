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
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { BsGrid3X3Gap, BsList } from 'react-icons/bs';
import Layout from './layout';
import CardView from './card-view';
import ListView from './list-view';
import Pagination from './pagination';
import Filters from './filters';
import AdvancedSearch from './advanced-search';
import { type Book, type Movie } from '../../types';

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
}: ResourcePageLayoutProps<T>) => {
  const [items, setItems] = useState<Item[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();

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

  const filteredItems = items.filter(item => {
    // 1. Statü Filtresi
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesStatus;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

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
            <Button colorScheme="blue" size="md" onClick={onAddModalOpen}>
              {addItemButtonText}
            </Button>
          </HStack>
        </Flex>

        <VStack spacing={4} align="stretch" mb={6}>
          {/* <AdvancedSearch 
            type={itemType} 
            onSearch={setSearchCriteria} 
          /> */}
          <Filters
            options={filters.map(f => ({ label: f.label, value: f.key }))}
            selectedStatus={filterStatus}
            onStatusChange={setFilterStatus}
          />
        </VStack>

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

      {/* Ekleme Modalı */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Yeni {itemType === 'book' ? 'Kitap' : 'Film'} Ekle</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4} color="gray.500">
              Aşağıdaki kriterlere göre arama yaparak kütüphanenize yeni bir {itemType === 'book' ? 'kitap' : 'film'} ekleyebilirsiniz.
            </Text>
            <AdvancedSearch 
              type={itemType} 
              onSearch={(criteria) => {
                console.log("Arama yapılıyor:", criteria);
                // İleride buraya backend isteği eklenecek
              }} 
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Layout>
  );
};

export default ResourcePageLayout;
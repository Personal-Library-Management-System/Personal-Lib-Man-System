import React from 'react';
import {
  VStack,
  Card,
  CardBody,
  Flex,
  Box,
  Image,
  Heading,
  Text,
  HStack,
  Skeleton,
  SkeletonText,
  useColorModeValue
} from '@chakra-ui/react';
import { type Book, type Movie } from '../../../types';

type ListItem = Book | Movie;

interface ListViewProps {
  items: ListItem[];
  isLoading: boolean;
  itemsPerPage: number;
  getStatusBadge: (status: string) => React.ReactNode;
  type: 'book' | 'movie';
  onItemClick?: (item: ListItem) => void;
}

const ListSkeleton = ({ type }: { type: 'book' | 'movie' }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const imageWidth = type === 'book' ? '60px' : '80px';
  const imageHeight = type === 'book' ? '90px' : '120px';

  return (
    <Card bg={cardBg}>
      <CardBody>
        <Flex gap={4} align="center">
          <Skeleton width={imageWidth} height={imageHeight} borderRadius="md" flexShrink={0} />
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
};

const ListView: React.FC<ListViewProps> = ({
  items,
  isLoading,
  itemsPerPage,
  getStatusBadge,
  type,
  onItemClick,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  
  const imageWidth = type === 'book' ? '60px' : '80px';
  const imageHeight = type === 'book' ? '90px' : '120px';
  const fallbackIcon = type === 'book' ? '📚' : '🎬';

  return (
    <VStack spacing={4} align="stretch">
      {isLoading
        ? Array.from({ length: itemsPerPage }).map((_, index) => (
            <ListSkeleton key={index} type={type} />
          ))
        : items.map(item => {
            const imageUrl = type === 'book' 
              ? (item as Book).imageLinks?.thumbnail || '' 
              : (item as Movie).imageUrl;
            
            const subtitle = type === 'book' 
              ? (item as Book).authors?.join(', ') || 'Yazar bilinmiyor'
              : (item as Movie).director;
            
            const rating = type === 'book'
              ? (item as Book).averageRating || 0
              : (item as Movie).ratings?.at(0)?.Value || 0;
            
            const date = type === 'book'
              ? (item as Book).publishedDate || 'Bilinmiyor'
              : (item as Movie).releaseDate;
            
            const pageOrDuration = type === 'book'
              ? `📄 ${(item as Book).pageCount || 0} sayfa`
              : `⏱️ ${(item as Movie).runtime} dakika`;
            
            const description = (item as Book).description || (item as Movie).plot || 'Açıklama bulunmuyor';

            return (
              <Card
                key={item.id}
                bg={cardBg}
                cursor="pointer"
                transition="all 0.2s ease"
                _hover={{ shadow: 'md' }}
                onClick={() => onItemClick && onItemClick(item)}
              >
                <CardBody>
                  <Flex gap={4} align="center">
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      w={imageWidth}
                      h={imageHeight}
                      objectFit="cover"
                      objectPosition="center top"
                      borderRadius="md"
                      flexShrink={0}
                      fallback={
                        <Box 
                          w={imageWidth} 
                          h={imageHeight} 
                          bg="gray.200" 
                          borderRadius="md"
                          display="flex" 
                          alignItems="center" 
                          justifyContent="center"
                        >
                          <Text color="gray.500" fontSize="sm">{fallbackIcon}</Text>
                        </Box>
                      }
                    />
                    <Box flex="1" minW="0">
                      <HStack mb={1} spacing={2} align="center">
                        <Heading size="md" color={textColor} noOfLines={1}>
                          {item.title}
                        </Heading>
                        {getStatusBadge(item.status)}
                      </HStack>
                      <Text color={subtextColor} fontSize="md" mb={2}>
                        {subtitle}
                      </Text>
                      <Text color={subtextColor} fontSize="sm" noOfLines={2} mb={2}>
                        {description}
                      </Text>
                      <HStack spacing={4} flexWrap="wrap">
                        <Text fontSize="sm" color={subtextColor}>
                          📅 {date}
                        </Text>
                        <Text fontSize="sm" color={subtextColor}>
                          {pageOrDuration}
                        </Text>
                        <HStack spacing={1}>
                          <Text fontSize="sm">⭐</Text>
                          <Text fontSize="sm" color={subtextColor}>{parseFloat(String(rating)).toFixed(1)}</Text>
                        </HStack>
                      </HStack>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>
            );
          })
      }
    </VStack>
  );
};

export default ListView;
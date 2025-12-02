import React from 'react';
import {
  SimpleGrid,
  Card,
  CardBody,
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

type CardItem = Book | Movie;

interface CardViewProps {
  items: CardItem[];
  isLoading: boolean;
  itemsPerPage: number;
  getStatusBadge: (status: string) => React.ReactNode;
  type: 'book' | 'movie';
  onItemClick?: (item: CardItem) => void;
}

const CardSkeleton = ({ type }: { type: 'book' | 'movie' }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const imageHeight = type === 'book' ? '360px' : '400px';

  return (
    <Card 
      bg={cardBg}
      overflow="hidden"
      h="auto"
      transition="all 0.3s ease"
    >
      <CardBody p={0}>
        <Box position="relative">
          <Skeleton height={imageHeight} borderRadius="0" />
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
};

const CardView: React.FC<CardViewProps> = ({
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
  
  const imageHeight = type === 'book' ? '360px' : '400px';
  const fallbackIcon = type === 'book' ? '📚' : '🎬';

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
      {isLoading
        ? Array.from({ length: itemsPerPage }).map((_, index) => (
            <CardSkeleton key={index} type={type} />
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
              : (item as Movie).rating;
            
            const additionalInfo = type === 'book'
              ? `${(item as Book).pageCount || 0}s`
              : `${(item as Movie).duration}dk`;

            return (
              <Card
                key={item.id}
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
                onClick={() => onItemClick && onItemClick(item)}
              >
                <CardBody p={0}>
                  <Box position="relative">
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      w="full"
                      h={imageHeight}
                      objectFit="cover"
                      objectPosition="center top"
                      fallback={
                        <Box 
                          w="full" 
                          h={imageHeight} 
                          bg="gray.200" 
                          display="flex" 
                          alignItems="center" 
                          justifyContent="center"
                        >
                          <Text color="gray.500" fontSize="xl">{fallbackIcon}</Text>
                        </Box>
                      }
                    />
                  </Box>
                  <Box p={4}>
                    <Heading size="sm" color={textColor} noOfLines={2} mb={2} minH="40px">
                      {item.title}
                    </Heading>
                    <Text color={subtextColor} fontSize="sm" mb={2} noOfLines={1}>
                      {subtitle}
                    </Text>
                    <HStack justify="space-between" align="center">
                      <HStack spacing={1}>
                        <Text fontSize="sm">⭐</Text>
                        <Text fontSize="sm" color={subtextColor}>{rating.toFixed(1)}</Text>
                        <Text fontSize="xs" color={subtextColor}>
                          • {additionalInfo}
                        </Text>
                      </HStack>
                      {getStatusBadge(item.status)}
                    </HStack>
                  </Box>
                </CardBody>
              </Card>
            );
          })
      }
    </SimpleGrid>
  );
};

export default CardView;
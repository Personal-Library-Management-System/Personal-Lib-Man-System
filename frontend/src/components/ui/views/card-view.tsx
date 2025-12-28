import React, { useState } from 'react';
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
  useColorModeValue,
  Stack
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
  
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };
  
  const imageHeight = type === 'book' ? '360px' : '400px';
  const fallbackIcon = type === 'book' ? '📚' : '🎬';

  return (
    <SimpleGrid columns={[1, 2, 3, 4]} spacing={4}>
      {isLoading
        ? Array.from({ length: itemsPerPage }).map((_, index) => (
            <CardSkeleton key={index} type={type} />
          ))
        : items.map((it, i) => {
            const itemId = it.id ?? (it as any)._id ?? `item-${i}`;
            const hasImageError = imageErrors.has(itemId);
            const imageUrl = type === 'book' 
              ? (it as Book).coverPhoto ?? '' 
              : (it as Movie).coverPhoto ?? '';

            return (
              <Card
                key={`${itemId}-${i}`}
                bg={cardBg}
                cursor="pointer"
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-8px)',
                  shadow: 'xl'
                }}
                overflow="hidden"
                h="auto"
                onClick={() => onItemClick && onItemClick(it)}
              >
                <CardBody p={0}>
                  <Box position="relative">
                    {!hasImageError && imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={it.title}
                        w="full"
                        h={imageHeight}
                        objectFit="cover"
                        objectPosition="center top"
                        onError={() => handleImageError(itemId)}
                      />
                    ) : (
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
                    )}
                  </Box>
                  <Box p={4}>
                    <Heading size="sm" color={textColor} noOfLines={2} mb={2} minH="40px">
                      {it.title}
                    </Heading>
                    <Text color={subtextColor} fontSize="sm" mb={2} noOfLines={1}>
                      {type === 'book' ? ((it as Book).author ?? 'Unknown author') : ((it as Movie).director ?? 'Unknown director')}
                    </Text>
                    <HStack justify="space-between" align="center">
                      <HStack spacing={1}>
                        <Text fontSize="sm">⭐</Text>
                        <Text fontSize="sm" color={subtextColor}>
                          {Number((it as any).ratings?.[0]?.value ?? (type === 'book' ? (it as Book).averageRating : 0) ?? 0).toFixed(1)}
                        </Text>
                        <Text fontSize="xs" color={subtextColor}>
                          • {type === 'book' ? `${(it as Book).pageCount ?? 0}p` : `${(it as Movie).runtime ?? 0}min`}
                        </Text>
                      </HStack>
                      {getStatusBadge(it.status)}
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
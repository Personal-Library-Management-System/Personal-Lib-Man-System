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

interface ListItem {
  id: number;
  title: string;
  imageUrl: string;
  description: string;
  rating: number;
  status: string;
  // Kitap için
  author?: string;
  pageCount?: number;
  publishedDate?: string;
  // Film için
  director?: string;
  duration?: number;
  releaseDate?: string;
}

interface ListViewProps {
  items: ListItem[];
  isLoading: boolean;
  itemsPerPage: number;
  getStatusBadge: (status: string) => React.ReactNode;
  type: 'book' | 'movie';
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
  type
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
        : items.map(item => (
            <Card
              key={item.id}
              bg={cardBg}
              cursor="pointer"
              transition="all 0.2s ease"
              _hover={{ shadow: 'md' }}
            >
              <CardBody>
                <Flex gap={4} align="center">
                  <Image
                    src={item.imageUrl}
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
                      {type === 'book' ? item.author : item.director}
                    </Text>
                    <Text color={subtextColor} fontSize="sm" noOfLines={2} mb={2}>
                      {item.description}
                    </Text>
                    <HStack spacing={4} flexWrap="wrap">
                      <Text fontSize="sm" color={subtextColor}>
                        📅 {type === 'book' ? item.publishedDate : item.releaseDate}
                      </Text>
                      <Text fontSize="sm" color={subtextColor}>
                        {type === 'book' 
                          ? `📄 ${item.pageCount} sayfa` 
                          : `⏱️ ${item.duration} dakika`
                        }
                      </Text>
                      <HStack spacing={1}>
                        <Text fontSize="sm">⭐</Text>
                        <Text fontSize="sm" color={subtextColor}>{item.rating}</Text>
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
};

export default ListView;
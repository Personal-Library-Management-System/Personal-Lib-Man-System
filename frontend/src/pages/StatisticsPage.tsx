import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  VStack,
  HStack,
  Divider,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaBook, FaFilm, FaUserEdit, FaTheaterMasks, FaClock, FaListOl } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/layout';

interface TopListItem {
  name?: string;
  category?: string;
  count: number;
}

interface UserStatistics {
  userId: string;
  totalReadBooks: number;
  totalReadPages: number;
  totalWatchedMovies: number;
  totalWatchedMinutes: number;
  top5Authors: TopListItem[];
  top5Directors: TopListItem[];
  top5BookCategories: TopListItem[];
  top5MovieCategories: TopListItem[];
}

const StatisticsPage = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/v1/stats', {
        method: 'GET',
        credentials: 'include', // Important: include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('User not authenticated, redirecting to login...');
          navigate('/auth');
          return;
        }
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStatistics(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4} align="center" minH="400px" justify="center">
          <Spinner size="xl" color={accentColor} thickness="4px" />
          <Text>Loading statistics...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          minH="200px"
          borderRadius="lg"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Failed to Load Statistics
          </AlertTitle>
          <AlertDescription maxW="sm">{error}</AlertDescription>
        </Alert>
      </Container>
    );
  }

  if (!statistics) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          No statistics available.
        </Alert>
      </Container>
    );
  }

  return (
    <Layout activeItem="istatistikler">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={2}>
            Your Statistics
          </Heading>
          <Text color="gray.500">
            Track your reading and watching journey
          </Text>
        </Box>

        {/* Overview Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <HStack justify="space-between" mb={2}>
                  <StatLabel>Books Read</StatLabel>
                  <Icon as={FaBook} color="green.500" boxSize={6} />
                </HStack>
                <StatNumber fontSize="3xl">{statistics.totalReadBooks}</StatNumber>
                <StatHelpText>Total books in library</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <HStack justify="space-between" mb={2}>
                  <StatLabel>Pages Read</StatLabel>
                  <Icon as={FaListOl} color="blue.500" boxSize={6} />
                </HStack>
                <StatNumber fontSize="3xl">
                  {statistics.totalReadPages.toLocaleString()}
                </StatNumber>
                <StatHelpText>Total pages consumed</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <HStack justify="space-between" mb={2}>
                  <StatLabel>Movies Watched</StatLabel>
                  <Icon as={FaFilm} color="purple.500" boxSize={6} />
                </HStack>
                <StatNumber fontSize="3xl">{statistics.totalWatchedMovies}</StatNumber>
                <StatHelpText>Total movies in library</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <HStack justify="space-between" mb={2}>
                  <StatLabel>Watch Time</StatLabel>
                  <Icon as={FaClock} color="orange.500" boxSize={6} />
                </HStack>
                <StatNumber fontSize="3xl">
                  {formatTime(statistics.totalWatchedMinutes)}
                </StatNumber>
                <StatHelpText>Total runtime</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Top Lists Grid */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Top Authors */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack mb={4}>
                <Icon as={FaUserEdit} color="green.500" boxSize={5} />
                <Heading size="md">Top Authors</Heading>
              </HStack>
              <Divider mb={4} />
              <VStack align="stretch" spacing={3}>
                {statistics.top5Authors.length > 0 ? (
                  statistics.top5Authors.map((author, index) => (
                    <HStack key={index} justify="space-between">
                      <HStack>
                        <Badge colorScheme="green" variant="subtle">
                          #{index + 1}
                        </Badge>
                        <Text fontWeight="medium">{author.name || 'Unknown'}</Text>
                      </HStack>
                      <Badge colorScheme="green">{author.count} books</Badge>
                    </HStack>
                  ))
                ) : (
                  <Text color="gray.500" textAlign="center" py={4}>
                    No authors data yet
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Top Directors */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack mb={4}>
                <Icon as={FaTheaterMasks} color="purple.500" boxSize={5} />
                <Heading size="md">Top Directors</Heading>
              </HStack>
              <Divider mb={4} />
              <VStack align="stretch" spacing={3}>
                {statistics.top5Directors.length > 0 ? (
                  statistics.top5Directors.map((director, index) => (
                    <HStack key={index} justify="space-between">
                      <HStack>
                        <Badge colorScheme="purple" variant="subtle">
                          #{index + 1}
                        </Badge>
                        <Text fontWeight="medium">{director.name || 'Unknown'}</Text>
                      </HStack>
                      <Badge colorScheme="purple">{director.count} movies</Badge>
                    </HStack>
                  ))
                ) : (
                  <Text color="gray.500" textAlign="center" py={4}>
                    No directors data yet
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Top Book Categories */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack mb={4}>
                <Icon as={FaBook} color="blue.500" boxSize={5} />
                <Heading size="md">Top Book Categories</Heading>
              </HStack>
              <Divider mb={4} />
              <VStack align="stretch" spacing={3}>
                {statistics.top5BookCategories.length > 0 ? (
                  statistics.top5BookCategories.map((category, index) => (
                    <HStack key={index} justify="space-between">
                      <HStack>
                        <Badge colorScheme="blue" variant="subtle">
                          #{index + 1}
                        </Badge>
                        <Text fontWeight="medium">{category.category || 'Unknown'}</Text>
                      </HStack>
                      <Badge colorScheme="blue">{category.count} books</Badge>
                    </HStack>
                  ))
                ) : (
                  <Text color="gray.500" textAlign="center" py={4}>
                    No categories data yet
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Top Movie Categories */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack mb={4}>
                <Icon as={FaFilm} color="orange.500" boxSize={5} />
                <Heading size="md">Top Movie Categories</Heading>
              </HStack>
              <Divider mb={4} />
              <VStack align="stretch" spacing={3}>
                {statistics.top5MovieCategories.length > 0 ? (
                  statistics.top5MovieCategories.map((category, index) => (
                    <HStack key={index} justify="space-between">
                      <HStack>
                        <Badge colorScheme="orange" variant="subtle">
                          #{index + 1}
                        </Badge>
                        <Text fontWeight="medium">{category.category || 'Unknown'}</Text>
                      </HStack>
                      <Badge colorScheme="orange">{category.count} movies</Badge>
                    </HStack>
                  ))
                ) : (
                  <Text color="gray.500" textAlign="center" py={4}>
                    No categories data yet
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Container>
    </Layout>
  );
};

export default StatisticsPage;

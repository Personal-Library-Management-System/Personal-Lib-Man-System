import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Avatar,
  Card,
  CardBody,
  Divider,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaEnvelope, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/layout';
import type { User } from '../types';

const MyAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const valueColor = useColorModeValue('gray.800', 'gray.100');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the backend API to get user info
      const response = await fetch('http://localhost:5000/api/v1/auth/me', {
        method: 'GET',
        credentials: 'include', // Important: include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If unauthorized, redirect to auth page
        if (response.status === 401) {
          console.log('User not authenticated, redirecting to login...');
          navigate('/auth');
          return;
        }
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Layout activeItem="hesabim">
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Page Header */}
          <Box>
            <Heading size="lg" mb={2}>
              My Account
            </Heading>
            <Text color={labelColor}>
              View your account information and profile details
            </Text>
          </Box>

          {/* Loading State */}
          {loading && (
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <VStack spacing={4} py={8}>
                  <Spinner size="xl" color="blue.500" thickness="4px" />
                  <Text color={labelColor}>Loading your profile...</Text>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          )}

          {/* User Profile */}
          {!loading && !error && user && (
            <>
              {/* Profile Card */}
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    {/* Avatar and Basic Info */}
                    <HStack spacing={6} align="start">
                      <Avatar
                        size="2xl"
                        name={user.name}
                        src={user.picture || undefined}
                        border="4px solid"
                        borderColor="blue.500"
                      />
                      <VStack align="start" spacing={2} flex={1}>
                        <Heading size="md" color={valueColor}>
                          {user.name}
                        </Heading>
                        <HStack>
                          <FaEnvelope color="#3182CE" />
                          <Text color={labelColor} fontSize="sm">
                            {user.email}
                          </Text>
                        </HStack>
                        <Badge colorScheme="green" fontSize="sm" px={2} py={1}>
                          <HStack spacing={1}>
                            <FaCheckCircle />
                            <Text>Verified with Google</Text>
                          </HStack>
                        </Badge>
                      </VStack>
                    </HStack>

                    <Divider />

                    {/* Account Details */}
                    <VStack spacing={4} align="stretch">
                      <Heading size="sm" color={valueColor}>
                        Account Details
                      </Heading>

                      {/* User ID */}
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color={labelColor}
                          mb={1}
                        >
                          User ID
                        </Text>
                        <Text color={valueColor} fontFamily="mono" fontSize="sm">
                          {user.id}
                        </Text>
                      </Box>

                      {/* Google ID */}
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color={labelColor}
                          mb={1}
                        >
                          Google ID
                        </Text>
                        <Text color={valueColor} fontFamily="mono" fontSize="sm">
                          {user.googleId}
                        </Text>
                      </Box>

                      {/* Account Created */}
                      {user.createdAt && (
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={labelColor}
                            mb={1}
                          >
                            <HStack spacing={2}>
                              <FaCalendarAlt />
                              <Text>Account Created</Text>
                            </HStack>
                          </Text>
                          <Text color={valueColor}>
                            {formatDate(user.createdAt)}
                          </Text>
                        </Box>
                      )}

                      {/* Last Updated */}
                      {user.updatedAt && (
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={labelColor}
                            mb={1}
                          >
                            Last Updated
                          </Text>
                          <Text color={valueColor}>
                            {formatDate(user.updatedAt)}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Authentication Info Card */}
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="sm" color={valueColor}>
                      Authentication
                    </Heading>
                    <Text color={labelColor} fontSize="sm">
                      Your account is securely authenticated using Google OAuth 2.0.
                      This ensures your login credentials are protected and managed
                      by Google's secure infrastructure.
                    </Text>
                    <HStack spacing={2}>
                      <Badge colorScheme="blue">OAuth 2.0</Badge>
                      <Badge colorScheme="green">Google Authenticated</Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </>
          )}
        </VStack>
      </Container>
    </Layout>
  );
};

export default MyAccountPage;

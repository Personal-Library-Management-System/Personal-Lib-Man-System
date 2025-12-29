import React, { useState, useEffect, useRef } from 'react';
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
  Button,
  Icon,
  useToast,
  Input,
  Progress,
} from '@chakra-ui/react';
import { FaEnvelope, FaCalendarAlt, FaCheckCircle, FaDownload, FaUpload, FaFileExport } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/ui/layout';
import type { User } from '../types';
import * as libraryApi from '../services/library.service';

const MyAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Import/Export states
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<string | null>(null);

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

      const BACKEND_AUTH_URL = import.meta.env.VITE_BACKEND_URL + '/auth';
      const response = await fetch(`${BACKEND_AUTH_URL}/me`, {
        method: 'GET',
        credentials: 'include',
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

  // Export library handler
  const handleExport = async () => {
    try {
      setIsExporting(true);
      await libraryApi.downloadLibraryAsJson();
      toast({
        title: 'Export Successful',
        description: 'Your library data has been downloaded as a JSON file.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Export error:', err);
      toast({
        title: 'Export Failed',
        description: err instanceof Error ? err.message : 'Failed to export library data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Trigger file input click
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection for import
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportProgress('Reading file...');

      // Parse the file
      const importData = await libraryApi.parseImportFile(file);
      
      setImportProgress(`Importing ${importData.mediaItems.length} items and ${importData.lists.length} lists...`);

      // Send to backend
      await libraryApi.importLibrary(importData);

      toast({
        title: 'Import Successful',
        description: `Successfully imported ${importData.mediaItems.length} media items and ${importData.lists.length} lists.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Import error:', err);
      toast({
        title: 'Import Failed',
        description: err instanceof Error ? err.message : 'Failed to import library data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsImporting(false);
      setImportProgress(null);
    }
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

              {/* Data Import/Export Card */}
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                  <VStack spacing={5} align="stretch">
                    <HStack spacing={3}>
                      <Icon as={FaFileExport} boxSize={5} color="blue.500" />
                      <Heading size="sm" color={valueColor}>
                        Data Import / Export
                      </Heading>
                    </HStack>
                    
                    <Text color={labelColor} fontSize="sm">
                      Export your library data to a JSON file for backup or transfer to another account.
                      Import data from a previously exported file to restore or merge your library.
                    </Text>

                    {/* Hidden file input for import */}
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      display="none"
                    />

                    {/* Import Progress */}
                    {isImporting && importProgress && (
                      <Box>
                        <Text fontSize="sm" color={labelColor} mb={2}>
                          {importProgress}
                        </Text>
                        <Progress size="sm" isIndeterminate colorScheme="blue" borderRadius="md" />
                      </Box>
                    )}

                    <HStack spacing={4} flexWrap="wrap">
                      {/* Export Button */}
                      <Button
                        leftIcon={<Icon as={FaDownload} />}
                        colorScheme="blue"
                        variant="solid"
                        onClick={handleExport}
                        isLoading={isExporting}
                        loadingText="Exporting..."
                        size="md"
                      >
                        Export Library
                      </Button>

                      {/* Import Button */}
                      <Button
                        leftIcon={<Icon as={FaUpload} />}
                        colorScheme="green"
                        variant="outline"
                        onClick={handleImportClick}
                        isLoading={isImporting}
                        loadingText="Importing..."
                        size="md"
                      >
                        Import Library
                      </Button>
                    </HStack>

                    <Alert status="info" borderRadius="md" fontSize="sm">
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="medium">Note:</Text>
                        <Text>
                          Importing will merge data with your existing library. Items with the same title will be updated.
                        </Text>
                      </Box>
                    </Alert>
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

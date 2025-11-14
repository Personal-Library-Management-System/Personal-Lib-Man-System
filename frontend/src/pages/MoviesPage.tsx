// src/pages/MoviesPage.tsx
import React from 'react';
import Layout from '../components/ui/layout';
import { Box, Heading, Text } from '@chakra-ui/react';

const MoviesPage = () => {
  return (
    <Layout activeItem="filmarsivi">
      <Box>
        <Heading size="xl" mb={4} color="blue.600">
          🎬 Film Arşivim
        </Heading>
        <Text color="gray.600">
          Film koleksiyonunuz burada görünecek...
        </Text>
      </Box>
    </Layout>
  );
};

export default MoviesPage;
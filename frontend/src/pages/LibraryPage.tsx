import React from 'react';
import Layout from '../components/ui/layout';
import { 
  Box, 
  Heading, 
  Text,
  useColorModeValue 
} from '@chakra-ui/react';

const LibraryPage = () => {
  return (
    <Layout activeItem="kitaplik">
      <Box>
        <Heading 
          size="xl" 
          mb={4} 
          color={useColorModeValue('blue.600', 'blue.300')}
        >
          📚 Kitaplığım
        </Heading>
        <Text color={useColorModeValue('gray.600', 'gray.300')}>
          Kitap koleksiyonunuz burada görünecek...
        </Text>
      </Box>
    </Layout>
  );
};

export default LibraryPage;
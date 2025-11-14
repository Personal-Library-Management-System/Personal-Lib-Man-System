import React from 'react';
import Layout from '../components/ui/layout';
import { 
  Box, 
  Heading, 
  Text, 
  SimpleGrid,
  useColorModeValue,
  Icon
} from '@chakra-ui/react';
import { FaBook, FaList, FaChartBar } from 'react-icons/fa';

const MainPage = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Layout activeItem="anasayfa">
      <Box textAlign="center">
        <Heading 
          size="xl" 
          mb={4} 
          color={useColorModeValue('blue.600', 'blue.300')}
        >
          Hoş Geldiniz! 📚
        </Heading>
        
        <Text fontSize="lg" color={subtitleColor} mb={8}>
          Kütüphanenizi yönetmeye başlayabilirsiniz.
        </Text>

        {/* Feature Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {/* Kitaplarım Card */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            shadow="md"
            border="1px"
            borderColor={cardBorder}
            _hover={{
              transform: 'translateY(-4px)',
              shadow: 'xl',
              borderColor: 'blue.300'
            }}
            transition="all 0.3s"
            cursor="pointer"
          >
            <Box
              w={16}
              h={16}
              bg="blue.500"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={4}
            >
              <Icon as={FaBook} color="white" boxSize={7} />
            </Box>
            <Heading size="md" mb={3} color={textColor}>
              Kitaplarım
            </Heading>
            <Text fontSize="sm" color={subtitleColor}>
              Kişisel kitap koleksiyonunuzu yönetin
            </Text>
          </Box>

          {/* Okuma Listesi Card */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            shadow="md"
            border="1px"
            borderColor={cardBorder}
            _hover={{
              transform: 'translateY(-4px)',
              shadow: 'xl',
              borderColor: 'purple.300'
            }}
            transition="all 0.3s"
            cursor="pointer"
          >
            <Box
              w={16}
              h={16}
              bg="purple.500"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={4}
            >
              <Icon as={FaList} color="white" boxSize={7} />
            </Box>
            <Heading size="md" mb={3} color={textColor}>
              Okuma Listesi
            </Heading>
            <Text fontSize="sm" color={subtitleColor}>
              Okumak istediğiniz kitapları planlayın
            </Text>
          </Box>

          {/* İstatistikler Card */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            shadow="md"
            border="1px"
            borderColor={cardBorder}
            _hover={{
              transform: 'translateY(-4px)',
              shadow: 'xl',
              borderColor: 'green.300'
            }}
            transition="all 0.3s"
            cursor="pointer"
          >
            <Box
              w={16}
              h={16}
              bg="green.500"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={4}
            >
              <Icon as={FaChartBar} color="white" boxSize={7} />
            </Box>
            <Heading size="md" mb={3} color={textColor}>
              İstatistikler
            </Heading>
            <Text fontSize="sm" color={subtitleColor}>
              Okuma alışkanlıklarınızı takip edin
            </Text>
          </Box>
        </SimpleGrid>

        {/* Alt Bilgi */}
        <Box
          mt={8}
          p={4}
          bg={useColorModeValue('blue.50', 'blue.900')}
          borderRadius="md"
          border="1px"
          borderColor={useColorModeValue('blue.200', 'blue.600')}
        >
          <Text 
            fontSize="xs" 
            color={useColorModeValue('blue.600', 'blue.200')}
          >
            🚀 Bu özellikler yakında aktif olacak. PLMS v1.0.0 - Demo Sürüm
          </Text>
        </Box>
      </Box>
    </Layout>
  );
};

export default MainPage;
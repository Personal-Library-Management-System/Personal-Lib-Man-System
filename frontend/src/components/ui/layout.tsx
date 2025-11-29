import React from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  VStack,
  IconButton,
  Text,
  Avatar,
  HStack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FaBars,
  FaHome,
  FaBook,
  FaFilm,
  FaChartBar,
  FaUser,
  FaSignOutAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  activeItem?: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeItem = '' }) => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');

  const handleSignOut = () => {
    navigate('/auth');
    onClose();
  };

  const sidebarItems: SidebarItem[] = [
    { id: 'anasayfa', label: 'Anasayfa', icon: FaHome, path: '/main' },
    { id: 'kitaplik', label: 'Kitaplık', icon: FaBook, path: '/library' },
    { id: 'filmarsivi', label: 'Film Arşivi', icon: FaFilm, path: '/movies' },
    { id: 'istatistikler', label: 'İstatistikler', icon: FaChartBar, path: '/stats' },
    { id: 'hesabim', label: 'Hesabım', icon: FaUser, path: '/account' }
  ];

  const handleSidebarClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const SidebarContent = () => (
    <VStack spacing={1} align="stretch" px={4} py={6}>
      {sidebarItems.map((item) => {
        const isActive = activeItem === item.id;
        const IconComponent = item.icon;
        
        return (
          <Button
            key={item.id}
            variant="ghost"
            justifyContent="flex-start"
            leftIcon={<IconComponent />}
            px={4}
            py={6}
            h="auto"
            fontWeight={isActive ? 'bold' : 'normal'}
            bg={isActive ? 'blue.100' : 'transparent'}
            color={isActive ? 'blue.600' : textColor}
            borderLeft="4px solid"
            borderLeftColor={isActive ? 'blue.500' : 'transparent'}
            borderRadius="md"
            _hover={{
              bg: hoverBg,
              color: 'blue.600',
              transform: 'translateX(2px)'
            }}
            _active={{
              transform: 'translateX(1px)'
            }}
            transition="all 0.2s"
            onClick={() => handleSidebarClick(item.path)}
          >
            <Text fontSize="md">{item.label}</Text>
          </Button>
        );
      })}
    </VStack>
  );

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Header */}
      <Box
        as="header"
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        px={4}
        py={3}
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        shadow="sm"
      >
        <Flex align="center" justify="space-between">
          <HStack spacing={4}>
            <IconButton
              icon={<FaBars />}
              variant="outline"
              size="md"
              onClick={onOpen}
              display={{ base: 'flex', lg: 'none' }}
              aria-label="Open menu"
            />
            
            <Heading 
              size={{ base: 'sm', md: 'md' }} 
              color={useColorModeValue('blue.600', 'blue.300')}
              fontWeight="bold"
            >
              📚 PLMS
            </Heading>
            
            <Text 
              fontSize={{ base: 'xs', md: 'sm' }}
              color={useColorModeValue('gray.600', 'gray.400')}
              display={{ base: 'none', sm: 'block' }}
            >
              Kişisel Kütüphane Yönetim Sistemi
            </Text>
          </HStack>
          
          <HStack spacing={3}>
            <Avatar size="sm" bg="blue.500" />
            
            <Button
              variant="outline"
              colorScheme="red"
              size="sm"
              leftIcon={<FaSignOutAlt />}
              onClick={handleSignOut}
              _hover={{
                bg: 'red.50',
                transform: 'translateY(-1px)'
              }}
              transition="all 0.2s"
            >
              <Text display={{ base: 'none', md: 'block' }}>Çıkış Yap</Text>
            </Button>
          </HStack>
        </Flex>
      </Box>

      <Flex pt="60px">
        {/* Desktop Sidebar */}
        <Box
          as="nav"
          w="200px"
          bg={bgColor}
          borderRight="1px"
          borderColor={borderColor}
          minH="calc(100vh - 60px)"
          position="fixed"
          left={0}
          top="60px"
          display={{ base: 'none', lg: 'block' }}
          shadow="sm"
          overflowY="auto"
        >
          <Box py={4}>
            <Text
              px={6}
              py={2}
              fontSize="xs"
              fontWeight="bold"
              color={useColorModeValue('gray.500', 'gray.400')}
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Menü
            </Text>
            <SidebarContent />
          </Box>
        </Box>

        {/* Mobile Drawer */}
        <Drawer
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          size="xs"
        >
          <DrawerOverlay />
          <DrawerContent maxW="200px">
            <DrawerHeader borderBottomWidth="1px">
              <Flex justify="space-between" align="center">
                <Text fontSize="lg" fontWeight="bold" color="blue.600">
                  📚 PLMS
                </Text>
              </Flex>
              <DrawerCloseButton />
            </DrawerHeader>
            <DrawerBody p={0}>
              <SidebarContent />
              
              <Box px={4} py={6} borderTop="1px" borderColor={borderColor} mt={4}>
                <Button
                  variant="outline"
                  colorScheme="red"
                  size="sm"
                  leftIcon={<FaSignOutAlt />}
                  onClick={handleSignOut}
                  w="full"
                >
                  Çıkış Yap
                </Button>
              </Box>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Main Content */}
        <Box
          as="main"
          flex={1}
          ml={{ base: 0, lg: "200px" }}
          p={6}
          minH="calc(100vh - 60px)"
        >
          <Box
            bg={bgColor}
            shadow="sm"
            borderRadius="lg"
            p={6}
            border="1px"
            borderColor={borderColor}
          >
            {children}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;
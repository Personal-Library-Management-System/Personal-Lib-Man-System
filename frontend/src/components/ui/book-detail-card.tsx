import React from 'react';
import {
  Box,
  Flex,
  Image,
  Heading,
  Text,
  Button,
  Icon,
  HStack,
  Stack,
  Divider,
  Select,
  FormControl,
  FormLabel,
  useColorModeValue,
} from '@chakra-ui/react';
import { type IconType } from 'react-icons';
import { FiClock } from 'react-icons/fi';

export interface InfoBlock {
  label: string;
  value: string;
  icon: IconType;
}

export interface StatusOption {
  label: string;
  value: string;
}

export interface BookDetailCardProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  description: string;
  infoBlocks: InfoBlock[];
  addedDate?: string;
  status: string;
  statusOptions: StatusOption[];
  onEdit?: () => void;
  onRemove?: () => void;
  onStatusChange?: (value: string) => void;
}

const BookDetailCard: React.FC<BookDetailCardProps> = ({
  imageUrl,
  title,
  subtitle,
  description,
  infoBlocks,
  addedDate,
  status,
  statusOptions,
  onEdit,
  onRemove,
  onStatusChange,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const blockBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const bodyBg = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const selectBg = useColorModeValue('gray.100', 'gray.800');

  return (
    <Box
      w="full"
      borderWidth="1px"
      borderRadius="2xl"
      borderColor={borderColor}
      bg={bodyBg}
      shadow="xl"
      p={{ base: 4, md: 6 }}
    >
      <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 4, md: 6 }}>
        <Box flex="0 0 260px" alignSelf="center">
          <Box
            borderRadius="xl"
            border="6px solid"
            borderColor={borderColor}
            overflow="hidden"
            bg="black"
            boxShadow="xl"
          >
            <Image
              src={imageUrl}
              alt={title}
              objectFit="cover"
              w="full"
              h="min(420px, 70vh)"
            />
          </Box>
        </Box>

        <Flex direction="column" flex="1" gap={4}>
          <Stack spacing={1}>
            <Heading size="lg">{title}</Heading>
            {subtitle && (
              <Text fontSize="md" color="gray.500">
                {subtitle}
              </Text>
            )}
          </Stack>

          <HStack wrap="wrap" spacing={3}>
            {infoBlocks.map((block) => (
              <Box
                key={block.label}
                minW="150px"
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                bg={blockBg}
                px={3}
                py={2}
              >
                <HStack spacing={2} mb={1}>
                  <Icon as={block.icon} boxSize={4} color="teal.400" />
                  <Text fontSize="xs" letterSpacing="wider" textTransform="uppercase" color="gray.500">
                    {block.label}
                  </Text>
                </HStack>
                <Text fontWeight="bold" fontSize="md" color={textColor}>
                  {block.value}
                </Text>
              </Box>
            ))}
          </HStack>

          <Text color={textColor} lineHeight="tall">
            {description}
          </Text>

          <Flex align="center" gap={2} color="gray.500">
            <Icon as={FiClock} boxSize={4} />
            <Text fontSize="sm">
              Eklenme Tarihi: {addedDate ?? 'Bilinmiyor'}
            </Text>
          </Flex>
        </Flex>
      </Flex>

      <Divider my={6} borderColor={borderColor} />

      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'stretch', md: 'center' }}
        justify="space-between"
        gap={4}
      >
        <HStack spacing={3}>
          <Button colorScheme="blue" onClick={onEdit}>
            Düzenle
          </Button>
          <Button colorScheme="red" variant="outline" onClick={onRemove}>
            Kaldır
          </Button>
        </HStack>

        <FormControl maxW="220px">
          <FormLabel fontSize="sm" color="gray.500" mb={1}>
            Durum Değiştir
          </FormLabel>
          <Select
            value={status}
            onChange={(event) => onStatusChange?.(event.target.value)}
            bg={selectBg}
            borderRadius="lg"
            borderColor={borderColor}
            _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px #38B2AC' }}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormControl>
      </Flex>
    </Box>
  );
};

export default BookDetailCard;

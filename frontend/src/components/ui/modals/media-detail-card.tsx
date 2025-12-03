import React from 'react';
import {
  Box,
  Flex,
  Image,
  Heading,
  Text,
  Button,
  Icon,
  IconButton,
  HStack,
  Stack,
  Divider,
  Select,
  FormControl,
  FormLabel,
  useColorModeValue,
  Grid,
  GridItem,
  Tooltip,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi'; // Yeni ikonlar için eklemeler
import { type IconType } from 'react-icons';
import TagSelector from '../tag-selector';

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
  onAddTag?: () => void;
  onAddToList?: () => void;
  tagSelector?: React.ReactNode;
  assignedTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  // yeni: callback to create a new tag
  onCreateTag?: (tagName: string) => void;
}

const MediaDetailCard: React.FC<BookDetailCardProps> = ({
  imageUrl,
  title,
  subtitle,
  description,
  infoBlocks,
  status,
  statusOptions,
  onEdit,
  onRemove,
  onStatusChange,
  onAddTag,
  onAddToList,
  tagSelector,
  assignedTags = [],
  onTagsChange,
  onCreateTag,
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

          {/* 2x2 Tablo Görünümü */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            {infoBlocks.map((block) => (
              <GridItem
                key={block.label}
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
              </GridItem>
            ))}
          </Grid>

          <Box>
            <Text color={textColor} lineHeight="tall">
              {description}
            </Text>
          </Box>
        </Flex>
      </Flex>

      <Divider my={6} borderColor={borderColor} />

      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'stretch', md: 'center' }}
        justify="space-between"
        gap={4}
      >
        {/* Aksiyon Butonları */}
        <HStack spacing={3}>
          {/* Mevcut Aksiyonlar */}
          <Button colorScheme="blue" onClick={onEdit}>
            Düzenle
          </Button>
          <Button colorScheme="red" variant="outline" onClick={onRemove}>
            Kaldır
          </Button>

          {/* Ayrım için Divider */}
          <Divider orientation="vertical" h="24px" borderColor={borderColor} />

          {/* Yeni Aksiyonlar */}
          <TagSelector 
            assignedTags={assignedTags}
            onChange={onTagsChange || (() => {})}
            trigger={tagSelector}
            onCreateTag={onCreateTag}
          />

          <Tooltip label="Listeye Ekle" aria-label="Listeye Ekle">
            <IconButton
              aria-label="Listeye Ekle"
              icon={<FiPlus />}
              colorScheme="teal"
              variant="outline"
              onClick={onAddToList}
            />
          </Tooltip>
        </HStack>

        {/* Durum Değiştir */}
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

export default MediaDetailCard;

import React from 'react';
import {
  Box,
  Flex,
  Image,
  Heading,
  Text,
  Stack,
  useColorModeValue,
  Grid,
  GridItem,
  HStack,
  Icon,
  Divider,
  Button,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import { type IconType } from 'react-icons';
import TagSelector from '../tag-selector';
import ListSelector from '../list-selector';
import PersonalNote from '../personal-note';

export interface InfoBlock {
  label: string;
  value: React.ReactNode; // allow JSX/Element
  icon: IconType;
  hideLabel?: boolean;     // if true, don't render the small label/header
  fullWidth?: boolean;     // if true, span both columns
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
  currentPage?: number
  pageCount?: number
  onRemove?: () => void;
  onStatusChange?: (value: string) => void;
  tagSelector?: React.ReactNode;
  assignedTags?: string[];
  // callback when tags change (used by TagSelector)
  onTagsChange?: (tags: string[]) => void;
  // List management
  assignedLists?: string[];
  onListsChange?: (lists: string[]) => void;
  // Personal note
  personalNote?: string;
  onPersonalNoteChange?: (note: string) => void;
  // Item type for filtering lists
  itemType?: 'book' | 'movie';
  // Media item ID for API calls
  mediaItemId?: string;
}

const MediaDetailCard: React.FC<BookDetailCardProps> = ({
  imageUrl,
  title,
  subtitle,
  description,
  infoBlocks,
  status,
  statusOptions,
  onRemove,
  onStatusChange,
  tagSelector,
  assignedTags = [],
  onTagsChange,
  assignedLists = [],
  onListsChange,
  personalNote = '',
  onPersonalNoteChange,
  itemType,
  mediaItemId,
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
        <Box 
          flex={{ base: '0 0 auto', md: '0 0 220px' }} // Reduced from 260px
          alignSelf={{ base: 'center', md: 'flex-start' }}
          maxW={{ base: '180px', md: '220px' }}
        >
          <Box
            borderRadius="xl"
            border="4px solid" // Reduced from 6px
            borderColor={borderColor}
            overflow="hidden"
            bg="black"
            boxShadow="lg" // Reduced from xl
            aspectRatio="2/3" // NEW: Maintain aspect ratio
          >
            <Image
              src={imageUrl}
              alt={title}
              objectFit="cover"
              w="full"
              h="full"
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
                key={block.label + (block.fullWidth ? '-full' : '')}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                bg={blockBg}
                px={3}
                py={2}
                // if fullWidth, span both columns on md+
                gridColumn={block.fullWidth ? { base: '1 / -1', md: '1 / -1' } : undefined}
              >
                {!block.hideLabel && (
                  <HStack spacing={2} mb={1}>
                    <Icon as={block.icon} boxSize={4} color="teal.400" />
                    <Text fontSize="xs" letterSpacing="wider" textTransform="uppercase" color="gray.500">
                      {block.label}
                    </Text>
                  </HStack>
                )}

                {typeof block.value === 'string' ? (
                  <Text fontWeight="bold" fontSize="md" color={textColor}>
                    {block.value}
                  </Text>
                ) : (
                  <Box>
                    {block.value}
                  </Box>
                )}
              </GridItem>
            ))}
          </Grid>

          <Box>
            <Text color={textColor} lineHeight="tall">
              {description}
            </Text>
          </Box>

          {/* Personal Note */}
          <PersonalNote
            note={personalNote}
            onChange={onPersonalNoteChange || (() => {})}
          />
        </Flex>
      </Flex>

      <Divider my={6} />

      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'stretch', md: 'center' }}
        justify="space-between"
        gap={4}
      >
        {/* Action Buttons */}
        <HStack spacing={3}>
          <Button colorScheme="red" variant="outline" onClick={onRemove}>
            Remove
          </Button>

          <Divider orientation="vertical" h="24px" borderColor={borderColor} />

          <TagSelector
            assignedTags={assignedTags}
            onChange={onTagsChange || (() => {})}
            trigger={tagSelector}
            mediaItemId={mediaItemId}
          />

          <ListSelector
            assignedLists={assignedLists}
            onChange={onListsChange || (() => {})}
            itemType={itemType}
            mediaItemId={mediaItemId}
          />
        </HStack>

        {/* Change Status */}
        <FormControl maxW="220px">
          <FormLabel fontSize="sm" color="gray.500" mb={1}>
            Change Status
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

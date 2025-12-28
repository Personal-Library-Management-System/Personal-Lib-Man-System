import React, { useMemo, useEffect, useState } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Wrap,
  Tag,
  TagLabel,
  IconButton,
  Icon,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { FaList, FaHeart, FaCalendarAlt, FaStar, FaRocket, FaBook, FaUsers } from 'react-icons/fa';
import { getAllMediaLists, type MediaListResponse } from '../../services/mediaList.service';

export interface ListItem {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  mediaType?: 'book' | 'movie';
  items: { type: 'book' | 'movie'; id: string }[];
  createdAt?: string;
}

interface ListSelectorProps {
  allLists?: ListItem[];
  assignedLists: string[]; // Array of list IDs
  onChange: (updated: string[]) => void;
  buttonLabel?: string;
  trigger?: React.ReactNode;
  itemType?: 'book' | 'movie'; // Filter lists by media type
}

const localeCompare = (a: string, b: string) => a.localeCompare(b, 'tr');

const getListIcon = (iconName?: string) => {
  switch (iconName) {
    case 'heart': return FaHeart;
    case 'calendar': return FaCalendarAlt;
    case 'star': return FaStar;
    case 'rocket': return FaRocket;
    case 'book': return FaBook;
    case 'users': return FaUsers;
    default: return FaList;
  }
};

const getListColor = (color?: string): string => {
  switch (color) {
    case 'red': return 'red';
    case 'blue': return 'blue';
    case 'purple': return 'purple';
    case 'teal': return 'teal';
    case 'green': return 'green';
    case 'orange': return 'orange';
    default: return 'gray';
  }
};

const ListSelector: React.FC<ListSelectorProps> = ({
  allLists,
  assignedLists,
  onChange,
  buttonLabel = 'Add to List',
  trigger,
  itemType,
}) => {
  const [fetchedLists, setFetchedLists] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if no lists provided via props
    if (!allLists) {
      const fetchLists = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const lists = await getAllMediaLists();
          // Transform API response to ListItem format and filter by itemType
          const transformedLists: ListItem[] = lists
            .filter((list) => !itemType || list.mediaType === (itemType === 'book' ? 'Book' : 'Movie'))
            .map((list: MediaListResponse) => ({
              id: list._id,
              name: list.title,
              color: list.color,
              mediaType: list.mediaType.toLowerCase() as 'book' | 'movie',
              items: list.items.map((itemId) => ({ type: list.mediaType.toLowerCase() as 'book' | 'movie', id: itemId })),
            }));
          setFetchedLists(transformedLists);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch lists');
        } finally {
          setIsLoading(false);
        }
      };
      fetchLists();
    }
  }, [allLists, itemType]);

  // Source list: alphabetically sorted by name, filtered by itemType if provided
  const sourceLists = useMemo(() => {
    const list = allLists ?? fetchedLists;
    const filtered = itemType 
      ? list.filter(l => l.mediaType === itemType)
      : list;
    return [...filtered].sort((a, b) => localeCompare(a.name, b.name));
  }, [allLists, fetchedLists, itemType]);

  // Fast lookup for assigned lists
  const assignedSet = useMemo(() => new Set(assignedLists ?? []), [assignedLists]);

  const toggle = (listId: string) => {
    const isAssigned = assignedSet.has(listId);
    let updated: string[];
    if (isAssigned) {
      updated = assignedLists.filter((id) => id !== listId);
    } else {
      updated = [...assignedLists, listId];
    }
    onChange(updated);
  };

  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        {trigger ? (
          trigger
        ) : (
          <IconButton
            aria-label={buttonLabel}
            icon={<Icon as={FiPlus} />}
            size="md"
            variant="outline"
            colorScheme="teal"
          />
        )}
      </PopoverTrigger>
      <PopoverContent width="320px" _focus={{ boxShadow: 'md' }}>
        <PopoverBody>
          {isLoading ? (
            <Spinner size="sm" color="teal.500" />
          ) : error ? (
            <Text fontSize="sm" color="red.500">{error}</Text>
          ) : sourceLists.length === 0 ? (
            <Text fontSize="sm" color="gray.500">No lists available</Text>
          ) : (
            <Wrap spacing={2}>
              {sourceLists.map((list) => {
                const active = assignedSet.has(list.id);
                const IconComponent = getListIcon(list.icon);
                const colorScheme = getListColor(list.color);
                
                return (
                  <Tag
                    key={list.id}
                    size="md"
                    variant={active ? 'solid' : 'subtle'}
                    colorScheme={active ? colorScheme : 'gray'}
                    opacity={active ? 1 : 0.45}
                    cursor="pointer"
                    onClick={() => toggle(list.id)}
                    _hover={{ opacity: active ? 0.9 : 0.7 }}
                  >
                    <Icon as={IconComponent} mr={1} boxSize={3} />
                    <TagLabel>{list.name}</TagLabel>
                  </Tag>
                );
              })}
            </Wrap>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ListSelector;

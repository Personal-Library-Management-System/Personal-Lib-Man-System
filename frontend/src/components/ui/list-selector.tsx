import React, { useMemo, useState } from 'react';
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
  Input,
  HStack,
  Button,
  Box,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { FaList, FaHeart, FaCalendarAlt, FaStar, FaRocket, FaBook, FaUsers } from 'react-icons/fa';
import listDataJson from '../../mock-data/list-data.json';

export interface ListItem {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  items: { type: 'book' | 'movie'; id: string }[];
  createdAt?: string;
}

export const ALL_LISTS = listDataJson as ListItem[];

interface ListSelectorProps {
  allLists?: ListItem[];
  assignedLists: string[]; // Array of list IDs
  onChange: (updated: string[]) => void;
  buttonLabel?: string;
  trigger?: React.ReactNode;
  // callback when a new list is created (parent handles persistence)
  onCreateList?: (listName: string) => void;
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
  onCreateList,
}) => {
  const [newListName, setNewListName] = useState('');

  // Source list: alphabetically sorted by name
  const sourceLists = useMemo(() => {
    const list = allLists ? [...allLists] : [...ALL_LISTS];
    return list.sort((a, b) => localeCompare(a.name, b.name));
  }, [allLists]);

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

  const handleCreate = () => {
    const name = newListName.trim();
    if (!name) return;
    // notify parent (for now parent will console.log, later backend call)
    onCreateList?.(name);
    setNewListName('');
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

          {/* + create list area */}
          <Box mt={3} px={1}>
            <HStack spacing={2}>
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
                placeholder="+ create list"
                size="sm"
              />
              <Button size="sm" onClick={handleCreate}>
                + Add
              </Button>
            </HStack>
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ListSelector;

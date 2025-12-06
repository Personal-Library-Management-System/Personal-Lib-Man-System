import { Box, Flex, Text, Tag, TagLabel, TagCloseButton, useColorModeValue, Wrap, WrapItem, Icon } from '@chakra-ui/react';
import { FaList, FaHeart, FaCalendarAlt, FaStar, FaRocket, FaBook, FaUsers } from 'react-icons/fa';
import { type ListItem } from './types';

interface ListFilterProps {
  availableLists: ListItem[];
  selectedLists: string[];
  onChange: (listIds: string[]) => void;
}

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

const getListColor = (color?: string) => {
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

const ListFilter = ({ availableLists, selectedLists, onChange }: ListFilterProps) => {
  const bgTag = useColorModeValue('gray.100', 'gray.700');

  const toggleList = (listId: string) => {
    if (selectedLists.includes(listId)) {
      onChange(selectedLists.filter((l) => l !== listId));
    } else {
      onChange([...selectedLists, listId]);
    }
  };

  if (availableLists.length === 0) return null;

  return (
    <Box>
      <Flex align="center" gap={2} mb={2}>
        <FaList size={14} color="purple" />
        <Text fontSize="sm" fontWeight="medium" color="gray.600">
          Listeler
        </Text>
        {selectedLists.length > 0 && (
          <Tag size="sm" colorScheme="purple" borderRadius="full">
            {selectedLists.length}
          </Tag>
        )}
      </Flex>
      <Wrap spacing={2}>
        {availableLists.map((list) => {
          const isSelected = selectedLists.includes(list.id);
          const colorScheme = getListColor(list.color);
          const IconComponent = getListIcon(list.icon);
          
          return (
            <WrapItem key={list.id}>
              <Tag
                size="md"
                cursor="pointer"
                colorScheme={isSelected ? colorScheme : 'gray'}
                variant={isSelected ? 'solid' : 'subtle'}
                bg={isSelected ? undefined : bgTag}
                onClick={() => toggleList(list.id)}
                _hover={{ opacity: 0.8 }}
                transition="all 0.2s"
              >
                <Icon as={IconComponent} mr={1} boxSize={3} />
                <TagLabel>{list.name}</TagLabel>
                {isSelected && (
                  <TagCloseButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleList(list.id);
                    }}
                  />
                )}
              </Tag>
            </WrapItem>
          );
        })}
      </Wrap>
    </Box>
  );
};

export default ListFilter;

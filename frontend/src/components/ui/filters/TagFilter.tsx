import { Box, Flex, Text, Tag, TagLabel, TagCloseButton, useColorModeValue, Wrap, WrapItem } from '@chakra-ui/react';
import { FaTags } from 'react-icons/fa';

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

const TagFilter = ({ availableTags, selectedTags, onChange }: TagFilterProps) => {
  const bgTag = useColorModeValue('gray.100', 'gray.700');
  const bgTagSelected = useColorModeValue('teal.100', 'teal.800');
  const borderSelected = useColorModeValue('teal.400', 'teal.500');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  if (availableTags.length === 0) return null;

  return (
    <Box>
      <Flex align="center" gap={2} mb={2}>
        <FaTags size={14} color="teal" />
        <Text fontSize="sm" fontWeight="medium" color="gray.600">
          Etiketler
        </Text>
        {selectedTags.length > 0 && (
          <Tag size="sm" colorScheme="teal" borderRadius="full">
            {selectedTags.length}
          </Tag>
        )}
      </Flex>
      <Wrap spacing={2}>
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <WrapItem key={tag}>
              <Tag
                size="md"
                cursor="pointer"
                bg={isSelected ? bgTagSelected : bgTag}
                borderWidth="1px"
                borderColor={isSelected ? borderSelected : 'transparent'}
                onClick={() => toggleTag(tag)}
                _hover={{ opacity: 0.8 }}
                transition="all 0.2s"
              >
                <TagLabel>{tag}</TagLabel>
                {isSelected && (
                  <TagCloseButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTag(tag);
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

export default TagFilter;

import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Button,
  useColorModeValue,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FaChevronDown, FaTags } from 'react-icons/fa';

interface CategoryFilterProps {
  availableCategories: string[];
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

const CategoryFilter = ({ availableCategories, selectedCategories, onChange }: CategoryFilterProps) => {
  const menuBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');

  const handleToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter(c => c !== category));
    } else {
      onChange([...selectedCategories, category]);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <Box>
      <Menu closeOnSelect={false}>
        <MenuButton
          as={Button}
          size="sm"
          variant="outline"
          rightIcon={<FaChevronDown />}
          leftIcon={<FaTags />}
          fontWeight="normal"
          borderRadius="full"
          _hover={{ bg: hoverBg }}
        >
          Kategori {selectedCategories.length > 0 && `(${selectedCategories.length})`}
        </MenuButton>
        <MenuList bg={menuBg} borderRadius="lg" shadow="lg" maxH="250px" overflowY="auto">
          <MenuOptionGroup type="checkbox" value={selectedCategories}>
            {availableCategories.map((category) => (
              <MenuItemOption
                key={category}
                value={category}
                onClick={() => handleToggle(category)}
                _hover={{ bg: hoverBg }}
                borderRadius="md"
                mx={1}
                my={0.5}
              >
                {category}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>

      {/* Seçili kategorileri tag olarak göster */}
      {selectedCategories.length > 0 && (
        <Wrap mt={2} spacing={1}>
          {selectedCategories.map((cat) => (
            <WrapItem key={cat}>
              <Tag size="sm" colorScheme="blue" borderRadius="full" variant="subtle">
                <TagLabel>{cat}</TagLabel>
                <TagCloseButton onClick={() => handleToggle(cat)} />
              </Tag>
            </WrapItem>
          ))}
          {selectedCategories.length > 1 && (
            <WrapItem>
              <Tag
                size="sm"
                colorScheme="red"
                borderRadius="full"
                variant="outline"
                cursor="pointer"
                onClick={handleClear}
              >
                <TagLabel>Temizle</TagLabel>
              </Tag>
            </WrapItem>
          )}
        </Wrap>
      )}
    </Box>
  );
};

export default CategoryFilter;

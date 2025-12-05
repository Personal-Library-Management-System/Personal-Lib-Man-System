import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaChevronDown, FaSort } from 'react-icons/fa';
import { type FilterOption, SORT_OPTIONS_BOOK, SORT_OPTIONS_MOVIE } from './types';

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
  type: 'book' | 'movie';
}

const SortSelect = ({ value, onChange, type }: SortSelectProps) => {
  const options: FilterOption[] = type === 'movie' ? SORT_OPTIONS_MOVIE : SORT_OPTIONS_BOOK;
  const selectedOption = options.find(opt => opt.value === value) || options[0];
  
  const menuBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');
  const activeBg = useColorModeValue('blue.100', 'blue.800');

  return (
    <Box>
      <Menu>
        <MenuButton
          as={Button}
          size="sm"
          variant="outline"
          rightIcon={<FaChevronDown />}
          leftIcon={<FaSort />}
          fontWeight="normal"
          borderRadius="full"
          _hover={{ bg: hoverBg }}
        >
          Sırala: {selectedOption.label}
        </MenuButton>
        <MenuList bg={menuBg} borderRadius="lg" shadow="lg" minW="180px">
          {options.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              bg={value === option.value ? activeBg : 'transparent'}
              _hover={{ bg: hoverBg }}
              borderRadius="md"
              mx={1}
              my={0.5}
            >
              {option.label}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default SortSelect;

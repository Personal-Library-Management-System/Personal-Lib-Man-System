import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaChevronDown, FaStar } from 'react-icons/fa';
import { type FilterOption, RATING_OPTIONS, IMDB_RATING_OPTIONS } from './types';

interface RatingFilterProps {
  value: number;
  onChange: (value: number) => void;
  type: 'book' | 'movie';
}

const RatingFilter = ({ value, onChange, type }: RatingFilterProps) => {
  const options: FilterOption[] = type === 'movie' ? IMDB_RATING_OPTIONS : RATING_OPTIONS;
  const label = type === 'movie' ? 'IMDb Puanı' : 'Puan';
  
  const selectedOption = options.find(opt => opt.value === String(value)) || options[0];
  
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
          leftIcon={<FaStar color="#ECC94B" />}
          fontWeight="normal"
          borderRadius="full"
          _hover={{ bg: hoverBg }}
        >
          {label}: {selectedOption.label}
        </MenuButton>
        <MenuList bg={menuBg} borderRadius="lg" shadow="lg" minW="150px">
          {options.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => onChange(Number(option.value))}
              bg={value === Number(option.value) ? activeBg : 'transparent'}
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

export default RatingFilter;

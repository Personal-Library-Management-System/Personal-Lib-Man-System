import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaChevronDown, FaCalendarAlt } from 'react-icons/fa';
import { YEAR_PRESETS } from './types';

interface YearFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const YearFilter = ({ value, onChange }: YearFilterProps) => {
  const selectedOption = YEAR_PRESETS.find(opt => opt.value === value) || YEAR_PRESETS[0];
  
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
          leftIcon={<FaCalendarAlt />}
          fontWeight="normal"
          borderRadius="full"
          _hover={{ bg: hoverBg }}
        >
          Year: {selectedOption.label}
        </MenuButton>
        <MenuList bg={menuBg} borderRadius="lg" shadow="lg" minW="150px">
          {YEAR_PRESETS.map((option) => (
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

export default YearFilter;

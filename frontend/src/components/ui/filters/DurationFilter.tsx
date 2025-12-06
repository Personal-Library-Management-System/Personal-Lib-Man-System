import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaChevronDown, FaClock } from 'react-icons/fa';
import { DURATION_OPTIONS } from './types';

interface DurationFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const DurationFilter = ({ value, onChange }: DurationFilterProps) => {
  const selectedOption = DURATION_OPTIONS.find(opt => opt.value === value) || DURATION_OPTIONS[0];
  
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
          leftIcon={<FaClock />}
          fontWeight="normal"
          borderRadius="full"
          _hover={{ bg: hoverBg }}
        >
          Duration: {selectedOption.label}
        </MenuButton>
        <MenuList bg={menuBg} borderRadius="lg" shadow="lg" minW="170px">
          {DURATION_OPTIONS.map((option) => (
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

export default DurationFilter;

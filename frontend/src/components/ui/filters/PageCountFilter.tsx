import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaChevronDown, FaBookOpen } from 'react-icons/fa';
import { PAGE_COUNT_OPTIONS } from './types';

interface PageCountFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const PageCountFilter = ({ value, onChange }: PageCountFilterProps) => {
  const selectedOption = PAGE_COUNT_OPTIONS.find(opt => opt.value === value) || PAGE_COUNT_OPTIONS[0];
  
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
          leftIcon={<FaBookOpen />}
          fontWeight="normal"
          borderRadius="full"
          _hover={{ bg: hoverBg }}
        >
          Pages: {selectedOption.label}
        </MenuButton>
        <MenuList bg={menuBg} borderRadius="lg" shadow="lg" minW="150px">
          {PAGE_COUNT_OPTIONS.map((option) => (
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

export default PageCountFilter;

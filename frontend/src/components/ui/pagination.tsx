import React from 'react';
import {
  Flex,
  HStack,
  Button,
  IconButton
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  return (
    <Flex justify="center" align="center" mt={8} gap={2}>
      <IconButton
        icon={<ChevronLeftIcon />}
        isDisabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        variant="outline"
        size="sm"
        aria-label="Önceki sayfa"
      />
      
      <HStack spacing={1}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
          <Button
            key={pageNum}
            size="sm"
            variant={currentPage === pageNum ? 'solid' : 'outline'}
            colorScheme={currentPage === pageNum ? 'blue' : 'gray'}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </Button>
        ))}
      </HStack>

      <IconButton
        icon={<ChevronRightIcon />}
        isDisabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        variant="outline"
        size="sm"
        aria-label="Sonraki sayfa"
      />
    </Flex>
  );
};

export default Pagination;
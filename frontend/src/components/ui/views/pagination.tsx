import React from 'react';
import {
  Flex,
  HStack,
  Button,
  IconButton,
  Text
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

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5; // Number of visible pages in the middle

    if (totalPages <= maxVisiblePages + 2) {
      // Show all pages if total pages are small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show the first and last pages
      pages.push(1);

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      if (startPage > 2) {
        pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Flex justify="center" align="center" mt={8} gap={2}>
      <IconButton
        icon={<ChevronLeftIcon />}
        isDisabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        variant="outline"
        size="sm"
        aria-label="Previous page"
      />

      <HStack spacing={1}>
        {pageNumbers.map((page, index) =>
          typeof page === 'number' ? (
            <Button
              key={index}
              size="sm"
              variant={currentPage === page ? 'solid' : 'outline'}
              colorScheme={currentPage === page ? 'blue' : 'gray'}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ) : (
            <Text key={index} fontSize="sm" color="gray.500">
              {page}
            </Text>
          )
        )}
      </HStack>

      <IconButton
        icon={<ChevronRightIcon />}
        isDisabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        variant="outline"
        size="sm"
        aria-label="Next page"
      />
    </Flex>
  );
};

export default Pagination;
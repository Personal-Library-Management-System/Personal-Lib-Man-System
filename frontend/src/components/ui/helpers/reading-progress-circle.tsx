import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

interface ReadingProgressCircleProps {
  currentPage?: number;
  pageCount: number;
  title: string;
  size?: string;
  thickness?: string;
}

const ReadingProgressCircle: React.FC<ReadingProgressCircleProps> = ({
  currentPage,
  pageCount,
  title,
  size = '70px',
  thickness = '7px',
}) => {
  const initialPage = Number(currentPage ?? 0);
  const totalPages = Number(pageCount ?? 0);

  // display state (so updating via UI reflects immediately without backend)
  const [displayPage, setDisplayPage] = useState<number>(initialPage);
  // allow empty input state -> use null to represent empty field
  const [editPage, setEditPage] = useState<number | null>(initialPage);

  useEffect(() => {
    const v = Number(currentPage ?? 0);
    setDisplayPage(v);
    setEditPage(v);
  }, [currentPage]);

  const progressPercent = totalPages > 0 ? Math.min(100, Math.round((displayPage / totalPages) * 100)) : 0;
  const progressColor =
    progressPercent >= 80 ? 'green.400' : progressPercent >= 40 ? 'yellow.400' : 'orange.400';

  // Popover control for edit panel (prevents layout shift)
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // focus input when popover opens
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const commitEdit = () => {
    // if input is empty (null) treat as 0, otherwise clamp between 0 and totalPages
    const raw = editPage === null ? 0 : editPage;
    const newPage = raw > totalPages ? totalPages : raw < 0 ? 0 : raw;
    setDisplayPage(newPage);
    setEditPage(newPage);
    onClose();
    console.log(`Updated currentPage for "${title}":`, newPage);
    // backend persistence to be implemented later
  };

  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} placement="top" closeOnBlur>
      <PopoverTrigger>
        <Box
          as="button"
          display="inline-block"
          cursor="pointer"
          aria-label="Open reading progress editor"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            // toggle manually so a second click closes
            if (isOpen) onClose();
            else onOpen();
            e.stopPropagation();
          }}
        >
          <CircularProgress
            value={progressPercent}
            size={size}
            thickness={thickness}
            color={progressColor}
            capIsRound
            aria-label={`Reading progress ${progressPercent}%`}
          >
            <CircularProgressLabel fontSize="xs" fontWeight="semibold">
              {progressPercent}%
            </CircularProgressLabel>
          </CircularProgress>
        </Box>
      </PopoverTrigger>

      <PopoverContent
        w="auto"
        minW="140px"
        maxW="140px"
        p={2}
        borderRadius="md"
        _focus={{ boxShadow: 'none' }}
      >
        <PopoverArrow />
        <PopoverBody p={2}>
          <InputGroup size="sm">
            <Input
              ref={inputRef}
              value={editPage === null ? '' : String(editPage)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                // accept only digits; keep empty as null
                const sanitized = e.target.value.replace(/[^\d]/g, '');
                if (sanitized === '') {
                  setEditPage(null);
                } else {
                  const parsed = parseInt(sanitized, 10);
                  setEditPage(Number.isNaN(parsed) ? null : parsed);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitEdit(); // Enter updates and closes (no close button)
                }
              }}
              aria-label="currentPage"
              textAlign="right"
              pr="3.5rem" // match InputRightElement width
            />
            <InputRightElement width="4.5rem" pointerEvents="none" display="flex" alignItems="center" justifyContent="center">
              <Text fontSize="sm" color="gray.500" textAlign="center">
                / {totalPages}
              </Text>
            </InputRightElement>
          </InputGroup>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ReadingProgressCircle;
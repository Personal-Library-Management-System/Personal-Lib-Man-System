import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Textarea,
  IconButton,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi';

const MAX_LENGTH = 100;

interface PersonalNoteProps {
  note: string;
  onChange: (note: string) => void;
  placeholder?: string;
}

const PersonalNote: React.FC<PersonalNoteProps> = ({
  note,
  onChange,
  placeholder = 'Add your personal note...',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'whiteAlpha.50');
  const quoteColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    setDraft(note);
  }, [note]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onChange(draft.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(note);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <Box
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={3}
        bg={bgColor}
      >
        <Textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          size="sm"
          rows={2}
          maxLength={MAX_LENGTH}
          resize="none"
          borderColor={borderColor}
          _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px #38B2AC' }}
        />
        <Flex justify="space-between" align="center" mt={2}>
          <Text fontSize="xs" color="gray.500">
            {draft.length}/{MAX_LENGTH}
          </Text>
          <Flex gap={2}>
            <Tooltip label="Cancel (Esc)">
              <IconButton
                aria-label="Cancel"
                icon={<FiX />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={handleCancel}
              />
            </Tooltip>
            <Tooltip label="Save (Enter)">
              <IconButton
                aria-label="Save"
                icon={<FiCheck />}
                size="sm"
                colorScheme="teal"
                onClick={handleSave}
              />
            </Tooltip>
          </Flex>
        </Flex>
      </Box>
    );
  }

  // Display mode
  if (!note) {
    return (
      <Flex
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={3}
        bg={bgColor}
        align="center"
        justify="space-between"
        cursor="pointer"
        onClick={() => setIsEditing(true)}
        _hover={{ borderColor: 'teal.400' }}
        transition="border-color 0.2s"
      >
        <Text fontSize="sm" color="gray.500" fontStyle="italic">
          {placeholder}
        </Text>
        <Tooltip label="Add note">
          <IconButton
            aria-label="Add note"
            icon={<FiEdit2 />}
            size="sm"
            variant="ghost"
            colorScheme="teal"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          />
        </Tooltip>
      </Flex>
    );
  }

  return (
    <Flex
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      bg={bgColor}
      align="flex-start"
      justify="space-between"
      gap={2}
    >
      <Box flex="1" overflow="hidden">
        <Text
          fontSize="lg"
          fontFamily="'Playfair Display', Georgia, serif"
          fontStyle="italic"
          color={quoteColor}
          lineHeight="tall"
          wordBreak="break-word"
          whiteSpace="pre-wrap"
        >
          "{note}"
        </Text>
      </Box>
      <Tooltip label="Edit">
        <IconButton
          aria-label="Edit"
          icon={<FiEdit2 />}
          size="sm"
          variant="ghost"
          colorScheme="teal"
          onClick={() => setIsEditing(true)}
        />
      </Tooltip>
    </Flex>
  );
};

export default PersonalNote;

import React, { useState } from 'react';
import {
  Box,
  VStack,
  Checkbox,
  Textarea,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Stack,
  Icon,
  Divider,
  Flex,
  Badge,
  HStack,
} from '@chakra-ui/react';
import { FiStar, FiZap, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';

interface AiRecommendationProps {
  onSubmit?: (data: {
    useHistory: boolean;
    useRatings: boolean;
    useComments: boolean;
    customPrompt: string;
  }) => void;
}

const AiRecommendation: React.FC<AiRecommendationProps> = ({ onSubmit }) => {
  const [useHistory, setUseHistory] = useState(false);
  const [useRatings, setUseRatings] = useState(false);
  const [useComments, setUseComments] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  // All useColorModeValue calls must run unconditionally (hooks order)
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const subtleColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const textareaBg = useColorModeValue('gray.50', 'gray.900');
  const gradientBg = useColorModeValue(
    'linear(to-br, blue.50, purple.50)',
    'linear(to-br, gray.800, gray.900)'
  );

  // Active background used conditionally in JSX but defined here so hooks order is stable
  const activeBg = useColorModeValue('blue.50', 'blue.900');

  const handleSubmit = () => {
    // sanitize newlines: replace any newline sequences with a single space
    const sanitizedPrompt = customPrompt.replace(/\r?\n+/g, ' ').trim();

    if (onSubmit) {
      onSubmit({
        useHistory,
        useRatings,
        useComments,
        customPrompt: sanitizedPrompt,
      });
    }
  };

  return (
    <Box
      w="full"
      maxW="900px"
      mx="auto"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={6}
      boxShadow="sm"
      bgGradient={gradientBg}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        bgGradient: 'linear(to-r, blue.400, purple.500)',
      }}
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex align="center" justify="space-between">
          <HStack spacing={3}>
            <Flex
              align="center"
              justify="center"
              w={12}
              h={12}
              borderRadius="md"
              bg={accentColor}
              color="white"
              boxShadow="md"
            >
              <Icon as={FiZap} boxSize={6} />
            </Flex>
            <Box>
              <Heading size="lg" bgGradient="linear(to-r, blue.500, purple.600)" bgClip="text">
                AI Recommendation System
              </Heading>
              <Text fontSize="sm" color={subtleColor} mt={1}>
                Personalized suggestions powered by AI
              </Text>
            </Box>
          </HStack>
          <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
            Beta
          </Badge>
        </Flex>

        <Divider />

        {/* Options Section */}
        <Box>
          <Text fontSize="sm" fontWeight="semibold" mb={3} color={subtleColor} textTransform="uppercase" letterSpacing="wide">
            Personalize Recommendations
          </Text>
          <Stack spacing={3}>
            {/* Primary option as compact full-width */}
            <Checkbox
              isChecked={useHistory}
              onChange={(e) => {
                const checked = e.target.checked;
                setUseHistory(checked);
                if (!checked) {
                  setUseRatings(false);
                  setUseComments(false);
                }
              }}
              size="lg"
              colorScheme="blue"
              display="flex"
              alignItems="center"
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor={useHistory ? accentColor : borderColor}
              bg={useHistory ? activeBg : 'transparent'}
              transition="all 0.15s"
              _hover={{ bg: hoverBg }}
            >
              <HStack spacing={2}>
                <Icon as={FiCheckCircle} boxSize={5} color={useHistory ? accentColor : subtleColor} />
                <Text fontSize="md" fontWeight="medium">Use my reading and watching history</Text>
              </HStack>
            </Checkbox>

            <VStack spacing={2} pl={6} align="stretch">
              <Checkbox
                isChecked={useRatings}
                onChange={(e) => setUseRatings(e.target.checked)}
                isDisabled={!useHistory}
                colorScheme="blue"
                size="lg"
                display="flex"
                alignItems="center"
                p={3}
                borderRadius="md"
                borderWidth="1px"
                borderColor={useRatings ? accentColor : borderColor}
                bg={useRatings ? activeBg : 'transparent'}
                opacity={useHistory ? 1 : 0.5}
                transition="all 0.15s"
                _hover={useHistory ? { bg: hoverBg } : undefined}
              >
                <HStack spacing={2}>
                  <Icon as={FiStar} boxSize={5} color={useRatings ? accentColor : subtleColor} />
                  <Text fontSize="md">Use my ratings</Text>
                </HStack>
              </Checkbox>

              <Checkbox
                isChecked={useComments}
                onChange={(e) => setUseComments(e.target.checked)}
                isDisabled={!useHistory}
                colorScheme="blue"
                size="lg"
                display="flex"
                alignItems="center"
                p={3}
                borderRadius="md"
                borderWidth="1px"
                borderColor={useComments ? accentColor : borderColor}
                bg={useComments ? activeBg : 'transparent'}
                opacity={useHistory ? 1 : 0.5}
                transition="all 0.15s"
                _hover={useHistory ? { bg: hoverBg } : undefined}
              >
                <HStack spacing={2}>
                  <Icon as={FiMessageSquare} boxSize={5} color={useComments ? accentColor : subtleColor} />
                  <Text fontSize="md">Use my comments</Text>
                </HStack>
              </Checkbox>
            </VStack>
          </Stack>
        </Box>

        <Divider />

        {/* Custom Prompt Section */}
        <Box>
          <Text fontSize="sm" fontWeight="semibold" mb={3} color={subtleColor} textTransform="uppercase" letterSpacing="wide">
            Custom Request (Optional)
          </Text>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => {
              // Enter to submit, Shift+Enter for newline
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Can you suggest the best anime movie of all time? (clue: Princess Mononoke)"
            rows={4}
            resize="vertical"
            bg={textareaBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            _focus={{
              borderColor: accentColor,
              boxShadow: `0 0 0 1px ${accentColor}`,
            }}
            fontSize="md"
            p={3}
          />
        </Box>

        {/* Submit Button */}
        <Button
          size="lg"
          h={12}
          bgGradient="linear(to-r, blue.400, purple.500)"
          color="white"
          _hover={{
            bgGradient: 'linear(to-r, blue.500, purple.600)',
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          }}
          onClick={handleSubmit}
          isDisabled={!useHistory && !customPrompt.trim()}
          borderRadius="md"
          fontWeight="semibold"
          fontSize="md"
          leftIcon={<Icon as={FiZap} boxSize={5} />}
        >
          Get Recommendations
        </Button>
      </VStack>
    </Box>
  );
};

export default AiRecommendation;
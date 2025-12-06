import React, { useState } from 'react';
import { HStack, Icon, Box } from '@chakra-ui/react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface StarRatingProps {
  rating: number; // 0-5 arası değer (0.5 artışlarla)
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onChange?: (rating: number) => void;
}

const sizeMap = {
  sm: 4,
  md: 5,
  lg: 6,
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  editable = false,
  onChange,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;
  const boxSize = sizeMap[size];

  const handleClick = (starIndex: number, isHalf: boolean) => {
    if (!editable || !onChange) return;
    const newRating = isHalf ? starIndex + 0.5 : starIndex + 1;
    onChange(newRating);
  };

  const handleMouseMove = (e: React.MouseEvent, starIndex: number) => {
    if (!editable) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    setHoverRating(isHalf ? starIndex + 0.5 : starIndex + 1);
  };

  const handleMouseLeave = () => {
    if (!editable) return;
    setHoverRating(null);
  };

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const isFull = displayRating >= starValue;
    const isHalf = !isFull && displayRating >= starValue - 0.5;

    let StarIcon = FaRegStar;
    let starColor = 'gray.300';

    if (isFull) {
      StarIcon = FaStar;
      starColor = 'yellow.400';
    } else if (isHalf) {
      StarIcon = FaStarHalfAlt;
      starColor = 'yellow.400';
    }

    return (
      <Box
        key={index}
        cursor={editable ? 'pointer' : 'default'}
        onMouseMove={(e) => handleMouseMove(e, index)}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const isHalfClick = x < rect.width / 2;
          handleClick(index, isHalfClick);
        }}
        transition="transform 0.1s"
        _hover={editable ? { transform: 'scale(1.1)' } : undefined}
      >
        <Icon as={StarIcon} boxSize={boxSize} color={starColor} />
      </Box>
    );
  };

  return (
    <HStack spacing={1} onMouseLeave={handleMouseLeave}>
      {Array.from({ length: maxRating }, (_, i) => renderStar(i))}
    </HStack>
  );
};

export default StarRating;

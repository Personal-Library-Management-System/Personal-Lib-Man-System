import React, { useEffect, useState } from 'react';
import { Box, IconButton, Image, Flex, Text, HStack } from '@chakra-ui/react';
import { FiCalendar, FiTag, FiClock, FiStar } from 'react-icons/fi';
import Modal from './modal';
import BookDetailCard, { type InfoBlock, type StatusOption } from './media-detail-card';
import { type Movie } from '../../../types';
import ImdbIcon from '../../icons/imdb.png';
import RottenIcon from '../../icons/rotten-tomatoes.jpeg';
import MetacriticIcon from '../../icons/metacritic.png';
import StarRating from '../star-rating';

const movieStatusOptions: StatusOption[] = [
  { label: 'Watched', value: 'watched' },
  { label: 'Want to Watch', value: 'want-to-watch' },
];

interface MovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
}

const MovieModal: React.FC<MovieModalProps> = ({ isOpen, onClose, movie }) => {
  const [currentStatus, setCurrentStatus] = useState<Movie['status']>(movie.status);
  const initialTags = (movie as any).tags ?? [];
  const [currentTags, setCurrentTags] = useState<string[]>(initialTags);
  
  // List management
  const initialLists = (movie as any).lists ?? [];
  const [currentLists, setCurrentLists] = useState<string[]>(initialLists);
  
  // localStorage key for personal note
  const noteKey = `movie-note-${movie.id}`;
  const [personalNote, setPersonalNote] = useState<string>(() => {
    return localStorage.getItem(noteKey) ?? (movie as any).personalNote ?? '';
  });

  useEffect(() => {
    setCurrentStatus(movie.status);
    setCurrentTags((movie as any).tags ?? []);
    setCurrentLists((movie as any).lists ?? []);
    // Load note from localStorage or fallback to movie data
    setPersonalNote(localStorage.getItem(`movie-note-${movie.id}`) ?? (movie as any).personalNote ?? '');
  }, [movie]);

  const getRatingBySource = (source: string) =>
    (movie.ratings || []).find((r: any) => r.Source === source)?.Value;

  // User rating state (stored in localStorage)
  const [userRating, setUserRating] = useState<number>(() => {
    const stored = localStorage.getItem(`movie-rating-${movie.id}`);
    return stored ? parseFloat(stored) : 0;
  });

  const handleRatingChange = (newRating: number) => {
    setUserRating(newRating);
    localStorage.setItem(`movie-rating-${movie.id}`, newRating.toString());
    console.log('Updated rating (movie):', newRating, 'movie id:', movie.id);
  };

  const imdbScore = movie.imdbRating ?? getRatingBySource('Internet Movie Database') ?? '-';
  const rottenScore = getRatingBySource('Rotten Tomatoes') ?? '-';
  const metacriticScore = getRatingBySource('Metacritic') ?? '-';
  const imdbVotes = movie.imdbVotes ?? '';

  // My Rating display with interactive stars
  const myRatingValue = (
    <HStack spacing={2}>
      <StarRating 
        rating={userRating} 
        size="sm" 
        editable={true}
        onChange={handleRatingChange}
      />
      <Box fontWeight="bold">{userRating > 0 ? userRating.toFixed(1) : '-'}</Box>
    </HStack>
  );

  const infoBlocks: InfoBlock[] = [
    { label: 'Release Year', value: movie.releaseDate, icon: FiCalendar },
    { label: 'Genre', value: movie.categories?.join(', ') || 'Movie', icon: FiTag },

    // Duration
    { label: 'Duration', value: `${movie.runtime} min`, icon: FiClock },

    // Ratings: three vertical columns
    {
      label: 'Ratings',
      hideLabel: true,
      value: (
        <Box w="full">
          <Flex justify="space-between" align="center" gap={3} flexWrap="nowrap">
            {/* IMDb */}
            <Box flex="1" textAlign="center" minW={0}>
              <Flex direction="column" align="center" justify="center" gap={1}>
                <Image src={ImdbIcon} alt="IMDB" boxSize="32px" objectFit="contain" />
                <Text fontWeight="bold" fontSize="sm" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                  {imdbScore}
                </Text>
                {imdbVotes ? (
                  <Text fontSize="xs" color="gray.500" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                    {imdbVotes}
                  </Text>
                ) : (
                  <Box height="14px" />
                )}
              </Flex>
            </Box>

            {/* Rotten Tomatoes */}
            <Box flex="1" textAlign="center" minW={0}>
              <Flex direction="column" align="center" justify="center" gap={1}>
                <Image src={RottenIcon} alt="Rotten Tomatoes" boxSize="32px" objectFit="contain" />
                <Text fontWeight="bold" fontSize="sm" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                  {rottenScore}
                </Text>
                <Box height="14px" /> {/* empty space for alignment */}
              </Flex>
            </Box>

            {/* Metacritic */}
            <Box flex="1" textAlign="center" minW={0}>
              <Flex direction="column" align="center" justify="center" gap={1}>
                <Image src={MetacriticIcon} alt="Metacritic" boxSize="32px" objectFit="contain" />
                <Text fontWeight="bold" fontSize="sm" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                  {metacriticScore}
                </Text>
                <Box height="14px" />
              </Flex>
            </Box>
          </Flex>
        </Box>
      ),
      icon: FiStar,
    },
    // My Rating (interactive) - separate from external ratings
    { label: 'My Rating', value: myRatingValue, icon: FiStar },
  ];

  const handleEdit = () => {
    console.log('Edit movie:', movie.title);
  };

  const handleRemove = () => {
    console.log('Remove movie:', movie.title);
  };

  const handleTagsChange = (updated: string[]) => {
    setCurrentTags(updated);
    console.log('Updated tags (movie):', updated, 'movie id:', movie.id);
  };

  const handleNoteChange = (note: string) => {
    setPersonalNote(note);
    localStorage.setItem(`movie-note-${movie.id}`, note);
    console.log('Updated note (movie):', note, 'movie id:', movie.id);
  };

  const handleListsChange = (updated: string[]) => {
    setCurrentLists(updated);
    console.log('Updated lists (movie):', updated, 'movie id:', movie.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={movie.title}>
      <Box>
        <BookDetailCard
          imageUrl={movie.imageUrl}
          title={movie.title}
          subtitle={`Director: ${movie.director}`}
          description={movie.plot}
          infoBlocks={infoBlocks}
          addedDate={movie.releaseDate}
          status={currentStatus}
          statusOptions={movieStatusOptions}
          onStatusChange={(value) => setCurrentStatus(value as Movie['status'])}
          onEdit={handleEdit}
          onRemove={handleRemove}
          assignedTags={currentTags}
          onTagsChange={handleTagsChange}
          onCreateTag={(tag) => {
            console.log(`Tag added for movie ${movie.id}: ${tag}`);
          }}
          personalNote={personalNote}
          onPersonalNoteChange={handleNoteChange}
          assignedLists={currentLists}
          onListsChange={handleListsChange}
          onCreateList={(listName) => {
            console.log(`List created for movie ${movie.id}: ${listName}`);
          }}
          itemType="movie"
        />
      </Box>
    </Modal>
  );
};

export default MovieModal;

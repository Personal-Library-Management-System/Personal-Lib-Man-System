import React, { useEffect, useState } from 'react';
import { Box, IconButton, Image, Flex, Text, HStack, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button } from '@chakra-ui/react';
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
  onDelete?: (movieId: string) => void;
}

const MovieModal: React.FC<MovieModalProps> = ({ isOpen, onClose, movie, onDelete }) => {
  const [currentStatus, setCurrentStatus] = useState<Movie['status']>(movie.status);
  const initialTags = (movie as any).tags ?? [];
  const [currentTags, setCurrentTags] = useState<string[]>(initialTags);
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  
  // localStorage key for personal note
  const noteKey = `movie-note-${movie.id}`;
  const [personalNote, setPersonalNote] = useState<string>(() => {
    return localStorage.getItem(noteKey) ?? (movie as any).personalNote ?? '';
  });

  useEffect(() => {
    setCurrentStatus(movie.status);
    setCurrentTags((movie as any).tags ?? []);
    // Load note from localStorage or fallback to movie data
    setPersonalNote(localStorage.getItem(`movie-note-${movie.id}`) ?? (movie as any).personalNote ?? '');
  }, [movie]);

  // Helper: ratings array'den source'a göre değer çek
  const getRatingBySource = (source: string): string => {
    if (!Array.isArray(movie.ratings) || movie.ratings.length === 0) return '-';
    const found = movie.ratings.find((r: any) => {
      const src = String(r.source ?? '').toLowerCase();
      return src.includes(source.toLowerCase());
    });
    return found ? String(found.value ?? '-') : '-';
  };

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

  const imdbScore = getRatingBySource('imdb');
  const rottenScore = getRatingBySource('rotten');
  const metacriticScore = getRatingBySource('metacritic');

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

  // Parse year from publishedDate
  const releaseYear = movie.publishedDate 
    ? (() => {
        try {
          const match = String(movie.publishedDate).match(/\d{4}/);
          return match ? match[0] : movie.publishedDate;
        } catch {
          return String(movie.publishedDate).slice(0, 4);
        }
      })()
    : 'Unknown';

  const infoBlocks: InfoBlock[] = [
    { label: 'Release Year', value: releaseYear, icon: FiCalendar },
    { label: 'Genre', value: movie.categories && movie.categories.length > 0 ? movie.categories.join(', ') : 'Unknown', icon: FiTag },

    // Duration
    { label: 'Duration', value: movie.runtime ? `${movie.runtime} min` : 'Unknown', icon: FiClock },

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
                <Box height="14px" />
              </Flex>
            </Box>

            {/* Rotten Tomatoes */}
            <Box flex="1" textAlign="center" minW={0}>
              <Flex direction="column" align="center" justify="center" gap={1}>
                <Image src={RottenIcon} alt="Rotten Tomatoes" boxSize="32px" objectFit="contain" />
                <Text fontWeight="bold" fontSize="sm" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                  {rottenScore}
                </Text>
                <Box height="14px" />
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
    onAlertOpen();
  };

  const confirmDelete = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE ?? '';
      const res = await fetch(`${API_BASE}/api/v1/mediaItems/${movie.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
  
      if (!res.ok) {
        throw new Error(`Failed to delete: ${res.status}`);
      }
  
      console.log('Movie deleted:', movie.id);
      onAlertClose();
      onClose();
      if (onDelete) onDelete(movie.id);
    } catch (err) {
      console.error('Delete movie error:', err);
      alert('Failed to delete movie');
    }
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

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title={movie.title}>
      <Box>
        <BookDetailCard
          imageUrl={movie.coverPhoto ?? ''}
          title={movie.title}
          subtitle={`Director: ${movie.director}`}
          description={movie.description ?? 'No description available.'}
          infoBlocks={infoBlocks}
          addedDate={releaseYear}
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
        />
      </Box>
    </Modal>

    <AlertDialog
      isOpen={isAlertOpen}
      leastDestructiveRef={cancelRef}
      onClose={onAlertClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Movie
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete "{movie.title}"? This action cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onAlertClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete} ml={3}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
    </>
  );
};

export default MovieModal;

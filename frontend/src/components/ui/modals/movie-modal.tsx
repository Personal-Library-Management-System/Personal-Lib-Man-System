import React, { useEffect, useState } from 'react';
import {
    Box,
    IconButton,
    Image,
    Flex,
    Text,
    HStack,
    Button,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    useToast,
} from '@chakra-ui/react';
import { FiCalendar, FiTag, FiClock, FiStar } from 'react-icons/fi';
import Modal from './modal';
import BookDetailCard, { type InfoBlock, type StatusOption } from './media-detail-card';
import { type Movie } from '../../../types';
import ImdbIcon from '../../icons/imdb.png';
import RottenIcon from '../../icons/rotten-tomatoes.jpeg';
import MetacriticIcon from '../../icons/metacritic.png';
import StarRating from '../star-rating';
import { apiFetch } from '../../../lib/apiFetch';
import * as mediaItemApi from '../../../services/mediaItem.service';

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
    const toast = useToast();
    const [currentStatus, setCurrentStatus] = useState<Movie['status']>(movie.status);
    const initialTags = (movie as any).tags ?? [];
    const [currentTags, setCurrentTags] = useState<string[]>(initialTags);

    const initialLists = (movie as any).lists ?? [];
    const [currentLists, setCurrentLists] = useState<string[]>(initialLists);

    const [personalNote, setPersonalNote] = useState<string>((movie as any).personalNotes ?? '');

    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setCurrentStatus(movie.status);
        setCurrentTags((movie as any).tags ?? []);
        setCurrentLists((movie as any).lists ?? []);
        setPersonalNote((movie as any).personalNotes ?? '');
        setUserRating((movie as any).myRating ?? 0);
    }, [movie]);

    const getRatingBySource = (source: string) => {
        // Hem Source (OMDb) hem source (Backend) formatını destekle
        const rating = (movie.ratings || []).find(
            (r: any) => r.source === source || r.Source === source
        );
        return rating?.value || rating?.value;
    };

    // User rating state
    const [userRating, setUserRating] = useState<number>((movie as any).myRating ?? 0);

    const handleRatingChange = async (newRating: number) => {
        setUserRating(newRating);
        try {
            await mediaItemApi.updateMediaItem(movie.id, { myRating: newRating });
            console.log('Updated rating (movie):', newRating, 'movie id:', movie.id);
        } catch (error) {
            console.error('Error updating rating:', error);
            toast({
                title: 'Error updating rating',
                description: 'Please try again',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDelete = async () => {
        try {
            const response = await apiFetch(`/mediaItems/${movie.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete movie');
            }

            toast({
                title: 'Movie deleted',
                description: `"${movie.title}" has been removed from your library`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            onDeleteClose();
            onClose();
            onDelete?.(movie.id);
        } catch (error) {
            console.error('Error deleting movie:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete movie',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Backend'den gelen ratings array'inden değerleri al
    const imdbScore = movie.imdbRating || getRatingBySource('Internet Movie Database') || '-';
    const rottenScore = getRatingBySource('Rotten Tomatoes') || '-';
    const metacriticScore = getRatingBySource('Metacritic') || '-';
    const imdbVotes = movie.ratingCount
        ? movie.ratingCount.toLocaleString() + ' votes'
        : movie.imdbVotes || '';

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

    // Published year - sadece yıl
    const publishYear = movie.releaseDate ? movie.releaseDate.split('-')[0] : 'Unknown';

    const infoBlocks: InfoBlock[] = [
        { label: 'Release Year', value: publishYear, icon: FiCalendar },
        { label: 'Genre', value: movie.genre?.join(', ') || 'Movie', icon: FiTag },

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
                                <Image
                                    src={ImdbIcon}
                                    alt="IMDB"
                                    boxSize="32px"
                                    objectFit="contain"
                                />
                                <Text
                                    fontWeight="bold"
                                    fontSize="sm"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                >
                                    {imdbScore}
                                </Text>
                                {imdbVotes ? (
                                    <Text
                                        fontSize="xs"
                                        color="gray.500"
                                        whiteSpace="nowrap"
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                    >
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
                                <Image
                                    src={RottenIcon}
                                    alt="Rotten Tomatoes"
                                    boxSize="32px"
                                    objectFit="contain"
                                />
                                <Text
                                    fontWeight="bold"
                                    fontSize="sm"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                >
                                    {rottenScore}
                                </Text>
                                <Box height="14px" /> {/* empty space for alignment */}
                            </Flex>
                        </Box>

                        {/* Metacritic */}
                        <Box flex="1" textAlign="center" minW={0}>
                            <Flex direction="column" align="center" justify="center" gap={1}>
                                <Image
                                    src={MetacriticIcon}
                                    alt="Metacritic"
                                    boxSize="32px"
                                    objectFit="contain"
                                />
                                <Text
                                    fontWeight="bold"
                                    fontSize="sm"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                >
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

    const handleTagsChange = (updated: string[]) => {
        setCurrentTags(updated);
        console.log('Updated tags (movie):', updated, 'movie id:', movie.id);
    };

    const handleNoteChange = async (note: string) => {
        setPersonalNote(note);
        try {
            await mediaItemApi.updateMediaItem(movie.id, { personalNotes: note });
            console.log('Updated note (movie):', note, 'movie id:', movie.id);
        } catch (error) {
            console.error('Error updating note:', error);
            toast({
                title: 'Error updating note',
                description: 'Please try again',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleStatusChange = async (value: string) => {
        setCurrentStatus(value as Movie['status']);

        const statusMap: Record<string, string> = {
            watched: 'COMPLETED',
            'want-to-watch': 'PLANNED',
        };
        const newStatus = statusMap[value];

        try {
            await mediaItemApi.updateMediaItem(movie.id, { status: newStatus });
            console.log('Updated status:', value, 'movie id:', movie.id);
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: 'Error updating status',
                description: 'Please try again',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleListsChange = (updated: string[]) => {
        setCurrentLists(updated);
        console.log('Updated lists (movie):', updated, 'movie id:', movie.id);
    };

    return (
        <>
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
                        onStatusChange={handleStatusChange}
                        onRemove={onDeleteOpen}
                        assignedTags={currentTags}
                        onTagsChange={handleTagsChange}
                        personalNote={personalNote}
                        onPersonalNoteChange={handleNoteChange}
                        assignedLists={currentLists}
                        onListsChange={handleListsChange}
                        itemType="movie"
                    />
                </Box>
            </Modal>

            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Movie
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete "{movie.title}"? This action cannot be
                            undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDelete} ml={3}>
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

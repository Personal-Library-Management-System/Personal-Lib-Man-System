import React, { useEffect, useState } from 'react';
import { FiCalendar, FiTag, FiBookOpen, FiStar} from 'react-icons/fi';
import { Box, HStack, Button, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, useDisclosure, useToast } from '@chakra-ui/react';
import Modal from './modal';
import BookDetailCard, { type InfoBlock, type StatusOption } from './media-detail-card';
import { type Book } from '../../../types';
import ReadingProgressCircle from '../helpers/reading-progress-circle';
import StarRating from '../star-rating';
import { apiFetch } from '../../../lib/apiFetch';
import * as mediaItemApi from '../../../services/mediaItem.service';

const bookStatusOptions: StatusOption[] = [
  { label: 'Read', value: 'read' },
  { label: 'Reading', value: 'reading' },
  { label: 'Want to Read', value: 'want-to-read' },
];

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onDelete?: (bookId: string) => void;
}

const BookModal: React.FC<BookModalProps> = ({ isOpen, onClose, book, onDelete }) => {
  const toast = useToast();
  const [currentStatus, setCurrentStatus] = useState<Book['status']>(book.status);
  const initialTags = (book as any).tags ?? [];
  const [currentTags, setCurrentTags] = useState<string[]>(initialTags);
  const initialLists = (book as any).lists ?? [];
  const [currentLists, setCurrentLists] = useState<string[]>(initialLists);
  
  const noteKey = `book-note-${book.id}`;
  const [personalNote, setPersonalNote] = useState<string>(() => {
    return localStorage.getItem(noteKey) ?? (book as any).personalNote ?? '';
  });

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const toast = useToast();

  useEffect(() => {
    setCurrentStatus(book.status);
    setCurrentTags((book as any).tags ?? []);
    setCurrentLists((book as any).lists ?? []);
    setPersonalNote((book as any).personalNote ?? '');
    setUserRating((book as any).rating ?? 0);
  }, [book]);

  // User rating state
  const [userRating, setUserRating] = useState<number>((book as any).rating ?? 0);

  const handleRatingChange = async (newRating: number) => {
    setUserRating(newRating);
    try {
      await mediaItemApi.updateMediaItem(book.id, { rating: newRating });
      console.log('Updated rating (book):', newRating, 'book id:', book.id);
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
      const response = await apiFetch(`/mediaItems/${book.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete book');
      }

      toast({
        title: 'Book deleted',
        description: `"${book.title}" has been removed from your library`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onDeleteClose();
      onClose();
      onDelete?.(book.id);
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete book',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Published date - sadece yıl
  const publishYear = book.publishedDate ? new Date(book.publishedDate).getFullYear().toString() : 'Unknown';

  const pageCountValue = book.pageCount ? (
    <HStack w="100%" align="center" justify="space-between" px={3}>
      <Box fontWeight="bold">{book.pageCount} pages</Box>
      {currentStatus === 'reading' && book.pageCount ? (
        <Box display="flex" alignItems="center" justifyContent="center">
          <ReadingProgressCircle
            currentPage={book.currentPage}
            pageCount={book.pageCount}
            title={book.title}
            size="50px"
            thickness="7px"
          />
        </Box>
      ) : null}
    </HStack>
  ) : 'Unknown';

  const ratingValue = book.averageRating ? (
    <HStack spacing={2}>
      <StarRating rating={book.averageRating} size="sm" />
      <Box fontWeight="bold">{book.averageRating.toFixed(1)}</Box>
    </HStack>
  ) : 'Not rated';

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
    { label: 'Published', value: publishYear, icon: FiCalendar },
    { label: 'Category', value: book.categories?.join(', ') || 'Unknown', icon: FiTag },
    { label: 'Pages', value: pageCountValue, icon: FiBookOpen },
    { label: 'Average Rating', value: ratingValue, icon: FiStar },
    { label: 'My Rating', value: myRatingValue, icon: FiStar },
  ];

  const handleEdit = () => {
    console.log('Edit book request:', book.title);
  };

  const handleRemove = () => {
    console.log('Remove book request:', book.title);
  };

  const handleTagsChange = (updated: string[]) => {
    setCurrentTags(updated);
    console.log('Updated tags:', updated, 'book id:', book.id);
  };

  const handleNoteChange = async (note: string) => {
    setPersonalNote(note);
    try {
      await mediaItemApi.updateMediaItem(book.id, { personalNote: note });
      console.log('Updated note:', note, 'book id:', book.id);
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
    setCurrentStatus(value as Book['status']);
    try {
      await mediaItemApi.updateMediaItem(book.id, { status: value });
      console.log('Updated status:', value, 'book id:', book.id);
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
    console.log('Updated lists:', updated, 'book id:', book.id);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={book.title}>
        <BookDetailCard
          imageUrl={book.imageLinks?.thumbnail || ''}
          title={book.title}
          subtitle={book.authors ? `Author: ${book.authors.join(', ')}` : 'Author: Unknown'}
          description={book.description || 'No description available.'}
          infoBlocks={infoBlocks}
          addedDate={book.publishedDate || ''}
          status={currentStatus}
          statusOptions={bookStatusOptions}
          onStatusChange={handleStatusChange}
          onRemove={onDeleteOpen}
          assignedTags={currentTags}
          onTagsChange={handleTagsChange}
          currentPage={book.currentPage}
          pageCount={book.pageCount}
          personalNote={personalNote}
          onPersonalNoteChange={handleNoteChange}
          assignedLists={currentLists}
          onListsChange={handleListsChange}
          itemType="book"
        />
      </Modal>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Book
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{book.title}"? This action cannot be undone.
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

export default BookModal;

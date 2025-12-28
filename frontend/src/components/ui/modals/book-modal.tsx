import React, { useEffect, useState } from 'react';
import { FiCalendar, FiTag, FiBookOpen, FiStar} from 'react-icons/fi';
import { Box, HStack, useToast } from '@chakra-ui/react';
import Modal from './modal';
import BookDetailCard, { type InfoBlock, type StatusOption } from './media-detail-card';
import { type Book } from '../../../types';
import ReadingProgressCircle from '../helpers/reading-progress-circle';
import StarRating from '../star-rating';
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
}

const BookModal: React.FC<BookModalProps> = ({ isOpen, onClose, book }) => {
  const toast = useToast();
  const [currentStatus, setCurrentStatus] = useState<Book['status']>(book.status);
  const initialTags = (book as any).tags ?? [];
  const [currentTags, setCurrentTags] = useState<string[]>(initialTags);
  
  // List management
  const initialLists = (book as any).lists ?? [];
  const [currentLists, setCurrentLists] = useState<string[]>(initialLists);
  
  // Personal note - use book data from backend
  const [personalNote, setPersonalNote] = useState<string>((book as any).personalNote ?? '');

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

  // Build page count display with optional progress circle
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

  // Average rating display (from book data)
  const ratingValue = book.averageRating ? (
    <HStack spacing={2}>
      <StarRating rating={book.averageRating} size="sm" />
      <Box fontWeight="bold">{book.averageRating.toFixed(1)}</Box>
    </HStack>
  ) : 'Not rated';

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
    { label: 'Published', value: book.publishedDate || 'Unknown', icon: FiCalendar },
    { label: 'Category', value: book.categories?.join(', ') || 'Unknown', icon: FiTag },
    { label: 'Pages', value: pageCountValue, icon: FiBookOpen },
    { label: 'Average Rating', value: ratingValue, icon: FiStar },
    { label: 'My Rating', value: myRatingValue, icon: FiStar },
  ];

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
        onRemove={handleRemove}
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
  );
};

export default BookModal;

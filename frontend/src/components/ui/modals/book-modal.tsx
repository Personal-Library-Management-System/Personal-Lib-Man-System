import React, { useEffect, useState } from 'react';
import { FiCalendar, FiTag, FiBookOpen, FiStar} from 'react-icons/fi';
import { Box, IconButton, HStack } from '@chakra-ui/react';
import Modal from './modal';
import BookDetailCard, { type InfoBlock, type StatusOption } from './media-detail-card';
import { type Book } from '../../../types';
import ReadingProgressCircle from '../helpers/reading-progress-circle';
import StarRating from '../star-rating';

const bookStatusOptions: StatusOption[] = [
  { label: 'Read', value: 'read' },
  { label: 'Reading', value: 'reading' },
  { label: 'Want to Read', value: 'wanttoread' },
];

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
}

const BookModal: React.FC<BookModalProps> = ({ isOpen, onClose, book }) => {
  const [currentStatus, setCurrentStatus] = useState<Book['status']>(book.status);
  const initialTags = (book as any).tags ?? [];
  const [currentTags, setCurrentTags] = useState<string[]>(initialTags);
  
  // List management
  const initialLists = (book as any).lists ?? [];
  const [currentLists, setCurrentLists] = useState<string[]>(initialLists);
  
  // localStorage key for personal note
  const noteKey = `book-note-${book.id}`;
  const [personalNote, setPersonalNote] = useState<string>(() => {
    return localStorage.getItem(noteKey) ?? (book as any).personalNote ?? '';
  });

  useEffect(() => {
    setCurrentStatus(book.status);
    setCurrentTags((book as any).tags ?? []);
    setCurrentLists((book as any).lists ?? []);
    // Load note from localStorage or fallback to book data
    setPersonalNote(localStorage.getItem(`book-note-${book.id}`) ?? (book as any).personalNote ?? '');
    // Load user rating from localStorage
    const storedRating = localStorage.getItem(`book-rating-${book.id}`);
    if (storedRating) setUserRating(parseFloat(storedRating));
  }, [book]);

  // User rating state (stored in localStorage)
  const [userRating, setUserRating] = useState<number>(() => {
    const stored = localStorage.getItem(`book-rating-${book.id}`);
    return stored ? parseFloat(stored) : 0;
  });

  const handleRatingChange = (newRating: number) => {
    setUserRating(newRating);
    localStorage.setItem(`book-rating-${book.id}`, newRating.toString());
    console.log('Updated rating (book):', newRating, 'book id:', book.id);
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

  const handleNoteChange = (note: string) => {
    setPersonalNote(note);
    localStorage.setItem(`book-note-${book.id}`, note);
    console.log('Updated note:', note, 'book id:', book.id);
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
        onStatusChange={(value) => setCurrentStatus(value as Book['status'])}
        onEdit={handleEdit}
        onRemove={handleRemove}
        assignedTags={currentTags}
        onTagsChange={handleTagsChange}
        onCreateTag={(tag) => {
          console.log(`Tag added for book ${book.id}: ${tag}`);
        }}
        currentPage={book.currentPage}
        pageCount={book.pageCount}
        personalNote={personalNote}
        onPersonalNoteChange={handleNoteChange}
        assignedLists={currentLists}
        onListsChange={handleListsChange}
        onCreateList={(listName) => {
          console.log(`List created for book ${book.id}: ${listName}`);
        }}
        itemType="book"
      />
    </Modal>
  );
};

export default BookModal;

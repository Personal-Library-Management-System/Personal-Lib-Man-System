import React, { useEffect, useState } from 'react';
import { FiCalendar, FiTag, FiBookOpen, FiStar} from 'react-icons/fi';
import { Box, IconButton, HStack } from '@chakra-ui/react';
import Modal from './modal';
import BookDetailCard, { type InfoBlock, type StatusOption } from './media-detail-card';
import { type Book } from '../../../types';
import ReadingProgressCircle from '../helpers/reading-progress-circle';

const bookStatusOptions: StatusOption[] = [
  { label: 'Okundu', value: 'read' },
  { label: 'Okunuyor', value: 'reading' },
  { label: 'Okunacak', value: 'wanttoread' },
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
  
  // localStorage key for personal note
  const noteKey = `book-note-${book.id}`;
  const [personalNote, setPersonalNote] = useState<string>(() => {
    return localStorage.getItem(noteKey) ?? (book as any).personalNote ?? '';
  });

  useEffect(() => {
    setCurrentStatus(book.status);
    setCurrentTags((book as any).tags ?? []);
    // Load note from localStorage or fallback to book data
    setPersonalNote(localStorage.getItem(`book-note-${book.id}`) ?? (book as any).personalNote ?? '');
  }, [book]);

  // Build page count display with optional progress circle
  const pageCountValue = book.pageCount ? (
    <HStack w="100%" align="center" justify="space-between" px={3}>
      <Box fontWeight="bold">{book.pageCount} sayfa</Box>
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
  ) : 'Bilinmiyor';

  const infoBlocks: InfoBlock[] = [
    { label: 'Yayın Tarihi', value: book.publishedDate || 'Bilinmiyor', icon: FiCalendar },
    { label: 'Kategori', value: book.categories?.join(', ') || 'Bilinmiyor', icon: FiTag },
    { label: 'Sayfa Sayısı', value: pageCountValue, icon: FiBookOpen },
    { label: 'Değerlendirme', value: book.averageRating ? `${book.averageRating.toFixed(1)} / 5` : 'Değerlendirilmemiş', icon: FiStar },
  ];

  const handleEdit = () => {
    console.log('Book düzenleme istek:', book.title);
  };

  const handleRemove = () => {
    console.log('Book kaldırma istek:', book.title);
  };

  const handleTagsChange = (updated: string[]) => {
    setCurrentTags(updated);
    console.log('Güncellenen tagler:', updated, 'kitap id:', book.id);
  };

  const handleNoteChange = (note: string) => {
    setPersonalNote(note);
    localStorage.setItem(`book-note-${book.id}`, note);
    console.log('Güncellenen not:', note, 'kitap id:', book.id);
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
          console.log(`Kitap ${book.id} için tag eklendi: ${tag}`);
        }}
        currentPage={book.currentPage}
        pageCount={book.pageCount}
        personalNote={personalNote}
        onPersonalNoteChange={handleNoteChange}
      />
    </Modal>
  );
};

export default BookModal;

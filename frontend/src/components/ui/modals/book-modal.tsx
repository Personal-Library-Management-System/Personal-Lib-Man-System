import React, { useEffect, useState } from 'react';
import { FiCalendar, FiTag, FiBookOpen, FiStar } from 'react-icons/fi';
import Modal from './modal';
import BookDetailCard, { type InfoBlock, type StatusOption } from './media-detail-card';
import { type Book } from '../../../types';

const bookStatusOptions: StatusOption[] = [
  { label: 'Okundu', value: 'read' },
  { label: 'Okunuyor', value: 'reading' },
  { label: 'Okunacak', value: 'want-to-read' },
];

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
}

const BookModal: React.FC<BookModalProps> = ({ isOpen, onClose, book }) => {
  const [currentStatus, setCurrentStatus] = useState<Book['status']>(book.status);

  useEffect(() => {
    setCurrentStatus(book.status);
  }, [book.status]);

  const infoBlocks: InfoBlock[] = [
    { label: 'Yayın Tarihi', value: book.publishedDate, icon: FiCalendar },
    { label: 'Tür', value: 'Kurgu', icon: FiTag },
    { label: 'Sayfa Sayısı', value: `${book.pageCount} sayfa`, icon: FiBookOpen },
    { label: 'Değerlendirme', value: `${book.rating.toFixed(1)} / 5`, icon: FiStar },
  ];

  const handleEdit = () => {
    console.log('Book düzenleme istek:', book.title);
  };

  const handleRemove = () => {
    console.log('Book kaldırma istek:', book.title);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={book.title}>
      <BookDetailCard
        imageUrl={book.imageUrl}
        title={book.title}
        subtitle={`Yazar: ${book.author}`}
        description={book.description}
        infoBlocks={infoBlocks}
        addedDate={book.publishedDate}
        status={currentStatus}
        statusOptions={bookStatusOptions}
        onStatusChange={(value) => setCurrentStatus(value as Book['status'])}
        onEdit={handleEdit}
        onRemove={handleRemove}
      />
    </Modal>
  );
};

export default BookModal;

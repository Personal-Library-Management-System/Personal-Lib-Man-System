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
    { label: 'Yayın Tarihi', value: book.publishedDate || 'Bilinmiyor', icon: FiCalendar },
    { label: 'Kategori', value: book.categories?.join(', ') || 'Bilinmiyor', icon: FiTag },
    { label: 'Sayfa Sayısı', value: book.pageCount ? `${book.pageCount} sayfa` : 'Bilinmiyor', icon: FiBookOpen },
    { label: 'Değerlendirme', value: book.averageRating ? `${book.averageRating.toFixed(1)} / 5` : 'Değerlendirilmemiş', icon: FiStar },
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
        imageUrl={book.imageLinks?.thumbnail || ''}
        title={book.title}
        subtitle={book.authors ? `Yazar: ${book.authors.join(', ')}` : 'Yazar: Bilinmiyor'}
        description={book.description || 'Açıklama bulunmamaktadır.'}
        infoBlocks={infoBlocks}
        addedDate={book.publishedDate || ''}
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

import React, { useEffect, useState } from 'react';
import { FiCalendar, FiTag, FiClock, FiStar } from 'react-icons/fi';
import Modal from './modal';
import BookDetailCard, { type InfoBlock, type StatusOption } from './book-detail-card';
import { type Movie } from '../../types';

const movieStatusOptions: StatusOption[] = [
  { label: 'İzlendi', value: 'watched' },
  { label: 'İzlenecek', value: 'want-to-watch' },
];

interface MovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
}

const MovieModal: React.FC<MovieModalProps> = ({ isOpen, onClose, movie }) => {
  const [currentStatus, setCurrentStatus] = useState<Movie['status']>(movie.status);

  useEffect(() => {
    setCurrentStatus(movie.status);
  }, [movie.status]);

  const infoBlocks: InfoBlock[] = [
    { label: 'Yapım Yılı', value: movie.releaseDate, icon: FiCalendar },
    { label: 'Tür', value: 'Sinema', icon: FiTag },
    { label: 'Süre', value: `${movie.duration} dakika`, icon: FiClock },
    { label: 'Değerlendirme', value: `${movie.rating.toFixed(1)} / 10`, icon: FiStar },
  ];

  const handleEdit = () => {
    console.log('Film düzenleme istek:', movie.title);
  };

  const handleRemove = () => {
    console.log('Film kaldırma istek:', movie.title);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={movie.title}>
      <BookDetailCard
        imageUrl={movie.imageUrl}
        title={movie.title}
        subtitle={`Yönetmen: ${movie.director}`}
        description={movie.description}
        infoBlocks={infoBlocks}
        addedDate={movie.releaseDate}
        status={currentStatus}
        statusOptions={movieStatusOptions}
        onStatusChange={(value) => setCurrentStatus(value as Movie['status'])}
        onEdit={handleEdit}
        onRemove={handleRemove}
      />
    </Modal>
  );
};

export default MovieModal;

import React, { useEffect, useState } from 'react';
import { Box, IconButton } from '@chakra-ui/react';
import { FiCalendar, FiTag, FiClock, FiStar } from 'react-icons/fi';
import Modal from './modal';
import BookDetailCard, { type InfoBlock, type StatusOption } from './media-detail-card';
import { type Movie } from '../../../types';

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
  const initialTags = (movie as any).tags ?? [];
  const [currentTags, setCurrentTags] = useState<string[]>(initialTags);

  useEffect(() => {
    setCurrentStatus(movie.status);
    setCurrentTags((movie as any).tags ?? []);
  }, [movie]);

  const infoBlocks: InfoBlock[] = [
    { label: 'Yapım Yılı', value: movie.releaseDate, icon: FiCalendar },
    { label: 'Tür', value: 'Sinema', icon: FiTag },
    { label: 'Süre', value: `${movie.runtime} dakika`, icon: FiClock },
    { label: 'Değerlendirme', value: `${movie.ratings?.[0].Value}`, icon: FiStar },
  ];

  const handleEdit = () => {
    console.log('Film düzenleme istek:', movie.title);
  };

  const handleRemove = () => {
    console.log('Film kaldırma istek:', movie.title);
  };

  const handleTagsChange = (updated: string[]) => {
    setCurrentTags(updated);
    console.log('Güncellenen tagler (film):', updated, 'film id:', movie.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={movie.title}>
      <Box>
        <BookDetailCard
          imageUrl={movie.imageUrl}
          title={movie.title}
          subtitle={`Yönetmen: ${movie.director}`}
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
            // geçici: backend çağrısı yerine console.log
            console.log(`Film ${movie.id} için tag eklendi: ${tag}`);
          }}
        />
      </Box>
    </Modal>
  );
};

export default MovieModal;

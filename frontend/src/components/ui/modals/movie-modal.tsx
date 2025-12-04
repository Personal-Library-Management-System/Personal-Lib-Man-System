import React, { useEffect, useState } from 'react';
import { Box, IconButton, Image, Flex, Text } from '@chakra-ui/react';
import { FiCalendar, FiTag, FiClock, FiStar } from 'react-icons/fi';
import Modal from './modal';
import BookDetailCard, { type InfoBlock, type StatusOption } from './media-detail-card';
import { type Movie } from '../../../types';
import ImdbIcon from '../../icons/imdb.png';
import RottenIcon from '../../icons/rotten-tomatoes.jpeg';
import MetacriticIcon from '../../icons/metacritic.png';

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

  const getRatingBySource = (source: string) =>
    (movie.ratings || []).find((r: any) => r.Source === source)?.Value;

  const imdbScore = movie.imdbRating ?? getRatingBySource('Internet Movie Database') ?? '-';
  const rottenScore = getRatingBySource('Rotten Tomatoes') ?? '-';
  const metacriticScore = getRatingBySource('Metacritic') ?? '-';
  const imdbVotes = movie.imdbVotes ?? '';

  const infoBlocks: InfoBlock[] = [
    { label: 'Yapım Yılı', value: movie.releaseDate, icon: FiCalendar },
    { label: 'Tür', value: 'Sinema', icon: FiTag },

    // Süre kutucuğu (ayrı)
    { label: 'Süre', value: `${movie.runtime} dakika`, icon: FiClock },

    // Değerlendirme: üç dikey sütun (icon üstte, puan ortada, imdbVotes sadece imdb sütununda altta)
    {
      label: 'Değerlendirme',
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
                {imdbVotes ? (
                  <Text fontSize="xs" color="gray.500" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
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
                <Image src={RottenIcon} alt="Rotten Tomatoes" boxSize="32px" objectFit="contain" />
                <Text fontWeight="bold" fontSize="sm" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                  {rottenScore}
                </Text>
                <Box height="14px" /> {/* hizalama için boş alan */}
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

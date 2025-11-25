import React from 'react';
import { HStack, Button } from '@chakra-ui/react';

// Filtre seçeneklerinin yapısını tanımlıyoruz
interface FilterOption {
  label: string; // Butonun üzerinde yazacak metin (Örn: "İzlendi")
  value: string; // Arka planda kullanılacak değer (Örn: "watched")
}

interface FiltersProps {
  options: FilterOption[]; // Dışarıdan gelecek seçenekler listesi
  selectedStatus: string; // Şu an seçili olan değer
  onStatusChange: (value: string) => void; // Seçim değiştiğinde çalışacak fonksiyon
}

const Filters: React.FC<FiltersProps> = ({ 
  options, 
  selectedStatus, 
  onStatusChange 
}) => {
  return (
    <HStack spacing={2} mb={6} flexWrap="wrap">
      {options.map((option) => (
        <Button
          key={option.value}
          size="sm"
          // Eğer bu buton seçiliyse 'solid' (dolu), değilse 'outline' (çizgili) olsun
          variant={selectedStatus === option.value ? 'solid' : 'outline'}
          // Seçiliyse mavi, değilse gri olsun
          colorScheme={selectedStatus === option.value ? 'blue' : 'gray'}
          onClick={() => onStatusChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </HStack>
  );
};

export default Filters;

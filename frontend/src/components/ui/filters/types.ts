// Filter types
export type YearRangePreset = 'all' | '2020s' | '2010s' | '2000s' | 'classic';
export type DurationPreset = 'all' | 'short' | 'medium' | 'long';
export type PageCountPreset = 'all' | 'short' | 'medium' | 'long';

export interface FilterState {
  // Ortak filtreler
  rating?: number; // Minimum puan (örn: 4 = 4+ puan)
  yearRange?: YearRangePreset;
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
  
  // Kitaplara özel
  categories?: string[];
  pageCountRange?: PageCountPreset;
  
  // Filmlere özel
  durationRange?: DurationPreset;
  imdbRating?: number; // Minimum IMDb puanı
}

export type SortOption = 
  | 'title-asc' 
  | 'title-desc' 
  | 'rating-high' 
  | 'rating-low' 
  | 'year-new' 
  | 'year-old'
  | 'duration-short'
  | 'duration-long'
  | 'pages-short'
  | 'pages-long';

export interface FilterOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export const PAGE_COUNT_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'short', label: 'Kısa (<200)' },
  { value: 'medium', label: 'Orta (200-400)' },
  { value: 'long', label: 'Uzun (400+)' },
];

export const DURATION_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'short', label: 'Kısa (<90 dk)' },
  { value: 'medium', label: 'Normal (90-150 dk)' },
  { value: 'long', label: 'Uzun (150+ dk)' },
];

export const RATING_OPTIONS: FilterOption[] = [
  { value: '0', label: 'Tümü' },
  { value: '4', label: '4+ ⭐' },
  { value: '3', label: '3+ ⭐' },
  { value: '2', label: '2+ ⭐' },
];

export const IMDB_RATING_OPTIONS: FilterOption[] = [
  { value: '0', label: 'Tümü' },
  { value: '8', label: '8+ ⭐' },
  { value: '7', label: '7+ ⭐' },
  { value: '6', label: '6+ ⭐' },
  { value: '5', label: '5+ ⭐' },
];

export const YEAR_PRESETS: FilterOption[] = [
  { value: 'all', label: 'Tümü' },
  { value: '2020s', label: '2020\'ler' },
  { value: '2010s', label: '2010\'lar' },
  { value: '2000s', label: '2000\'ler' },
  { value: 'classic', label: 'Klasikler (<2000)' },
];

export const SORT_OPTIONS_BOOK: FilterOption[] = [
  { value: 'title-asc', label: 'A-Z' },
  { value: 'title-desc', label: 'Z-A' },
  { value: 'rating-high', label: 'Puan (Yüksek→Düşük)' },
  { value: 'rating-low', label: 'Puan (Düşük→Yüksek)' },
  { value: 'year-new', label: 'Yıl (Yeni→Eski)' },
  { value: 'year-old', label: 'Yıl (Eski→Yeni)' },
  { value: 'pages-short', label: 'Sayfa (Az→Çok)' },
  { value: 'pages-long', label: 'Sayfa (Çok→Az)' },
];

export const SORT_OPTIONS_MOVIE: FilterOption[] = [
  { value: 'title-asc', label: 'A-Z' },
  { value: 'title-desc', label: 'Z-A' },
  { value: 'rating-high', label: 'IMDb (Yüksek→Düşük)' },
  { value: 'rating-low', label: 'IMDb (Düşük→Yüksek)' },
  { value: 'year-new', label: 'Yıl (Yeni→Eski)' },
  { value: 'year-old', label: 'Yıl (Eski→Yeni)' },
  { value: 'duration-short', label: 'Süre (Kısa→Uzun)' },
  { value: 'duration-long', label: 'Süre (Uzun→Kısa)' },
];

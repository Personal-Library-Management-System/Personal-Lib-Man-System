// Filter types
export type YearRangePreset = 'all' | '2020s' | '2010s' | '2000s' | 'classic';
export type DurationPreset = 'all' | 'short' | 'medium' | 'long';
export type PageCountPreset = 'all' | 'short' | 'medium' | 'long';

export interface ListItem {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  items: { type: 'book' | 'movie'; id: string }[];
  createdAt?: string;
}

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
  
  // Tag ve List filtreleri (her ikisi için)
  tags?: string[];
  lists?: string[];
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
  { value: 'all', label: 'All' },
  { value: 'short', label: 'Short (<200)' },
  { value: 'medium', label: 'Medium (200-400)' },
  { value: 'long', label: 'Long (400+)' },
];

export const DURATION_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'short', label: 'Short (<90 min)' },
  { value: 'medium', label: 'Medium (90-150 min)' },
  { value: 'long', label: 'Long (150+ min)' },
];

export const RATING_OPTIONS: FilterOption[] = [
  { value: '0', label: 'All' },
  { value: '4', label: '4+ ⭐' },
  { value: '3', label: '3+ ⭐' },
  { value: '2', label: '2+ ⭐' },
];

export const IMDB_RATING_OPTIONS: FilterOption[] = [
  { value: '0', label: 'All' },
  { value: '8', label: '8+ ⭐' },
  { value: '7', label: '7+ ⭐' },
  { value: '6', label: '6+ ⭐' },
  { value: '5', label: '5+ ⭐' },
];

export const YEAR_PRESETS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: '2020s', label: '2020s' },
  { value: '2010s', label: '2010s' },
  { value: '2000s', label: '2000s' },
  { value: 'classic', label: 'Classics (<2000)' },
];

export const SORT_OPTIONS_BOOK: FilterOption[] = [
  { value: 'title-asc', label: 'A-Z' },
  { value: 'title-desc', label: 'Z-A' },
  { value: 'rating-high', label: 'Rating (High→Low)' },
  { value: 'rating-low', label: 'Rating (Low→High)' },
  { value: 'year-new', label: 'Year (New→Old)' },
  { value: 'year-old', label: 'Year (Old→New)' },
  { value: 'pages-short', label: 'Pages (Short→Long)' },
  { value: 'pages-long', label: 'Pages (Long→Short)' },
];

export const SORT_OPTIONS_MOVIE: FilterOption[] = [
  { value: 'title-asc', label: 'A-Z' },
  { value: 'title-desc', label: 'Z-A' },
  { value: 'rating-high', label: 'IMDb (High→Low)' },
  { value: 'rating-low', label: 'IMDb (Low→High)' },
  { value: 'year-new', label: 'Year (New→Old)' },
  { value: 'year-old', label: 'Year (Old→New)' },
  { value: 'duration-short', label: 'Duration (Short→Long)' },
  { value: 'duration-long', label: 'Duration (Long→Short)' },
];

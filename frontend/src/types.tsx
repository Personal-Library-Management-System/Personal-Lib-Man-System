// Book and Movie specific statuses used in UI/backend mapping
export type ItemStatus =
  | 'want-to-read'
  | 'reading'
  | 'read'
  | 'want-to-watch'
  | 'watched';

export type MediaType = 'Book' | 'Movie';

// Backend enum strings
export type BackendStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';

export const ALLOWED_ITEM_STATUSES: ItemStatus[] = [
  'want-to-read',
  'reading',
  'read',
  'want-to-watch',
  'watched',
];

/** Map backend -> frontend ItemStatus */
export const statusFromBackend = (raw: any): ItemStatus => {
  if (!raw && raw !== '') return 'want-to-read';
  const up = String(raw ?? '').toUpperCase().trim();
  switch (up) {
    case 'PLANNED':
      return 'want-to-read';
    case 'IN_PROGRESS':
      return 'reading';
    case 'COMPLETED':
      return 'read';
    default: {
      const low = String(raw ?? '').toLowerCase().replace(/_/g, '-').trim();
      return ALLOWED_ITEM_STATUSES.includes(low as ItemStatus) ? (low as ItemStatus) : 'want-to-read';
    }
  }
};

/** Map frontend ItemStatus -> backend enum */
export const statusToBackend = (s: ItemStatus | string): BackendStatus => {
  const low = String(s ?? '').toLowerCase().replace(/_/g, '-').trim();
  switch (low) {
    case 'want-to-read':
      return 'PLANNED';
    case 'reading':
      return 'IN_PROGRESS';
    case 'read':
      return 'COMPLETED';
    case 'want-to-watch':
      return 'PLANNED';
    case 'watched':
      return 'COMPLETED';
    default:
      return String(s).toUpperCase().replace(/-/g, '_') as BackendStatus;
  }
}

export interface Rating {
  source: string;
  value: string;
}

export interface MediaItemBase {
  id: string;
  title: string;
  publishedDate?: string | null; // ISO date string
  ratings?: Rating[] | null;
  ratingCount?: number | null;
  categories?: string[];
  description?: string | null;
  coverPhoto?: string | null;
  language?: string | null;
  author?: string | null;
  lists?: string[]; // frontend representation of ObjectId[]
  tags?: string[] | null; // frontend representation of ObjectId[]
  status: ItemStatus;
  myRating?: number | null;
  progress?: number | null;
  personalNotes?: string | null;
  mediaType: MediaType;
}

export interface Book extends MediaItemBase {
  ISBN?: string;
  pageCount?: number;
  publisher?: string;
}

export interface Movie extends MediaItemBase {
  actors?: string[] | null;
  awards?: string | null;
  runtime?: number | null; // minutes
  director?: string | null;
  imdbID?: string | null;
}

export interface User {
  id: string;
  googleId: string;
  name: string;
  email: string;
  picture?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
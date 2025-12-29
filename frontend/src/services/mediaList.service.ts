const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface MediaListCreatePayload {
  title: string;
  color?: string;
  mediaType: 'Book' | 'Movie';
  items?: string[];
}

export interface MediaListUpdatePayload {
  title?: string;
  color?: string;
}

export interface MediaListResponse {
  _id: string;
  title: string;
  color: string;
  mediaType: 'Book' | 'Movie';
  items: string[];
  ownerId: string;
}

// Get all media lists for the authenticated user
export const getAllMediaLists = async (): Promise<MediaListResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/mediaLists`, {
    method: 'GET',
    credentials: 'include', // Use cookies for authentication
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // If unauthorized, return empty array (user not logged in)
  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch media lists');
  }

  const data = await response.json();
  return data.lists;
};

// Create a new media list
export const createMediaList = async (payload: MediaListCreatePayload): Promise<MediaListResponse> => {
  const response = await fetch(`${API_BASE_URL}/mediaLists`, {
    method: 'POST',
    credentials: 'include', // Use cookies for authentication
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create media list');
  }

  const data = await response.json();
  return data.list;
};

// Update a media list (currently only title and color can be updated)
export const updateMediaList = async (listId: string, payload: MediaListUpdatePayload): Promise<MediaListResponse> => {
  const response = await fetch(`${API_BASE_URL}/mediaLists/${listId}`, {
    method: 'PATCH',
    credentials: 'include', // Use cookies for authentication
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update media list');
  }

  const data = await response.json();
  return data.list;
};

// Delete a media list
export const deleteMediaList = async (listId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/mediaLists/${listId}`, {
    method: 'DELETE',
    credentials: 'include', // Use cookies for authentication
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete media list');
  }
};

// Get a specific media list by ID
export const getMediaListById = async (listId: string): Promise<MediaListResponse> => {
  const response = await fetch(`${API_BASE_URL}/mediaLists/${listId}`, {
    method: 'GET',
    credentials: 'include', // Use cookies for authentication
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch media list');
  }

  const data = await response.json();
  return data.list;
};

// Add media items to a media list
export const addMediaItemsToList = async (listId: string, itemIds: string[]): Promise<MediaListResponse> => {
  const response = await fetch(`${API_BASE_URL}/mediaLists/${listId}/items`, {
    method: 'POST',
    credentials: 'include', // Use cookies for authentication
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: itemIds }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add items to media list');
  }

  const data = await response.json();
  return data.list;
};

// Remove media items from a media list
export const removeMediaItemsFromList = async (listId: string, itemIds: string[]): Promise<MediaListResponse> => {
  const response = await fetch(`${API_BASE_URL}/mediaLists/${listId}/items`, {
    method: 'DELETE',
    credentials: 'include', // Use cookies for authentication
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: itemIds }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to remove items from media list');
  }

  const data = await response.json();
  return data.list;
};

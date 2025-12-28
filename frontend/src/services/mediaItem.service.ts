const API_BASE_URL = 'http://localhost:5000/api/v1';

// Add tags to a media item
export const addTagsToMediaItem = async (mediaItemId: string, tagIds: string[]): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/mediaItems/${mediaItemId}/tags`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tagIds }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Remove a tag from a media item
export const removeTagFromMediaItem = async (mediaItemId: string, tagId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/mediaItems/${mediaItemId}/tags/${tagId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

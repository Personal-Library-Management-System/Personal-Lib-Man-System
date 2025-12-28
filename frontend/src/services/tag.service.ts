const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

export interface Tag {
  _id: string;
  userId: string;
  name: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTagPayload {
  name: string;
  color?: string;
}

export interface UpdateTagPayload {
  name?: string;
  color?: string;
}

// Get all tags for the authenticated user
export const getAllTags = async (): Promise<Tag[]> => {
  const response = await fetch(`${API_BASE_URL}/tags`, {
    method: 'GET',
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

// Create a new tag
export const createTag = async (payload: CreateTagPayload): Promise<Tag> => {
  const response = await fetch(`${API_BASE_URL}/tags`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Update an existing tag
export const updateTag = async (tagId: string, payload: UpdateTagPayload): Promise<Tag> => {
  const response = await fetch(`${API_BASE_URL}/tags/${tagId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Delete a tag
export const deleteTag = async (tagId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/tags/${tagId}`, {
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
};

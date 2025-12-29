const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

export interface RecommendationOptions {
  useHistory: boolean;
  useRatings: boolean;
  useComments: boolean;
  customPrompt: string;
}

export const getRecommendations = async (options: RecommendationOptions): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/recommendations`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recommendationOptions: options
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

export interface LibraryExportData {
  _id: string;
  email: string;
  name: string;
  mediaItems: any[];
  lists: any[];
  createdAt: string;
  updatedAt: string;
}

// Export user's library data
export const exportLibrary = async (): Promise<LibraryExportData> => {
  const response = await fetch(`${API_BASE_URL}/library/export`, {
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

  const data = await response.json();
  return data.library;
};

// Import library data
export const importLibrary = async (libraryData: {
  mediaItems: any[];
  lists: any[];
}): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/library/import`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(libraryData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Download library data as JSON file
export const downloadLibraryAsJson = async (): Promise<void> => {
  const library = await exportLibrary();
  
  const exportData = {
    mediaItems: library.mediaItems,
    lists: library.lists,
    exportedAt: new Date().toISOString(),
    exportedFrom: 'Personal Library Management System',
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `library-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Parse imported JSON file
export const parseImportFile = (file: File): Promise<{ mediaItems: any[]; lists: any[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate the structure
        if (!data.mediaItems || !Array.isArray(data.mediaItems)) {
          throw new Error('Invalid file format: mediaItems array is required');
        }
        if (!data.lists || !Array.isArray(data.lists)) {
          throw new Error('Invalid file format: lists array is required');
        }
        
        resolve({
          mediaItems: data.mediaItems,
          lists: data.lists,
        });
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to parse file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
      <App />
        </GoogleOAuthProvider>
    </ChakraProvider>
  </StrictMode>
);

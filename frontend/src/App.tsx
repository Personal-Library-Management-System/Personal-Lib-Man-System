// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import LibraryPage from './pages/LibraryPage';
import MoviesPage from './pages/MoviesPage';
// Diğer sayfalar...

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<MainPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Protected Routes - Layout ile */}
        <Route path="/main" element={<MainPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        {/* İleride eklenecekler:
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/account" element={<AccountPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import LibraryPage from './pages/LibraryPage';
import MoviesPage from './pages/MoviesPage';
import MyAccountPage from './pages/MyAccountPage';
import StatisticsPage from './pages/StatisticsPage';
// Diğer sayfalar...

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Protected Routes - Layout ile */}
        <Route path="/main" element={<MainPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/stats" element={<StatisticsPage />} />
        <Route path="/account" element={<MyAccountPage />} />
      </Routes>
    </Router>
  );
}

export default App;
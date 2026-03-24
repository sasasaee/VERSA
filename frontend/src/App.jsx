import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ThemeLamp from './components/ThemeLamp';
import Write from './pages/Write';
import Profile from './pages/Profile';
import About from './pages/About';
import ContestPage from './pages/ContestPage';
import Leaderboard from './pages/Leaderboard';

import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
      <div className="min-h-screen bg-skin-base text-skin-text transition-colors duration-500">
        <ThemeLamp />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/write" element={<Write />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/contest" element={<ContestPage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>
    </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;

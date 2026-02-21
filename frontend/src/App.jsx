import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ThemeLamp from './components/ThemeLamp';
import Write from './pages/Write';
import Profile from './pages/Profile';
import About from './pages/About';

function App() {
  return (
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
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ThemeLamp from './components/ThemeLamp';
import Write from './pages/Write';

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
      </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;
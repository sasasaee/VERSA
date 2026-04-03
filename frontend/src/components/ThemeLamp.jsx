import { useEffect, useState } from 'react';
const ThemeLamp = () => {

  const savedTheme = localStorage.getItem('theme') || 'light';
  const [theme, setTheme] = useState(savedTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const toggleTheme = () => {
    const newTheme = theme == 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); //saves the choice
  };

  return (
    <div className="fixed top-0 left-10 z-50 flex flex-col items-center">
      {/* The Cord */}
      <div className="w-1 h-24 bg-skin-text transition-colors duration-500"></div>

      {/* The Lamp Shade */}
      <button
        onClick={toggleTheme}
        className="relative group focus:outline-none animate-swing origin-top">
        {/* Lamp Body */}
        <div className={`w-16 h-12 rounded-t-full rounded-b-lg shadow-lg transition-colors duration-500 ${theme === 'light' ? 'bg-skin-secondary' : 'bg-skin-accent'}`}></div>

        {/* The Bulb (Glows in dark mode) */}
        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-500 ${theme === 'dark' ? 'bg-yellow-200 shadow-[0_0_20px_5px_rgba(255,255,0,0.5)]' : 'bg-gray-300'}`}></div>

        {/* String Pull (Clickable area) */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-400"></div>
        <div className="absolute top-[3.5rem] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-skin-primary cursor-pointer hover:scale-125 transition-transform"></div>
      </button>
    </div>
  );
};

export default ThemeLamp;
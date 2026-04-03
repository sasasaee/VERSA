import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import SearchBar from './SearchBar';
import SortDropdown from './SortDropdown';

const Navbar = ({ activeTab, setActiveTab, onSearch, sortBy, setSortBy, filterGenre, setFilterGenre, isProfile = false }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const genres = ['All Genres', 'General', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Thriller'];

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/user/profile', {
          headers: { 'x-auth-token': token.replace(/^"|"$/g, '') }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Error fetching navbar user profile:", err);
      }
    };

    fetchUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={`flex items-center justify-between pt-6 mb-8 gap-6 ${isProfile ? 'relative' : ''}`}>

      {isProfile ? (
        <div className="absolute left-[48%] -translate-x-1/2">
          <button
            onClick={() => navigate('/')}
            className="text-2xl font-serif font-black text-skin-primary tracking-tighter hover:text-skin-secondary transition-colors"
          >
            ← VERSA
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-12">
          {/*Toggle Switch */}
          <div className="bg-skin-card rounded-full p-1 flex shadow-inner shrink-0">
            <button
              onClick={() => navigate('/')}
              className={`px-6 py-2 rounded-full font-bold transition-all ${window.location.pathname === '/' ? 'bg-skin-secondary text-white shadow-md' : 'text-skin-muted hover:text-skin-primary'}`}
            >
              Feed
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className={`px-6 py-2 rounded-full font-bold transition-all ${window.location.pathname === '/leaderboard' ? 'bg-skin-secondary text-white shadow-md' : 'text-skin-muted hover:text-skin-primary'}`}
            >
              Leaderboard
            </button>
          </div>

          {/* Search Bar */}
          {onSearch && (
            <div className="w-[450px] hidden lg:block">
              <SearchBar onSearch={onSearch} />
            </div>
          )}

          {/* Unified Nested Sort Dropdown */}
          {sortBy && setSortBy && (
            <SortDropdown
              sortBy={sortBy}
              setSortBy={setSortBy}
              filterGenre={filterGenre}
              setFilterGenre={setFilterGenre}
            />
          )}
        </div>
      )}

      <div className={`flex items-center gap-4 ${isProfile ? 'ml-auto' : ''}`}>
        <div className="bg-skin-card rounded-xl p-2 flex gap-4 shadow-sm">
          {/*Notification bell with dropdown component */}
          <NotificationDropdown />

          <button
            onClick={() => navigate('/about')}
            className="w-8 h-8 rounded-full bg-skin-base hover:bg-skin-primary/20 flex items-center justify-center text-skin-text cursor-pointer transition-all focus:outline-none"
            title="About Us"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </button>

          {!isProfile && (
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-skin-base border-2 border-skin-navbar-border hover:border-skin-primary/40 flex items-center justify-center text-skin-text overflow-hidden transition-all"
              title="Profile"
            >
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center font-bold px-4 h-[48px] rounded-xl transition-all text-xs uppercase tracking-widest text-red-500 hover:bg-red-500/10 border border-red-500/20"
          title="Logout"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;


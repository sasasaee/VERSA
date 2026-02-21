import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import SearchBar from './SearchBar';
import SortDropdown from './SortDropdown';

const Navbar = ({ activeTab, setActiveTab, onSearch, sortBy, setSortBy, filterGenre, setFilterGenre, isProfile = false }) => {
  const navigate = useNavigate();
  const genres = ['All Genres', 'General', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Thriller'];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-between mb-8 gap-6">

      <div className="flex items-center gap-12">
        {isProfile ? (
          <button
            onClick={() => navigate('/')}
            className="text-2xl font-serif font-black text-skin-primary tracking-tighter hover:text-skin-secondary transition-colors"
          >
            VERSA
          </button>
        ) : (
          <>
            {/*Toggle Switch */}
            <div className="bg-skin-card rounded-full p-1 flex shadow-inner shrink-0">
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'feed' ? 'bg-skin-secondary text-white shadow-md' : 'text-skin-muted hover:text-skin-primary'}`}
              >
                Feed
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-skin-secondary text-white shadow-md' : 'text-skin-muted hover:text-skin-primary'}`}
              >
                Leaderboard
              </button>
            </div>

            {/* Search Bar */}
            <div className="w-[450px] hidden lg:block">
              <SearchBar onSearch={onSearch} />
            </div>

            {/* Unified Nested Sort Dropdown */}
            <SortDropdown
              sortBy={sortBy}
              setSortBy={setSortBy}
              filterGenre={filterGenre}
              setFilterGenre={setFilterGenre}
            />
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-skin-card rounded-xl p-2 flex gap-4 shadow-sm">
          {/*Notification bell with dropdown component */}
          <NotificationDropdown />

          <button
            onClick={() => navigate('/about')}
            className="w-8 h-8 rounded-full bg-skin-base hover:bg-skin-primary/20 flex items-center justify-center text-skin-primary cursor-pointer"
            title="About Us"
          >
            ℹ️
          </button>

          <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full bg-skin-base hover:bg-skin-primary/20 flex items-center justify-center text-skin-primary" title="Profile">👤</button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-10 h-10 bg-red-400/20 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center justify-center font-bold"
          title="Logout"
        >
          ➔
        </button>
      </div>
    </div>
  );
};

export default Navbar;

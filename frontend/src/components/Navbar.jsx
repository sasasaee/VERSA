import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem('token');

  const getUserIdFromToken = (token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/me', {
          headers: { 'x-auth-token': token }
        });

        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const currentUserId = getUserIdFromToken(token);

  return (
    <nav className="bg-skin-card shadow-lg rounded-2xl p-4 mb-8 border border-skin-primary/10">
      <div className="flex items-center justify-between">
        <div 
          onClick={() => navigate('/')}
          className="text-2xl font-bold bg-gradient-to-r from-skin-primary to-skin-secondary bg-clip-text text-transparent cursor-pointer hover:scale-110 transition-transform duration-300"
        >
          VERSA
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              setActiveTab && setActiveTab('feed');
              navigate('/');
            }}
            className={`font-medium transition-all duration-300 relative ${
              activeTab === 'feed' 
                ? 'text-skin-primary' 
                : 'text-skin-muted hover:text-skin-primary'
            }`}
          >
            Feed
            {activeTab === 'feed' && (
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-skin-primary rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => navigate('/write')}
            className="font-medium text-skin-muted hover:text-skin-primary transition-colors duration-300"
          >
            Write
          </button>

          <button
            onClick={() => navigate('/about')}
            className="font-medium text-skin-muted hover:text-skin-primary transition-colors duration-300"
          >
            About
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative w-11 h-11 rounded-full bg-gradient-to-br from-skin-primary/30 to-skin-secondary/30 flex items-center justify-center font-bold text-skin-primary border-2 border-skin-primary/40 hover:scale-110 hover:shadow-lg hover:shadow-skin-primary/30 transition-all duration-300 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-skin-primary/20 to-skin-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {currentUser?.profilePicture ? (
                <img 
                  src={currentUser.profilePicture} 
                  alt={currentUser.username} 
                  className="w-full h-full object-cover relative z-10"
                />
              ) : (
                <span className="relative z-10">{currentUser?.username?.[0]?.toUpperCase() || 'U'}</span>
              )}
            </button>

            {showDropdown && (
              <div 
                className="absolute right-0 mt-3 w-56 bg-skin-card rounded-xl shadow-2xl border border-skin-primary/20 py-2 z-50"
                style={{
                  animation: 'dropdown-in 0.2s ease-out forwards'
                }}
              >
                <div className="px-4 py-3 border-b border-skin-muted/20 bg-gradient-to-r from-skin-primary/5 to-skin-secondary/5">
                  <p className="font-bold text-skin-primary text-sm truncate">{currentUser?.username}</p>
                  <p className="text-xs text-skin-muted capitalize">{currentUser?.rank}</p>
                </div>
                
                <button
                  onClick={() => {
                    navigate(`/profile/${currentUserId}`);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 text-skin-text hover:bg-skin-primary/10 transition-all duration-200 text-sm flex items-center gap-3 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-skin-primary group-hover:scale-110 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">My Profile</span>
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-500/10 transition-all duration-200 text-sm flex items-center gap-3 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dropdown-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

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
          className="text-2xl font-bold text-skin-primary cursor-pointer hover:scale-105 transition-transform"
        >
          VERSA
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              setActiveTab && setActiveTab('feed');
              navigate('/');
            }}
            className={`font-medium transition-colors ${
              activeTab === 'feed' 
                ? 'text-skin-primary' 
                : 'text-skin-muted hover:text-skin-primary'
            }`}
          >
            Feed
          </button>

          <button
            onClick={() => navigate('/write')}
            className="font-medium text-skin-muted hover:text-skin-primary transition-colors"
          >
            Write
          </button>

          <button
            onClick={() => navigate('/about')}
            className="font-medium text-skin-muted hover:text-skin-primary transition-colors"
          >
            About
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full bg-skin-primary/20 flex items-center justify-center font-bold text-skin-primary border-2 border-skin-primary/30 hover:scale-110 transition-transform overflow-hidden"
            >
              {currentUser?.profilePicture ? (
                <img 
                  src={currentUser.profilePicture} 
                  alt={currentUser.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUser?.username?.[0]?.toUpperCase() || 'U'
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-skin-card rounded-lg shadow-xl border border-skin-primary/10 py-2 z-50">
                <div className="px-4 py-2 border-b border-skin-muted/20">
                  <p className="font-bold text-skin-primary text-sm">{currentUser?.username}</p>
                  <p className="text-xs text-skin-muted">{currentUser?.rank}</p>
                </div>
                
                <button
                  onClick={() => {
                    navigate(`/profile/${currentUserId}`);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-skin-text hover:bg-skin-primary/10 transition-colors text-sm"
                >
                  My Profile
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-500/10 transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

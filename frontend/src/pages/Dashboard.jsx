import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ContestSidebar from '../components/ContestSidebar';
import QuickWrite from '../components/QuickWrite';
import StoryModal from '../components/StoryModal';
import Toast from '../components/Toast';
import RankUpgradeModal from '../components/RankUpgradeModal';

// Get current user ID to check if we liked the story
const getUserIdFromToken = (token) => {
  if (!token) return null;

  // Clean token
  const cleanToken = token.replace(/^"|"$/g, '');

  try {
    const payload = JSON.parse(atob(cleanToken.split('.')[1]));
    return payload.userId;
  } catch (e) {
    console.error("Dashboard Token parse error:", e);
    return null;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [toast, setToast] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [userSavedStories, setUserSavedStories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterGenre, setFilterGenre] = useState('All Genres');
  const [showRankUpgrade, setShowRankUpgrade] = useState(false);

  // Get token and User ID immediately
  const token = localStorage.getItem('token');
  const currentUserId = getUserIdFromToken(token);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchStories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/stories', {
          headers: { 'x-auth-token': token }
        });

        //Token invalid/expired?
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setStories(data);
        } else {
          console.error("Failed to fetch");
        }
      } catch (err) {
        console.error("Error fetching stories:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/user/profile', {
          headers: { 'x-auth-token': token.replace(/^"|"$/g, '') }
        });
        if (res.ok) {
          const data = await res.json();
          setUserSavedStories(data.savedStories || []);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchStories();
    fetchUserProfile();
  }, [navigate, token]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      const res = await fetch(`http://localhost:5000/api/stories/search?q=${query}`, {
        headers: { 'x-auth-token': token.replace(/^"|"$/g, '') }
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle URL search param
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('search');
    if (query) {
      handleSearch(query);
      // Remove the query param after handling
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleNewStory = (story) => {
    setStories([story, ...stories]);
  };

  const handleSave = async (storyId) => {
    if (!token) return navigate('/login');
    const cleanToken = token.replace(/^"|"$/g, '');

    try {
      const res = await fetch(`http://localhost:5000/api/stories/save/${storyId}`, {
        method: 'POST',
        headers: { 'x-auth-token': cleanToken }
      });

      if (res.ok) {
        const data = await res.json();
        setUserSavedStories(data.savedStories);
        setToast({
          message: data.isSaved ? 'Story saved' : 'Story removed from saves',
          type: 'success'
        });
      }
    } catch (err) {
      console.error("Error saving story:", err);
    }
  };

  const handleDelete = async (storyId) => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    if (!token) return navigate('/login');
    const cleanToken = token.replace(/^"|"$/g, '');

    try {
      const res = await fetch(`http://localhost:5000/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': cleanToken }
      });

      if (res.ok) {
        setStories(stories.filter(s => s._id !== storyId));
        setToast({ message: 'Story deleted successfully', type: 'success' });
      } else {
        const data = await res.json();
        setToast({ message: data.msg || 'Failed to delete story', type: 'error' });
      }
    } catch (err) {
      console.error("Error deleting story:", err);
      setToast({ message: 'Error deleting story', type: 'error' });
    }
  };

  //Handle Like Function 
  const handleLike = async (storyId) => {
    let rawToken = localStorage.getItem('token');

    if (!rawToken) {
      alert("You are not logged in!");
      return;
    }

    const cleanToken = rawToken.replace(/^"|"$/g, '');

    // Check if currently liked
    const story = stories.find(s => String(s._id) === String(storyId));
    const wasLiked = isLiked(story?.upvotes);

    try {
      const res = await fetch(`http://localhost:5000/api/stories/like/${storyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': cleanToken,
          'Authorization': `Bearer ${cleanToken}`
        }
      });

      if (res.status === 401 || res.status === 403) {
        console.error("Token rejected by server.");
        alert("Session expired. Please log in again.");
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();

        let newUpvotes = [];
        if (Array.isArray(data)) newUpvotes = data;
        else if (data.upvotes) newUpvotes = data.upvotes;

        setStories(prevStories =>
          prevStories.map(story =>
            String(story._id) === String(storyId)
              ? { ...story, upvotes: newUpvotes }
              : story
          )
        );

        // Show toast only when unliking
        if (wasLiked) {
          setToast({ message: 'Upvote removed', type: 'info' });
        }
      } else {
        const errData = await res.json();
        console.error("Like failed:", errData);
      }
    } catch (err) {
      console.error("Error liking story:", err);
    }
  };

  //check if liked
  const isLiked = (upvotes) => {
    if (!upvotes || !currentUserId) return false;

    // Force both IDs to strings before comparing
    return upvotes.some(id => String(id) === String(currentUserId));
  };

  // Stop rendering if no token
  if (!token) {
    return null;
  }

  const storiesToDisplay = (() => {
    let list = isSearching ? searchResults : stories;

    // Filter by genre if sortBy is 'genre' AND a specific genre is selected
    if (sortBy === 'genre' && filterGenre !== 'All Genres') {
      list = list.filter(s => (s.genre || 'General') === filterGenre);
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'genre') {
        return (a.genre || '').localeCompare(b.genre || '');
      }
      return 0;
    });
  })();

  return (
    <div className="min-h-screen pt-10 px-4 max-w-7xl mx-auto">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearch={handleSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterGenre={filterGenre}
        setFilterGenre={setFilterGenre}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* LEFT COLUMN: Feed */}
        <div className="lg:col-span-3">
          <QuickWrite
            onStoryPosted={handleNewStory}
            onRankUpgrade={() => setShowRankUpgrade(true)}
          />

          <div className="space-y-8">
            {isSearching && (
              <div className="flex items-center justify-between mb-4 bg-skin-secondary/5 p-4 rounded-xl border border-skin-secondary/10">
                <h2 className="text-xl font-serif font-bold text-skin-primary">
                  Search Results for "{searchQuery}"
                </h2>
                <button
                  onClick={() => { setIsSearching(false); setSearchQuery(''); }}
                  className="text-sm text-skin-muted hover:text-skin-primary underline font-bold"
                >
                  Clear Results
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-skin-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-skin-muted">Searching stories...</p>
              </div>
            ) : storiesToDisplay.length === 0 ? (
              <div className="text-center py-20 bg-skin-muted/5 rounded-3xl border border-dashed border-skin-muted/30">
                <p className="text-skin-muted font-serif italic text-lg">
                  {isSearching ? "No stories found matching your search." : "No stories yet. Be the first!"}
                </p>
              </div>
            ) : (
              storiesToDisplay.map((story) => (
                <div
                  key={story._id}
                  className="bg-skin-card rounded-2xl shadow-lg overflow-hidden border border-transparent hover:shadow-xl transition-shadow"
                >
                  {story.headerImage && (
                    <div className="h-48 w-full overflow-hidden relative bg-skin-muted/20">
                      <img
                        src={story.headerImage}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />

                      {/* Genre Badge on Image */}
                      <div className="absolute top-4 right-4">
                        <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-skin-muted/20">
                          {story.genre || 'General'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="p-6">
                    {/*Author Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (story.author?._id) {
                            navigate(`/profile/${story.author._id}`);
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-full bg-skin-primary/20 flex items-center justify-center font-bold text-skin-primary border-2 border-skin-primary/10 overflow-hidden group-hover:border-skin-secondary transition-colors">
                          {story.author?.profilePicture ? (
                            <img
                              src={story.author.profilePicture}
                              alt={story.author.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            story.author?.username?.[0]?.toUpperCase() || "U"
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-skin-text group-hover:text-skin-secondary transition-colors">
                            {story.author?.username || "Unknown"}
                          </h4>

                          <span className="text-xs text-skin-muted">
                            {story.createdAt
                              ? new Date(story.createdAt).toLocaleDateString()
                              : 'Just now'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 menu-container">
                        {!story.headerImage && (
                          <span className="text-xs font-medium text-skin-muted bg-skin-muted/10 border border-skin-muted/20 px-3 py-1 rounded-full">
                            {story.genre || 'General'}
                          </span>
                        )}

                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === story._id ? null : story._id);
                            }}
                            className="p-1 text-skin-muted hover:text-skin-primary transition-colors focus:outline-none"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                            </svg>
                          </button>

                          {openMenuId === story._id && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-skin-card border border-skin-muted/20 rounded-xl shadow-xl z-[40] py-2 animate-fade-in">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSave(story._id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-skin-text hover:bg-skin-primary/10 transition-colors flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill={userSavedStories.some(id => String(id) === String(story._id)) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                </svg>
                                {userSavedStories.some(id => String(id) === String(story._id)) ? 'Unsave Story' : 'Save Story'}
                              </button>

                              {String(story.author?._id || story.author) === String(currentUserId) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(story._id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
                                  Delete Story
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <h2 className="text-2xl font-serif font-bold text-skin-primary mb-2">
                      {story.title}
                    </h2>

                    <p className="text-skin-text leading-relaxed opacity-80 mb-6 font-serif">
                      {story.segments?.[0]?.content
                        ? story.segments[0].content.substring(0, 150) + "..."
                        : "No preview available."}
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between border-t border-skin-muted/20 pt-4 relative">
                      <div className="flex items-center gap-6">
                        {/* BOOK UPVOTE BUTTON */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (String(story.author?._id) === String(currentUserId)) return;
                            handleLike(story._id);
                          }}
                          disabled={String(story.author?._id) === String(currentUserId)}
                          className={`flex items-center gap-2 group transition-all focus:outline-none ${String(story.author?._id) === String(currentUserId)
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                            }`}
                          title={
                            String(story.author?._id) === String(currentUserId)
                              ? "You cannot upvote your own story"
                              : "Like this story"
                          }
                        >
                          <div className="relative">
                            <div
                              className={`absolute inset-0 bg-skin-secondary/20 rounded-full blur-md transition-opacity duration-500 ${isLiked(story.upvotes)
                                ? "opacity-100 scale-150"
                                : "opacity-0 scale-0"
                                }`}
                            />

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className={`relative z-10 w-6 h-6 transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) ${isLiked(story.upvotes)
                                ? "fill-skin-primary text-skin-primary scale-110"
                                : "fill-none text-skin-muted group-hover:text-skin-primary group-hover:scale-105"
                                }`}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                              />
                            </svg>
                          </div>

                          <span
                            className={`font-medium text-sm transition-colors duration-300 ${isLiked(story.upvotes)
                              ? "text-skin-primary font-bold"
                              : "text-skin-muted"
                              }`}
                          >
                            {story.upvotes?.length || 0}
                          </span>
                        </button>

                        {/* Save Story Toggle (Quick access) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave(story._id);
                          }}
                          className={`flex items-center gap-2 group transition-all focus:outline-none ${userSavedStories.some(id => String(id) === String(story._id)) ? 'text-skin-primary' : 'text-skin-muted hover:text-skin-secondary'}`}
                          title={userSavedStories.some(id => String(id) === String(story._id)) ? "Unsave story" : "Save story"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill={userSavedStories.some(id => String(id) === String(story._id)) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedStoryId(story._id)}
                          className="px-6 py-2 bg-skin-secondary text-white rounded-full font-bold text-sm hover:brightness-110 shadow-md transition-all"
                        >
                          Read & Continue →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 hidden lg:block">
          <ContestSidebar />
        </div>
      </div>

      {/* Popup Modal */}
      {selectedStoryId && (
        <StoryModal
          storyId={selectedStoryId}
          onClose={() => setSelectedStoryId(null)}
          onRankUpgrade={() => setShowRankUpgrade(true)}
        />
      )}

      {/* Rank Upgrade Modal */}
      {showRankUpgrade && (
        <RankUpgradeModal onClose={() => setShowRankUpgrade(false)} />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;

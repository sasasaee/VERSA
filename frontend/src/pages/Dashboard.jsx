import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ContestSidebar from '../components/ContestSidebar';
import QuickWrite from '../components/QuickWrite';
import StoryModal from '../components/StoryModal';

// --- 1. HELPER: Get current user ID to check if we liked the story ---
const getUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch {
    return null;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedStoryId, setSelectedStoryId] = useState(null);

  // Get token and User ID immediately
  const token = localStorage.getItem('token');
  const currentUserId = getUserIdFromToken(token);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchStories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/stories', {
          headers: { 'x-auth-token': token },
        });

        // Security Check
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setStories(data);
        } else {
          console.error('Failed to fetch');
        }
      } catch (err) {
        console.error('Error fetching stories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [navigate, token]);

  const handleNewStory = (story) => {
    setStories([story, ...stories]);
  };

  // --- 2. Handle Like Function ---
  const handleLike = async (storyId) => {
    let rawToken = localStorage.getItem('token');

    if (!rawToken) {
      alert('You are not logged in!');
      return;
    }

    const cleanToken = rawToken.replace(/^"|"$/g, '');

    try {
      const res = await fetch(
        `http://localhost:5000/api/stories/like/${storyId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': cleanToken,
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();

        let newUpvotes = [];
        if (Array.isArray(data)) newUpvotes = data;
        else if (data.upvotes) newUpvotes = data.upvotes;

        setStories((prevStories) =>
          prevStories.map((story) =>
            String(story._id) === String(storyId)
              ? { ...story, upvotes: newUpvotes }
              : story
          )
        );
      } else {
        const errData = await res.json();
        console.error('Like failed:', errData);
      }
    } catch (err) {
      console.error('Error liking story:', err);
    }
  };

  // --- 3. Check If Liked ---
  const isLiked = (upvotes) => {
    if (!upvotes || !currentUserId) return false;
    return upvotes.some(
      (id) => String(id) === String(currentUserId)
    );
  };

  if (!token) return null;

  return (
    <div className="min-h-screen pt-10 px-4 max-w-7xl mx-auto">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-3">
          <QuickWrite onStoryPosted={handleNewStory} />

          <div className="space-y-8">
            {loading ? (
              <p className="text-center text-skin-muted">
                Loading...
              </p>
            ) : stories.length === 0 ? (
              <p className="text-center text-skin-muted">
                No stories yet. Be the first!
              </p>
            ) : (
              stories.map((story) => (
                <div
                  key={story._id}
                  className="bg-skin-card rounded-2xl shadow-lg overflow-hidden border border-skin-primary/10 hover:shadow-xl transition-shadow"
                >
                  {/* Header Image */}
                  {story.headerImage && (
                    <div className="h-48 w-full overflow-hidden relative bg-skin-muted/20">
                      <img
                        src={story.headerImage}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />

                      <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/20">
                        {story.genre || 'General'}
                      </span>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Author */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/profile/${story.author?._id}`
                          );
                        }}
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <div className="w-10 h-10 rounded-full bg-skin-primary/20 flex items-center justify-center font-bold text-skin-primary border-2 border-skin-primary/30 overflow-hidden">
                          {story.author?.profilePicture ? (
                            <img
                              src={story.author.profilePicture}
                              alt={story.author.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            story.author?.username?.[0]?.toUpperCase() ||
                            'U'
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-skin-text hover:text-skin-primary transition-colors">
                            {story.author?.username || 'Unknown'}
                          </h4>

                          <span className="text-xs text-skin-muted">
                            {story.createdAt
                              ? new Date(
                                  story.createdAt
                                ).toLocaleDateString()
                              : 'Just now'}
                          </span>
                        </div>
                      </div>

                      {!story.headerImage && (
                        <span className="text-xs font-medium text-skin-muted bg-skin-muted/10 border border-skin-muted/20 px-3 py-1 rounded-full">
                          {story.genre || 'General'}
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl font-serif font-bold text-skin-primary mb-2">
                      {story.title}
                    </h2>

                    <p className="text-skin-text leading-relaxed opacity-80 mb-6 font-serif">
                      {story.segments?.[0]?.content
                        ? story.segments[0].content.substring(
                            0,
                            150
                          ) + '...'
                        : 'No preview available.'}
                    </p>

                    {/* ACTION BAR */}
                    <div className="flex items-center justify-between border-t border-skin-muted/20 pt-4">
                      {/* LIKE BUTTON */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(story._id);
                        }}
                        className="flex items-center gap-2 group transition-all focus:outline-none"
                        title="Like this story"
                      >
                        <div className="relative">
                          <div
                            className={`absolute inset-0 bg-skin-secondary/20 rounded-full blur-md transition-opacity duration-500 ${
                              isLiked(story.upvotes)
                                ? 'opacity-100 scale-150'
                                : 'opacity-0 scale-0'
                            }`}
                          />

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={`relative z-10 w-6 h-6 transition-all duration-500 ${
                              isLiked(story.upvotes)
                                ? 'fill-skin-secondary text-skin-secondary scale-110'
                                : 'fill-none text-skin-muted group-hover:text-skin-primary group-hover:scale-105'
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
                          className={`font-medium text-sm ${
                            isLiked(story.upvotes)
                              ? 'text-skin-secondary font-bold'
                              : 'text-skin-muted'
                          }`}
                        >
                          {story.upvotes?.length || 0}
                        </span>
                      </button>

                      {/* READ BUTTON */}
                      <button
                        onClick={() =>
                          setSelectedStoryId(story._id)
                        }
                        className="px-6 py-2 bg-skin-secondary text-white rounded-full font-bold text-sm hover:brightness-110 shadow-md transition-all"
                      >
                        Read & Continue →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-1 hidden lg:block">
          <ContestSidebar />
        </div>
      </div>

      {/* STORY MODAL */}
      {selectedStoryId && (
        <StoryModal
          storyId={selectedStoryId}
          onClose={() => setSelectedStoryId(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;

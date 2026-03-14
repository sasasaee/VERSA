import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';

const StoryModal = ({ storyId, onClose, onRankUpgrade }) => {
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [newSegment, setNewSegment] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [userSavedStories, setUserSavedStories] = useState([]);
  const [userSavedSegments, setUserSavedSegments] = useState([]);
  const [toast, setToast] = useState(null);

  // Helper to get clean token
  const getCleanToken = () => {
    const rawToken = localStorage.getItem('token');
    if (!rawToken) return null;
    return rawToken.replace(/^"|"$/g, '');
  };

  // Get current user ID from token
  const currentUserId = (() => {
    const token = getCleanToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (e) {
      console.error("Token parse error:", e);
      return null;
    }
  })();

  // Click outside listener to close menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch full story details when Modal opens
  useEffect(() => {
    const fetchStory = async () => {
      const token = getCleanToken();
      try {
        const res = await fetch(`http://localhost:5000/api/stories/${storyId}`, {
          headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        setStory(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchUserProfile = async () => {
      const token = getCleanToken();
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/user/profile', {
          headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        setUserSavedStories(data.savedStories || []);
        setUserSavedSegments(data.savedSegments || []);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    if (storyId) {
      fetchStory();
      fetchUserProfile();
    }
  }, [storyId]);

  const getWordCount = (str) => {
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleSave = async () => {
    const token = getCleanToken();
    if (!token) return navigate('/login');

    try {
      const res = await fetch(`http://localhost:5000/api/stories/save/${storyId}`, {
        method: 'POST',
        headers: { 'x-auth-token': token }
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

  const handleSaveSegment = async (segmentId) => {
    const token = getCleanToken();
    if (!token) return navigate('/login');

    try {
      const res = await fetch(`http://localhost:5000/api/stories/save-segment/${storyId}/${segmentId}`, {
        method: 'POST',
        headers: { 'x-auth-token': token }
      });

      if (res.ok) {
        const data = await res.json();
        setUserSavedSegments(data.savedSegments);
        setToast({
          message: data.isSaved ? 'Part saved' : 'Part removed from saves',
          type: 'success'
        });
      }
    } catch (err) {
      console.error("Error saving segment:", err);
    }
  };

  const handleDeleteStory = async () => {
    if (!window.confirm("Are you sure you want to delete this entire story?")) return;
    const token = getCleanToken();
    if (!token) return navigate('/login');

    try {
      const res = await fetch(`http://localhost:5000/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });

      if (res.ok) {
        setToast({ message: 'Story deleted successfully', type: 'success' });
        setTimeout(() => onClose(), 1500);
      } else {
        const data = await res.json();
        setToast({ message: data.msg || 'Failed to delete story', type: 'error' });
      }
    } catch (err) {
      console.error("Error deleting story:", err);
    }
  };

  const handleDeleteSegment = async (segmentId) => {
    if (!window.confirm("Are you sure you want to delete this contribution?")) return;
    const token = getCleanToken();
    if (!token) return navigate('/login');

    try {
      const res = await fetch(`http://localhost:5000/api/stories/segment/${storyId}/${segmentId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });

      if (res.ok) {
        const updatedStory = await res.json();
        setStory(updatedStory);
        setToast({ message: 'Contribution removed', type: 'success' });
      } else {
        const data = await res.json();
        setToast({ message: data.msg || 'Failed to delete contribution', type: 'error' });
      }
    } catch (err) {
      console.error("Error deleting contribution:", err);
    }
  };

  const handlePublish = async () => {
    if (getWordCount(newSegment) > 200) {
      return alert("Continuation cannot exceed 200 words.");
    }

    const token = getCleanToken();
    try {
      const res = await fetch(`http://localhost:5000/api/stories/segment/${storyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ content: newSegment })
      });

      if (res.ok) {
        const responseData = await res.json();
        setStory(responseData);
        setNewSegment('');

        if (responseData.rankUpgraded && onRankUpgrade) {
          onRankUpgrade();
        }
      } else {
        const err = await res.json();
        alert(err.msg);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!story) return null;

  const wordCount = getWordCount(newSegment);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-skin-base w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-fade-in-up">

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 left-4 z-10 w-8 h-8 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors">✕</button>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto p-0 flex-1 custom-scrollbar">

          {/* Header Image */}
          <div className="relative h-56">
            {story.headerImage && <img src={story.headerImage} className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-black/40 flex items-end p-6">
              <div className="flex justify-between items-end w-full">
                <h2 className="text-3xl font-serif font-bold text-skin-primary">{story.title}</h2>

                {/* Story Menu */}
                <div className="relative menu-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === 'story-menu' ? null : 'story-menu');
                    }}
                    className="p-2 text-white/70 hover:text-white transition-colors focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                  </button>

                  {openMenuId === 'story-menu' && (
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-skin-card border border-skin-muted/20 rounded-xl shadow-xl z-[60] py-2 animate-fade-in">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave();
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-skin-text hover:bg-skin-primary/10 transition-colors flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill={userSavedStories.some(id => String(id) === String(storyId)) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                        {userSavedStories.some(id => String(id) === String(storyId)) ? 'Unsave Story' : 'Save Story'}
                      </button>

                      {String(story.author?._id || story.author) === String(currentUserId) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStory();
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
          </div>

          <div className="p-8 space-y-6">
            {/* The Chain of Segments */}
            {story.segments.map((seg, index) => (
              <div key={index} className="bg-skin-card p-4 rounded-xl shadow-sm border border-skin-muted/10 relative group">
                <p className="text-skin-text font-serif leading-relaxed whitespace-pre-wrap">{seg.content}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-skin-muted font-bold uppercase tracking-wider">
                    <div className="w-5 h-5 rounded-full bg-skin-primary text-skin-on-primary flex items-center justify-center overflow-hidden">
                      {seg.author?.profilePicture ? (
                        <img src={seg.author.profilePicture} alt={seg.author.username} className="w-full h-full object-cover" />
                      ) : (
                        seg.author?.username?.[0] || 'A'
                      )}
                    </div>
                    {seg.author?.username}
                  </div>

                  {/* Segment Menu - Available for saving; deletion restricted to continuations by author */}
                  <div className="relative menu-container opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === `seg-${index}` ? null : `seg-${index}`);
                      }}
                      className="p-1 text-skin-muted hover:text-skin-primary transition-colors focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                      </svg>
                    </button>

                    {openMenuId === `seg-${index}` && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-skin-card border border-skin-muted/20 rounded-xl shadow-xl z-[60] py-2 animate-fade-in text-left">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveSegment(seg._id);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-skin-text hover:bg-skin-primary/10 transition-colors flex items-center gap-2 font-bold"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill={userSavedSegments.some(id => String(id) === String(seg._id)) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                          </svg>
                          {userSavedSegments.some(id => String(id) === String(seg._id)) ? 'Unsave Part' : 'Save Part'}
                        </button>

                        {String(seg.author?._id || seg.author) === String(currentUserId) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (index === 0) {
                                handleDeleteStory();
                              } else {
                                handleDeleteSegment(seg._id);
                              }
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 font-bold"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            {index === 0 ? 'Delete Entire Story' : 'Delete Part'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* The Continuation Input */}
            <div className="pt-6 border-t border-skin-muted/20">
              {story.isPaused ? (
                <p className="text-center text-red-500 font-bold">⛔ Story Locked by Author</p>
              ) : (
                <div className="bg-skin-secondary/5 p-4 rounded-xl">
                  <h3 className="text-skin-primary font-bold mb-2">Write the next part...</h3>
                  <textarea
                    value={newSegment}
                    onChange={(e) => setNewSegment(e.target.value)}
                    className="w-full h-24 bg-transparent border-b border-skin-muted focus:border-skin-secondary outline-none text-skin-text resize-none"
                    placeholder="Continue the story (Max 200 words)..."
                  ></textarea>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs ${wordCount > 200 ? 'text-red-500 font-bold' : 'text-skin-muted'}`}>
                      {wordCount}/200 words
                    </span>
                    <button
                      onClick={handlePublish}
                      disabled={wordCount > 200}
                      className={`px-4 py-2 bg-skin-secondary text-white rounded-lg font-bold hover:shadow-lg transition-all text-sm ${wordCount > 200 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Publish
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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

export default StoryModal;

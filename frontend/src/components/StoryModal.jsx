import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';
import UserListModal from './UserListModal';

const StoryModal = ({ storyId, onClose, onRankUpgrade }) => {
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [newSegment, setNewSegment] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [userSavedStories, setUserSavedStories] = useState([]);
  const [userSavedSegments, setUserSavedSegments] = useState([]);
  const [toast, setToast] = useState(null);

  // Liker State
  const [showLikersModal, setShowLikersModal] = useState(false);
  const [likersList, setLikersList] = useState([]);
  const [likersLoading, setLikersLoading] = useState(false);

  // Edit state
  const [editingSegmentId, setEditingSegmentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editFirstContent, setEditFirstContent] = useState('');

  const getCleanToken = () => {
    const rawToken = localStorage.getItem('token');
    if (!rawToken) return null;
    return rawToken.replace(/^"|"$/g, '');
  };

  const currentUserId = (() => {
    const token = getCleanToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (e) {
      return null;
    }
  })();

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

  const getWordCount = (str) => str.trim().split(/\s+/).filter(Boolean).length;

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
        setToast({ message: data.isSaved ? 'Story saved' : 'Story removed from saves', type: 'success' });
      }
    } catch (err) { console.error(err); }
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
        setToast({ message: data.isSaved ? 'Part saved' : 'Part removed from saves', type: 'success' });
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteStory = async () => {
    if (!window.confirm("Are you sure you want to delete this entire story?")) return;
    const token = getCleanToken();
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
        setToast({ message: data.msg || 'Failed to delete', type: 'error' });
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteSegment = async (segmentId) => {
    if (!window.confirm("Are you sure you want to delete this contribution?")) return;
    const token = getCleanToken();
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
        setToast({ message: data.msg || 'Failed to delete', type: 'error' });
      }
    } catch (err) { console.error(err); }
  };

  const handleEditStoryStart = () => {
    setEditTitle(story.title);
    setEditGenre(story.genre);
    setEditFirstContent(story.segments[0]?.content || '');
    setIsEditingStory(true);
    setOpenMenuId(null);
  };

  const handleEditStorySave = async () => {
    const token = getCleanToken();
    try {
      const res = await fetch(`http://localhost:5000/api/stories/edit/${storyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ title: editTitle, genre: editGenre, content: editFirstContent })
      });
      if (res.ok) {
        const updated = await res.json();
        setStory(updated);
        setIsEditingStory(false);
        setToast({ message: 'Story updated!', type: 'success' });
      } else {
        const data = await res.json();
        setToast({ message: data.msg || 'Failed to update', type: 'error' });
      }
    } catch (err) { console.error(err); }
  };

  const handleEditSegmentStart = (seg) => {
    setEditingSegmentId(String(seg._id));
    setEditingContent(seg.content);
    setOpenMenuId(null);
  };

  const handleEditSegmentSave = async (segmentId) => {
    const token = getCleanToken();
    try {
      const res = await fetch(`http://localhost:5000/api/stories/segment/edit/${storyId}/${segmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ content: editingContent })
      });
      if (res.ok) {
        const updated = await res.json();
        setStory(updated);
        setEditingSegmentId(null);
        setEditingContent('');
        setToast({ message: 'Contribution updated!', type: 'success' });
      } else {
        const data = await res.json();
        setToast({ message: data.msg || 'Failed to update', type: 'error' });
      }
    } catch (err) { console.error(err); }
  };

  const handleSegmentLike = async (segmentId) => {
    const token = getCleanToken();
    if (!token) return navigate('/login');
    try {
      const res = await fetch(`http://localhost:5000/api/stories/segment/like/${storyId}/${segmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token }
      });
      if (res.ok) {
        const newUpvotes = await res.json();
        setStory(prev => ({
          ...prev,
          segments: prev.segments.map(seg =>
            String(seg._id) === String(segmentId)
              ? { ...seg, upvotes: newUpvotes }
              : seg
          )
        }));
      } else {
        const data = await res.json();
        setToast({ message: data.msg, type: 'info' });
      }
    } catch (err) { console.error(err); }
  };

  const fetchSegmentLikers = async (segmentId) => {
    try {
      setLikersLoading(true);
      setShowLikersModal(true);
      const token = getCleanToken();
      const res = await fetch(`http://localhost:5000/api/stories/${storyId}/segment/${segmentId}/likers`, {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setLikersList(data);
      }
    } catch (err) {
      console.error("Error fetching segment likers:", err);
    } finally {
      setLikersLoading(false);
    }
  };

  const handlePublish = async () => {
    if (getWordCount(newSegment) > 200) return alert("Continuation cannot exceed 200 words.");
    const token = getCleanToken();
    try {
      const res = await fetch(`http://localhost:5000/api/stories/segment/${storyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ content: newSegment })
      });
      if (res.ok) {
        const responseData = await res.json();
        setStory(responseData);
        setNewSegment('');
        if (responseData.rankUpgraded && onRankUpgrade) onRankUpgrade();
      } else {
        const err = await res.json();
        alert(err.msg);
      }
    } catch (error) { console.error(error); }
  };

  if (!story) return null;

  const wordCount = getWordCount(newSegment);
  const isStoryAuthor = String(story.author?._id || story.author) === String(currentUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-skin-base w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-fade-in-up">

        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-8 h-8 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
        >
          ✕
        </button>

        <div className="overflow-y-auto p-0 flex-1 custom-scrollbar">

          {/* Header Image */}
          <div className="relative h-56">
            {story.headerImage && (
              <img src={story.headerImage} className="w-full h-full object-cover" alt={story.title} />
            )}
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
                        onClick={(e) => { e.stopPropagation(); handleSave(); setOpenMenuId(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-skin-text hover:bg-skin-primary/10 transition-colors flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill={userSavedStories.some(id => String(id) === String(storyId)) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                        {userSavedStories.some(id => String(id) === String(storyId)) ? 'Unsave Story' : 'Save Story'}
                      </button>

                      {isStoryAuthor && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditStoryStart(); }}
                          className="w-full text-left px-4 py-2 text-sm text-skin-text hover:bg-skin-primary/10 transition-colors flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                          Edit Story
                        </button>
                      )}

                      {isStoryAuthor && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteStory(); setOpenMenuId(null); }}
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

            {/* Edit Story Form */}
            {isEditingStory && (
              <div className="bg-skin-card border-2 border-skin-primary/30 rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-skin-primary text-lg">Edit Story</h3>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Story title..."
                  className="w-full p-3 bg-skin-base border border-skin-muted/30 rounded-lg text-skin-text focus:outline-none focus:border-skin-primary"
                />
                <select
                  value={editGenre}
                  onChange={(e) => setEditGenre(e.target.value)}
                  className="w-full p-3 bg-skin-base border border-skin-muted/30 rounded-lg text-skin-text focus:outline-none focus:border-skin-primary"
                >
                  {['General', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Thriller', 'Others'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <textarea
                  value={editFirstContent}
                  onChange={(e) => setEditFirstContent(e.target.value)}
                  rows={5}
                  placeholder="Story content..."
                  className="w-full p-3 bg-skin-base border border-skin-muted/30 rounded-lg text-skin-text focus:outline-none focus:border-skin-primary resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleEditStorySave}
                    className="px-5 py-2 bg-skin-secondary text-white rounded-lg font-bold hover:brightness-110 transition-all text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditingStory(false)}
                    className="px-5 py-2 bg-skin-muted/20 text-skin-text rounded-lg font-bold hover:bg-skin-muted/30 transition-all text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Segments */}
            {story.segments.map((seg, index) => (
              <div key={index} className="bg-skin-card p-4 rounded-xl shadow-sm border border-skin-muted/10 relative group">

                {/* Edit Segment Form */}
                {editingSegmentId === String(seg._id) ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={4}
                      className="w-full p-3 bg-skin-base border border-skin-muted/30 rounded-lg text-skin-text focus:outline-none focus:border-skin-primary resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSegmentSave(seg._id)}
                        className="px-4 py-1.5 bg-skin-secondary text-white rounded-lg font-bold text-xs hover:brightness-110 transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditingSegmentId(null); setEditingContent(''); }}
                        className="px-4 py-1.5 bg-skin-muted/20 text-skin-text rounded-lg font-bold text-xs hover:bg-skin-muted/30 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-skin-text font-serif leading-relaxed whitespace-pre-wrap">{seg.content}</p>
                    {seg.editedAt && (
                      <p className="text-xs text-skin-muted mt-1 italic">edited</p>
                    )}
                  </>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">

                    {/* Author */}
                    <div
                      className="flex items-center gap-2 text-xs text-skin-muted font-bold uppercase tracking-wider cursor-pointer hover:text-skin-primary transition-colors"
                      onClick={() => { onClose(); navigate(`/profile/${seg.author?._id}`); }}
                    >
                      <div className="w-5 h-5 rounded-full bg-skin-primary text-skin-on-primary flex items-center justify-center overflow-hidden">
                        {seg.author?.profilePicture ? (
                          <img src={seg.author.profilePicture} alt={seg.author.username} className="w-full h-full object-cover" />
                        ) : (
                          seg.author?.username?.[0] || 'A'
                        )}
                      </div>
                      {seg.author?.username}
                    </div>

                    {/* Segment Upvote Button & Likers Count */}
                    <div className="flex items-center gap-1">
                      {String(seg.author?._id || seg.author) !== String(currentUserId) && (
                        <button
                          onClick={() => handleSegmentLike(seg._id)}
                          className="group/like transition-all focus:outline-none"
                          title="Upvote this part"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={`w-4 h-4 transition-all duration-300 ${seg.upvotes?.some(id => String(id) === String(currentUserId))
                              ? 'fill-skin-primary text-skin-primary scale-110'
                              : 'fill-none text-skin-muted group-hover/like:text-skin-primary'
                              }`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                          </svg>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchSegmentLikers(seg._id);
                        }}
                        className={`flex items-center gap-1 hover:bg-skin-primary/5 px-2 py-0.5 rounded-full transition-colors group/likers ${seg.upvotes?.some(id => String(id) === String(currentUserId)) ? 'text-skin-primary font-bold' : 'text-skin-muted group-hover/likers:text-skin-primary'}`}
                        title="See who liked this part"
                      >
                        <span className="text-xs font-bold">
                          {seg.upvotes?.length || 0}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Segment Menu */}
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
                      <div className="absolute right-0 top-full mt-1 w-44 bg-skin-card border border-skin-muted/20 rounded-xl shadow-xl z-[60] py-2 animate-fade-in text-left">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSaveSegment(seg._id); setOpenMenuId(null); }}
                          className="w-full text-left px-4 py-2 text-xs text-skin-text hover:bg-skin-primary/10 transition-colors flex items-center gap-2 font-bold"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill={userSavedSegments.some(id => String(id) === String(seg._id)) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                          </svg>
                          {userSavedSegments.some(id => String(id) === String(seg._id)) ? 'Unsave Part' : 'Save Part'}
                        </button>

                        {String(seg.author?._id || seg.author) === String(currentUserId) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditSegmentStart(seg); }}
                            className="w-full text-left px-4 py-2 text-xs text-skin-text hover:bg-skin-primary/10 transition-colors flex items-center gap-2 font-bold"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                            </svg>
                            Edit Part
                          </button>
                        )}

                        {String(seg.author?._id || seg.author) === String(currentUserId) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (index === 0) { handleDeleteStory(); } else { handleDeleteSegment(seg._id); }
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

            {/* Continuation Input */}
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

      <UserListModal
        isOpen={showLikersModal}
        onClose={() => setShowLikersModal(false)}
        title="Liked By"
        users={likersList}
        loading={likersLoading}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default StoryModal;
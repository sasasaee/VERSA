import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import SortDropdown from '../components/SortDropdown';
import StoryModal from '../components/StoryModal';
import Toast from '../components/Toast';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        bio: ''
    });
    const [uploading, setUploading] = useState(false);

    const [toast, setToast] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [userSavedStories, setUserSavedStories] = useState([]);
    const [stories, setStories] = useState([]);
    const [storiesLoading, setStoriesLoading] = useState(true);
    const [activeStoryTab, setActiveStoryTab] = useState('my-stories');
    const [selectedStoryId, setSelectedStoryId] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
    const [filterGenre, setFilterGenre] = useState('All Genres');
    const [savedStoriesData, setSavedStoriesData] = useState([]);
    const [savedSegmentsData, setSavedSegmentsData] = useState([]);

    // Follower State
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [followersList, setFollowersList] = useState([]);
    const [followingList, setFollowingList] = useState([]);

    const { id } = useParams(); // Get ID from URL
    const navigate = useNavigate();

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
            return payload.userId || payload.id;
        } catch (e) {
            console.error("Token parse error:", e);
            return null;
        }
    })();

    const isOwnProfile = !id || id === currentUserId;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.menu-container')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleTabChange = (tab) => {
        if (tab === 'feed') navigate('/');
    };

    const fetchProfile = async () => {
        try {
            const token = getCleanToken();
            const endpoint = id
                ? `http://localhost:5000/api/user/${id}` //if there's an id view someone else's profile
                : 'http://localhost:5000/api/user/profile'; //if no id, view own profile

            const res = await axios.get(endpoint, {
                headers: { 'x-auth-token': token }
            });
            setUser(res.data);
            setUserSavedStories(res.data.savedStories || []);
            
            setFollowersCount(res.data.followers?.length || 0);
            setFollowingCount(res.data.following?.length || 0);
            
            if (id && currentUserId) {
                setIsFollowing(res.data.followers?.some(fid => fid.toString() === currentUserId.toString()));
            }

            if (!id) {
                setFormData({
                    username: res.data.username,
                    bio: res.data.bio || ''
                });
            }
            setLoading(false);
        } catch (err) {
            console.error("Profile Fetch Error:", err);
            setError('Failed to load profile');
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        const token = getCleanToken();
        if (!token) return navigate('/login');
        if (!id) return;

        setFollowLoading(true);
        try {
            const res = await axios.post(`http://localhost:5000/api/follow/${id}`, {}, {
                headers: { 'x-auth-token': token }
            });
            setIsFollowing(res.data.isFollowing);
            setFollowersCount(res.data.followersCount);
            setToast({
                message: res.data.isFollowing ? `You are now following ${user.username}` : `Unfollowed ${user.username}`,
                type: 'success'
            });
        } catch (err) {
            console.error("Follow error:", err);
            setToast({ message: 'Error updating follow status', type: 'error' });
        } finally {
            setFollowLoading(false);
        }
    };

    const fetchFollowers = async () => {
        try {
            const token = getCleanToken();
            const res = await axios.get(`http://localhost:5000/api/follow/followers/${id || currentUserId}`, {
                headers: { 'x-auth-token': token }
            });
            setFollowersList(res.data);
        } catch (err) {
            console.error("Error fetching followers:", err);
        }
    };

    const fetchFollowing = async () => {
        try {
            const token = getCleanToken();
            const res = await axios.get(`http://localhost:5000/api/follow/following/${id || currentUserId}`, {
                headers: { 'x-auth-token': token }
            });
            setFollowingList(res.data);
        } catch (err) {
            console.error("Error fetching following:", err);
        }
    };

    useEffect(() => {
        if (showFollowersModal) fetchFollowers();
    }, [showFollowersModal]);

    useEffect(() => {
        if (showFollowingModal) fetchFollowing();
    }, [showFollowingModal]);

    const fetchUserStories = async () => {
        try {
            setStoriesLoading(true);
            const token = getCleanToken();

            let userIdToFetch = id || currentUserId;

            if (userIdToFetch) {
                const res = await axios.get(`http://localhost:5000/api/stories/user/${userIdToFetch}`, {
                    headers: { 'x-auth-token': token }
                });
                setStories(res.data);
            }
            setStoriesLoading(false);
        } catch (err) {
            console.error("DEBUG [Profile]: Error fetching stories:", err);
            setStoriesLoading(false);
        }
    };
    const fetchSavedItems = async () => {
        try {
            setStoriesLoading(true);
            const token = getCleanToken();
            const res = await axios.get('http://localhost:5000/api/user/saved', {
                headers: { 'x-auth-token': token }
            });
            setSavedStoriesData(res.data.savedStories || []);
            setSavedSegmentsData(res.data.savedSegments || []);
            setStoriesLoading(false);
        } catch (err) {
            console.error("Error fetching saved items:", err);
            setStoriesLoading(false);
        }
    };

    useEffect(() => {
        if (activeStoryTab === 'saved') {
            fetchSavedItems();
        }
    }, [activeStoryTab]);

    useEffect(() => {
        const init = async () => {
            await fetchProfile();
            await fetchUserStories();
        };
        init();
    }, [id]);

    const handleSave = async (storyId) => {
        const token = getCleanToken();
        if (!token) return navigate('/login');

        try {
            const res = await axios.post(`http://localhost:5000/api/stories/save/${storyId}`, {}, {
                headers: { 'x-auth-token': token }
            });

            if (res.status === 200) {
                setUserSavedStories(res.data.savedStories);

                // If we are on the 'saved' tab and just unsaved, remove it from the local data list immediately
                if (activeStoryTab === 'saved' && !res.data.isSaved) {
                    setSavedStoriesData(prev => prev.filter(s => s._id !== storyId));
                }

                setToast({
                    message: res.data.isSaved ? 'Story saved' : 'Story removed from saves',
                    type: 'success'
                });
            }
        } catch (err) {
            console.error("Error saving story:", err);
        }
    };

    const handleDelete = async (storyId) => {
        if (!window.confirm("Are you sure you want to delete this story?")) return;
        const token = getCleanToken();
        if (!token) return navigate('/login');

        try {
            const res = await fetch(`http://localhost:5000/api/stories/${storyId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
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

    const filteredStories = stories.filter(story => {
        const profileUserIdStr = String(id || currentUserId);
        const authorIdStr = String(story.author?._id || story.author);

        const isAuthor = authorIdStr === profileUserIdStr;

        if (activeStoryTab === 'my-stories') {
            return isAuthor;
        } else {
            // user is in segments but is NOT the author
            return !isAuthor;
        }
    });

    const itemsToDisplay = (() => {
        let list = [];
        if (activeStoryTab === 'saved') {
            list = [...savedStoriesData];
        } else {
            list = [...filteredStories];
        }

        // Filter by genre if sortBy is 'genre' AND a specific genre is selected
        if (sortBy === 'genre' && filterGenre !== 'All Genres') {
            list = list.filter(s => (s.genre || 'General') === filterGenre);
        }

        return list.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'genre') return (a.genre || '').localeCompare(b.genre || '');
            return 0;
        });
    })();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = getCleanToken();
            const res = await axios.put('http://localhost:5000/api/user/profile', formData, {
                headers: { 'x-auth-token': token }
            });
            setUser(res.data);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            setError('Failed to update profile');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataObj = new FormData();
        formDataObj.append('profilePicture', file);
        setUploading(true);

        try {
            const token = getCleanToken();
            const res = await axios.post('http://localhost:5000/api/user/profile/picture', formDataObj, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUser({ ...user, profilePicture: res.data.profilePicture });
            setUploading(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to upload image');
            setUploading(false);
        }
    };

    if (loading) return <div className="text-center text-skin-base mt-20 p-10"><div className="animate-spin w-8 h-8 border-4 border-skin-primary border-t-transparent rounded-full mx-auto mb-4"></div>Loading...</div>;
    if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-skin-base text-skin-text pb-20 pt-10">
            <div className="max-w-4xl mx-auto px-4">
                <Navbar isProfile={true} />

                <div className="space-y-8 mt-4">
                    {/*Profile Header Card */}
                    <div className="bg-skin-card rounded-2xl p-8 shadow-lg border border-skin-muted/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-skin-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-skin-primary/20 shadow-inner relative bg-skin-muted/10 group">
                                    {user.profilePicture ? (
                                        <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">👤</div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold">Uploading...</div>
                                    )}
                                </div>

                                {!id && (
                                    <label className="cursor-pointer bg-skin-base border border-skin-muted/30 text-skin-text py-1.5 px-4 rounded-full text-xs font-bold hover:border-skin-primary transition-all shadow-sm">
                                        Change Picture
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                )}
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-4">
                                {!isEditing ? (
                                    <>
                                        <div className="flex items-center justify-center md:justify-start gap-4">
                                            <h1 className="text-4xl font-serif font-bold text-skin-primary">{user.username}</h1>
                                            <span className="px-3 py-1 bg-skin-secondary/10 text-skin-secondary rounded-full text-xs font-bold uppercase tracking-widest border border-skin-secondary/20">
                                                {user.rank || 'beginner'}
                                            </span>
                                        </div>

                                        <p className="text-skin-text/70 italic text-lg max-w-lg leading-relaxed">
                                            "{user.bio || "Waiting for the first right line..."}"
                                        </p>

                                        <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                                            <div className="text-center border-r border-skin-muted/20 pr-6">
                                                <p className="text-2xl font-bold text-skin-primary">
                                                    {stories.filter(s => String(s.author?._id || s.author) === String(id || currentUserId)).length}
                                                </p>
                                                <p className="text-xs text-skin-muted uppercase tracking-tighter">Stories</p>
                                            </div>
                                            <div 
                                                className="text-center border-r border-skin-muted/20 pr-6 cursor-pointer hover:opacity-70 transition-opacity"
                                                onClick={() => setShowFollowersModal(true)}
                                            >
                                                <p className="text-2xl font-bold text-skin-primary">{followersCount}</p>
                                                <p className="text-xs text-skin-muted uppercase tracking-tighter">Followers</p>
                                            </div>
                                            <div 
                                                className="text-center border-r border-skin-muted/20 pr-6 cursor-pointer hover:opacity-70 transition-opacity"
                                                onClick={() => setShowFollowingModal(true)}
                                            >
                                                <p className="text-2xl font-bold text-skin-primary">{followingCount}</p>
                                                <p className="text-xs text-skin-muted uppercase tracking-tighter">Following</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-skin-primary">{user.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</p>
                                                <p className="text-xs text-skin-muted uppercase tracking-tighter">Joined</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-6">
                                            {!id ? (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="bg-skin-primary text-skin-on-primary px-8 py-2.5 rounded-full hover:brightness-110 transition-all font-bold shadow-md active:scale-95"
                                                >
                                                    Edit Profile
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleFollow}
                                                    disabled={followLoading}
                                                    className={`px-8 py-2.5 rounded-full font-bold shadow-md active:scale-95 transition-all flex items-center gap-2 ${
                                                        isFollowing 
                                                        ? 'bg-skin-muted/20 text-skin-text hover:bg-red-500/10 hover:text-red-500 border border-skin-muted/30' 
                                                        : 'bg-skin-primary text-skin-on-primary hover:brightness-110'
                                                    }`}
                                                >
                                                    {followLoading ? (
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                    ) : isFollowing ? (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                                <path fillRule="evenodd" d="M19.91 4.146a.75.75 0 01.09 1.053l-9 10a.75.75 0 01-1.082.028l-4-4a.75.75 0 011.06-1.06l3.435 3.434 8.444-9.382a.75.75 0 011.053-.09z" clipRule="evenodd" />
                                                            </svg>
                                                            Following
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                                <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                                                            </svg>
                                                            Follow
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto md:mx-0">
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="w-full bg-skin-base border border-skin-muted/20 rounded-xl p-3 focus:outline-none focus:border-skin-primary text-xl font-bold font-serif shadow-sm"
                                            placeholder="Username"
                                        />
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full bg-skin-base border border-skin-muted/20 rounded-xl p-3 focus:outline-none focus:border-skin-primary text-skin-text leading-relaxed shadow-sm resize-none"
                                            placeholder="Tell your story..."
                                        />
                                        <div className="flex gap-3">
                                            <button type="submit" className="bg-skin-primary text-skin-on-primary px-6 py-2 rounded-full font-bold shadow-md hover:brightness-110">Save</button>
                                            <button type="button" onClick={() => setIsEditing(false)} className="text-skin-muted hover:text-skin-text font-medium px-4">Cancel</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stories Dashboard */}
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-skin-muted/20 pb-4">
                            <div className="flex gap-8">
                                <button
                                    onClick={() => setActiveStoryTab('my-stories')}
                                    className={`pb-3 text-sm font-bold uppercase tracking-widest transition-all relative ${activeStoryTab === 'my-stories' ? 'text-skin-primary' : 'text-skin-muted hover:text-skin-text'}`}
                                >
                                    {id ? `${user.username}'s Stories` : "My Stories"}
                                    {activeStoryTab === 'my-stories' && <div className="absolute bottom-0 left-0 w-full h-1 bg-skin-primary rounded-t-full"></div>}
                                </button>
                                <button
                                    onClick={() => setActiveStoryTab('contributions')}
                                    className={`pb-3 text-sm font-bold uppercase tracking-widest transition-all relative ${activeStoryTab === 'contributions' ? 'text-skin-primary' : 'text-skin-muted hover:text-skin-text'}`}
                                >
                                    Contributions
                                    {activeStoryTab === 'contributions' && <div className="absolute bottom-0 left-0 w-full h-1 bg-skin-primary rounded-t-full"></div>}
                                </button>

                                {/* Only show Saved tab on own profile */}
                                {isOwnProfile && (
                                    <button
                                        onClick={() => setActiveStoryTab('saved')}
                                        className={`pb-3 text-sm font-bold uppercase tracking-widest transition-all relative ${activeStoryTab === 'saved' ? 'text-skin-primary' : 'text-skin-muted hover:text-skin-text'}`}
                                    >
                                        Saved Stories
                                        {activeStoryTab === 'saved' && <div className="absolute bottom-0 left-0 w-full h-1 bg-skin-primary rounded-t-full"></div>}
                                    </button>
                                )}
                            </div>

                            {/* Profile Specific sorting dropdown */}
                            <SortDropdown
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                filterGenre={filterGenre}
                                setFilterGenre={setFilterGenre}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {storiesLoading ? (
                                <div className="col-span-full py-20 text-center text-skin-muted flex flex-col items-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-skin-primary border-t-transparent rounded-full mb-2"></div>
                                    Loading content...
                                </div>
                            ) : (itemsToDisplay.length === 0 && (activeStoryTab !== 'saved' || savedSegmentsData.length === 0)) ? (
                                <div className="col-span-full py-20 text-center bg-skin-muted/5 rounded-3xl border border-dashed border-skin-muted/30">
                                    <p className="text-skin-muted font-serif italic text-lg">No content found in this category.</p>
                                </div>
                            ) : (
                                <>
                                    {itemsToDisplay.map(story => (
                                        <div
                                            key={story._id}
                                            className="group bg-skin-card rounded-2xl overflow-hidden border border-skin-muted/20 hover:border-skin-primary/30 hover:shadow-xl transition-all duration-300 relative"
                                        >
                                            {story.headerImage && (
                                                <div className="h-32 w-full overflow-hidden cursor-pointer" onClick={() => setSelectedStoryId(story._id)}>
                                                    <img src={story.headerImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                </div>
                                            )}
                                            <div className="p-5 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <span className="px-2 py-0.5 bg-skin-primary/10 text-skin-primary text-[10px] font-bold uppercase rounded-md border border-skin-muted/10">
                                                        {story.genre || 'General'}
                                                    </span>

                                                    <div className="flex items-center gap-2 menu-container">
                                                        <span className="text-[10px] text-skin-muted font-medium">
                                                            {new Date(story.updatedAt).toLocaleDateString()}
                                                        </span>

                                                        <div className="relative">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenMenuId(openMenuId === story._id ? null : story._id);
                                                                }}
                                                                className="p-1 text-skin-muted hover:text-skin-primary transition-colors focus:outline-none"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                                                                </svg>
                                                            </button>

                                                            {openMenuId === story._id && (
                                                                <div className="absolute right-0 top-full mt-1 w-48 bg-skin-card border border-skin-muted/20 rounded-xl shadow-xl z-[40] py-2 animate-fade-in text-left">
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
                                                <h3 className="text-xl font-serif font-bold text-skin-primary group-hover:text-skin-secondary transition-colors line-clamp-1 cursor-pointer" onClick={() => setSelectedStoryId(story._id)}>{story.title}</h3>
                                                <p className="text-sm text-skin-text/60 line-clamp-2 leading-relaxed cursor-pointer" onClick={() => setSelectedStoryId(story._id)}>
                                                    {story.segments?.[0]?.content || "No content yet."}
                                                </p>
                                                <div className="flex items-center justify-between pt-2 border-t border-skin-muted/10">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-skin-primary/10 flex items-center justify-center text-[10px] text-skin-primary font-bold">
                                                            {story.segments?.length || 0}
                                                        </div>
                                                        <span className="text-[10px] text-skin-muted uppercase font-bold tracking-tight">Segments</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Saved Segments Section */}
                                    {activeStoryTab === 'saved' && savedSegmentsData.length > 0 && (
                                        <div className="col-span-full pt-10 space-y-6">
                                            <h3 className="text-lg font-bold text-skin-primary uppercase tracking-wider border-b border-skin-primary/20 pb-2">Saved Segments</h3>
                                            <div className="space-y-4">
                                                {savedSegmentsData.map(segment => (
                                                    <div key={segment._id} className="bg-skin-card p-6 rounded-2xl border border-skin-muted/10 hover:border-skin-primary/30 transition-all group">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className="text-xs font-bold text-skin-muted uppercase">From: <span className="text-skin-secondary">{segment.storyTitle}</span></span>
                                                            <button
                                                                onClick={() => setSelectedStoryId(segment.storyId)}
                                                                className="text-xs font-black text-skin-primary hover:text-skin-secondary transition-colors uppercase tracking-widest"
                                                            >
                                                                View Full Story →
                                                            </button>
                                                        </div>
                                                        <p className="text-skin-text/80 italic font-serif leading-relaxed border-l-4 border-skin-primary/20 pl-4 py-1">
                                                            "{segment.content}"
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Popup Modal */}
                {selectedStoryId && (
                    <StoryModal
                        storyId={selectedStoryId}
                        onClose={() => setSelectedStoryId(null)}
                    />
                )}

                {/* Followers/Following Modals */}
                <FollowListModal 
                    isOpen={showFollowersModal}
                    onClose={() => setShowFollowersModal(false)}
                    title="Followers"
                    users={followersList}
                />
                <FollowListModal 
                    isOpen={showFollowingModal}
                    onClose={() => setShowFollowingModal(false)}
                    title="Following"
                    users={followingList}
                />

                {/* Toast Notification */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        </div>
    );
};

const FollowListModal = ({ isOpen, onClose, title, users }) => {
    const navigate = useNavigate();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div 
                className="bg-skin-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-modal-pop"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-skin-muted/10 flex justify-between items-center bg-skin-primary/5">
                    <h3 className="text-xl font-serif font-bold text-skin-primary">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-skin-primary/10 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
                    {users.length === 0 ? (
                        <div className="py-10 text-center text-skin-muted italic font-serif">
                            No users found.
                        </div>
                    ) : (
                        users.map(user => (
                            <div 
                                key={user._id} 
                                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-skin-primary/5 transition-all cursor-pointer group"
                                onClick={() => {
                                    onClose();
                                    navigate(`/profile/${user._id}`);
                                }}
                            >
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-skin-primary/10 group-hover:border-skin-primary/30 transition-colors">
                                    {user.profilePicture ? (
                                        <img src={user.profilePicture} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-skin-muted/10 text-skin-primary font-bold">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-skin-text group-hover:text-skin-primary transition-colors">{user.username}</p>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-skin-muted">{user.rank || 'beginner'}</span>
                                </div>
                                <div className="text-skin-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;

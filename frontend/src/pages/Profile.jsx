import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import StoryModal from '../components/StoryModal';

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

    const [stories, setStories] = useState([]);
    const [storiesLoading, setStoriesLoading] = useState(true);
    const [activeStoryTab, setActiveStoryTab] = useState('my-stories');
    const [selectedStoryId, setSelectedStoryId] = useState(null);

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
            return payload.userId;
        } catch (e) {
            console.error("Token parse error:", e);
            return null;
        }
    })();

    const handleTabChange = (tab) => {
        if (tab === 'feed') navigate('/');
    };

    useEffect(() => {
        const init = async () => {
            await fetchProfile();
            await fetchUserStories();
        };
        init();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const token = getCleanToken();
            const endpoint = id
                ? `http://localhost:5000/api/user/${id}`
                : 'http://localhost:5000/api/user/profile';

            const res = await axios.get(endpoint, {
                headers: { 'x-auth-token': token }
            });
            setUser(res.data);

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

    const fetchUserStories = async () => {
        try {
            setStoriesLoading(true);
            const token = getCleanToken();

            let userIdToFetch = id;
            if (!userIdToFetch && token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                userIdToFetch = payload.userId;
            }

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

    const filteredStories = stories.filter(story => {
        const profileUserIdStr = String(id || currentUserId);
        const authorIdStr = String(story.author?._id || story.author);

        const isAuthor = authorIdStr === profileUserIdStr;

        if (activeStoryTab === 'my-stories') {
            return isAuthor;
        } else {
            // Contributions: user is in segments but is NOT the author
            return !isAuthor;
        }
    });

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

    if (loading) return <div className="text-center text-skin-base mt-10">Loading...</div>;
    if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-skin-base text-skin-text p-4 pb-20">
            <Navbar activeTab="profile" setActiveTab={handleTabChange} />

            <div className="max-w-4xl mx-auto space-y-8 mt-10">
                {/* 1. Profile Header Card */}
                <div className="bg-skin-card rounded-2xl p-8 shadow-lg border border-skin-muted/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-skin-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-skin-primary/20 shadow-inner relative bg-skin-muted/10">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
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
                                        "{user.bio || "This writer is still crafting their story..."}"
                                    </p>

                                    <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                                        <div className="text-center border-r border-skin-muted/20 pr-6">
                                            <p className="text-2xl font-bold text-skin-primary">
                                                {stories.filter(s => String(s.author?._id || s.author) === String(id || currentUserId)).length}
                                            </p>
                                            <p className="text-xs text-skin-muted uppercase tracking-tighter">Stories</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-skin-primary">{user.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</p>
                                            <p className="text-xs text-skin-muted uppercase tracking-tighter">Joined</p>
                                        </div>
                                    </div>

                                    {!id && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="mt-6 bg-skin-primary text-white px-8 py-2.5 rounded-full hover:brightness-110 transition-all font-bold shadow-md active:scale-95"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
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
                                        <button type="submit" className="bg-skin-primary text-white px-6 py-2 rounded-full font-bold shadow-md hover:brightness-110">Save</button>
                                        <button type="button" onClick={() => setIsEditing(false)} className="text-skin-muted hover:text-skin-text font-medium px-4">Cancel</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Stories Dashboard */}
                <div className="space-y-6">
                    <div className="flex gap-8 border-b border-skin-muted/20 pb-1">
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {storiesLoading ? (
                            <div className="col-span-full py-20 text-center text-skin-muted">
                                <div className="animate-pulse flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-skin-muted/20"></div>
                                    <p>Loading stories...</p>
                                </div>
                            </div>
                        ) : filteredStories.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-skin-muted/5 rounded-3xl border border-dashed border-skin-muted/30">
                                <p className="text-skin-muted font-serif italic text-lg">No stories found in this category.</p>
                            </div>
                        ) : (
                            filteredStories.map(story => (
                                <div
                                    key={story._id}
                                    onClick={() => setSelectedStoryId(story._id)}
                                    className="group bg-skin-card rounded-2xl overflow-hidden border border-skin-muted/20 hover:border-skin-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
                                >
                                    {story.headerImage && (
                                        <div className="h-32 w-full overflow-hidden">
                                            <img src={story.headerImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                    )}
                                    <div className="p-5 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <span className="px-2 py-0.5 bg-skin-primary/10 text-skin-primary text-[10px] font-bold uppercase rounded-md border border-skin-primary/10">
                                                {story.genre || 'General'}
                                            </span>
                                            <span className="text-[10px] text-skin-muted font-medium">
                                                {new Date(story.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-serif font-bold text-skin-text group-hover:text-skin-primary transition-colors line-clamp-1">{story.title}</h3>
                                        <p className="text-sm text-skin-text/60 line-clamp-2 leading-relaxed">
                                            {story.segments?.[0]?.content || "No content yet."}
                                        </p>
                                        <div className="flex items-center justify-between pt-2 border-t border-skin-muted/10">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-skin-primary/10 flex items-center justify-center text-[10px] text-skin-primary font-bold">
                                                    {story.segments?.length || 0}
                                                </div>
                                                <span className="text-[10px] text-skin-muted uppercase font-bold tracking-tight">Segments</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-skin-secondary">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                                </svg>
                                                <span className="text-xs font-bold">{story.upvotes?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
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
        </div>
    );
};

export default Profile;

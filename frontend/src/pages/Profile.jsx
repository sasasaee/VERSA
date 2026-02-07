import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

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

    const { id } = useParams(); // Get ID from URL
    const navigate = useNavigate();

    const handleTabChange = (tab) => {
        if (tab === 'feed') {
            navigate('/');
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [id]); // Re-fetch when ID changes

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            // Determine endpoint: /profile (me) or /:id (others)
            const endpoint = id
                ? `http://localhost:5000/api/user/${id}`
                : 'http://localhost:5000/api/user/profile';

            const res = await axios.get(endpoint, {
                headers: { 'x-auth-token': token }
            });
            setUser(res.data);

            // Only set form data if it's MY profile
            if (!id) {
                setFormData({
                    username: res.data.username,
                    bio: res.data.bio || ''
                });
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load profile');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
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

        const formData = new FormData();
        formData.append('profilePicture', file);
        setUploading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/user/profile/picture', formData, {
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

    return (
        <div className="min-h-screen bg-skin-base text-skin-text p-8">
            <Navbar activeTab="profile" setActiveTab={handleTabChange} />

            <div className="max-w-2xl mx-auto bg-skin-card rounded-xl p-8 shadow-lg border border-skin-muted/10">
                <h1 className="text-3xl font-bold mb-6 text-skin-primary">Your Profile</h1>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-skin-primary/30 relative bg-skin-muted/20">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">Uploading...</div>
                            )}
                        </div>

                        {!id && (
                            <label className="cursor-pointer bg-skin-secondary text-white py-2 px-4 rounded-full text-sm hover:bg-opacity-90 transition">
                                Change Picture
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                        )}
                    </div>

                    <div className="flex-1 w-full">
                        {!isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-skin-muted text-sm uppercase tracking-wide">Username</label>
                                    <p className="text-xl font-semibold">{user.username}</p>
                                </div>
                                <div>
                                    <label className="text-skin-muted text-sm uppercase tracking-wide">Email</label>
                                    <p className="text-lg">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-skin-muted text-sm uppercase tracking-wide">Rank</label>
                                    <p className="inline-block bg-skin-primary/10 text-skin-primary px-3 py-1 rounded-full text-sm font-bold capitalize">
                                        {user.rank}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-skin-muted text-sm uppercase tracking-wide">Bio</label>
                                    <p className="text-skin-text/80 italic">{user.bio || "No bio yet."}</p>
                                </div>
                                <div className="pt-4">
                                    <label className="text-skin-muted text-sm uppercase tracking-wide">Joined</label>
                                    <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>

                                {!id && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="mt-4 border border-skin-primary text-skin-primary px-6 py-2 rounded-lg hover:bg-skin-primary hover:text-white transition-all font-bold"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-skin-muted text-sm mb-1">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="w-full bg-skin-base border border-skin-muted/30 rounded-lg p-2 focus:outline-none focus:border-skin-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-skin-muted text-sm mb-1">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="w-full bg-skin-base border border-skin-muted/30 rounded-lg p-2 focus:outline-none focus:border-skin-primary"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        className="bg-skin-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 font-bold"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="text-skin-muted px-6 py-2 hover:text-skin-text"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

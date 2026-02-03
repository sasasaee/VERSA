import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const currentUserId = getUserIdFromToken(token);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/profile/${userId}`, {
          headers: { 'x-auth-token': token }
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setBio(data.user.bio || '');
          setUsername(data.user.username || '');
          setIsOwnProfile(currentUserId === userId);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, token, navigate, currentUserId]);

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    setUploading(true);

    try {
      const res = await fetch('http://localhost:5000/api/users/profile/picture', {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: formData
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setProfile(prev => ({
          ...prev,
          user: { ...prev.user, profilePicture: updatedUser.profilePicture }
        }));
      }
    } catch (err) {
      console.error('Error uploading picture:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ bio, username })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setProfile(prev => ({
          ...prev,
          user: { ...prev.user, bio: updatedUser.bio, username: updatedUser.username }
        }));
        setEditMode(false);
      } else {
        const error = await res.json();
        alert(error.msg || 'Update failed');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-10 px-4 max-w-7xl mx-auto">
        <Navbar />
        <p className="text-center text-skin-muted mt-20">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-10 px-4 max-w-7xl mx-auto">
        <Navbar />
        <p className="text-center text-skin-muted mt-20">User not found</p>
      </div>
    );
  }

  const { user, stats, storiesStarted, storiesContributed } = profile;

  return (
    <div className="min-h-screen pt-10 px-4 max-w-7xl mx-auto">
      <Navbar />
      
      <div className="bg-skin-card rounded-2xl shadow-lg p-8 mt-8 border border-skin-primary/10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-skin-primary/20 flex items-center justify-center font-bold text-4xl text-skin-primary border-4 border-skin-primary/30 overflow-hidden">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                user.username[0].toUpperCase()
              )}
            </div>
            
            {isOwnProfile && (
              <label className="absolute bottom-0 right-0 bg-skin-secondary text-white p-2 rounded-full cursor-pointer hover:brightness-110 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureUpload}
                  disabled={uploading}
                />
              </label>
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              {editMode ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-3xl font-bold text-skin-primary bg-skin-base border-2 border-skin-primary/30 rounded-lg px-3 py-1 focus:outline-none focus:border-skin-primary"
                  placeholder="Username"
                  minLength={3}
                  maxLength={20}
                />
              ) : (
                <h1 className="text-3xl font-bold text-skin-primary">{user.username}</h1>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                user.rank === 'master' 
                  ? 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30' 
                  : 'bg-green-500/20 text-green-600 border border-green-500/30'
              }`}>
                {user.rank.toUpperCase()}
              </span>
            </div>

            <div className="mb-4">
              {editMode ? (
                <div className="space-y-2">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={500}
                    className="w-full bg-skin-base border border-skin-muted/30 rounded-lg p-3 text-skin-text focus:outline-none focus:border-skin-primary"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleProfileUpdate}
                      className="px-4 py-2 bg-skin-secondary text-white rounded-lg font-medium hover:brightness-110 transition-all"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setBio(user.bio || '');
                        setUsername(user.username || '');
                      }}
                      className="px-4 py-2 bg-skin-muted/20 text-skin-text rounded-lg font-medium hover:bg-skin-muted/30 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-skin-text/80 mb-2">
                    {user.bio || 'No bio yet.'}
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="text-skin-secondary text-sm font-medium hover:underline"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="text-skin-muted text-sm">
              Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-skin-muted/20">
          <div className="bg-skin-base/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-skin-primary mb-1">{stats.storiesStarted}</div>
            <div className="text-skin-muted text-sm">Stories Started</div>
          </div>
          <div className="bg-skin-base/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-skin-primary mb-1">{stats.storiesContributed}</div>
            <div className="text-skin-muted text-sm">Stories Contributed</div>
          </div>
          <div className="bg-skin-base/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-skin-primary mb-1">{stats.contestsParticipated}</div>
            <div className="text-skin-muted text-sm">Contests Participated</div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-skin-primary mb-4">Stories Started</h2>
          {storiesStarted.length === 0 ? (
            <p className="text-skin-muted text-center py-8">No stories started yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {storiesStarted.map((story) => (
                <div
                  key={story._id}
                  onClick={() => navigate('/')}
                  className="bg-skin-card rounded-xl p-6 border border-skin-primary/10 hover:shadow-lg transition-all cursor-pointer"
                >
                  <h3 className="text-xl font-bold text-skin-primary mb-2">{story.title}</h3>
                  <p className="text-skin-text/80 text-sm mb-3">
                    {story.segments?.[0]?.content?.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between text-xs text-skin-muted">
                    <span>{story.genre || 'General'}</span>
                    <span>{story.upvotes?.length || 0} upvotes</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-skin-primary mb-4">Stories Contributed</h2>
          {storiesContributed.length === 0 ? (
            <p className="text-skin-muted text-center py-8">No contributions yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {storiesContributed.map((story) => (
                <div
                  key={story._id}
                  onClick={() => navigate('/')}
                  className="bg-skin-card rounded-xl p-6 border border-skin-primary/10 hover:shadow-lg transition-all cursor-pointer"
                >
                  <h3 className="text-xl font-bold text-skin-primary mb-2">{story.title}</h3>
                  <p className="text-skin-text/80 text-sm mb-3">
                    by {story.author?.username || 'Unknown'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-skin-muted">
                    <span>{story.genre || 'General'}</span>
                    <span>{story.upvotes?.length || 0} upvotes</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchStories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/stories', {
            headers: { 'x-auth-token': token }
        });
        
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

    fetchStories();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 max-w-2xl mx-auto">
      
      {/* Top Controls */}
      <div className="fixed top-4 left-4 z-40 flex items-center gap-4 bg-skin-card/80 backdrop-blur-md p-2 rounded-full border border-skin-primary/20 shadow-sm">
        <button className="p-2 hover:bg-skin-primary/10 rounded-full transition-colors relative">
          <span className="text-2xl">🔔</span>
        </button>
        <button className="p-2 hover:bg-skin-primary/10 rounded-full transition-colors">
          <span className="text-2xl">👤</span>
        </button>
        <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors">
          <span className="text-2xl">🚪</span>
        </button>
      </div>

      {/* Write Trigger */}
      <div 
        onClick={() => navigate('/write')} 
        className="bg-skin-card p-6 rounded-2xl shadow-md border border-skin-primary/10 cursor-pointer hover:border-skin-primary transition-all group mb-8 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-full bg-skin-muted/20 flex items-center justify-center text-2xl">✏️</div>
        <div className="flex-1">
          <h3 className="text-skin-muted group-hover:text-skin-primary font-medium text-lg transition-colors">Start a new story...</h3>
        </div>
      </div>

      {/* The Feed */}
      <div className="space-y-8">
        {loading ? (
           <p className="text-center text-skin-muted">Loading...</p>
        ) : stories.length === 0 ? (
           <p className="text-center text-skin-muted">No stories yet. Start one!</p>
        ) : (
          stories.map((story) => (
            <div key={story._id} className="bg-skin-card rounded-2xl shadow-lg overflow-hidden border border-skin-primary/10 hover:shadow-xl transition-shadow">
              
              {/* Header Image */}
              <div className="h-48 w-full overflow-hidden relative bg-skin-muted/20">
                {story.headerImage ? (
                  <img src={story.headerImage} alt={story.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-skin-muted">No Cover Image</div>
                )}
                <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/20">
                  {story.genre || 'General'}
                </span>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-skin-primary/20 flex items-center justify-center font-bold text-skin-primary border-2 border-skin-primary/30">
                     {story.author?.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h4 className="font-bold text-skin-text">{story.author?.username || "Unknown"}</h4>
                    <span className="text-xs text-skin-muted">
                        {story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl font-serif font-bold text-skin-primary mb-2">{story.title}</h2>
                <p className="text-skin-text leading-relaxed opacity-80 mb-6 font-serif">
                  {story.segments?.[0]?.content 
                    ? story.segments[0].content.substring(0, 150) + "..." 
                    : "No preview available."}
                </p>

                <div className="flex items-center justify-end border-t border-skin-muted/20 pt-4">
                   <button className="px-6 py-2 bg-skin-secondary text-white rounded-full font-bold text-sm hover:brightness-110 shadow-md transition-all">
                     Read & Continue →
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
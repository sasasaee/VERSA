import { useState, useEffect } from 'react';

const StoryModal = ({ storyId, onClose }) => {
  const [story, setStory] = useState(null);
  const [newSegment, setNewSegment] = useState('');

  // Fetch full story details when Modal opens
  useEffect(() => {
    const fetchStory = async () => {
      const token = localStorage.getItem('token');
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
    if (storyId) fetchStory();
  }, [storyId]);

  const handlePublish = async () => {
    const token = localStorage.getItem('token');
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
        const updatedStory = await res.json();
        setStory(updatedStory);
        setNewSegment('');
      } else {
        const err = await res.json();
        alert(err.msg);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-skin-base w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-fade-in-up">

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors">✕</button>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto p-0 flex-1 custom-scrollbar">

          {/* Header Image */}
          <div className="relative h-56">
            {story.headerImage && <img src={story.headerImage} className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <h2 className="text-3xl font-serif font-bold text-white">{story.title}</h2>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* The Chain of Segments */}
            {story.segments.map((seg, index) => (
              <div key={index} className="bg-skin-card p-4 rounded-xl shadow-sm border border-skin-muted/10">
                <p className="text-skin-text font-serif leading-relaxed whitespace-pre-wrap">{seg.content}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-skin-muted font-bold uppercase tracking-wider">
                  <div className="w-5 h-5 rounded-full bg-skin-primary text-white flex items-center justify-center overflow-hidden">
                    {seg.author?.profilePicture ? (
                      <img src={seg.author.profilePicture} alt={seg.author.username} className="w-full h-full object-cover" />
                    ) : (
                      seg.author?.username?.[0] || 'A'
                    )}
                  </div>
                  {seg.author?.username}
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
                    maxLength={1000}
                  ></textarea>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-skin-muted">{newSegment.length}/1000</span>
                    <button
                      onClick={handlePublish}
                      className="px-4 py-2 bg-skin-secondary text-white rounded-lg font-bold hover:shadow-lg transition-all text-sm"
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
    </div>
  );
};

export default StoryModal;
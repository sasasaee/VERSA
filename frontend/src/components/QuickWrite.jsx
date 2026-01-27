import { useState } from 'react';

const QuickWrite = ({ onStoryPosted }) => {
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', genre: 'General', headerImage: '' });

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert("Please login first");

    try {
      const res = await fetch('http://localhost:5000/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newStory = await res.json();
        onStoryPosted(newStory); // Update parent feed instantly
        setFormData({ title: '', content: '', genre: 'General', headerImage: '' }); // Reset
        setExpanded(false); // Close box
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-skin-card rounded-2xl p-4 shadow-md border border-skin-muted/20 mb-8 transition-all duration-300">
      
      {/* 1. Collapsed View (Just the trigger) */}
      {!expanded ? (
        <div 
          onClick={() => setExpanded(true)}
          className="flex items-center gap-4 cursor-pointer"
        >
            <div className="w-10 h-10 rounded-full bg-skin-muted/20 flex items-center justify-center text-2xl text-skin-muted font-light">+</div>
            <input 
                type="text" 
                placeholder="Start a new story..." 
                className="bg-transparent text-xl font-serif text-skin-muted w-full outline-none pointer-events-none"
                readOnly
            />
        </div>
      ) : (
        /* 2. Expanded View (Full Form) */
        <div className="space-y-4 animate-fade-in">
            <input 
                type="text" 
                placeholder="Story Title" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full text-2xl font-bold font-serif bg-transparent border-b border-skin-muted/30 pb-2 focus:border-skin-primary outline-none text-skin-text"
            />
            
            <textarea 
                placeholder="Once upon a time... (Max 200 words)"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                maxLength={1000}
                className="w-full h-32 bg-transparent outline-none text-lg text-skin-text resize-none font-serif leading-relaxed"
            ></textarea>

            <div className="flex items-center gap-2">
                 <input 
                    type="text" 
                    placeholder="Image URL (Optional)" 
                    value={formData.headerImage}
                    onChange={(e) => setFormData({...formData, headerImage: e.target.value})}
                    className="flex-1 bg-skin-base p-2 rounded text-sm text-skin-text border border-skin-muted/20 outline-none"
                />
                <select 
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    className="bg-skin-base p-2 rounded text-sm text-skin-text border border-skin-muted/20 outline-none"
                >
                    <option>General</option>
                    <option>Horror</option>
                    <option>Sci-Fi</option>
                    <option>Romance</option>
                </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setExpanded(false)} className="px-4 py-2 text-skin-muted hover:text-skin-text">Cancel</button>
                <button onClick={handleSubmit} className="px-6 py-2 bg-skin-secondary text-white rounded-full font-bold shadow-md hover:bg-skin-primary transition-colors">Post Story</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default QuickWrite;
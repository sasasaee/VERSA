import { useState } from 'react';

const QuickWrite = ({ onStoryPosted }) => {
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', genre: 'General' });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    let rawToken = localStorage.getItem('token');
    if (!rawToken) return alert("Please login first");

    // Clean token (removes extra quotes if present)
    const token = rawToken.replace(/^"|"$/g, '');

    if (!formData.title.trim() || !formData.content.trim()) {
      return alert("Please fill in both the title and the story content.");
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('genre', formData.genre);
    if (imageFile) {
      data.append('headerImage', imageFile);
    }

    try {
      const res = await fetch('http://localhost:5000/api/stories', {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: data,
      });

      if (res.ok) {
        const newStory = await res.json();
        onStoryPosted(newStory); // Update parent feed instantly
        setFormData({ title: '', content: '', genre: 'General' }); // Reset
        setImageFile(null);
        setPreview(null);
        setExpanded(false); // Close box
      } else {
        const errData = await res.json();
        alert(`Failed to post: ${errData.msg || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-skin-card rounded-2xl p-4 shadow-md mb-8 transition-all duration-300">

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
            className="bg-transparent text-xl font-serif text-skin-text w-full outline-none pointer-events-none"
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
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full text-2xl font-bold font-serif bg-transparent border-b border-skin-muted/30 pb-2 focus:border-skin-primary outline-none text-skin-primary"
          />

          <textarea
            placeholder="Once upon a time... (Max 200 words)"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            maxLength={1000}
            className="w-full h-32 bg-transparent outline-none text-lg text-skin-text resize-none font-serif leading-relaxed"
          ></textarea>

          <div className="flex flex-col gap-4">
            {preview && (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-skin-muted/10">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setImageFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 bg-skin-base p-2 rounded-lg text-sm text-skin-text border border-dashed border-skin-muted/20 hover:border-skin-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 opacity-60">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  {imageFile ? imageFile.name : "Upload Header Photo"}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="bg-skin-base p-2 rounded-lg text-sm text-skin-text border border-skin-muted/20 outline-none h-[42px]"
              >
                <option>General</option>
                <option>Horror</option>
                <option>Sci-Fi</option>
                <option>Romance</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setExpanded(false)} className="px-4 py-2 text-skin-muted hover:text-skin-text">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-2 bg-skin-secondary text-white rounded-full font-bold shadow-md hover:bg-skin-primary transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Posting...' : 'Post Story'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickWrite;
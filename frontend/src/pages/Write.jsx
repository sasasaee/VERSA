import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Write = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [genre, setGenre] = useState('General');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const genres = ['General', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Thriller'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let rawToken = localStorage.getItem('token');
      if (!rawToken) {
        alert("You must be logged in to post.");
        navigate('/login');
        return;
      }

      // Clean token
      const token = rawToken.replace(/^"|"$/g, '');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('genre', genre);
      if (imageFile) {
        formData.append('headerImage', imageFile);
      }

      setLoading(true);
      const response = await fetch('http://localhost:5000/api/stories', {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: formData,
      });

      if (response.ok) {
        alert("Story Published!");
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        alert(errorData.msg || "Failed to publish");
      }
    } catch (error) {
      console.error(error);
      alert("Server error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 px-4 max-w-4xl mx-auto min-h-screen">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* --- 1. Top Bar: Genre & Upload --- */}
        <div className="flex flex-col gap-6">

          {preview && (
            <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-xl border border-skin-muted/10">
              <img src={preview} alt="Header Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setPreview(null); }}
                className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 backdrop-blur-md transition-all"
              >
                ✕ Remove Photo
              </button>
            </div>
          )}

          <div className="flex gap-4 items-center">
            {/* Genre Selection */}
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="p-3 bg-skin-card border border-skin-muted/30 rounded-xl text-skin-text focus:outline-none focus:border-skin-primary cursor-pointer shadow-sm"
            >
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {/* Image Upload Button */}
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center gap-3 p-3 bg-skin-base border-2 border-dashed border-skin-muted/30 rounded-xl text-skin-muted hover:border-skin-primary hover:text-skin-primary transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 opacity-60 group-hover:opacity-100">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="font-medium">{imageFile ? imageFile.name : "Upload Header Photo"}</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 2. Title Input */}
        <div className="relative group">
          <input
            type="text"
            placeholder="Title of your story..."
            className="w-full text-5xl font-serif font-bold bg-transparent border-b-2 border-transparent focus:border-skin-primary outline-none placeholder-skin-muted/40 transition-all pb-2 text-skin-text"
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* 3. Story Body */}
        <div>
          <textarea
            placeholder="Start your story here... (Limit: 200 words)"
            className="w-full h-[40vh] text-xl leading-relaxed bg-transparent outline-none resize-none placeholder-skin-muted/40 text-skin-text font-light"
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            required
          ></textarea>
          <div className="text-right text-skin-muted text-sm">
            {content.length}/1000 characters
          </div>
        </div>

        {/* 4. Publish Button */}
        <button
          type="submit"
          disabled={loading}
          className={`fixed bottom-10 right-10 px-8 py-3 bg-skin-secondary text-white rounded-full font-bold shadow-lg hover:scale-110 hover:shadow-xl transition-all z-20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Publishing...' : 'Publish Story'}
        </button>
      </form>
    </div>
  );
};

export default Write;
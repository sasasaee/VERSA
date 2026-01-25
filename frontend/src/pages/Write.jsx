import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Write = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [genre, setGenre] = useState('General');
  const [headerImage, setHeaderImage] = useState('');
  const navigate = useNavigate();

  const genres = ['General', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Thriller'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in to post.");
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify({ title, content, genre, headerImage }),
      });

      if (response.ok) {
        alert("Story Published!");
        navigate('/dashboard'); 
        const data = await response.json();
        alert(data.msg || "Failed to publish");
      }
    } catch (error) {
      console.error(error);
      alert("Server error. Is the backend running?");
    }
  };

  return (
    <div className="pt-24 px-4 max-w-4xl mx-auto min-h-screen">
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Genre & Image URL */}
            <div className="flex gap-4">
                {/* Genre Selection */}
                <select 
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="p-2 bg-skin-card border border-skin-muted/30 rounded-lg text-skin-text focus:outline-none focus:border-skin-primary cursor-pointer"
                >
                    {genres.map((g) => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>

                {/* Image URL Input */}
                <input 
                    type="text" 
                    placeholder="Cover Image URL (e.g., https://...)" 
                    className="flex-1 p-2 bg-transparent border-b border-skin-muted/30 focus:border-skin-primary outline-none text-skin-text placeholder-skin-muted/50"
                    onChange={(e) => setHeaderImage(e.target.value)}
                />
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
                    className="w-full h-[50vh] text-xl leading-relaxed bg-transparent outline-none resize-none placeholder-skin-muted/40 text-skin-text font-light"
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
                className="fixed bottom-10 right-10 px-8 py-3 bg-skin-secondary text-white rounded-full font-bold shadow-lg hover:scale-110 hover:shadow-xl transition-all"
            >
                Publish Story
            </button>
        </form>
    </div>
  );
};

export default Write;
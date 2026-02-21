import React, { useState, useRef, useEffect } from 'react';

const SortDropdown = ({ sortBy, setSortBy, filterGenre, setFilterGenre }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('main'); // 'main' or 'genres'
    const dropdownRef = useRef(null);

    const genres = ['All Genres', 'General', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Thriller'];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
                setView('main');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSortChange = (type) => {
        if (type === 'genre') {
            setView('genres');
        } else {
            setSortBy(type);
            setIsOpen(false);
        }
    };

    const handleGenreSelect = (genre) => {
        setSortBy('genre');
        setFilterGenre(genre);
        setIsOpen(false);
        setView('main');
    };

    const getSortLabel = () => {
        if (sortBy === 'newest') return 'Newest';
        if (sortBy === 'oldest') return 'Oldest';
        if (sortBy === 'genre') {
            return filterGenre === 'All Genres' ? 'By Genre' : `Genre: ${filterGenre}`;
        }
        return 'Sort By';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-skin-card border border-skin-muted/20 rounded-full py-2 px-5 text-sm font-bold text-skin-text hover:bg-skin-muted/5 transition-all shadow-sm"
            >
                <span>{getSortLabel()}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-skin-card border border-skin-muted/20 rounded-2xl shadow-2xl z-[50] overflow-hidden animate-fade-in">
                    <div className={`transition-transform duration-300 flex w-[200%] ${view === 'genres' ? '-translate-x-1/2' : 'translate-x-0'}`}>
                        {/* Main Menu */}
                        <div className="w-1/2 p-2 space-y-1">
                            <button
                                onClick={() => handleSortChange('newest')}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${sortBy === 'newest' ? 'bg-skin-primary text-white' : 'text-skin-text hover:bg-skin-primary/10'}`}
                            >
                                Newest First
                            </button>
                            <button
                                onClick={() => handleSortChange('oldest')}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${sortBy === 'oldest' ? 'bg-skin-primary text-white' : 'text-skin-text hover:bg-skin-primary/10'}`}
                            >
                                Oldest First
                            </button>
                            <button
                                onClick={() => handleSortChange('genre')}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${sortBy === 'genre' ? 'bg-skin-primary/10 text-skin-primary' : 'text-skin-text hover:bg-skin-primary/10'}`}
                            >
                                <span>Filter by Genre</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        </div>

                        {/* Genre Sub-menu */}
                        <div className="w-1/2 p-2 space-y-1">
                            <button
                                onClick={() => setView('main')}
                                className="w-full text-left px-4 py-2 mb-1 text-xs font-black uppercase tracking-widest text-skin-muted hover:text-skin-primary flex items-center gap-2 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                                Back
                            </button>
                            <div className="max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                {genres.map(g => (
                                    <button
                                        key={g}
                                        onClick={() => handleGenreSelect(g)}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${sortBy === 'genre' && filterGenre === g ? 'bg-skin-secondary text-white' : 'text-skin-text hover:bg-skin-secondary/10'}`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SortDropdown;

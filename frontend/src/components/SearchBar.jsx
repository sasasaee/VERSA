import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-xl group">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stories, genres, authors..."
                className="w-full bg-skin-card border border-skin-search-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-skin-primary transition-all shadow-sm"
            />
            <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-skin-muted group-focus-within:text-skin-primary transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            </button>
            {query && (
                <button
                    onClick={() => { setQuery(''); onSearch(''); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-skin-muted hover:text-red-500 transition-colors"
                    type="button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </form>
    );
};

export default SearchBar;

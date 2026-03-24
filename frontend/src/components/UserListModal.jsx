import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserListModal = ({ isOpen, onClose, title, users, loading }) => {
    const navigate = useNavigate();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-skin-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-modal-pop"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-skin-muted/10 flex justify-between items-center bg-skin-primary/5">
                    <h3 className="text-xl font-serif font-bold text-skin-primary">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-skin-primary/10 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="py-10 flex flex-col items-center justify-center">
                            <div className="animate-spin w-8 h-8 border-4 border-skin-primary border-t-transparent rounded-full mb-4"></div>
                            <p className="text-skin-muted text-sm italic">Loading users...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="py-10 text-center text-skin-muted italic font-serif">
                            No users found.
                        </div>
                    ) : (
                        users.map(user => (
                            <div
                                key={user._id}
                                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-skin-primary/5 transition-all cursor-pointer group"
                                onClick={() => {
                                    onClose();
                                    navigate(`/profile/${user._id}`);
                                }}
                            >
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-skin-primary/10 group-hover:border-skin-primary/30 transition-colors">
                                    {user.profilePicture ? (
                                        <img src={user.profilePicture} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-skin-muted/10 text-skin-primary font-bold">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-skin-text group-hover:text-skin-primary transition-colors">{user.username}</p>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-skin-muted">{user.rank || 'beginner'}</span>
                                </div>
                                <div className="text-skin-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserListModal;

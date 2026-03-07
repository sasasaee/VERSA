import React from 'react';

const RankUpgradeModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-skin-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-bounce-in relative p-8 text-center border border-skin-secondary/30">

                {/* Glow effect */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-skin-secondary/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-skin-primary/20 rounded-full blur-3xl"></div>

                {/* Badge Icon */}
                <div className="relative mb-6">
                    <div className="w-24 h-24 bg-skin-secondary/10 rounded-full flex items-center justify-center mx-auto border-4 border-skin-secondary/20 relative">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-skin-secondary animate-pulse">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>

                        {/* Particles */}
                        <div className="absolute top-0 right-0 w-2 h-2 bg-skin-secondary rounded-full animate-ping"></div>
                        <div className="absolute bottom-4 left-0 w-3 h-3 bg-skin-primary rounded-full animate-bounce"></div>
                    </div>
                </div>

                <h2 className="text-3xl font-serif font-bold text-skin-primary mb-2">Title Upgraded!</h2>
                <p className="text-skin-muted mb-8 leading-relaxed">
                    Your journey as a <span className="text-skin-secondary font-bold">Reader</span> has evolved.
                    You are now recognized as a <span className="text-skin-secondary font-bold">Beginner</span>!
                </p>

                <div className="space-y-4">
                    <div className="bg-skin-secondary/5 p-4 rounded-2xl border border-skin-secondary/10 italic text-sm text-skin-text">
                        "Every legend begins with a single word. Today, you've written yours."
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-skin-secondary text-white rounded-full font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all"
                    >
                        Continue My Journey
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RankUpgradeModal;

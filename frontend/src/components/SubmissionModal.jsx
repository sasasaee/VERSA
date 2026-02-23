import React from 'react';

const SubmissionModal = ({ submission, onClose }) => {
    if (!submission) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div
                className="absolute inset-0 bg-skin-base/80 backdrop-blur-xl animate-fade-in"
                onClick={onClose}
            ></div>

            <div className="relative bg-skin-card w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden border border-skin-primary/10 flex flex-col animate-scale-in">
                {/* Header */}
                <div className="p-8 border-b border-skin-primary/5 flex items-center justify-between bg-gradient-to-r from-skin-primary/5 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-skin-secondary/20 shadow-inner">
                            <img
                                src={submission.user?.profilePicture || 'https://via.placeholder.com/150'}
                                alt={submission.user?.username}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-2xl font-serif font-bold text-skin-primary">
                                {submission.user?.username || 'Anonymous'}
                            </h3>
                            <p className="text-xs text-skin-muted font-black uppercase tracking-widest mt-1">
                                Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-skin-base hover:bg-red-500 hover:text-white transition-all shadow-md group"
                    >
                        <span className="text-2xl group-hover:rotate-90 transition-transform">✕</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="max-w-3xl mx-auto">
                        <p className="font-serif italic text-xl md:text-2xl leading-relaxed text-skin-text/90 whitespace-pre-wrap first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-skin-secondary">
                            {submission.content}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-skin-base/30 border-t border-skin-primary/5 flex justify-center">
                    <p className="text-[10px] font-black text-skin-muted uppercase tracking-[0.3em]">
                        VERSA WEEKLY CONTEST ENTRY
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubmissionModal;

import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-skin-card w-full max-w-sm rounded-2xl shadow-2xl border border-skin-muted/10 p-6 space-y-6">
                <div className="text-center">
                    <h3 className="text-xl font-serif font-bold text-skin-primary mb-2">{title}</h3>
                    <p className="text-skin-text/80">{message}</p>
                </div>
                
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 bg-skin-muted/10 text-skin-text rounded-xl font-bold hover:bg-skin-muted/20 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg transition-all"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

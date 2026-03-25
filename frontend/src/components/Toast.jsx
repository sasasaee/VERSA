import { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: 'bg-skin-secondary',
        error: 'bg-red-900',
        info: 'bg-skin-secondary'
    };

    const icons = {
        success: '✓',
        error: '✕',
        //info: 'ℹ️'
    };

    const textColors = {
        success: 'text-skin-on-primary',
        error: 'text-white',
        info: 'text-skin-on-primary'
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
            <div className={`${styles[type]} ${textColors[type]} px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[280px] backdrop-blur-sm`}>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xl flex-shrink-0">
                    {icons[type]}
                </div>
                <p className="font-medium">{message}</p>
            </div>

            <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default Toast;

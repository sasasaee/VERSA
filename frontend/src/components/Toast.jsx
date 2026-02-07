import { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Use VERSA's color scheme
  const styles = {
    success: 'bg-gradient-to-r from-skin-primary to-skin-secondary border-2 border-skin-primary/30',
    error: 'bg-gradient-to-r from-gray-900 to-red-950 border-2 border-red-500/50',
    info: 'bg-gradient-to-r from-skin-secondary to-skin-primary border-2 border-skin-secondary/30'
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ️'
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
      <div className={`${styles[type]} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[280px] backdrop-blur-sm`}>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xl flex-shrink-0">
          {icons[type]}
        </div>
        <p className="font-medium text-white">{message}</p>
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

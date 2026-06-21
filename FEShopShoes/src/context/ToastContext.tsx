
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CloseIcon } from '../components/common/SimpleIcons';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-24 right-4 z-[200] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id}
            className={`pointer-events-auto p-4 flex items-center justify-between shadow-xl border-l-4 min-w-[300px] animate-slide-in
              ${t.type === 'success' ? 'bg-white border-green-500' : ''}
              ${t.type === 'error' ? 'bg-white border-red-500' : ''}
              ${t.type === 'info' ? 'bg-white border-[#0F172A]' : ''}
            `}
          >
            <span className="font-bold text-xs uppercase tracking-widest">{t.message}</span>
            <button 
              onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
              className="ml-4 hover:opacity-60"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

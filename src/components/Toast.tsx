import React from 'react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none items-center max-w-sm w-full px-4">
      {toasts.map(t => (
        <div
          key={t.id}
          className="bg-slate-900/95 dark:bg-slate-800/95 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full shadow-lg border border-slate-700/60 backdrop-blur-md animate-bounce-short pointer-events-auto transition-all text-center"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
};

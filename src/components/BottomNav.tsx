import React from 'react';
import { useApp, TabType } from '../context/AppContext';
import { Home, BookOpen, Layers, Award, Bookmark } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const items: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: Home },
    { id: 'guide', label: 'Sözlük', icon: BookOpen },
    { id: 'flashcards', label: 'Kartlar', icon: Layers },
    { id: 'quiz', label: 'Quiz', icon: Award },
    { id: 'mylist', label: 'Listem', icon: Bookmark }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 px-2 flex justify-around items-center transition-colors">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
              isActive
                ? 'text-slate-950 dark:text-white font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

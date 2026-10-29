import React, { useState, useEffect } from 'react';
import { useApp, TabType } from '../context/AppContext';
import {
  Menu,
  X,
  Home,
  BookOpen,
  Layers,
  Award,
  Bookmark,
  Moon,
  Sun,
  Volume2,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    isDark,
    toggleDarkMode,
    speechRate,
    setSpeechRate,
    activeTab,
    setActiveTab,
    openGoogleModal,
    isGoogleConnected,
    googleUser
  } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when menu drawer is open on mobile
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navItems: {
    id: TabType;
    label: string;
    desc: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'dashboard',
      label: 'Ana Sayfa',
      desc: 'Günlük hedef, ilerleme özeti, günün kelimesi & cümlesi',
      icon: Home
    },
    {
      id: 'guide',
      label: 'Sözlük & Rehber',
      desc: '2133 kelime, 299 cümle, 12 kategori ve arama',
      icon: BookOpen
    },
    {
      id: 'flashcards',
      label: 'Flaş Kartlar',
      desc: 'Leitner kutuları, çevirerek çalışma ve sesli telaffuz',
      icon: Layers
    },
    {
      id: 'quiz',
      label: 'Quiz',
      desc: '4 şıklı çoktan seçmeli pratik ve başarı ölçümü',
      icon: Award
    },
    {
      id: 'mylist',
      label: 'İlerleme & Listem',
      desc: 'Favoriler, zor kelimeler, özel sözlüğüm ve ayarlar',
      icon: Bookmark
    }
  ];

  const currentItem = navItems.find(item => item.id === activeTab) || navItems[0];

  const handleSelectTab = (tabId: TabType) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-3">
          
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSelectTab('dashboard')}
              className="flex items-baseline gap-2 text-left group"
            >
              <span className="font-display font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                Kelime Rehberi
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wider">
                EN · ES · TR
              </span>
            </button>
          </div>

          {/* Zone 2: Menü Button & Actions */}
          <div className="flex items-center gap-2">
            
            {/* The Main "Menü" Button */}
            <button
              onClick={() => setIsMenuOpen(prev => !prev)}
              aria-label="Navigasyon Menüsünü Aç"
              aria-expanded={isMenuOpen}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-97 ${
                isMenuOpen
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs'
              }`}
            >
              {isMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              )}
              <span>Menü</span>
              <span className="hidden sm:inline font-normal text-slate-400 dark:text-slate-500 border-l border-slate-200 dark:border-slate-700 pl-2">
                {currentItem.label}
              </span>
            </button>

            {/* Google Integration Trigger */}
            <button
              onClick={openGoogleModal}
              title={isGoogleConnected ? `Google Bağlı (${googleUser?.email || ''})` : 'Google ile Bağlan'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                isGoogleConnected
                  ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="hidden md:inline">
                {isGoogleConnected ? 'Google Bağlı' : 'Google'}
              </span>
              {isGoogleConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              )}
            </button>

            {/* Voice Speed Toggle */}
            <button
              onClick={() => {
                const nextRate = speechRate === 1 ? 0.75 : speechRate === 0.75 ? 1.25 : 1;
                setSpeechRate(nextRate);
              }}
              title="Telaffuz Hızı"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors tabular-nums"
            >
              <Volume2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{speechRate}x</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                toggleDarkMode();
              }}
              title={isDark ? 'Aydınlık Moda Geç' : 'Karanlık (Gece) Moda Geç'}
              aria-label={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over / Dropdown Navigation Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end sm:justify-center p-0 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          
          {/* Backdrop click dismiss */}
          <div
            className="fixed inset-0"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Card / Drawer */}
          <div className="relative z-10 w-full sm:max-w-md bg-white dark:bg-slate-900 border-b sm:border border-slate-200/90 dark:border-slate-800 sm:rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto animate-in slide-in-from-top-4 sm:slide-in-from-top-2 duration-200">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  <Menu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Uygulama Menüsü
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    2133 Kelime · 299 Cümle · 12 Kategori
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Options List */}
            <nav className="space-y-1.5" aria-label="Menü Seçenekleri">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-xs'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isActive
                            ? 'bg-white/20 dark:bg-slate-950/15 text-white dark:text-slate-950'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">
                          {item.label}
                        </div>
                        <div
                          className={`text-[11px] truncate ${
                            isActive
                              ? 'text-slate-200 dark:text-slate-700'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {isActive ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Quick Google Workspace Action within Menu */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  openGoogleModal();
                }}
                className="w-full p-3 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/70 hover:bg-slate-100/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <div className="text-left">
                    <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <span>Google Drive & E-Tablolar</span>
                      {isGoogleConnected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isGoogleConnected ? 'Bağlantı aktif · E-Tabloya aktar' : 'Bağlan ve verilerini eşitle'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Theme Toggle within Menu */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Görünüm Teması
              </span>
              <button
                onClick={toggleDarkMode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold transition-colors"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Aydınlık Mod</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-700" />
                    <span>Gece Modu</span>
                  </>
                )}
              </button>
            </div>

            {/* Bottom Footer Tip */}
            <div className="pt-2 text-center text-[11px] text-slate-400">
              Menüyü kapatmak için boş bir yere dokunabilir veya ESC'ye basabilirsiniz.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

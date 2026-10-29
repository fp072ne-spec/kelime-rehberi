import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/dictionary';
import { Search, Volume2, Star, CheckCircle, BookOpen } from 'lucide-react';

export const GuideView: React.FC = () => {
  const {
    allWords,
    langMode,
    setLangMode,
    showPronunciation,
    setShowPronunciation,
    hideMemorized,
    setHideMemorized,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    playPronunciation,
    currentlyPlayingId,
    userStats,
    toggleMemorize,
    toggleFavorite,
    openWordDetail
  } = useApp();

  const [activeSubCategory, setActiveSubCategory] = useState<string>('all');
  const [displayLimit, setDisplayLimit] = useState<number>(60);

  // Filter words
  const filteredWords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allWords.filter(w => {
      if (selectedCategory !== 'all' && w.category !== selectedCategory) {
        return false;
      }

      if (activeSubCategory !== 'all' && w.subCategory !== activeSubCategory) {
        return false;
      }

      if (hideMemorized && userStats.memorizedIds[w.id]) {
        return false;
      }

      if (q) {
        const matchEn = w.en.toLowerCase().includes(q);
        const matchEs = w.es.toLowerCase().includes(q);
        const matchTr = w.tr.toLowerCase().includes(q);
        const matchEnp = (w.enp || '').toLowerCase().includes(q);
        const matchEsp = (w.esp || '').toLowerCase().includes(q);
        if (!matchEn && !matchEs && !matchTr && !matchEnp && !matchEsp) {
          return false;
        }
      }

      return true;
    });
  }, [allWords, selectedCategory, activeSubCategory, hideMemorized, searchQuery, userStats.memorizedIds]);

  const displayedWords = filteredWords.slice(0, displayLimit);

  const currentCategoryObj = CATEGORIES.find(c => c.name === selectedCategory);
  const subCategoriesList = currentCategoryObj?.subCategories || [];

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Controls Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5">
        {/* Language Display Modes */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {[
            { id: 0, label: 'EN · TR' },
            { id: 1, label: 'EN · ES' },
            { id: 2, label: 'ES · TR' },
            { id: 3, label: 'EN · ES · TR' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setLangMode(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                langMode === m.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setDisplayLimit(60);
              }}
              placeholder="İngilizce, İspanyolca veya Türkçe ara…"
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => {
              setSelectedCategory(e.target.value);
              setActiveSubCategory('all');
              setDisplayLimit(60);
            }}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-slate-400"
          >
            <option value="all">Tüm Kategoriler ({allWords.length} kayıt)</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.words.length})
              </option>
            ))}
          </select>
        </div>

        {/* Subcategories */}
        {subCategoriesList.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs scrollbar-none">
            <button
              onClick={() => {
                setActiveSubCategory('all');
                setDisplayLimit(60);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                activeSubCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tümü
            </button>
            {subCategoriesList.map(sc => (
              <button
                key={sc}
                onClick={() => {
                  setActiveSubCategory(sc);
                  setDisplayLimit(60);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  activeSubCategory === sc
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {sc}
              </button>
            ))}
          </div>
        )}

        {/* Toggles & Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPronunciation}
                onChange={e => setShowPronunciation(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-400 w-3.5 h-3.5"
              />
              <span>Okunuşlar</span>
            </label>

            <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideMemorized}
                onChange={e => setHideMemorized(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-400 w-3.5 h-3.5"
              />
              <span>Ezberlenenleri gizle</span>
            </label>
          </div>

          <div className="text-slate-400 font-medium tabular-nums">
            {filteredWords.length} kayıt
          </div>
        </div>
      </div>

      {/* Words List */}
      <div className="space-y-1.5">
        {displayedWords.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sonuç bulunamadı</p>
            <p className="text-xs text-slate-400 mt-0.5">Arama terimini veya filtreleri değiştirip tekrar deneyin.</p>
          </div>
        ) : (
          displayedWords.map(word => {
            const isMemorized = !!userStats.memorizedIds[word.id];
            const isFav = !!userStats.favoriteIds[word.id];

            return (
              <div
                key={word.id}
                onClick={() => openWordDetail(word)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isMemorized
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-70'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-400/80 shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Columns */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 w-full">
                  {/* EN */}
                  {(langMode === 0 || langMode === 1 || langMode === 3) && (
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">EN</span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            playPronunciation(word.en, 'en', word.id + '_en');
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            currentlyPlayingId === word.id + '_en'
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                              : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {word.en}
                      </div>
                      {showPronunciation && word.enp && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                          [{word.enp}]
                        </div>
                      )}
                    </div>
                  )}

                  {/* ES */}
                  {(langMode === 1 || langMode === 2 || langMode === 3) && (
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">ES</span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            playPronunciation(word.es, 'es', word.id + '_es');
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            currentlyPlayingId === word.id + '_es'
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                              : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {word.es}
                      </div>
                      {showPronunciation && word.esp && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                          [{word.esp}]
                        </div>
                      )}
                    </div>
                  )}

                  {/* TR */}
                  {(langMode === 0 || langMode === 2 || langMode === 3) && (
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">TR</div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {word.tr}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {word.subCategory || word.category}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleMemorize(word.id);
                    }}
                    title={isMemorized ? 'Ezberlendi (kaldır)' : 'Ezberledim olarak işaretle'}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isMemorized
                        ? 'border-emerald-300 dark:border-emerald-800 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <CheckCircle className={`w-3.5 h-3.5 ${isMemorized ? 'fill-emerald-500 text-white' : ''}`} />
                  </button>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleFavorite(word.id);
                    }}
                    title={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isFav
                        ? 'border-amber-300 dark:border-amber-800 text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-amber-500'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load More Button */}
      {displayedWords.length < filteredWords.length && (
        <div className="text-center pt-2">
          <button
            onClick={() => setDisplayLimit(prev => prev + 60)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Daha Fazla Göster ({filteredWords.length - displayedWords.length} kayıt kaldı)
          </button>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, Star, CheckCircle, X } from 'lucide-react';

export const WordDetailModal: React.FC = () => {
  const {
    selectedWord,
    closeWordDetail,
    playPronunciation,
    currentlyPlayingId,
    userStats,
    toggleMemorize,
    toggleFavorite
  } = useApp();

  if (!selectedWord) return null;

  const isMemorized = !!userStats.memorizedIds[selectedWord.id];
  const isFavorite = !!userStats.favoriteIds[selectedWord.id];
  const leitnerData = userStats.leitner[selectedWord.id] || { box: 1, errorCount: 0 };

  return (
    <div
      onClick={closeWordDetail}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in duration-150"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-2 duration-150"
      >
        {/* Mobile handle */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {selectedWord.category}
            </span>
            {selectedWord.subCategory && (
              <span className="text-xs text-slate-400">
                · {selectedWord.subCategory}
              </span>
            )}
          </div>
          <button
            onClick={closeWordDetail}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Details */}
        <div className="space-y-2.5 my-4">
          {/* English */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">İngilizce</span>
              <button
                onClick={() => playPronunciation(selectedWord.en, 'en', selectedWord.id + '_en')}
                className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold border transition-all ${
                  currentlyPlayingId === selectedWord.id + '_en'
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Telaffuz</span>
              </button>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {selectedWord.en}
            </div>
            {selectedWord.enp && (
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                [{selectedWord.enp}]
              </div>
            )}
          </div>

          {/* Spanish */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">İspanyolca</span>
              <button
                onClick={() => playPronunciation(selectedWord.es, 'es', selectedWord.id + '_es')}
                className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold border transition-all ${
                  currentlyPlayingId === selectedWord.id + '_es'
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Telaffuz</span>
              </button>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {selectedWord.es}
            </div>
            {selectedWord.esp && (
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                [{selectedWord.esp}]
              </div>
            )}
          </div>

          {/* Turkish Meaning */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
              Türkçe Anlamı
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
              {selectedWord.tr}
            </div>
          </div>
        </div>

        {/* Leitner Box Progress */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Öğrenme Seviyesi (Leitner)</span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">Kutu {leitnerData.box} / 5</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1 p-0.5">
            {[1, 2, 3, 4, 5].map(b => (
              <div
                key={b}
                className={`h-full flex-1 rounded-full transition-all ${
                  b <= leitnerData.box ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => toggleFavorite(selectedWord.id)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
              isFavorite
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
            <span>{isFavorite ? 'Favorilerde' : 'Favoriye Ekle'}</span>
          </button>

          <button
            onClick={() => toggleMemorize(selectedWord.id)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
              isMemorized
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <CheckCircle className={`w-3.5 h-3.5 ${isMemorized ? 'fill-emerald-500 text-white' : ''}`} />
            <span>{isMemorized ? 'Ezberlendi' : 'Ezberledim'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

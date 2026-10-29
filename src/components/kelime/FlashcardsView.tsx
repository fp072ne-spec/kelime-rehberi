import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/dictionary';
import { Volume2, RotateCcw, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export const FlashcardsView: React.FC = () => {
  const {
    allWords,
    userStats,
    toggleMemorize,
    toggleFavorite,
    recordQuizResult,
    playPronunciation
  } = useApp();

  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const cardPool = useMemo(() => {
    if (selectedCat === 'all') return allWords;
    return allWords.filter(w => w.category === selectedCat);
  }, [allWords, selectedCat]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedCat]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < cardPool.length - 1) {
          setCurrentIndex(i => i + 1);
          setIsFlipped(false);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex(i => i - 1);
          setIsFlipped(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cardPool.length]);

  const currentCard = cardPool[currentIndex] || cardPool[0];
  const isMemorized = currentCard ? !!userStats.memorizedIds[currentCard.id] : false;
  const isFav = currentCard ? !!userStats.favoriteIds[currentCard.id] : false;
  const leitnerInfo = currentCard ? userStats.leitner[currentCard.id] || { box: 1 } : { box: 1 };

  if (!currentCard) {
    return <div className="p-8 text-center text-slate-400">Kelime bulunamadı.</div>;
  }

  const handleNext = () => {
    if (currentIndex < cardPool.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-200">
      {/* Category selector */}
      <div className="flex items-center justify-between gap-3">
        <select
          value={selectedCat}
          onChange={e => setSelectedCat(e.target.value)}
          className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden"
        >
          <option value="all">Tüm Konular ({allWords.length} kelime/cümle)</option>
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.name}>
              {c.name} ({c.words.length})
            </option>
          ))}
        </select>

        <span className="text-xs font-semibold text-slate-400 tabular-nums shrink-0">
          {currentIndex + 1} / {cardPool.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          style={{ width: `${((currentIndex + 1) / cardPool.length) * 100}%` }}
          className="h-full bg-slate-900 dark:bg-white transition-all duration-300"
        />
      </div>

      {/* 3D Flashcard Container */}
      <div
        className="w-full h-80 sm:h-96 relative [perspective:1200px] cursor-pointer select-none"
        onClick={() => setIsFlipped(prev => !prev)}
      >
        <div
          className={`w-full h-full relative duration-500 [transform-style:preserve-3d] transition-transform ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* FRONT FACE */}
          <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between text-center items-center">
            {/* Header badges */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                {currentCard.category}
              </span>
              <span className="tabular-nums">
                Kutu {leitnerInfo.box}/5
              </span>
            </div>

            {/* Main Word */}
            <div className="my-auto space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">İNGİLİZCE</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {currentCard.en}
              </h2>
              {currentCard.enp && (
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  [{currentCard.enp}]
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={e => {
                  e.stopPropagation();
                  playPronunciation(currentCard.en, 'en', currentCard.id + '_fc_en');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Telaffuz</span>
              </button>
              <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                <RotateCcw className="w-3 h-3" />
                <span>Çevirmek için dokun</span>
              </span>
            </div>
          </div>

          {/* BACK FACE */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm flex flex-col justify-between text-center items-center">
            {/* Header */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-500 dark:text-slate-400">TÜRKÇE VE İSPANYOLCA</span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  toggleFavorite(currentCard.id);
                }}
                className="p-1 text-slate-400 hover:text-amber-500"
              >
                <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
              </button>
            </div>

            {/* Translation details */}
            <div className="my-auto space-y-4 w-full">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TÜRKÇE</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {currentCard.tr}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">İSPANYOLCA</span>
                <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {currentCard.es}
                </div>
                {currentCard.esp && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    [{currentCard.esp}]
                  </div>
                )}
              </div>
            </div>

            {/* Feedback Buttons */}
            <div className="w-full flex items-center gap-2 pt-2">
              <button
                onClick={e => {
                  e.stopPropagation();
                  recordQuizResult(currentCard.id, false);
                  handleNext();
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Tekrar Et
              </button>

              <button
                onClick={e => {
                  e.stopPropagation();
                  recordQuizResult(currentCard.id, true);
                  toggleMemorize(currentCard.id);
                  handleNext();
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xs"
              >
                {isMemorized ? 'Ezberlendi' : 'Ezberledim'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons below card */}
      <div className="flex items-center justify-between gap-2.5">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1 shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Önceki</span>
        </button>

        <button
          onClick={() => setIsFlipped(prev => !prev)}
          className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center justify-center gap-1.5 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isFlipped ? 'Ön Yüzü Gör' : 'Cevabı Gör'}</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === cardPool.length - 1}
          className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1 shadow-2xs"
        >
          <span>Sonraki</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

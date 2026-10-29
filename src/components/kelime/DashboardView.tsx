import React from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/dictionary';
import { Volume2, ArrowRight, Play, Layers, Compass, Flame, Check } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    userStats,
    allWords,
    setActiveTab,
    setSelectedCategory,
    playPronunciation,
    currentlyPlayingId,
    openWordDetail,
    openGoogleModal,
    isGoogleConnected
  } = useApp();

  const goal = userStats.dailyGoal || 20;
  const count = userStats.todayCount;
  const progressPercent = Math.min(100, Math.round((count / goal) * 100));

  const totalMastered = Object.keys(userStats.memorizedIds).length;
  const totalReviewed = Object.keys(userStats.leitner).length;

  // Deterministic daily pick
  const todayStr = new Date().toISOString().slice(0, 10);
  const hash = todayStr.split('-').reduce((acc, part) => acc * 31 + Number(part), 7);
  const wordsOnly = allWords.filter(w => !w.isSentence);
  const sentencesOnly = allWords.filter(w => w.isSentence);

  const wordOfTheDay = wordsOnly[hash % (wordsOnly.length || 1)] || allWords[0];
  const sentenceOfTheDay = sentencesOnly[(hash * 5) % (sentencesOnly.length || 1)] || allWords[1];

  // Last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const dayName = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'][d.getDay()];
    const history = userStats.activityHistory[iso] || { total: 0, correct: 0 };
    return {
      day: dayName,
      iso,
      count: history.total,
      isToday: i === 6
    };
  });

  const maxActivity = Math.max(1, ...last7Days.map(d => d.count), goal);

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* 1. MINIMAL HERO: PROGRESS & DAILY METRICS */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              Günlük Hedef
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {count >= goal ? 'Hedef Tamamlandı' : `${goal - count} kelime kaldı`}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{userStats.streak} gün seri</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{count} / {goal} kelime çalışıldı</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{totalMastered} ezberlenen</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('quiz')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Quiz Başlat</span>
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kartlar</span>
            </button>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Bugünkü ilerleme</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              %{progressPercent}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-slate-900 dark:bg-emerald-500 rounded-full transition-all duration-500"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="tabular-nums">
              Tam Kapsam: <strong className="text-slate-800 dark:text-slate-200">2133 Kelime</strong> · <strong className="text-slate-800 dark:text-slate-200">299 Cümle</strong> (12 Kategori)
            </span>
            <button
              onClick={openGoogleModal}
              className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isGoogleConnected ? 'E-Tablolara Aktar' : 'Google ile Bağlan'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL FEATURED: GÜNÜN KELİMESİ & CÜMLESİ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Word of the Day */}
        {wordOfTheDay && (
          <article className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                  Günün Kelimesi
                </span>
                <span className="truncate max-w-[160px] text-right">{wordOfTheDay.category}</span>
              </div>

              <div className="py-5 space-y-3">
                {/* English */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      İngilizce
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                      {wordOfTheDay.en}
                    </h3>
                    {wordOfTheDay.enp && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        [{wordOfTheDay.enp}]
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => playPronunciation(wordOfTheDay.en, 'en', 'wod_en')}
                    title="İngilizce Telaffuz"
                    className={`p-2 rounded-lg border transition-colors ${
                      currentlyPlayingId === 'wod_en'
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Spanish & Turkish */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      İspanyolca
                    </span>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {wordOfTheDay.es}
                    </div>
                    {wordOfTheDay.esp && (
                      <span className="text-[11px] text-slate-400">[{wordOfTheDay.esp}]</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Türkçe
                    </span>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                      {wordOfTheDay.tr}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => openWordDetail(wordOfTheDay)}
              className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors self-start"
            >
              <span>Tüm Detayları Gör</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </article>
        )}

        {/* Sentence of the Day */}
        {sentenceOfTheDay && (
          <article className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                  Günün Pratik Cümlesi
                </span>
                <span className="truncate max-w-[160px] text-right">
                  {sentenceOfTheDay.subCategory || 'Kalıplar'}
                </span>
              </div>

              <div className="py-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      İngilizce
                    </span>
                    <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight mt-0.5 leading-snug">
                      "{sentenceOfTheDay.en}"
                    </p>
                    {sentenceOfTheDay.enp && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        [{sentenceOfTheDay.enp}]
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => playPronunciation(sentenceOfTheDay.en, 'en', 'sod_en')}
                    title="İngilizce Telaffuz"
                    className={`p-2 rounded-lg border transition-colors shrink-0 ${
                      currentlyPlayingId === 'sod_en'
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      İspanyolca
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      "{sentenceOfTheDay.es}"
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Türkçe
                    </span>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                      {sentenceOfTheDay.tr}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => openWordDetail(sentenceOfTheDay)}
              className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors self-start"
            >
              <span>Cümle Detayı</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </article>
        )}
      </section>

      {/* 3. CALM 7-DAY ACTIVITY */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Haftalık Aktivite</h2>
            <p className="text-xs text-slate-400 mt-0.5">Son 7 günlük soru ve çalışma dağılımı</p>
          </div>
          <span className="text-xs text-slate-500 font-medium tabular-nums">
            Hedef: {goal} soru/gün
          </span>
        </div>

        <div className="flex items-end justify-between gap-2 pt-4 h-28">
          {last7Days.map(d => {
            const heightPct = Math.max(8, Math.min(100, (d.count / maxActivity) * 100));
            return (
              <div key={d.iso} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[11px] font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                  {d.count > 0 ? d.count : '—'}
                </span>
                <div className="w-full max-w-[28px] bg-slate-100 dark:bg-slate-800 rounded-t-md h-full flex items-end overflow-hidden">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      d.count >= goal
                        ? 'bg-slate-900 dark:bg-emerald-400'
                        : d.count > 0
                        ? 'bg-slate-400 dark:bg-slate-600'
                        : 'bg-transparent'
                    }`}
                  />
                </div>
                <span
                  className={`text-[11px] ${
                    d.isToday ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-400'
                  }`}
                >
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. REFINED 12 CATEGORIES LIST */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">12 Kelime ve Cümle Grubu</h2>
            <p className="text-xs text-slate-400 mt-0.5">Kategoriye tıklayarak doğrudan o konudaki kelimeleri inceleyin</p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setActiveTab('guide');
            }}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Tümünü Aç →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {CATEGORIES.map(cat => {
            const catWords = allWords.filter(w => w.category === cat.name);
            const memorizedCount = catWords.filter(w => userStats.memorizedIds[w.id]).length;
            const pct = catWords.length > 0 ? Math.round((memorizedCount / catWords.length) * 100) : 0;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setActiveTab('guide');
                }}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all text-left flex flex-col justify-between group shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors line-clamp-1">
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                    {catWords.length}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-slate-900 dark:bg-emerald-500 rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                    <span>{memorizedCount} ezberlendi</span>
                    <span className="tabular-nums">%{pct}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

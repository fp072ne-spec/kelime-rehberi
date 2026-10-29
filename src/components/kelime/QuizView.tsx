import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/dictionary';
import { WordItem } from '../../data/types';
import { triggerConfetti } from '../../utils/confetti';
import { Play, Volume2, RotateCcw, ArrowRight } from 'lucide-react';

type QuizMode = 't' | 'mc' | 'dl' | 'mix';

export const QuizView: React.FC = () => {
  const {
    allWords,
    userStats,
    recordQuizResult,
    playPronunciation
  } = useApp();

  // Setup State
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<QuizMode>('t');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [quizDirection, setQuizDirection] = useState<string>('tr-en');
  const [filterType, setFilterType] = useState<'a' | 'h' | 'f' | 'm'>('a');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isTimed, setIsTimed] = useState<boolean>(false);

  // Active Question State
  const [currentQuestions, setCurrentQuestions] = useState<WordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [answerFeedback, setAnswerFeedback] = useState<string | null>(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false);
  const [wrongAnswersList, setWrongAnswersList] = useState<WordItem[]>([]);
  const [mcOptions, setMcOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [streakCombo, setStreakCombo] = useState<number>(0);

  // Result state
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const specialChars = {
    'tr-en': ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü'],
    'en-tr': ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü'],
    'tr-es': ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'],
    'es-tr': ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü'],
    'en-es': ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'],
    'es-en': []
  }[quizDirection] || ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü'];

  const getSourceAndTarget = (item: WordItem) => {
    switch (quizDirection) {
      case 'tr-en':
        return { prompt: item.tr, target: item.en, targetLang: 'en' as const, pron: item.enp };
      case 'en-tr':
        return { prompt: item.en, target: item.tr, targetLang: 'tr' as const, pron: item.enp };
      case 'tr-es':
        return { prompt: item.tr, target: item.es, targetLang: 'es' as const, pron: item.esp };
      case 'es-tr':
        return { prompt: item.es, target: item.tr, targetLang: 'tr' as const, pron: item.esp };
      case 'en-es':
        return { prompt: item.en, target: item.es, targetLang: 'es' as const, pron: item.esp };
      case 'es-en':
        return { prompt: item.es, target: item.en, targetLang: 'en' as const, pron: item.enp };
      default:
        return { prompt: item.tr, target: item.en, targetLang: 'en' as const, pron: item.enp };
    }
  };

  const startQuiz = (overridePool?: WordItem[]) => {
    let pool = overridePool ? [...overridePool] : [...allWords];

    if (!overridePool && selectedCategory !== 'all') {
      pool = pool.filter(w => w.category === selectedCategory);
    }

    if (!overridePool) {
      if (filterType === 'h') {
        pool = pool.filter(w => {
          const l = userStats.leitner[w.id];
          return l && l.errorCount > 0 && l.box < 3;
        });
      } else if (filterType === 'f') {
        pool = pool.filter(w => userStats.favoriteIds[w.id]);
      } else if (filterType === 'm') {
        pool = pool.filter(w => userStats.memorizedIds[w.id]);
      }
    }

    if (pool.length === 0) {
      alert('Seçilen filtre ve kategoride kelime bulunamadı.');
      return;
    }

    const shuffled = pool.sort(() => Math.random() - 0.5);
    const selected = questionCount > 0 ? shuffled.slice(0, questionCount) : shuffled;

    setCurrentQuestions(selected);
    setCurrentIndex(0);
    setScore(0);
    setStreakCombo(0);
    setWrongAnswersList([]);
    setUserAnswer('');
    setIsAnswerChecked(false);
    setAnswerFeedback(null);
    setIsFinished(false);
    setIsQuizActive(true);

    prepareQuestion(selected[0], 0, selected);
  };

  const prepareQuestion = (item: WordItem, index: number, fullList: WordItem[]) => {
    setUserAnswer('');
    setIsAnswerChecked(false);
    setAnswerFeedback(null);
    setTimeLeft(15);

    const { target, targetLang } = getSourceAndTarget(item);

    if (selectedMode === 'dl') {
      playPronunciation(target, targetLang, item.id + '_quiz_audio');
    }

    const isMc = selectedMode === 'mc' || (selectedMode === 'mix' && index % 2 === 1);
    if (isMc) {
      const otherTargets = fullList
        .filter(w => w.id !== item.id)
        .map(w => getSourceAndTarget(w).target);
      const uniqueDistractors = Array.from(new Set(otherTargets))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const options = [target, ...uniqueDistractors].sort(() => Math.random() - 0.5);
      setMcOptions(options);
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Timer
  useEffect(() => {
    if (!isQuizActive || isFinished || isAnswerChecked || !isTimed) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isQuizActive, isFinished, isAnswerChecked, isTimed, currentIndex]);

  const handleTimeUp = () => {
    if (isAnswerChecked) return;
    const currentItem = currentQuestions[currentIndex];
    const { target } = getSourceAndTarget(currentItem);

    setIsAnswerChecked(true);
    setIsCorrectAnswer(false);
    setStreakCombo(0);
    setWrongAnswersList(prev => [...prev, currentItem]);
    recordQuizResult(currentItem.id, false);
    setAnswerFeedback(`Süre doldu. Doğru cevap: ${target}`);
  };

  const checkAnswer = (explicitAnswer?: string) => {
    if (isAnswerChecked) {
      handleNextQuestion();
      return;
    }

    const currentItem = currentQuestions[currentIndex];
    const { target } = getSourceAndTarget(currentItem);
    const submitted = (explicitAnswer !== undefined ? explicitAnswer : userAnswer).trim();

    if (!submitted) {
      setAnswerFeedback('Lütfen bir cevap girin.');
      return;
    }

    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/[.,?!¿¡]/g, '')
        .trim();

    const isMatch = normalize(submitted) === normalize(target);

    setIsAnswerChecked(true);
    setIsCorrectAnswer(isMatch);

    if (isMatch) {
      setScore(s => s + 1);
      setStreakCombo(c => c + 1);
      setAnswerFeedback('Doğru cevap.');
      recordQuizResult(currentItem.id, true);
    } else {
      setStreakCombo(0);
      setWrongAnswersList(prev => [...prev, currentItem]);
      setAnswerFeedback(`Yanlış. Doğru cevap: ${target}`);
      recordQuizResult(currentItem.id, false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < currentQuestions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      prepareQuestion(currentQuestions[nextIdx], nextIdx, currentQuestions);
    } else {
      setIsFinished(true);
      const finalScorePct = Math.round((score / currentQuestions.length) * 100);
      if (finalScorePct >= 80) {
        triggerConfetti();
      }
    }
  };

  const currentItem = currentQuestions[currentIndex];
  const { prompt, target, targetLang, pron } = currentItem
    ? getSourceAndTarget(currentItem)
    : { prompt: '', target: '', targetLang: 'en' as const, pron: '' };
  const isMcActive = selectedMode === 'mc' || (selectedMode === 'mix' && currentIndex % 2 === 1);

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-200">
      {/* 1. SETUP */}
      {!isQuizActive && !isFinished && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Quiz Yapılandırması</h2>
            <p className="text-xs text-slate-400 mt-0.5">Çalışma modu ve soru sayısını seçin</p>
          </div>

          {/* Mode */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Test Modu
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 't', label: '✍️ Harf Harf Yazma' },
                { id: 'mc', label: '🔘 Çoktan Seçmeli' },
                { id: 'dl', label: '🎧 Dinle ve Yaz' },
                { id: 'mix', label: '🎲 Karışık Mod' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMode(m.id as QuizMode)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    selectedMode === m.id
                      ? 'border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Direction */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Yön
            </span>
            <select
              value={quizDirection}
              onChange={e => setQuizDirection(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200"
            >
              <option value="tr-en">Türkçe → İngilizce</option>
              <option value="en-tr">İngilizce → Türkçe</option>
              <option value="tr-es">Türkçe → İspanyolca</option>
              <option value="es-tr">İspanyolca → Türkçe</option>
              <option value="en-es">İngilizce → İspanyolca</option>
              <option value="es-en">İspanyolca → İngilizce</option>
            </select>
          </div>

          {/* Question count */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Soru Sayısı
            </span>
            <div className="flex gap-2">
              {[10, 20, 40, 0].map(n => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    questionCount === n
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {n === 0 ? 'Sınırsız' : n}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Kategori
              </span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200"
              >
                <option value="all">Tüm Konular ({allWords.length})</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.words.length})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Filtre
              </span>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200"
              >
                <option value="a">Tüm Kelimeler</option>
                <option value="h">Zor Kelimeler</option>
                <option value="f">Favori Kelimelerim</option>
                <option value="m">Ezberlenenler</option>
              </select>
            </div>
          </div>

          {/* Timed toggle */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isTimed}
              onChange={e => setIsTimed(e.target.checked)}
              className="rounded text-slate-900 focus:ring-slate-400 w-3.5 h-3.5"
            />
            <span>Soru başı 15 saniye sınır</span>
          </label>

          <button
            onClick={() => startQuiz()}
            className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Teste Başla</span>
          </button>
        </div>
      )}

      {/* 2. ACTIVE QUESTION */}
      {isQuizActive && !isFinished && currentItem && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="text-slate-700 dark:text-slate-300 font-bold tabular-nums">
                {currentIndex + 1} / {currentQuestions.length}
              </span>
              <span className="tabular-nums">
                Puan: {score}
                {streakCombo > 1 && ` · ${streakCombo} seri`}
              </span>
            </div>

            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${((currentIndex + 1) / currentQuestions.length) * 100}%` }}
                className="h-full bg-slate-900 dark:bg-white transition-all duration-300"
              />
            </div>

            {isTimed && !isAnswerChecked && (
              <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(timeLeft / 15) * 100}%` }}
                  className="h-full bg-slate-400 transition-all duration-1000 ease-linear"
                />
              </div>
            )}
          </div>

          {/* Question Text */}
          <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center space-y-2">
            <span className="text-[11px] text-slate-400 font-medium">{currentItem.category}</span>

            {selectedMode === 'dl' ? (
              <div className="py-2">
                <button
                  onClick={() => playPronunciation(target, targetLang, currentItem.id + '_listen')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-xs"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Dinlemek İçin Dokun</span>
                </button>
                <p className="text-xs text-slate-400 mt-2">Duyduğunuz kelime veya cümleyi yazın</p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {prompt}
                </h3>
                {pron && <div className="text-xs text-slate-400 mt-1">[{pron}]</div>}
              </div>
            )}
          </div>

          {/* Multiple choice or Input */}
          {isMcActive ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {mcOptions.map((opt, i) => {
                const isSelected = userAnswer === opt;
                let btnStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800';

                if (isAnswerChecked) {
                  if (opt === target) {
                    btnStyle = 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950 font-bold';
                  } else if (isSelected && !isCorrectAnswer) {
                    btnStyle = 'border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold';
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={isAnswerChecked}
                    onClick={() => {
                      setUserAnswer(opt);
                      checkAnswer(opt);
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <input
                ref={inputRef}
                type="text"
                disabled={isAnswerChecked}
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') checkAnswer();
                }}
                placeholder="Cevabınızı yazın…"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />

              {specialChars.length > 0 && !isAnswerChecked && (
                <div className="flex flex-wrap gap-1">
                  {specialChars.map(char => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => {
                        setUserAnswer(prev => prev + char);
                        inputRef.current?.focus();
                      }}
                      className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Feedback */}
          {answerFeedback && (
            <div
              className={`p-3 rounded-xl text-xs font-bold ${
                isCorrectAnswer
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {answerFeedback}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2 pt-2">
            {!isAnswerChecked ? (
              <>
                <button
                  onClick={() => checkAnswer()}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 shadow-xs"
                >
                  Kontrol Et
                </button>
                <button
                  onClick={() => {
                    if (target) {
                      setUserAnswer(target.slice(0, Math.min(target.length, userAnswer.length + 1)));
                      inputRef.current?.focus();
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50"
                >
                  İpucu
                </button>
                <button
                  onClick={() => {
                    setIsAnswerChecked(true);
                    setIsCorrectAnswer(false);
                    setWrongAnswersList(prev => [...prev, currentItem]);
                    setAnswerFeedback(`Cevap: ${target}`);
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50"
                >
                  Pas Geç
                </button>
              </>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>{currentIndex < currentQuestions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. RESULT */}
      {isFinished && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs text-center space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Test Tamamlandı
            </h2>
            <p className="text-xs text-slate-500">
              {currentQuestions.length} sorudan {score} tanesi doğru cevaplandı.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 max-w-xs mx-auto">
            <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              %{Math.round((score / currentQuestions.length) * 100)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium uppercase mt-0.5">Başarı Oranı</div>
          </div>

          {wrongAnswersList.length > 0 && (
            <div className="text-left space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Yanlış Yapılan Kelimeler ({wrongAnswersList.length})
              </span>
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                {wrongAnswersList.map(w => {
                  const { prompt, target, targetLang } = getSourceAndTarget(w);
                  return (
                    <div
                      key={w.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{prompt}</div>
                        <div className="text-slate-500 font-medium">{target}</div>
                      </div>
                      <button
                        onClick={() => playPronunciation(target, targetLang, w.id + '_review')}
                        className="p-1.5 text-slate-400 hover:text-slate-900"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => startQuiz(wrongAnswersList)}
                className="w-full mt-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yalnızca Yanlışları Tekrar Et ({wrongAnswersList.length})</span>
              </button>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                setIsQuizActive(false);
                setIsFinished(false);
              }}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            >
              Test Ayarlarına Dön
            </button>
            <button
              onClick={() => startQuiz()}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 shadow-xs"
            >
              Yeni Test Başlat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

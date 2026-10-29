import React, { createContext, useContext, useState, useEffect } from 'react';
import { WordItem, UserStats, CustomWord } from '../data/types';
import { ALL_WORDS, CATEGORIES } from '../data/dictionary';
import { triggerConfetti } from '../utils/confetti';
import { speakText } from '../utils/speech';
import { googleSignIn, logoutGoogle, initAuth, getAccessToken } from '../services/googleAuth';
import {
  exportToGoogleSheets,
  backupToGoogleDrive,
  listGoogleDriveBackups,
  downloadBackupFromDrive,
  DriveBackupFile
} from '../services/googleWorkspace';
import { User } from 'firebase/auth';

interface ToastMessage {
  id: string;
  text: string;
}

export type TabType = 'dashboard' | 'guide' | 'flashcards' | 'quiz' | 'mylist';

interface AppContextType {
  // Theme & Font
  isDark: boolean;
  toggleDarkMode: () => void;
  fontSizeScale: number;
  setFontSizeScale: (scale: number) => void;

  // Active Tab
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Language & Filter Preferences
  langMode: number; // 0: EN-TR, 1: EN-ES, 2: ES-TR, 3: EN-ES-TR
  setLangMode: (mode: number) => void;
  showPronunciation: boolean;
  setShowPronunciation: (val: boolean) => void;
  hideMemorized: boolean;
  setHideMemorized: (val: boolean) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Word Collections
  allWords: WordItem[];
  customWords: CustomWord[];
  addCustomWord: (word: Omit<CustomWord, 'id'>) => void;

  // User Stats & Learning
  userStats: UserStats;
  toggleMemorize: (wordId: string) => void;
  toggleFavorite: (wordId: string) => void;
  recordQuizResult: (wordId: string, isCorrect: boolean) => void;
  setDailyGoal: (goal: number) => void;
  resetProgress: () => void;

  // Word Detail Modal
  selectedWord: WordItem | null;
  openWordDetail: (word: WordItem) => void;
  closeWordDetail: () => void;

  // Audio Playback
  currentlyPlayingId: string | null;
  playPronunciation: (text: string, lang: 'en' | 'es' | 'tr', id?: string) => void;

  // Toast
  toast: (text: string) => void;
  toasts: ToastMessage[];

  // Backup & Restore
  exportAllData: () => void;
  importAllData: (jsonData: string) => boolean;

  // Google Workspace Integration
  googleUser: any | null;
  isGoogleConnected: boolean;
  isGoogleSyncing: boolean;
  googleSyncStatus: string;
  lastSpreadsheetUrl: string | null;
  driveBackups: any[];
  isGoogleModalOpen: boolean;
  openGoogleModal: () => void;
  closeGoogleModal: () => void;
  handleGoogleSignIn: () => Promise<void>;
  handleGoogleSignOut: () => Promise<void>;
  exportToSheets: () => Promise<string | null>;
  backupToDrive: () => Promise<void>;
  restoreFromDrive: (fileId: string) => Promise<boolean>;
  refreshDriveBackups: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KELIME_KEY = 'kelime_rehberi_v4_state';
const STORAGE_PREFS_KEY = 'kelime_rehberi_v4_prefs';

function getTodayIso(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Preferences
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFS_KEY);
      if (saved) return JSON.parse(saved).isDark ?? false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [fontSizeScale, setFontSizeScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFS_KEY);
      if (saved) return JSON.parse(saved).fontSizeScale || 1;
    } catch {}
    return 1;
  });

  // Navigation & Filters
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [langMode, setLangMode] = useState<number>(0);
  const [showPronunciation, setShowPronunciation] = useState<boolean>(true);
  const [hideMemorized, setHideMemorized] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio State
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  // Modal State
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = (text: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  // Custom user words
  const [customWords, setCustomWords] = useState<CustomWord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KELIME_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.customWords || [];
      }
    } catch {}
    return [];
  });

  // User Learning Stats
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const today = getTodayIso();
    const defaultStats: UserStats = {
      streak: 1,
      lastActiveDate: today,
      dailyGoal: 20,
      todayCount: 0,
      todayLearnedIds: [],
      memorizedIds: {},
      favoriteIds: {},
      leitner: {},
      activityHistory: { [today]: { total: 0, correct: 0 } },
      bestQuizScore: 0
    };

    try {
      const saved = localStorage.getItem(STORAGE_KELIME_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const stats: UserStats = parsed.userStats || defaultStats;

        if (stats.lastActiveDate !== today) {
          const lastDate = new Date(stats.lastActiveDate);
          const currDate = new Date(today);
          const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            stats.streak = (stats.streak || 0) + 1;
          } else if (diffDays > 1) {
            stats.streak = 1;
          }
          stats.lastActiveDate = today;
          stats.todayCount = 0;
          stats.todayLearnedIds = [];
        }

        if (!stats.activityHistory) stats.activityHistory = {};
        if (!stats.activityHistory[today]) stats.activityHistory[today] = { total: 0, correct: 0 };

        return stats;
      }
    } catch {}
    return defaultStats;
  });

  // Sync Preferences to DOM & LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify({ isDark, fontSizeScale }));
    } catch {}

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isDark ? '#020617' : '#ffffff');
    }

    document.documentElement.style.setProperty('--app-scale', String(fontSizeScale));
  }, [isDark, fontSizeScale]);

  // Sync User Learning State
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KELIME_KEY,
        JSON.stringify({
          customWords,
          userStats
        })
      );
    } catch {}
  }, [customWords, userStats]);

  // Combined Words
  const allWords = React.useMemo(() => {
    const formattedCustom: WordItem[] = customWords.map(c => ({
      id: c.id,
      en: c.en,
      enp: c.enp || '',
      es: c.es,
      esp: c.esp || '',
      tr: c.tr,
      category: c.category || 'Özel Kelimeler'
    }));
    return [...ALL_WORDS, ...formattedCustom];
  }, [customWords]);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  const toggleMemorize = (wordId: string) => {
    setUserStats(prev => {
      const next = { ...prev.memorizedIds };
      if (next[wordId]) {
        delete next[wordId];
        toast('Ezberlenenlerden kaldırıldı');
      } else {
        next[wordId] = true;
        toast('Ezberlendi olarak işaretlendi');
      }
      return { ...prev, memorizedIds: next };
    });
  };

  const toggleFavorite = (wordId: string) => {
    setUserStats(prev => {
      const next = { ...prev.favoriteIds };
      if (next[wordId]) {
        delete next[wordId];
        toast('Favorilerden kaldırıldı');
      } else {
        next[wordId] = true;
        toast('Favorilere eklendi');
      }
      return { ...prev, favoriteIds: next };
    });
  };

  const recordQuizResult = (wordId: string, isCorrect: boolean) => {
    const today = getTodayIso();
    setUserStats(prev => {
      const prevLeitner = prev.leitner[wordId] || { box: 1, errorCount: 0, nextReview: today };
      const newBox = isCorrect ? Math.min(5, prevLeitner.box + 1) : 1;
      const newError = isCorrect ? prevLeitner.errorCount : prevLeitner.errorCount + 1;

      const intervals = [0, 1, 3, 7, 14, 30];
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + (isCorrect ? intervals[newBox] : 1));
      const nextReviewIso = nextReviewDate.toISOString().slice(0, 10);

      const alreadyLearnedToday = prev.todayLearnedIds.includes(wordId);
      const newTodayLearned = alreadyLearnedToday ? prev.todayLearnedIds : [...prev.todayLearnedIds, wordId];
      const newTodayCount = newTodayLearned.length;

      if (!alreadyLearnedToday && newTodayCount === prev.dailyGoal) {
        toast(`Tebrikler! Günlük ${prev.dailyGoal} kelime hedefine ulaştınız.`);
        triggerConfetti();
      }

      const prevDay = prev.activityHistory[today] || { total: 0, correct: 0 };
      const newActivity = {
        ...prev.activityHistory,
        [today]: {
          total: prevDay.total + 1,
          correct: prevDay.correct + (isCorrect ? 1 : 0)
        }
      };

      return {
        ...prev,
        todayCount: newTodayCount,
        todayLearnedIds: newTodayLearned,
        leitner: {
          ...prev.leitner,
          [wordId]: {
            box: newBox,
            errorCount: newError,
            nextReview: nextReviewIso
          }
        },
        activityHistory: newActivity
      };
    });
  };

  const setDailyGoal = (goal: number) => {
    setUserStats(prev => ({ ...prev, dailyGoal: goal }));
    toast(`Günlük hedef ${goal} kelime olarak belirlendi.`);
  };

  const resetProgress = () => {
    const today = getTodayIso();
    setUserStats({
      streak: 1,
      lastActiveDate: today,
      dailyGoal: 20,
      todayCount: 0,
      todayLearnedIds: [],
      memorizedIds: {},
      favoriteIds: {},
      leitner: {},
      activityHistory: { [today]: { total: 0, correct: 0 } },
      bestQuizScore: 0
    });
    toast('Çalışma geçmişi sıfırlandı.');
  };

  const addCustomWord = (word: Omit<CustomWord, 'id'>) => {
    const id = 'custom_' + Math.random().toString(36).slice(2, 9);
    setCustomWords(prev => [
      {
        id,
        ...word
      },
      ...prev
    ]);
    toast('Kelime eklendi.');
  };

  const playPronunciation = (text: string, lang: 'en' | 'es' | 'tr', id?: string) => {
    const langCode = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'tr-TR';
    if (id) setCurrentlyPlayingId(id);

    speakText(text, langCode, {
      rate: speechRate,
      onStart: () => {
        if (id) setCurrentlyPlayingId(id);
      },
      onEnd: () => {
        setCurrentlyPlayingId(null);
      },
      onError: () => {
        setCurrentlyPlayingId(null);
        toast('Telaffuz sesi çalınamadı.');
      }
    });
  };

  const openWordDetail = (word: WordItem) => setSelectedWord(word);
  const closeWordDetail = () => setSelectedWord(null);

  const exportAllData = () => {
    const fullBackup = {
      exportDate: new Date().toISOString(),
      userStats,
      customWords
    };
    const jsonString = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kelime_rehberi_yedek_${getTodayIso()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Yedek dosyası indirildi.');
  };

  const importAllData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.userStats) setUserStats(parsed.userStats);
      if (parsed.customWords) setCustomWords(parsed.customWords);
      toast('Veriler başarıyla içe aktarıldı.');
      return true;
    } catch {
      toast('Yedek dosyası biçimi geçersiz.');
      return false;
    }
  };

  // Google Workspace Integration State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [isGoogleSyncing, setIsGoogleSyncing] = useState<boolean>(false);
  const [googleSyncStatus, setGoogleSyncStatus] = useState<string>('');
  const [lastSpreadsheetUrl, setLastSpreadsheetUrl] = useState<string | null>(null);
  const [driveBackups, setDriveBackups] = useState<DriveBackupFile[]>([]);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsub = initAuth(
      (user) => {
        setGoogleUser(user);
        setIsGoogleConnected(true);
      },
      () => {
        setGoogleUser(null);
        setIsGoogleConnected(false);
      }
    );
    return () => unsub();
  }, []);

  const openGoogleModal = () => setIsGoogleModalOpen(true);
  const closeGoogleModal = () => setIsGoogleModalOpen(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSyncing(true);
      setGoogleSyncStatus('Google ile oturum açılıyor...');
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setIsGoogleConnected(true);
        toast(`Hoş geldiniz, ${res.user.displayName || 'Kullanıcı'}! Google bağlandı.`);
        try {
          const list = await listGoogleDriveBackups();
          setDriveBackups(list);
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err: any) {
      toast(`Giriş yapılamadı: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsGoogleSyncing(false);
      setGoogleSyncStatus('');
    }
  };

  const handleGoogleSignOut = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setIsGoogleConnected(false);
    setDriveBackups([]);
    toast('Google oturumu kapatıldı.');
  };

  const refreshDriveBackups = async () => {
    try {
      const list = await listGoogleDriveBackups();
      setDriveBackups(list);
    } catch (e) {
      console.error(e);
    }
  };

  const exportToSheets = async (): Promise<string | null> => {
    try {
      setIsGoogleSyncing(true);
      setGoogleSyncStatus('Google E-Tablo hazırlanıyor...');
      const result = await exportToGoogleSheets(
        allWords,
        customWords,
        userStats,
        (msg) => setGoogleSyncStatus(msg)
      );
      setLastSpreadsheetUrl(result.spreadsheetUrl);
      toast('Google E-Tablo başarıyla oluşturuldu!');
      return result.spreadsheetUrl;
    } catch (err: any) {
      toast(`E-Tablo aktarma hatası: ${err.message}`);
      return null;
    } finally {
      setIsGoogleSyncing(false);
      setGoogleSyncStatus('');
    }
  };

  const backupToDrive = async () => {
    try {
      setIsGoogleSyncing(true);
      setGoogleSyncStatus("Google Drive'a yedekleniyor...");
      const result = await backupToGoogleDrive(
        customWords,
        userStats,
        (msg) => setGoogleSyncStatus(msg)
      );
      toast(`Google Drive'a kaydedildi: ${result.fileName}`);
      await refreshDriveBackups();
    } catch (err: any) {
      toast(`Yedekleme hatası: ${err.message}`);
    } finally {
      setIsGoogleSyncing(false);
      setGoogleSyncStatus('');
    }
  };

  const restoreFromDrive = async (fileId: string): Promise<boolean> => {
    try {
      setIsGoogleSyncing(true);
      setGoogleSyncStatus("Google Drive'dan yedek yükleniyor...");
      const data = await downloadBackupFromDrive(fileId);
      if (data.userStats) setUserStats(data.userStats);
      if (data.customWords) setCustomWords(data.customWords);
      toast("Google Drive'dan veriler başarıyla geri yüklendi!");
      return true;
    } catch (err: any) {
      toast(`Geri yükleme hatası: ${err.message}`);
      return false;
    } finally {
      setIsGoogleSyncing(false);
      setGoogleSyncStatus('');
    }
  };

  return (
    <AppContext.Provider
      value={{
        isDark,
        toggleDarkMode,
        fontSizeScale,
        setFontSizeScale,
        activeTab,
        setActiveTab,
        langMode,
        setLangMode,
        showPronunciation,
        setShowPronunciation,
        hideMemorized,
        setHideMemorized,
        speechRate,
        setSpeechRate,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        allWords,
        customWords,
        addCustomWord,
        userStats,
        toggleMemorize,
        toggleFavorite,
        recordQuizResult,
        setDailyGoal,
        resetProgress,
        selectedWord,
        openWordDetail,
        closeWordDetail,
        currentlyPlayingId,
        playPronunciation,
        toast,
        toasts,
        exportAllData,
        importAllData,
        googleUser,
        isGoogleConnected,
        isGoogleSyncing,
        googleSyncStatus,
        lastSpreadsheetUrl,
        driveBackups,
        isGoogleModalOpen,
        openGoogleModal,
        closeGoogleModal,
        handleGoogleSignIn,
        handleGoogleSignOut,
        exportToSheets,
        backupToDrive,
        restoreFromDrive,
        refreshDriveBackups
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};

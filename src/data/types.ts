export type Language = 'en' | 'es' | 'tr';

export interface WordItem {
  id: string;
  en: string;
  enp: string; // English pronunciation (Turkish phonetics)
  es: string;
  esp: string; // Spanish pronunciation (Turkish phonetics)
  tr: string;
  category: string;
  subCategory?: string;
  isSentence?: boolean;
}

export interface CategoryData {
  id: string;
  name: string;
  iconName?: string;
  subCategories?: string[];
  words: WordItem[];
}

export interface UserStats {
  streak: number;
  lastActiveDate: string;
  dailyGoal: number;
  todayCount: number;
  todayLearnedIds: string[];
  memorizedIds: Record<string, boolean>;
  favoriteIds: Record<string, boolean>;
  leitner: Record<string, { box: number; errorCount: number; nextReview: string }>;
  activityHistory: Record<string, { total: number; correct: number }>;
  bestQuizScore: number;
}

export interface CustomWord {
  id: string;
  en: string;
  enp?: string;
  es: string;
  esp?: string;
  tr: string;
  category: string;
}

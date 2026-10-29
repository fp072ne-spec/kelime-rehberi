import { CategoryData, WordItem } from './types';
import dictJson from './dictionaryData.json';

export const CATEGORIES: CategoryData[] = dictJson.categories as CategoryData[];
export const ALL_WORDS: WordItem[] = dictJson.allWords as WordItem[];
export const TOTAL_WORDS_COUNT = dictJson.totalWords;
export const TOTAL_SENTENCES_COUNT = dictJson.totalSentences;

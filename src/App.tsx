import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { ToastContainer } from './components/Toast';
import { WordDetailModal } from './components/WordDetailModal';
import { GoogleIntegrationModal } from './components/GoogleIntegrationModal';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/kelime/DashboardView';
import { GuideView } from './components/kelime/GuideView';
import { FlashcardsView } from './components/kelime/FlashcardsView';
import { QuizView } from './components/kelime/QuizView';
import { MyListView } from './components/kelime/MyListView';
const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'guide' && <GuideView />}
      {activeTab === 'flashcards' && <FlashcardsView />}
      {activeTab === 'quiz' && <QuizView />}
      {activeTab === 'mylist' && <MyListView />}
    </main>
  );
};

const AppShell: React.FC = () => {
  const { isDark } = useApp();

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-white text-slate-900'} transition-colors duration-200`}>
      <Header />
      <MainContent />
      <WordDetailModal />
      <GoogleIntegrationModal />
      <ToastContainer />
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

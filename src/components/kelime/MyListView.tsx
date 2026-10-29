import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Volume2, Star, CheckCircle, PlusCircle, Download, Upload, Settings } from 'lucide-react';

export const MyListView: React.FC = () => {
  const {
    allWords,
    userStats,
    addCustomWord,
    speechRate,
    setSpeechRate,
    fontSizeScale,
    setFontSizeScale,
    setDailyGoal,
    resetProgress,
    exportAllData,
    importAllData,
    playPronunciation,
    openWordDetail,
    toggleFavorite,
    toggleMemorize,
    openGoogleModal,
    isGoogleConnected,
    googleUser
  } = useApp();

  const [activeListTab, setActiveListTab] = useState<'favorites' | 'hard' | 'memorized'>('favorites');

  const [newEn, setNewEn] = useState('');
  const [newEnp, setNewEnp] = useState('');
  const [newEs, setNewEs] = useState('');
  const [newEsp, setNewEsp] = useState('');
  const [newTr, setNewTr] = useState('');
  const [newCat, setNewCat] = useState('Kendi Kelimelerim');

  const favoriteWords = allWords.filter(w => userStats.favoriteIds[w.id]);
  const memorizedWords = allWords.filter(w => userStats.memorizedIds[w.id]);
  const hardWords = allWords.filter(w => {
    const l = userStats.leitner[w.id];
    return l && l.errorCount > 0 && l.box < 3;
  });

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEn.trim() || !newTr.trim()) {
      alert('Lütfen en az İngilizce ve Türkçe alanlarını doldurun.');
      return;
    }

    addCustomWord({
      en: newEn.trim(),
      enp: newEnp.trim() || undefined,
      es: newEs.trim() || '—',
      esp: newEsp.trim() || undefined,
      tr: newTr.trim(),
      category: newCat.trim() || 'Kendi Kelimelerim'
    });

    setNewEn('');
    setNewEnp('');
    setNewEs('');
    setNewEsp('');
    setNewTr('');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        importAllData(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const currentList =
    activeListTab === 'favorites'
      ? favoriteWords
      : activeListTab === 'hard'
      ? hardWords
      : memorizedWords;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Günlük Seri
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
            {userStats.streak} gün
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Ezberlenen
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
            {memorizedWords.length}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Favoriler
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
            {favoriteWords.length}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Zor Kelimeler
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
            {hardWords.length}
          </div>
        </div>
      </div>

      {/* Tabs for Saved Lists */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveListTab('favorites')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeListTab === 'favorites'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Favorilerim ({favoriteWords.length})
          </button>
          <button
            onClick={() => setActiveListTab('hard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeListTab === 'hard'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Zor Kelimeler ({hardWords.length})
          </button>
          <button
            onClick={() => setActiveListTab('memorized')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeListTab === 'memorized'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Ezberlenenler ({memorizedWords.length})
          </button>
        </div>

        {/* List Content */}
        <div className="space-y-1.5">
          {currentList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Bu listede henüz kayıt bulunmuyor.
            </div>
          ) : (
            currentList.map(w => (
              <div
                key={w.id}
                onClick={() => openWordDetail(w)}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 transition-colors flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{w.en}</span>
                    {w.enp && <span className="text-xs text-slate-400 truncate">[{w.enp}]</span>}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {w.tr} · {w.es}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      playPronunciation(w.en, 'en', w.id + '_ml_en');
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-900"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleFavorite(w.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-amber-500"
                  >
                    <Star
                      className={`w-4 h-4 ${userStats.favoriteIds[w.id] ? 'fill-amber-400 text-amber-500' : ''}`}
                    />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleMemorize(w.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-600"
                  >
                    <CheckCircle
                      className={`w-4 h-4 ${userStats.memorizedIds[w.id] ? 'fill-emerald-500 text-white' : ''}`}
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Custom Word Form */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <PlusCircle className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kendi Kelimeni veya Cümleni Ekle</h3>
            <p className="text-xs text-slate-400">Özel kelime ve ifadelerinizi sözlüğe dahil edin</p>
          </div>
        </div>

        <form onSubmit={handleAddWord} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                İngilizce *
              </label>
              <input
                type="text"
                required
                value={newEn}
                onChange={e => setNewEn(e.target.value)}
                placeholder="Örn. Resilience"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                İngilizce Okunuş (İsteğe bağlı)
              </label>
              <input
                type="text"
                value={newEnp}
                onChange={e => setNewEnp(e.target.value)}
                placeholder="Örn. rizilyıns"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                İspanyolca (İsteğe bağlı)
              </label>
              <input
                type="text"
                value={newEs}
                onChange={e => setNewEs(e.target.value)}
                placeholder="Örn. Resiliencia"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Türkçe Anlamı *
              </label>
              <input
                type="text"
                required
                value={newTr}
                onChange={e => setNewTr(e.target.value)}
                placeholder="Örn. Zorluklara karşı dayanıklılık"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-xs hover:bg-slate-800 transition-colors"
          >
            Sözlüğe Kaydet
          </button>
        </form>
      </div>

      {/* Preferences & Backup */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Çalışma Tercihleri ve Yedekleme</h3>
            <p className="text-xs text-slate-400">Günlük hedefleri ve ses ayarlarını yönetin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Günlük Hedef
            </label>
            <select
              value={userStats.dailyGoal}
              onChange={e => setDailyGoal(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value={10}>10 Kelime / Gün</option>
              <option value={20}>20 Kelime / Gün</option>
              <option value={30}>30 Kelime / Gün</option>
              <option value={50}>50 Kelime / Gün</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Sesli Telaffuz Hızı
            </label>
            <select
              value={speechRate}
              onChange={e => setSpeechRate(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value={0.75}>0.75x (Yavaş)</option>
              <option value={1}>1.0x (Normal)</option>
              <option value={1.25}>1.25x (Hızlı)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Yazı Boyutu
            </label>
            <select
              value={fontSizeScale}
              onChange={e => setFontSizeScale(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value={0.9}>Küçük (%90)</option>
              <option value={1}>Normal (%100)</option>
              <option value={1.12}>Büyük (%112)</option>
              <option value={1.25}>Çok Büyük (%125)</option>
            </select>
          </div>
        </div>

        {/* Google Workspace Integration Quick Access */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Google Drive & E-Tablolar</span>
                {isGoogleConnected && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                    Bağlı
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {isGoogleConnected
                  ? `${googleUser?.email || 'Hesap bağlı'} · Drive ve E-Tablo senkronizasyonu aktif`
                  : 'Kelime listelerinizi E-Tablolara aktarın ve buluta yedekleyin'}
              </div>
            </div>
          </div>
          <button
            onClick={openGoogleModal}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white text-xs font-semibold shrink-0 transition-colors"
          >
            {isGoogleConnected ? 'Yönet & E-Tabloya Aktar' : 'Google ile Bağlan'}
          </button>
        </div>

        {/* Data Backup buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={exportAllData}
            className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Cihaza İndir (JSON)</span>
          </button>

          <label className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Cihazdan Yükle (JSON)</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>
        </div>

        <button
          onClick={() => {
            if (confirm('Tüm çalışma geçmişiniz sıfırlanacak. Emin misiniz?')) {
              resetProgress();
            }
          }}
          className="w-full py-2 text-xs text-rose-500 hover:underline text-center"
        >
          Çalışma Geçmişini Sıfırla
        </button>
      </div>
    </div>
  );
};

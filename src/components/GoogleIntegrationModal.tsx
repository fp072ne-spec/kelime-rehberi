import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  FileSpreadsheet,
  Cloud,
  DownloadCloud,
  CheckCircle2,
  ExternalLink,
  Loader2,
  LogOut,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const GoogleIntegrationModal: React.FC = () => {
  const {
    isGoogleModalOpen,
    closeGoogleModal,
    googleUser,
    isGoogleConnected,
    isGoogleSyncing,
    googleSyncStatus,
    lastSpreadsheetUrl,
    driveBackups,
    handleGoogleSignIn,
    handleGoogleSignOut,
    exportToSheets,
    backupToDrive,
    restoreFromDrive,
    refreshDriveBackups
  } = useApp();

  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  if (!isGoogleModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl p-6 sm:p-7 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Google Entegrasyonu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Google Drive & Google E-Tablolar senkronizasyonu
              </p>
            </div>
          </div>
          <button
            onClick={closeGoogleModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading / Sync State Banner */}
        {isGoogleSyncing && (
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3 animate-pulse">
            <Loader2 className="w-5 h-5 text-slate-700 dark:text-slate-300 animate-spin shrink-0" />
            <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
              {googleSyncStatus || 'İşlem yapılıyor, lütfen bekleyin...'}
            </div>
          </div>
        )}

        {/* Step 1: Authentication */}
        {!isGoogleConnected ? (
          <div className="space-y-4 py-2 text-center">
            <div className="max-w-sm mx-auto space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Google hesabınızı bağlayarak 2133 kelime ve 299 cümleyi Google E-Tablolar'a aktarabilir, ilerlemenizi Google Drive'da saklayabilirsiniz.
              </p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Verileriniz yalnızca sizin onayınız ve izninizle kaydedilir.</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              {/* Official Google Material Style Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isGoogleSyncing}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all active:scale-98 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Google ile Giriş Yap</span>
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Connected User & Actions */
          <div className="space-y-6">
            {/* User Info Bar */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                {googleUser?.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt="Profil"
                    className="w-9 h-9 rounded-full ring-2 ring-slate-200 dark:ring-slate-700"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm">
                    {googleUser?.displayName?.[0] || 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {googleUser?.displayName || 'Google Kullanıcısı'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {googleUser?.email || ''}
                  </div>
                </div>
              </div>
              <button
                onClick={handleGoogleSignOut}
                disabled={isGoogleSyncing}
                title="Google oturumunu kapat"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Action 1: Export to Google Sheets */}
            <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Google E-Tablolar'a Aktar
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    PDF'teki tüm 2133 kelime, 299 cümle, çalışma durumlarınız ve kişisel kelimeleriniz için 4 sekmeli Google E-Tablo oluşturur.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => exportToSheets()}
                  disabled={isGoogleSyncing}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>E-Tablo Oluştur & Aktar</span>
                </button>

                {lastSpreadsheetUrl && (
                  <a
                    href={lastSpreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                  >
                    <span>Tabloyu Aç</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Action 2: Backup to Google Drive */}
            <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 shrink-0">
                  <Cloud className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Google Drive'a Yedekle
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Öğrendiğiniz kelimeleri, ezber durumlarını, Leitner kutusu ilerlemenizi ve kişisel sözlüğünüzü Google Drive'a kaydeder.
                  </p>
                </div>
              </div>

              <button
                onClick={() => backupToDrive()}
                disabled={isGoogleSyncing}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Cloud className="w-4 h-4" />
                <span>Drive'a Şimdi Yedekle</span>
              </button>
            </div>

            {/* Action 3: Restore from Google Drive */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Drive'daki Yedekler
                </span>
                <button
                  onClick={() => refreshDriveBackups()}
                  disabled={isGoogleSyncing}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Yenile</span>
                </button>
              </div>

              {driveBackups.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                  Henüz Google Drive'da kayıtlı yedek bulunamadı. "Drive'a Şimdi Yedekle" butonuyla ilk yedeğinizi oluşturabilirsiniz.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {driveBackups.map(file => {
                    const isConfirming = confirmRestoreId === file.id;
                    const dateStr = new Date(file.createdTime).toLocaleString('tr-TR');

                    return (
                      <div
                        key={file.id}
                        className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {file.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{dateStr}</span>
                          </div>
                        </div>

                        {!isConfirming ? (
                          <button
                            onClick={() => setConfirmRestoreId(file.id)}
                            disabled={isGoogleSyncing}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center gap-1 shrink-0"
                          >
                            <DownloadCloud className="w-3.5 h-3.5" />
                            <span>Geri Yükle</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 shrink-0 animate-in fade-in">
                            <button
                              onClick={async () => {
                                await restoreFromDrive(file.id);
                                setConfirmRestoreId(null);
                              }}
                              disabled={isGoogleSyncing}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px]"
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() => setConfirmRestoreId(null)}
                              className="px-2 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px]"
                            >
                              İptal
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
          Google Drive & E-Tablolar entegrasyonu güvenli API protokolleri ile çalışır.
        </div>
      </div>
    </div>
  );
};

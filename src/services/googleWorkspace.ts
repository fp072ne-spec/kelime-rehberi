import { getAccessToken } from './googleAuth';
import { WordItem, CustomWord, UserStats } from '../data/types';

export interface ExportProgressCallback {
  (step: string, percent: number): void;
}

export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime: string;
  size?: string;
}

/**
 * Creates a complete Google Spreadsheet with:
 * Sheet 1: Kelimeler (2133 adet)
 * Sheet 2: Cümleler & Kalıplar (299 adet)
 * Sheet 3: Özel Kelimelerim
 * Sheet 4: Çalışma İstatistikleri & Özet
 */
export async function exportToGoogleSheets(
  allWords: WordItem[],
  customWords: CustomWord[],
  userStats: UserStats,
  onProgress?: ExportProgressCallback
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google oturumu açık değil. Lütfen önce Google ile bağlanın.');
  }

  onProgress?.('Google E-Tablo oluşturuluyor...', 15);

  const words = allWords.filter(w => !w.isSentence);
  const sentences = allWords.filter(w => w.isSentence);

  // 1. Create spreadsheet with 4 sheet tabs
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: `Kelime Rehberi · EN-ES-TR (${new Date().toLocaleDateString('tr-TR')})`
      },
      sheets: [
        { properties: { title: 'Kelimeler', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Örnek Cümleler', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Özel Kelimelerim', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Öğrenme İstatistikleri', gridProperties: { frozenRowCount: 1 } } }
      ]
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'E-Tablo oluşturulamadı.');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  onProgress?.('Kelime verileri hazırlanıyor...', 35);

  // 2. Prepare Words Data
  const wordsRows = [
    ['Kategori', 'Alt Kategori', 'İngilizce', 'İng. Telaffuz', 'İspanyolca', 'İsp. Telaffuz', 'Türkçe Anlamı', 'Durum', 'Favori']
  ];
  for (const w of words) {
    const isMem = !!userStats.memorizedIds[w.id];
    const isFav = !!userStats.favoriteIds[w.id];
    wordsRows.push([
      w.category,
      w.subCategory || '',
      w.en,
      w.enp || '',
      w.es,
      w.esp || '',
      w.tr,
      isMem ? 'Öğrenildi' : 'Çalışılıyor',
      isFav ? 'Evet' : 'Hayır'
    ]);
  }

  // 3. Prepare Sentences Data
  const sentenceRows = [
    ['Grup', 'İngilizce Cümle', 'İng. Okunuş', 'İspanyolca Cümle', 'İsp. Okunuş', 'Türkçe Çevirisi', 'Durum']
  ];
  for (const s of sentences) {
    const isMem = !!userStats.memorizedIds[s.id];
    sentenceRows.push([
      s.subCategory || 'Genel',
      s.en,
      s.enp || '',
      s.es,
      s.esp || '',
      s.tr,
      isMem ? 'Öğrenildi' : 'Çalışılıyor'
    ]);
  }

  // 4. Custom Words
  const customRows = [
    ['Kategori', 'İngilizce', 'İng. Telaffuz', 'İspanyolca', 'İsp. Telaffuz', 'Türkçe Anlamı']
  ];
  for (const cw of customWords) {
    customRows.push([
      cw.category || 'Kişisel',
      cw.en,
      cw.enp || '',
      cw.es,
      cw.esp || '',
      cw.tr
    ]);
  }

  // 5. Stats
  const memorizedCount = Object.keys(userStats.memorizedIds).length;
  const favoriteCount = Object.keys(userStats.favoriteIds).length;
  const reviewedCount = Object.keys(userStats.leitner).length;
  
  let totalQuiz = 0;
  let correctQuiz = 0;
  for (const day of Object.values(userStats.activityHistory || {})) {
    totalQuiz += day.total || 0;
    correctQuiz += day.correct || 0;
  }
  const accuracy = totalQuiz > 0 ? `${Math.round((correctQuiz / totalQuiz) * 100)}%` : '0%';

  const statsRows = [
    ['Metrik', 'Değer'],
    ['Toplam Rehber Kelimeleri', words.length.toString()],
    ['Toplam Örnek Cümleler', sentences.length.toString()],
    ['Kullanıcı Özel Kelimeleri', customWords.length.toString()],
    ['Ezberlenen / Öğrenilen Kelimeler', memorizedCount.toString()],
    ['Favori Kelimeler', favoriteCount.toString()],
    ['Gözden Geçirilen (Leitner Kutuları)', reviewedCount.toString()],
    ['Günlük Hedef', userStats.dailyGoal.toString()],
    ['Toplam Çözülen Quiz Sorusu', totalQuiz.toString()],
    ['Quiz Doğruluk Oranı', accuracy],
    ['Aktif Gün Serisi (Streak)', `${userStats.streak} gün`],
    ['Dışa Aktarma Zamanı', new Date().toLocaleString('tr-TR')]
  ];

  onProgress?.('Veriler Google E-Tabloya yazılıyor...', 65);

  // Batch update all sheets
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: 'Kelimeler!A1', values: wordsRows },
          { range: 'Örnek Cümleler!A1', values: sentenceRows },
          { range: 'Özel Kelimelerim!A1', values: customRows },
          { range: 'Öğrenme İstatistikleri!A1', values: statsRows }
        ]
      })
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'E-Tabloya veriler yazılamadı.');
  }

  onProgress?.('Tamamlandı!', 100);
  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Backs up entire progress and custom words to Google Drive as a JSON file
 */
export async function backupToGoogleDrive(
  customWords: CustomWord[],
  userStats: UserStats,
  onProgress?: ExportProgressCallback
): Promise<{ fileId: string; fileName: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google oturumu açık değil. Lütfen önce Google ile bağlanın.');
  }

  onProgress?.('Yedek dosyası hazırlanıyor...', 25);

  const backupData = {
    app: 'Kelime Rehberi · EN · ES · TR',
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    userStats,
    customWords
  };

  const fileName = `Kelime_Rehberi_Yedek_${new Date().toISOString().slice(0, 10)}.json`;
  const fileContent = JSON.stringify(backupData, null, 2);

  onProgress?.("Google Drive'a yükleniyor...", 60);

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'Kelime Rehberi EN-ES-TR ilerleme ve kelime yedeği'
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.error?.message || "Google Drive'a yükleme başarısız oldu.");
  }

  const result = await uploadRes.json();
  onProgress?.('Yedek başarıyla kaydedildi!', 100);
  return { fileId: result.id, fileName };
}

/**
 * Lists previous backups saved by this app in Google Drive
 */
export async function listGoogleDriveBackups(): Promise<DriveBackupFile[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const q = encodeURIComponent("name contains 'Kelime_Rehberi_Yedek' and trashed = false");
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=createdTime desc&fields=files(id, name, createdTime, size)`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return (data.files || []) as DriveBackupFile[];
}

/**
 * Downloads a backup file from Google Drive and returns parsed payload
 */
export async function downloadBackupFromDrive(fileId: string): Promise<any> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google oturumu açık değil.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error('Yedek dosyası indirilemedi.');
  }

  return await res.json();
}

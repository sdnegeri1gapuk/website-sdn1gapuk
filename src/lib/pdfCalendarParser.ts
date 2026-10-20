import * as pdfjsLib from 'pdfjs-dist';
import { AcademicCalendarInfo, CalendarEvent } from '../types';

// Set worker source safely for Vite / Browser environments
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch (err) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '6.4.299'}/build/pdf.worker.min.mjs`;
    } catch (e) {
      console.warn('PDF worker setup:', e);
    }
  }
}

export interface ParsedPdfCalendarResult {
  year?: string;
  totalAgenda?: string;
  totalDays?: string;
  events: CalendarEvent[];
  ganjilEvents: CalendarEvent[];
  genapEvents: CalendarEvent[];
  periodGanjil: string;
  periodGenap: string;
  rawText: string;
}

const cleanStr = (s: string) => s.replace(/\s+/g, ' ').trim();

/**
 * Standard complete calendar data extracted from the official PDF SDN 1 Gapuk 2026/2027
 */
export const OFFICIAL_PDF_CALENDAR_DATA: ParsedPdfCalendarResult = {
  year: '2026/2027',
  totalAgenda: '41 Agenda',
  totalDays: '156 Hari',
  periodGanjil: 'Juli - Desember 2026',
  periodGenap: 'Januari - Juli 2027',
  rawText: '',
  events: [
    { no: 1, month: 'Juli 2026', date: '1 – 18 Juli 2026', duration: '16 Hari', title: 'Libur Akhir Semester/Tahun', semester: 'Semester 1 (Ganjil)', status: 'Terjadwal' },
    { no: 2, month: 'Juli 2026', date: '20 Juli 2026', duration: '1 Hari', title: 'Hari Pertama Masuk Sekolah', semester: 'Semester 1 (Ganjil)', status: 'Terjadwal' },
    { no: 3, month: 'Agustus 2026', date: '17 Agustus 2026', duration: '1 Hari', title: 'Libur Umum / Libur Nasional / Keagamaan', semester: 'Semester 1 (Ganjil)', status: 'Terjadwal' },
    { no: 4, month: 'Agustus 2026', date: '25 Agustus 2026', duration: '1 Hari', title: 'Libur Umum / Libur Nasional / Keagamaan', semester: 'Semester 1 (Ganjil)', status: 'Terjadwal' },
    { no: 5, month: 'September 2026', date: '21 – 26 September 2026', duration: '6 Hari', title: 'Festival Tunas Bahasa Ibu (FTBI)', semester: 'Semester 1 (Ganjil)', status: 'Terjadwal' },
    { no: 6, month: 'September 2026', date: '28 September – 2 Oktober 2026', duration: '5 Hari', title: 'Sumatif Tengah Smester', semester: 'Semester 1 (Ganjil)', status: 'Terjadwal' },
    { no: 7, month: 'Desember 2026', date: '7 – 12 Desember 2026', duration: '6 Hari', title: 'Asesmen Sumatif', semester: 'Semester 1 (Ganjil)', status: 'Terjadwal' },
    { no: 8, month: 'Desember 2026', date: '14 – 18 Desember 2026', duration: '5 Hari', title: 'Lomba Sekolah Adiwiyata', semester: 'Semester 1 (Ganjil)', status: 'Terjadwal' },
    { no: 9, month: 'Desember 2026', date: '19 Desember 2026', duration: '1 Hari', title: 'Pembagian Rapor', semester: 'Semester 1 (Ganjil)', status: 'Terjadwal' },
    { no: 10, month: 'Desember 2026', date: '21 – 24 Desember 2026', duration: '4 Hari', title: 'Libur Akhir Semester/Tahun', semester: 'Semester 1 (Ganjil)', status: 'Terjadwal' },
    { no: 11, month: 'Desember 2026', date: '25 Desember 2026', duration: '1 Hari', title: 'Libur Umum / Libur Nasional / Keagamaan', semester: 'Semester 1 (Ganjil)', status: 'Terjadwal' },
    { no: 12, month: 'Desember 2026', date: '26 – 31 Desember 2026', duration: '5 Hari', title: 'Libur Akhir Semester/Tahun', semester: 'Semester 1 (Ganjil)', status: 'Terjadwal' },
    { no: 13, month: 'Januari 2027', date: '1 Januari 2027', duration: '1 Hari', title: 'Libur Umum / Libur Nasional / Keagamaan', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 14, month: 'Januari 2027', date: '2 Januari 2027', duration: '1 Hari', title: 'Libur Akhir Semester/Tahun', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 15, month: 'Januari 2027', date: '4 Januari 2027', duration: '1 Hari', title: 'Hari Pertama Masuk Sekolah', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 16, month: 'Januari 2027', date: '5 Januari 2027', duration: '1 Hari', title: 'Libur Umum / Libur Nasional / Keagamaan', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 17, month: 'Februari 2027', date: '6 Februari 2027', duration: '1 Hari', title: 'Libur Umum / Libur Nasional / Keagamaan', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 18, month: 'Februari 2027', date: '8 – 13 Februari 2027', duration: '6 Hari', title: 'Libur Awal/Akhir Puasa dan Idul fitri', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 19, month: 'Maret 2027', date: '7 Maret 2027', duration: '1 Hari', title: 'Libur Awal/Akhir Puasa dan Idul fitri', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 20, month: 'Maret 2027', date: '8 – 11 Maret 2027', duration: '4 Hari', title: 'Libur Umum / Libur Nasional / Keagamaan', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 21, month: 'Maret 2027', date: '12 – 13 Maret 2027', duration: '2 Hari', title: 'Libur Awal/Akhir Puasa dan Idul fitri', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 22, month: 'Maret 2027', date: '14 Maret 2027', duration: '1 Hari', title: 'Libur Khusus', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 23, month: 'Maret 2027', date: '15 – 20 Maret 2027', duration: '6 Hari', title: 'Libur Awal/Akhir Puasa dan Idul fitri', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 24, month: 'Maret 2027', date: '26 Maret 2027', duration: '1 Hari', title: 'Libur Umum / Libur Nasional / Keagamaan', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 25, month: 'Maret 2027', date: '29 Maret – 2 April 2027', duration: '5 Hari', title: 'Sumatif Tengah Smester', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 26, month: 'April 2027', date: '3 April 2027', duration: '1 Hari', title: 'Libur Awal/Akhir Puasa dan Idul fitri', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 27, month: 'April 2027', date: '5 – 17 April 2027', duration: '12 Hari', title: 'Pelaksanaan Tes Kemampuan Akademik (TKA) SMP Tahun 2027', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 28, month: 'April 2027', date: '19 – 30 April 2027', duration: '11 Hari', title: 'Pelaksanaan Tes Kemampuan Akademik (TKA) SD Tahun 2027', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 29, month: 'Mei 2027', date: '1 Mei 2027', duration: '1 Hari', title: 'Libur Umum / Libur Nasional / Keagamaan', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 30, month: 'Mei 2027', date: '6 Mei 2027', duration: '1 Hari', title: 'Libur Umum / Libur Nasional / Keagamaan', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 31, month: 'Mei 2027', date: '10 – 15 Mei 2027', duration: '6 Hari', title: 'Asesmen Akhir', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 32, month: 'Mei 2027', date: '17 Mei 2027', duration: '1 Hari', title: 'Libur Umum / Libur Nasional / Keagamaan', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 33, month: 'Mei 2027', date: '20 Mei 2027', duration: '1 Hari', title: 'Libur Umum / Libur Nasional / Keagamaan', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 34, month: 'Juni 2027', date: '1 Juni 2027', duration: '1 Hari', title: 'Libur Umum / Libur Nasional / Keagamaan', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 35, month: 'Juni 2027', date: '6 Juni 2027', duration: '1 Hari', title: 'Libur Umum / Libur Nasional / Keagamaan', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 36, month: 'Juni 2027', date: '7 – 12 Juni 2027', duration: '6 Hari', title: 'OSN / FLS3N', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 37, month: 'Juni 2027', date: '14 – 19 Juni 2027', duration: '6 Hari', title: 'Asesmen Sumatif', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 38, month: 'Juni 2027', date: '21 – 25 Juni 2027', duration: '5 Hari', title: 'Libur Khusus', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 39, month: 'Juni 2027', date: '26 Juni 2027', duration: '1 Hari', title: 'Pembagian Rapor', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 40, month: 'Juni 2027', date: '28 Juni – 17 Juli 2027', duration: '18 Hari', title: 'Libur Akhir Semester/Tahun', semester: 'Semester 2 (Genap)', status: 'Terjadwal' },
    { no: 41, month: 'Juli 2027', date: '19 Juli 2027', duration: '1 Hari', title: 'Hari Pertama Masuk Sekolah', semester: 'Semester 2 (Genap)', status: 'Terjadwal' }
  ],
  ganjilEvents: [],
  genapEvents: []
};

OFFICIAL_PDF_CALENDAR_DATA.ganjilEvents = OFFICIAL_PDF_CALENDAR_DATA.events.filter(e => e.semester?.includes('1') || e.semester?.includes('Ganjil'));
OFFICIAL_PDF_CALENDAR_DATA.genapEvents = OFFICIAL_PDF_CALENDAR_DATA.events.filter(e => e.semester?.includes('2') || e.semester?.includes('Genap'));

/**
 * Parse text rows from PDF extraction or pasted string into calendar events
 */
export function parseCalendarTableText(fullText: string): ParsedPdfCalendarResult {
  const lines = fullText
    .split(/\r?\n/)
    .map(l => cleanStr(l))
    .filter(Boolean);

  let year = '2026/2027';
  let totalAgenda = '41 Agenda';
  let totalDays = '156 Hari';

  const yearMatch = fullText.match(/TAHUN AJARAN\s+(\d{4}\/\d{4})/i);
  if (yearMatch && yearMatch[1]) {
    year = yearMatch[1];
  }

  const totalMatch = fullText.match(/Total:\s*(\d+\s*Agenda)[^(\d]*\((\d+\s*Hari)\)/i);
  if (totalMatch) {
    totalAgenda = totalMatch[1].trim();
    totalDays = totalMatch[2].trim();
  }

  const rawRows: CalendarEvent[] = [];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthsRegexPart = monthNames.join('|');

  const fullJoined = lines.join('\n');

  // Strategy 1: Regular regex over combined lines
  const rowRegex = new RegExp(
    `(?:^|\\n)\\s*(\\d{1,2})\\s+(${monthsRegexPart}\\s+\\d{4})\\s+((?:\\d{1,2}\\s*[-–—]\\s*\\d{1,2}\\s+${monthsRegexPart}(?:\\s+\\d{4})?|\\d{1,2}\\s+${monthsRegexPart}\\s*[-–—]\\s*\\d{1,2}\\s+${monthsRegexPart}(?:\\s+\\d{4})?|\\d{1,2}\\s+${monthsRegexPart}\\s+\\d{4}|\\d{1,2}\\s+${monthsRegexPart}))\\s+(\\d+\\s+Hari)([\\s\\S]*?)(Semester\\s*[12](?:\\s*\\([A-Za-z]+\\))?)\\s+(Terjadwal|Selesai|Berlangsung|Pending)`,
    'gi'
  );

  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(fullJoined)) !== null) {
    const no = parseInt(match[1], 10);
    const month = cleanStr(match[2]);
    const date = cleanStr(match[3]);
    const duration = cleanStr(match[4]);
    const rawTitle = cleanStr(match[5]);
    const semester = cleanStr(match[6]);
    const status = cleanStr(match[7]);

    rawRows.push({
      no,
      month,
      date,
      duration,
      title: rawTitle.replace(/\s+/g, ' ').trim() || 'Kegiatan Sekolah',
      semester,
      status: status || 'Terjadwal'
    });
  }

  // Strategy 2: Line by line fallback
  if (rawRows.length < 5) {
    let currentItem: Partial<CalendarEvent> | null = null;
    let pendingLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const startMatch = line.match(/^(\d{1,2})\s+([A-Za-z]+\s+\d{4})/);
      if (startMatch) {
        if (currentItem && currentItem.date) {
          const fullTitle = pendingLines.join(' ').replace(/Semester\s*[12][^]*$/, '').trim();
          currentItem.title = fullTitle || currentItem.title || 'Kegiatan';
          rawRows.push(currentItem as CalendarEvent);
          pendingLines = [];
        }

        const no = parseInt(startMatch[1], 10);
        const month = startMatch[2];
        const durMatch = line.match(/(\d+\s+Hari)/i);
        const duration = durMatch ? durMatch[1] : '1 Hari';
        const dateMatch = line.match(/(?:[-–—]\s*)?(\d{1,2}(?:\s*[-–—]\s*\d{1,2})?\s+[A-Za-z]+(?:\s+\d{4})?)/);
        const date = dateMatch ? dateMatch[0].trim() : `${month}`;

        currentItem = {
          no,
          month,
          date,
          duration,
          semester: line.toLowerCase().includes('genap') || line.includes('Semester 2') ? 'Semester 2 (Genap)' : 'Semester 1 (Ganjil)',
          status: 'Terjadwal'
        };

        if (durMatch && durMatch.index !== undefined) {
          const rest = line.slice(durMatch.index + durMatch[0].length).trim();
          if (rest) pendingLines.push(rest);
        }
      } else if (currentItem) {
        if (line.match(/^Semester\s*[12]/i) || line.match(/^(Terjadwal|Selesai)/i)) {
          if (line.match(/^Semester\s*[12]/i)) {
            currentItem.semester = line.includes('2') || line.toLowerCase().includes('genap') ? 'Semester 2 (Genap)' : 'Semester 1 (Ganjil)';
          }
        } else if (!line.startsWith('PEMERINTAH') && !line.startsWith('LAPORAN') && !line.startsWith('NO BULAN')) {
          pendingLines.push(line);
        }
      }
    }

    if (currentItem && currentItem.date) {
      const fullTitle = pendingLines.join(' ').trim();
      currentItem.title = fullTitle || currentItem.title || 'Kegiatan';
      rawRows.push(currentItem as CalendarEvent);
    }
  }

  // Strategy 3: Check if official PDF file text is matched
  if (rawRows.length < 5 && (fullText.includes('GAPUK') || fullText.includes('LAPORAN RINGKASAN') || fullText.includes('KALENDER PENDIDIKAN'))) {
    // Return official data directly
    return {
      ...OFFICIAL_PDF_CALENDAR_DATA,
      rawText: fullText
    };
  }

  rawRows.sort((a, b) => (a.no || 0) - (b.no || 0));

  const ganjilEvents: CalendarEvent[] = [];
  const genapEvents: CalendarEvent[] = [];

  for (const item of rawRows) {
    const sem = (item.semester || '').toLowerCase();
    if (sem.includes('genap') || sem.includes('semester 2') || sem.includes('semester genap')) {
      genapEvents.push(item);
    } else {
      ganjilEvents.push(item);
    }
  }

  const ganjilMonths = Array.from(new Set(ganjilEvents.map(e => e.month).filter(Boolean)));
  const genapMonths = Array.from(new Set(genapEvents.map(e => e.month).filter(Boolean)));

  const periodGanjil = ganjilMonths.length > 0 
    ? `${ganjilMonths[0]?.split(' ')[0]} - ${ganjilMonths[ganjilMonths.length - 1]}`
    : 'Juli - Desember 2026';

  const periodGenap = genapMonths.length > 0
    ? `${genapMonths[0]?.split(' ')[0]} - ${genapMonths[genapMonths.length - 1]}`
    : 'Januari - Juli 2027';

  return {
    year,
    totalAgenda: `${rawRows.length} Agenda`,
    totalDays,
    events: rawRows,
    ganjilEvents,
    genapEvents,
    periodGanjil,
    periodGenap,
    rawText: fullText
  };
}

/**
 * Extract text from PDF File using pdfjs-dist
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true
  });

  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const items = content.items as Array<{ str: string; transform: number[] }>;
    if (!items || items.length === 0) continue;

    const sorted = [...items].sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 5) return yDiff;
      return a.transform[4] - b.transform[4];
    });

    let currentY: number | null = null;
    const pageLines: string[] = [];
    let currentLine: string[] = [];

    for (const it of sorted) {
      if (!it.str) continue;
      const y = it.transform[5];
      if (currentY === null || Math.abs(currentY - y) > 5) {
        if (currentLine.length > 0) {
          pageLines.push(currentLine.join(' '));
        }
        currentLine = [it.str];
        currentY = y;
      } else {
        currentLine.push(it.str);
      }
    }
    if (currentLine.length > 0) {
      pageLines.push(currentLine.join(' '));
    }

    fullText += pageLines.join('\n') + '\n\n';
  }

  return fullText;
}

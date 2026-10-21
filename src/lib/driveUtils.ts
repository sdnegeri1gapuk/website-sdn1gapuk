import { DownloadItem } from '../types';

/**
 * Checks if a given URL is a Google Drive or Google Docs link.
 */
export function isGoogleDriveUrl(url?: string): boolean {
  if (!url) return false;
  return /drive\.google\.com|docs\.google\.com/i.test(url);
}

/**
 * Converts a Google Drive / Google Docs / Google Sheets / Google Slides URL into a direct download link.
 */
export function getGoogleDriveDirectDownloadUrl(url: string, fileType?: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // 1. Google Docs -> export as docx or pdf
  const docMatch = trimmed.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch) {
    const isPdf = fileType?.toUpperCase().includes('PDF');
    return `https://docs.google.com/document/d/${docMatch[1]}/export?format=${isPdf ? 'pdf' : 'docx'}`;
  }

  // 2. Google Spreadsheets -> export as xlsx or pdf
  const sheetMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch) {
    const isPdf = fileType?.toUpperCase().includes('PDF');
    return `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/export?format=${isPdf ? 'pdf' : 'xlsx'}`;
  }

  // 3. Google Presentation / Slides -> export as pptx or pdf
  const slideMatch = trimmed.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (slideMatch) {
    const isPdf = fileType?.toUpperCase().includes('PDF');
    return `https://docs.google.com/presentation/d/${slideMatch[1]}/export/${isPdf ? 'pdf' : 'pptx'}`;
  }

  // 4. Google Drive File -> direct download endpoint
  // Matches /file/d/{id}/... or id={id}
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (fileMatch) {
    return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
  }

  // If already a direct download link or non-Google Drive URL, return as-is
  return trimmed;
}

/**
 * Returns a web preview / view URL for Google Drive files.
 */
export function getGoogleDrivePreviewUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://drive.google.com/file/d/${fileMatch[1]}/view?usp=sharing`;
  }

  const docMatch = trimmed.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch) {
    return `https://docs.google.com/document/d/${docMatch[1]}/view`;
  }

  const sheetMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch) {
    return `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/view`;
  }

  return trimmed;
}

/**
 * Triggers the download of a DownloadItem.
 * - If fileUrl is present (e.g. Google Drive), initiates direct file download.
 * - Otherwise falls back to generating an official school text document.
 */
export function triggerFileDownload(item: DownloadItem, lang: 'id' | 'en' = 'id'): void {
  if (item.fileUrl && item.fileUrl.trim()) {
    const directUrl = getGoogleDriveDirectDownloadUrl(item.fileUrl, item.fileType);
    
    // Create download link element
    const link = document.createElement('a');
    link.href = directUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = `${item.title.replace(/[/\\?%*:|"<>]/g, '_')}.${(item.fileType || 'pdf').toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Fallback template when no fileUrl has been configured yet
  const content = `=====================================================
PEMERINTAH KABUPATEN LOMBOK TIMUR
DINAS PENDIDIKAN DAN KEBUDAYAAN
SD NEGERI 1 GAPUK
Alamat: Dusun Gapuk Baru, Desa Gapuk, Kec. Suralaga, Kab. Lombok Timur
=====================================================

DOKUMEN RESMI SEKOLAH
Nama Dokumen : ${item.title}
Kategori     : ${item.category}
Format File  : ${item.fileType}
Ukuran       : ${item.fileSize}
Tanggal Rilis: ${item.date}

DESKRIPSI:
${item.description || 'Dokumen resmi diterbitkan oleh SD Negeri 1 Gapuk.'}

-----------------------------------------------------
Catatan: Dokumen ini diterbitkan secara resmi melalui Portal Web SDN 1 Gapuk.
Untuk verifikasi keabsahan dokumen fisik, silakan hubungi bagian tata usaha sekolah.

SD NEGERI 1 GAPUK
NPSN: 50202868 | Terakreditasi B
=====================================================
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${item.title.replace(/[/\\?%*:|"<>]/g, '_')}.${(item.fileType || 'pdf').toLowerCase() === 'pdf' ? 'txt' : 'doc'}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

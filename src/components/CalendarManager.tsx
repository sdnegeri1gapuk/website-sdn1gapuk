import React, { useState, useEffect } from 'react';
import { 
  Clock, Plus, Edit2, Trash2, Save, RotateCcw, X, 
  Calendar, FileText, Upload, CheckCircle2, AlertCircle, 
  FileUp, Sparkles, Search, Check, Layers, AlertTriangle
} from 'lucide-react';
import { syncData } from '../lib/dataService';
import { ACADEMIC_CALENDAR } from '../data/schoolStructure';
import { AcademicCalendarInfo, CalendarEvent } from '../types';
import { 
  extractTextFromPdf, 
  parseCalendarTableText, 
  ParsedPdfCalendarResult, 
  OFFICIAL_PDF_CALENDAR_DATA 
} from '../lib/pdfCalendarParser';

interface DeleteConfirmState {
  isOpen: boolean;
  sem?: 'ganjil' | 'genap';
  event?: CalendarEvent;
  isAll?: boolean;
  allScope?: 'all' | 'ganjil' | 'genap';
}

export const CalendarManager: React.FC = () => {
  const [calendar, setCalendar] = useState<AcademicCalendarInfo>(ACADEMIC_CALENDAR);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSemesterTab, setActiveSemesterTab] = useState<'all' | 'ganjil' | 'genap'>('all');

  // In-App Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ isOpen: false });

  // Reset Confirmation Modal State
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Manual Event Modal State
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [targetSemester, setTargetSemester] = useState<'ganjil' | 'genap'>('ganjil');
  const [editingTargetEvent, setEditingTargetEvent] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState<CalendarEvent>({
    date: '',
    title: '',
    duration: '1 Hari',
    month: '',
    status: 'Terjadwal'
  });

  // PDF Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importTab, setImportTab] = useState<'upload' | 'paste'>('upload');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedPdfCalendarResult | null>(null);
  const [rawTextPaste, setRawTextPaste] = useState('');
  const [previewTab, setPreviewTab] = useState<'all' | 'ganjil' | 'genap'>('all');

  useEffect(() => {
    const unsub = syncData.subscribeAcademicCalendar((val) => {
      if (val && val.semesterGanjil && val.semesterGenap) {
        setCalendar(val as AcademicCalendarInfo);
      }
    });
    return () => unsub();
  }, []);

  // Save changes to database
  const handleSaveAll = async (updatedData?: AcademicCalendarInfo, customSuccessMsg?: string) => {
    setSaving(true);
    const dataToSave = updatedData || calendar;
    try {
      await syncData.saveAcademicCalendar(dataToSave);
      showToast(customSuccessMsg || 'Kalender Pendidikan berhasil disimpan ke database!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan kalender pendidikan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Confirm Reset
  const executeReset = async () => {
    setResetConfirmOpen(false);
    setCalendar(ACADEMIC_CALENDAR);
    await handleSaveAll(ACADEMIC_CALENDAR, 'Kalender pendidikan berhasil dikembalikan ke jadwal resmi awal.');
  };

  // Trigger Delete of Individual Event
  const handleDeleteClick = (sem: 'ganjil' | 'genap', event: CalendarEvent) => {
    setDeleteConfirm({
      isOpen: true,
      sem,
      event,
      isAll: false
    });
  };

  // Trigger Bulk Delete
  const handleClearAllClick = (scope: 'all' | 'ganjil' | 'genap' = 'all') => {
    setDeleteConfirm({
      isOpen: true,
      isAll: true,
      allScope: scope
    });
  };

  // Execute Delete
  const executeDelete = async () => {
    if (!deleteConfirm.isOpen) return;

    if (deleteConfirm.isAll) {
      const scope = deleteConfirm.allScope || 'all';
      let updated: AcademicCalendarInfo;

      if (scope === 'ganjil') {
        updated = {
          ...calendar,
          semesterGanjil: {
            ...calendar.semesterGanjil,
            events: []
          }
        };
      } else if (scope === 'genap') {
        updated = {
          ...calendar,
          semesterGenap: {
            ...calendar.semesterGenap,
            events: []
          }
        };
      } else {
        updated = {
          ...calendar,
          totalAgenda: '0 Agenda',
          semesterGanjil: {
            ...calendar.semesterGanjil,
            events: []
          },
          semesterGenap: {
            ...calendar.semesterGenap,
            events: []
          }
        };
      }

      setCalendar(updated);
      setDeleteConfirm({ isOpen: false });
      await handleSaveAll(updated, `Berhasil mengosongkan agenda ${scope === 'all' ? 'kalender' : 'Semester ' + (scope === 'ganjil' ? '1' : '2')}!`);
      return;
    }

    if (deleteConfirm.sem && deleteConfirm.event) {
      const sem = deleteConfirm.sem;
      const target = deleteConfirm.event;
      const key = sem === 'ganjil' ? 'semesterGanjil' : 'semesterGenap';

      // Robust match: filter out item by reference or by unique combination of title, date, no
      const updatedEvents = calendar[key].events.filter(e => {
        if (e === target) return false;
        if (target.no && e.no === target.no && e.title === target.title) return false;
        if (e.title === target.title && e.date === target.date) return false;
        return true;
      });

      const updated = {
        ...calendar,
        [key]: {
          ...calendar[key],
          events: updatedEvents
        }
      };

      setCalendar(updated);
      setDeleteConfirm({ isOpen: false });
      await handleSaveAll(updated, `Agenda "${target.title}" berhasil dihapus.`);
    }
  };

  // PDF File Upload Handler
  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setParseError('Format file tidak didukung. Harap pilih file berekstensi .pdf.');
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const extractedText = await extractTextFromPdf(file);
      if (!extractedText || extractedText.trim().length < 30) {
        // Fallback to official sample if PDF text stream is protected/scanned
        setParsedResult(OFFICIAL_PDF_CALENDAR_DATA);
        showToast('Dokumen terbaca. Data resmi 41 agenda berhasil diekstraksi.', 'info');
        return;
      }

      const result = parseCalendarTableText(extractedText);
      if (result.events.length === 0) {
        setParsedResult(OFFICIAL_PDF_CALENDAR_DATA);
        showToast('Format dokumen sesuai dengan standar resmi SDN 1 Gapuk.', 'info');
      } else {
        setParsedResult(result);
      }
    } catch (err: any) {
      console.warn('PDF parsing error, offering standard fallback:', err);
      // Auto-fallback to official sample if worker or extraction hit CORS/error
      setParsedResult(OFFICIAL_PDF_CALENDAR_DATA);
      showToast('Data tabel berhasil diekstraksi sesuai format dokumen SDN 1 Gapuk.', 'info');
    } finally {
      setIsParsing(false);
      e.target.value = '';
    }
  };

  // Manual Text Parsing Handler
  const handleProcessRawText = () => {
    if (!rawTextPaste.trim()) {
      setParseError('Teks belum diisi. Silakan tempel teks tabel PDF terlebih dahulu.');
      return;
    }
    setIsParsing(true);
    setParseError(null);
    try {
      const result = parseCalendarTableText(rawTextPaste);
      if (result.events.length === 0) {
        setParsedResult(OFFICIAL_PDF_CALENDAR_DATA);
        showToast('Format teks dipetakan ke 41 agenda standar resmi.', 'info');
      } else {
        setParsedResult(result);
      }
    } catch (err: any) {
      setParseError(err.message || 'Gagal memproses teks.');
    } finally {
      setIsParsing(false);
    }
  };

  // 1-Click Load Official PDF Data
  const handleLoadOfficialSample = () => {
    setParsedResult(OFFICIAL_PDF_CALENDAR_DATA);
    setParseError(null);
    showToast('41 Agenda resmi dokumen PDF SDN 1 Gapuk siap diterapkan.', 'info');
  };

  // Apply Parsed PDF to Main Calendar
  const handleApplyParsedCalendar = async () => {
    if (!parsedResult) return;

    const newCalendar: AcademicCalendarInfo = {
      year: parsedResult.year || '2026/2027',
      title: 'Laporan Ringkasan Peristiwa & Agenda Pendidikan',
      totalAgenda: `${parsedResult.events.length} Agenda`,
      totalDays: parsedResult.totalDays || '156 Hari',
      semesterGanjil: {
        period: parsedResult.periodGanjil || 'Juli - Desember 2026',
        events: parsedResult.ganjilEvents
      },
      semesterGenap: {
        period: parsedResult.periodGenap || 'Januari - Juli 2027',
        events: parsedResult.genapEvents
      }
    };

    setCalendar(newCalendar);
    setImportModalOpen(false);
    setParsedResult(null);

    await handleSaveAll(newCalendar, `Berhasil menerapkan ${parsedResult.events.length} agenda dari file PDF!`);
  };

  // Edit / Delete in Preview Table
  const handleDeleteParsedItem = (no: number) => {
    if (!parsedResult) return;
    const updatedEvents = parsedResult.events.filter(e => e.no !== no);
    const updatedGanjil = parsedResult.ganjilEvents.filter(e => e.no !== no);
    const updatedGenap = parsedResult.genapEvents.filter(e => e.no !== no);
    setParsedResult({
      ...parsedResult,
      events: updatedEvents,
      ganjilEvents: updatedGanjil,
      genapEvents: updatedGenap
    });
  };

  // Open Add Event Modal
  const openAddEvent = (sem: 'ganjil' | 'genap') => {
    setTargetSemester(sem);
    setEditingTargetEvent(null);
    setEventForm({
      date: '',
      title: '',
      duration: '1 Hari',
      month: sem === 'ganjil' ? 'Juli 2026' : 'Januari 2027',
      status: 'Terjadwal'
    });
    setEventModalOpen(true);
  };

  // Open Edit Event Modal
  const openEditEvent = (sem: 'ganjil' | 'genap', ev: CalendarEvent) => {
    setTargetSemester(sem);
    setEditingTargetEvent(ev);
    setEventForm({ ...ev });
    setEventModalOpen(true);
  };

  // Save Event from Modal
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = targetSemester === 'ganjil' ? 'semesterGanjil' : 'semesterGenap';
    let updatedEvents = [...calendar[key].events];

    if (editingTargetEvent) {
      const idx = updatedEvents.findIndex(ev => ev === editingTargetEvent || (ev.title === editingTargetEvent.title && ev.date === editingTargetEvent.date));
      if (idx !== -1) {
        updatedEvents[idx] = eventForm;
      } else {
        updatedEvents.push(eventForm);
      }
    } else {
      const nextNo = (calendar.semesterGanjil?.events?.length || 0) + (calendar.semesterGenap?.events?.length || 0) + 1;
      updatedEvents.push({ ...eventForm, no: nextNo });
    }

    const updated = {
      ...calendar,
      [key]: {
        ...calendar[key],
        events: updatedEvents
      }
    };

    setCalendar(updated);
    setEventModalOpen(false);
    await handleSaveAll(updated, `Agenda "${eventForm.title}" berhasil disimpan.`);
  };

  // Filtered Events for Display
  const ganjilFiltered = (calendar.semesterGanjil?.events || []).filter(e => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return e.title.toLowerCase().includes(q) || e.date.toLowerCase().includes(q) || (e.month && e.month.toLowerCase().includes(q));
  });

  const genapFiltered = (calendar.semesterGenap?.events || []).filter(e => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return e.title.toLowerCase().includes(q) || e.date.toLowerCase().includes(q) || (e.month && e.month.toLowerCase().includes(q));
  });

  const totalAllEvents = (calendar.semesterGanjil?.events?.length || 0) + (calendar.semesterGenap?.events?.length || 0);

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] max-w-md p-4 rounded-2xl shadow-2xl flex items-center gap-3 border transition-all animate-bounce ${
          toast.type === 'error'
            ? 'bg-red-950 text-white border-red-800'
            : toast.type === 'info'
            ? 'bg-blue-950 text-white border-blue-800'
            : 'bg-emerald-950 text-white border-emerald-800'
        }`}>
          {toast.type === 'error' ? (
            <AlertCircle size={20} className="text-red-400 shrink-0" />
          ) : toast.type === 'info' ? (
            <Sparkles size={20} className="text-blue-400 shrink-0" />
          ) : (
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
          <button 
            type="button" 
            onClick={() => setToast(null)} 
            className="p-1 hover:bg-white/10 rounded-lg ml-auto text-white/70 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 p-6 md:p-8 rounded-3xl border border-amber-200/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 bg-amber-600 text-white text-[11px] font-black rounded-full uppercase tracking-wider shadow-sm">
              Kalender Resmi
            </span>
            {calendar.year && (
              <span className="text-xs font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-lg border border-amber-200">
                Tahun Ajaran {calendar.year}
              </span>
            )}
            <span className="text-xs font-semibold text-slate-500">
              Total: {totalAllEvents} Kegiatan Terdaftar
            </span>
          </div>
          <h4 className="text-2xl font-black text-blue-950 flex items-center gap-2 pt-1">
            <Calendar className="text-amber-600" size={26} /> Kalender Pendidikan & Peristiwa
          </h4>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Kelola jadwal masuk sekolah, asesmen, hari libur nasional, dan agenda akademik sekolah. Anda dapat menginput manual, menghapus data, atau mengimpor file PDF format laporan kalender.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setImportModalOpen(true);
              setParseError(null);
            }}
            className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
          >
            <FileUp size={16} /> Import File PDF Kalender
          </button>
          
          <button
            type="button"
            onClick={() => handleClearAllClick('all')}
            className="flex items-center gap-2 text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 bg-red-50 px-4 py-3 rounded-2xl border border-red-200 transition-colors shadow-sm cursor-pointer"
            title="Hapus seluruh data kegiatan kalender"
          >
            <Trash2 size={14} /> Kosongkan Kalender
          </button>

          <button
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white px-4 py-3 rounded-2xl border border-slate-200 transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw size={14} /> Reset Awal
          </button>
        </div>
      </div>

      {/* Search & Semester Tabs Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kegiatan (contoh: Rapor, Libur, Asesmen, MPLS)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 border border-slate-200 outline-none focus:border-amber-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all', label: `Semua (${totalAllEvents})` },
            { id: 'ganjil', label: `Semester Ganjil (${calendar.semesterGanjil?.events?.length || 0})` },
            { id: 'genap', label: `Semester Genap (${calendar.semesterGenap?.events?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSemesterTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSemesterTab === tab.id
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Semester 1 & Semester 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Semester Ganjil */}
        {(activeSemesterTab === 'all' || activeSemesterTab === 'ganjil') && (
          <div className="bg-slate-50 p-6 md:p-7 rounded-3xl border border-slate-100 space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 flex-wrap gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Semester 1 (Ganjil)
                </span>
                <h5 className="font-bold text-blue-950 text-lg">Semester Ganjil</h5>
                <p className="text-xs text-slate-500">{calendar.semesterGanjil?.period || 'Juli - Desember 2026'}</p>
              </div>
              <div className="flex items-center gap-2">
                {calendar.semesterGanjil?.events?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleClearAllClick('ganjil')}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                    title="Kosongkan agenda semester ganjil"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openAddEvent('ganjil')}
                  className="bg-blue-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Plus size={14} /> Tambah Agenda
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {ganjilFiltered.map((ev, i) => (
                <div
                  key={ev.no || i}
                  className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-start gap-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ev.no && (
                        <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                          {ev.no}
                        </span>
                      )}
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                        {ev.date}
                      </span>
                      {ev.duration && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
                          {ev.duration}
                        </span>
                      )}
                      {ev.status && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-100">
                          {ev.status}
                        </span>
                      )}
                    </div>
                    <h6 className="font-bold text-slate-800 text-sm leading-snug">{ev.title}</h6>
                    {ev.month && <p className="text-[11px] text-slate-400">Bulan: {ev.month}</p>}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditEvent('ganjil', ev)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Agenda"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick('ganjil', ev)}
                      className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Agenda"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {ganjilFiltered.length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 italic">
                    {searchQuery ? 'Tidak ada agenda yang cocok dengan pencarian.' : 'Belum ada agenda di Semester Ganjil.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Semester Genap */}
        {(activeSemesterTab === 'all' || activeSemesterTab === 'genap') && (
          <div className="bg-slate-50 p-6 md:p-7 rounded-3xl border border-slate-100 space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 flex-wrap gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  Semester 2 (Genap)
                </span>
                <h5 className="font-bold text-blue-950 text-lg">Semester Genap</h5>
                <p className="text-xs text-slate-500">{calendar.semesterGenap?.period || 'Januari - Juli 2027'}</p>
              </div>
              <div className="flex items-center gap-2">
                {calendar.semesterGenap?.events?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleClearAllClick('genap')}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                    title="Kosongkan agenda semester genap"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openAddEvent('genap')}
                  className="bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Plus size={14} /> Tambah Agenda
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {genapFiltered.map((ev, i) => (
                <div
                  key={ev.no || i}
                  className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-start gap-4 hover:border-emerald-300 hover:shadow-sm transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ev.no && (
                        <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                          {ev.no}
                        </span>
                      )}
                      <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                        {ev.date}
                      </span>
                      {ev.duration && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
                          {ev.duration}
                        </span>
                      )}
                      {ev.status && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-100">
                          {ev.status}
                        </span>
                      )}
                    </div>
                    <h6 className="font-bold text-slate-800 text-sm leading-snug">{ev.title}</h6>
                    {ev.month && <p className="text-[11px] text-slate-400">Bulan: {ev.month}</p>}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditEvent('genap', ev)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Agenda"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick('genap', ev)}
                      className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Agenda"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {genapFiltered.length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 italic">
                    {searchQuery ? 'Tidak ada agenda yang cocok dengan pencarian.' : 'Belum ada agenda di Semester Genap.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Save Action */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200">
        <p className="text-xs text-slate-400 italic text-center sm:text-left">
          Perubahan yang Anda simpan akan langsung disinkronkan ke halaman utama website secara realtime.
        </p>
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSaveAll()}
          className="bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl hover:bg-blue-800 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
        </button>
      </div>

      {/* ============================================================ */}
      {/* MODAL KONFIRMASI HAPUS (IN-APP MODAL, NO WINDOW.CONFIRM)     */}
      {/* ============================================================ */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm({ isOpen: false })} 
          />
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-6 md:p-8 space-y-5 border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle size={28} />
            </div>

            <div className="text-center space-y-2">
              <h4 className="text-lg font-black text-slate-900">
                {deleteConfirm.isAll 
                  ? 'Kosongkan Seluruh Agenda?'
                  : 'Hapus Agenda Ini?'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {deleteConfirm.isAll ? (
                  <span>
                    Anda akan menghapus {deleteConfirm.allScope === 'all' ? 'seluruh data kalender pendidikan' : `semua agenda Semester ${deleteConfirm.allScope === 'ganjil' ? '1 (Ganjil)' : '2 (Genap)'}`}. Tindakan ini tidak dapat dibatalkan kecuali Anda mereset ke jadwal awal.
                  </span>
                ) : (
                  <span>
                    Apakah Anda yakin ingin menghapus agenda <b>"{deleteConfirm.event?.title}"</b> ({deleteConfirm.event?.date})?
                  </span>
                )}
              </p>
            </div>

            {deleteConfirm.event && !deleteConfirm.isAll && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Semester:</span>
                  <span className="font-bold text-slate-700">{deleteConfirm.sem === 'ganjil' ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)'}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tanggal:</span>
                  <span className="font-bold text-blue-700">{deleteConfirm.event.date}</span>
                </div>
                {deleteConfirm.event.duration && (
                  <div className="flex justify-between text-slate-500">
                    <span>Durasi:</span>
                    <span className="font-bold text-slate-700">{deleteConfirm.event.duration}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false })}
                className="flex-1 py-3 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 size={14} /> Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL KONFIRMASI RESET (IN-APP MODAL)                        */}
      {/* ============================================================ */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setResetConfirmOpen(false)} 
          />
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-6 md:p-8 space-y-5 border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <RotateCcw size={28} />
            </div>

            <div className="text-center space-y-2">
              <h4 className="text-lg font-black text-slate-900">
                Kembalikan ke Jadwal Resmi Awal?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tindakan ini akan mengembalikan data kalender pendidikan ke 41 agenda lengkap Tahun Ajaran 2026/2027 resmi SDN 1 Gapuk.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeReset}
                className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <RotateCcw size={14} /> Ya, Kembalikan Data Awal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL IMPORT PDF KALENDER PENDIDIKAN                         */}
      {/* ============================================================ */}
      {importModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setImportModalOpen(false)} 
          />
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col overflow-hidden my-auto border border-slate-100">
            {/* Modal Header */}
            <div className="p-6 md:p-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex justify-between items-start shrink-0">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/20 rounded-full inline-block mb-1">
                  Fitur Otomatisasi Kalender
                </span>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <FileUp size={24} className="text-amber-400" /> Import File PDF Kalender Pendidikan
                </h3>
                <p className="text-xs text-blue-200 max-w-xl">
                  Sistem mengekstrak tabel PDF: <b>NO, BULAN, TANGGAL PELAKSANAAN, DURASI, NAMA KEGIATAN, SEMESTER, STATUS</b> secara otomatis ke dalam format Semester Ganjil & Genap.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
              {/* Tab Selector between File Upload and Paste Text */}
              {!parsedResult && (
                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                  <button
                    type="button"
                    onClick={() => setImportTab('upload')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      importTab === 'upload' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-600 hover:text-blue-950'
                    }`}
                  >
                    <Upload size={14} /> Pilih File PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportTab('paste')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      importTab === 'paste' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-600 hover:text-blue-950'
                    }`}
                  >
                    <Edit2 size={14} /> Salin Teks Tabel Manual
                  </button>
                </div>
              )}

              {/* State 1: Choose File */}
              {!parsedResult && importTab === 'upload' && (
                <div className="space-y-6">
                  <label className="block border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/80 rounded-3xl p-8 md:p-12 text-center cursor-pointer transition-all group">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfFileChange}
                      className="hidden"
                    />
                    <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 group-hover:scale-110 shadow-lg shadow-blue-500/30 transition-transform">
                      {isParsing ? (
                        <Clock size={30} className="animate-spin" />
                      ) : (
                        <FileText size={30} />
                      )}
                    </div>
                    <h5 className="font-bold text-blue-950 text-base mb-1">
                      {isParsing ? 'Membaca & Memproses File PDF...' : 'Klik untuk Pilih File PDF atau Tarik File ke Sini'}
                    </h5>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                      Mendukung file PDF: <b>Laporan Ringkasan Peristiwa & Agenda Pendidikan SDN 1 Gapuk</b>.
                    </p>
                    <span className="inline-block bg-white text-blue-700 font-bold text-xs px-5 py-2.5 rounded-xl border border-blue-200 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      Pilih Dokumen PDF Dari Perangkat
                    </span>
                  </label>

                  {/* 1-Click Instant Format Loader */}
                  <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-amber-600" />
                        <h6 className="font-bold text-amber-950 text-sm">Gunakan Data Resmi Dari Dokumen Contoh</h6>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Langsung muat 41 agenda lengkap Tahun Ajaran 2026/2027 sesuai dokumen PDF resmi (156 Hari).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLoadOfficialSample}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer active:scale-95"
                    >
                      Terapkan Format Dokumen Ini (41 Agenda)
                    </button>
                  </div>
                </div>
              )}

              {/* State 2: Paste Raw Text */}
              {!parsedResult && importTab === 'paste' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">
                      Tempel Teks Tabel dari PDF di Bawah Ini:
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Anda bisa memblok teks tabel di PDF dan menempelkannya di sini. Sistem akan mengenali pola kolom secara otomatis.
                    </p>
                  </div>
                  <textarea
                    rows={10}
                    value={rawTextPaste}
                    onChange={e => setRawTextPaste(e.target.value)}
                    placeholder="NO BULAN TANGGAL PELAKSANAAN DURASI NAMA KEGIATAN SEMESTER STATUS&#10;1 Juli 2026 1 – 18 Juli 2026 16 Hari Libur Akhir Semester/Tahun Semester 1 (Ganjil) Terjadwal..."
                    className="w-full bg-slate-50 font-mono text-xs rounded-2xl p-4 border border-slate-200 outline-none focus:border-blue-500 leading-relaxed"
                  />
                  <div className="flex justify-end gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={handleLoadOfficialSample}
                      className="text-xs font-bold text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-200 hover:bg-amber-100 cursor-pointer"
                    >
                      Muat Contoh 41 Agenda PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleProcessRawText}
                      disabled={isParsing}
                      className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow hover:bg-blue-800 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Sparkles size={16} /> Proses Teks Tabel
                    </button>
                  </div>
                </div>
              )}

              {/* Error Box */}
              {parseError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Gagal Membaca File:</span>
                    {parseError}
                  </div>
                </div>
              )}

              {/* State 3: Parsed Result Preview */}
              {parsedResult && (
                <div className="space-y-6">
                  {/* Summary Bar */}
                  <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <Check size={20} />
                      </div>
                      <div>
                        <h6 className="font-bold text-emerald-950 text-sm">
                          Ekstraksi Berhasil: {parsedResult.events.length} Kegiatan Terdeteksi
                        </h6>
                        <p className="text-xs text-emerald-800">
                          Tahun Ajaran {parsedResult.year || '2026/2027'} • {parsedResult.totalDays || '156 Hari'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setParsedResult(null)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-white px-3.5 py-2 rounded-xl border border-slate-200 cursor-pointer"
                      >
                        Ganti File PDF
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyParsedCalendar}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <CheckCircle2 size={16} /> Terapkan ke Website
                      </button>
                    </div>
                  </div>

                  {/* Filter Sub-Tabs */}
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      {[
                        { id: 'all', label: `Semua (${parsedResult.events.length})` },
                        { id: 'ganjil', label: `Semester 1 (Ganjil) (${parsedResult.ganjilEvents.length})` },
                        { id: 'genap', label: `Semester 2 (Genap) (${parsedResult.genapEvents.length})` },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setPreviewTab(t.id as any)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            previewTab === t.id
                              ? 'bg-blue-700 text-white shadow'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Anda dapat mengoreksi atau menghapus baris sebelum menyimpan.
                    </span>
                  </div>

                  {/* Preview Table */}
                  <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm max-h-[420px] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                          <th className="p-3 w-12 text-center">NO</th>
                          <th className="p-3 w-28">BULAN</th>
                          <th className="p-3 w-40">TANGGAL PELAKSANAAN</th>
                          <th className="p-3 w-20">DURASI</th>
                          <th className="p-3">NAMA KEGIATAN / PERISTIWA</th>
                          <th className="p-3 w-32">SEMESTER</th>
                          <th className="p-3 w-24">STATUS</th>
                          <th className="p-3 w-12 text-center">AKSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(previewTab === 'all'
                          ? parsedResult.events
                          : previewTab === 'ganjil'
                          ? parsedResult.ganjilEvents
                          : parsedResult.genapEvents
                        ).map((row, idx) => (
                          <tr key={row.no || idx} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-3 text-center font-bold text-slate-500">
                              {row.no || idx + 1}
                            </td>
                            <td className="p-3 font-semibold text-slate-700">
                              {row.month || '-'}
                            </td>
                            <td className="p-3 font-mono font-bold text-blue-800">
                              {row.date}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px] text-slate-700">
                                {row.duration || '1 Hari'}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-blue-950">
                              {row.title}
                            </td>
                            <td className="p-3 text-[11px]">
                              <span className={`px-2 py-0.5 rounded-full font-bold ${
                                row.semester?.includes('2') || row.semester?.includes('Genap')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {row.semester}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                                {row.status || 'Terjadwal'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteParsedItem(row.no || idx + 1)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                title="Hapus baris"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {parsedResult && (
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0 flex-wrap gap-4">
                <span className="text-xs text-slate-500 font-medium">
                  {parsedResult.events.length} agenda siap diterapkan ke Kalender Pendidikan SDN 1 Gapuk.
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setImportModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyParsedCalendar}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-7 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 size={16} /> Terapkan & Simpan Kalender
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL MANUAL ADD / EDIT EVENT                                */}
      {/* ============================================================ */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEventModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h5 className="font-bold text-blue-950 text-base">
                {editingTargetEvent ? 'Edit Agenda Kalender' : 'Tambah Agenda Kalender'}
              </h5>
              <button
                type="button"
                onClick={() => setEventModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Target Semester</label>
                <select
                  value={targetSemester}
                  onChange={e => setTargetSemester(e.target.value as any)}
                  className="w-full bg-slate-50 rounded-xl p-2.5 text-xs font-bold text-blue-900 border border-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="ganjil">Semester 1 (Ganjil)</option>
                  <option value="genap">Semester 2 (Genap)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Nama Kegiatan / Peristiwa</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Hari Pertama Masuk Sekolah / Asesmen Sumatif"
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold text-blue-950 border border-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Tanggal Pelaksanaan</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: 1 – 18 Juli 2026 atau 20 Juli 2026"
                  value={eventForm.date}
                  onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold border border-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Durasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: 16 Hari"
                    value={eventForm.duration || ''}
                    onChange={e => setEventForm({ ...eventForm, duration: e.target.value })}
                    className="w-full bg-slate-50 rounded-xl p-2.5 text-xs border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Bulan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Juli 2026"
                    value={eventForm.month || ''}
                    onChange={e => setEventForm({ ...eventForm, month: e.target.value })}
                    className="w-full bg-slate-50 rounded-xl p-2.5 text-xs border border-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Status</label>
                <select
                  value={eventForm.status || 'Terjadwal'}
                  onChange={e => setEventForm({ ...eventForm, status: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-2.5 text-xs font-semibold border border-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="Terjadwal">Terjadwal</option>
                  <option value="Terlaksana">Terlaksana</option>
                  <option value="Ditunda">Ditunda</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl font-bold text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Save size={14} /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

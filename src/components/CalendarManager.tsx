import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit2, Trash2, Save, RotateCcw, X, Calendar } from 'lucide-react';
import { syncData } from '../lib/dataService';
import { ACADEMIC_CALENDAR } from '../data/schoolStructure';
import { AcademicCalendarInfo, CalendarEvent } from '../types';

export const CalendarManager: React.FC = () => {
  const [calendar, setCalendar] = useState<AcademicCalendarInfo>(ACADEMIC_CALENDAR);
  const [saving, setSaving] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<'ganjil' | 'genap'>('ganjil');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [eventForm, setEventForm] = useState<CalendarEvent>({ date: '', title: '' });

  useEffect(() => {
    const unsub = syncData.subscribeAcademicCalendar((val) => {
      if (val && val.semesterGanjil && val.semesterGenap) {
        setCalendar(val as AcademicCalendarInfo);
      }
    });
    return () => unsub();
  }, []);

  const handleSaveAll = async (updatedData?: AcademicCalendarInfo) => {
    setSaving(true);
    const dataToSave = updatedData || calendar;
    try {
      await syncData.saveAcademicCalendar(dataToSave);
      alert('Kalender Pendidikan berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan kalender pendidikan.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Kembalikan kalender pendidikan ke jadwal resmi awal?')) {
      setCalendar(ACADEMIC_CALENDAR);
      await syncData.saveAcademicCalendar(ACADEMIC_CALENDAR);
      alert('Kalender pendidikan berhasil direset.');
    }
  };

  const openAddEvent = (sem: 'ganjil' | 'genap') => {
    setSelectedSemester(sem);
    setEditingIndex(null);
    setEventForm({ date: '', title: '' });
    setModalOpen(true);
  };

  const openEditEvent = (sem: 'ganjil' | 'genap', index: number) => {
    setSelectedSemester(sem);
    setEditingIndex(index);
    const semData = sem === 'ganjil' ? calendar.semesterGanjil : calendar.semesterGenap;
    setEventForm({ ...semData.events[index] });
    setModalOpen(true);
  };

  const handleDeleteEvent = async (sem: 'ganjil' | 'genap', index: number) => {
    if (window.confirm('Hapus agenda tanggal ini?')) {
      const key = sem === 'ganjil' ? 'semesterGanjil' : 'semesterGenap';
      const updatedEvents = calendar[key].events.filter((_, i) => i !== index);
      const updated = {
        ...calendar,
        [key]: {
          ...calendar[key],
          events: updatedEvents
        }
      };
      setCalendar(updated);
      await handleSaveAll(updated);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = selectedSemester === 'ganjil' ? 'semesterGanjil' : 'semesterGenap';
    let updatedEvents = [...calendar[key].events];
    if (editingIndex !== null) {
      updatedEvents[editingIndex] = eventForm;
    } else {
      updatedEvents = [...updatedEvents, eventForm];
    }

    const updated = {
      ...calendar,
      [key]: {
        ...calendar[key],
        events: updatedEvents
      }
    };
    setCalendar(updated);
    setModalOpen(false);
    await handleSaveAll(updated);
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-amber-50/70 p-6 rounded-3xl border border-amber-100">
        <div>
          <h4 className="text-xl font-bold text-amber-950 flex items-center gap-2">
            <Clock className="text-amber-600" size={24} /> Kelola Kalender Pendidikan
          </h4>
          <p className="text-sm text-slate-600 mt-1">
            Atur linimasa kalender akademik Semester Ganjil dan Semester Genap (MPLS, STS, SAS, Libur Semester).
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-red-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm shrink-0"
        >
          <RotateCcw size={14} /> Reset Kalender Awal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Semester Ganjil */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
                Semester 1
              </span>
              <h5 className="font-bold text-blue-950 text-base mt-2">Semester Ganjil</h5>
            </div>
            <button
              type="button"
              onClick={() => openAddEvent('ganjil')}
              className="bg-blue-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5"
            >
              <Plus size={14} /> Tambah Agenda
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Periode Bulan</label>
            <input
              type="text"
              value={calendar.semesterGanjil.period}
              onChange={e => {
                const updated = {
                  ...calendar,
                  semesterGanjil: { ...calendar.semesterGanjil, period: e.target.value }
                };
                setCalendar(updated);
              }}
              placeholder="Juli - Desember 2026"
              className="w-full bg-white rounded-xl p-2.5 text-xs font-bold text-blue-900 border border-slate-200 outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-3">
            {calendar.semesterGanjil.events.map((ev, i) => (
              <div
                key={i}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-black text-blue-600 block">{ev.date}</span>
                  <span className="font-semibold text-slate-800">{ev.title}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditEvent('ganjil', i)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent('ganjil', i)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Semester Genap */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                Semester 2
              </span>
              <h5 className="font-bold text-blue-950 text-base mt-2">Semester Genap</h5>
            </div>
            <button
              type="button"
              onClick={() => openAddEvent('genap')}
              className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5"
            >
              <Plus size={14} /> Tambah Agenda
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Periode Bulan</label>
            <input
              type="text"
              value={calendar.semesterGenap.period}
              onChange={e => {
                const updated = {
                  ...calendar,
                  semesterGenap: { ...calendar.semesterGenap, period: e.target.value }
                };
                setCalendar(updated);
              }}
              placeholder="Januari - Juni 2027"
              className="w-full bg-white rounded-xl p-2.5 text-xs font-bold text-blue-900 border border-slate-200 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-3">
            {calendar.semesterGenap.events.map((ev, i) => (
              <div
                key={i}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-black text-emerald-600 block">{ev.date}</span>
                  <span className="font-semibold text-slate-800">{ev.title}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditEvent('genap', i)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent('genap', i)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSaveAll()}
          className="bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl hover:bg-blue-800 transition-all flex items-center gap-2"
        >
          <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan Semua Kalender Pendidikan'}
        </button>
      </div>

      {/* Modal Add / Edit Event */}
      {modalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="font-bold text-blue-950 text-base">
                {editingIndex !== null ? 'Edit Agenda Kalender' : 'Tambah Agenda Kalender'}
              </h5>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Tanggal / Rentang Tanggal</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: 13 Juli 2026 atau 21 - 26 September 2026"
                  value={eventForm.date}
                  onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Nama Kegiatan / Libur</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Penilaian Sumatif Akhir Semester (SAS)"
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-xs border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-xs shadow hover:bg-blue-700 transition-all flex items-center gap-1.5"
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

import React, { useState, useEffect } from 'react';
import { Landmark, Plus, Edit2, Trash2, Save, RotateCcw, CheckCircle, Calendar, X } from 'lucide-react';
import { syncData } from '../lib/dataService';
import { SCHOOL_HISTORY } from '../data/schoolStructure';
import { SchoolHistoryInfo, HistoryMilestone } from '../types';

export const HistoryManager: React.FC = () => {
  const [history, setHistory] = useState<SchoolHistoryInfo>(SCHOOL_HISTORY);
  const [saving, setSaving] = useState(false);
  const [editingMilestoneIndex, setEditingMilestoneIndex] = useState<number | null>(null);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState<HistoryMilestone>({
    year: '',
    titleId: '',
    titleEn: '',
    descId: '',
    descEn: ''
  });

  useEffect(() => {
    const unsub = syncData.subscribeHistory((val) => {
      if (val) {
        setHistory({
          titleId: val.titleId || SCHOOL_HISTORY.titleId,
          titleEn: val.titleEn || SCHOOL_HISTORY.titleEn,
          summaryId: val.summaryId || SCHOOL_HISTORY.summaryId,
          summaryEn: val.summaryEn || SCHOOL_HISTORY.summaryEn,
          milestones: val.milestones || SCHOOL_HISTORY.milestones
        });
      }
    });
    return () => unsub();
  }, []);

  const handleSaveAll = async (updatedData?: SchoolHistoryInfo) => {
    setSaving(true);
    const dataToSave = updatedData || history;
    try {
      await syncData.saveHistory(dataToSave);
      alert('Data Sejarah Sekolah berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data sejarah.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Kembalikan data sejarah dan linimasa ke versi default awal?')) {
      setHistory(SCHOOL_HISTORY);
      await syncData.saveHistory(SCHOOL_HISTORY);
      alert('Sejarah sekolah berhasil direset ke data default.');
    }
  };

  const openAddMilestone = () => {
    setEditingMilestoneIndex(null);
    setMilestoneForm({
      year: '',
      titleId: '',
      titleEn: '',
      descId: '',
      descEn: ''
    });
    setMilestoneModalOpen(true);
  };

  const openEditMilestone = (index: number) => {
    setEditingMilestoneIndex(index);
    setMilestoneForm({ ...history.milestones[index] });
    setMilestoneModalOpen(true);
  };

  const handleDeleteMilestone = async (index: number) => {
    if (window.confirm('Hapus linimasa tahun ini?')) {
      const updatedMilestones = history.milestones.filter((_, i) => i !== index);
      const updated = { ...history, milestones: updatedMilestones };
      setHistory(updated);
      await handleSaveAll(updated);
    }
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedMilestones: HistoryMilestone[];
    if (editingMilestoneIndex !== null) {
      updatedMilestones = [...history.milestones];
      updatedMilestones[editingMilestoneIndex] = milestoneForm;
    } else {
      updatedMilestones = [...history.milestones, milestoneForm];
    }

    const updated = { ...history, milestones: updatedMilestones };
    setHistory(updated);
    setMilestoneModalOpen(false);
    await handleSaveAll(updated);
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-50/70 p-6 rounded-3xl border border-emerald-100">
        <div>
          <h4 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
            <Landmark className="text-emerald-600" size={24} /> Kelola Sejarah & Linimasa Sekolah
          </h4>
          <p className="text-sm text-slate-600 mt-1">
            Atur narasi sejarah berdirinya SDN 1 Gapuk beserta linimasa jejak langkah perkembangannya.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-red-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm shrink-0"
        >
          <RotateCcw size={14} /> Reset Data Awal
        </button>
      </div>

      {/* Main Narrative Section */}
      <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 space-y-6">
        <h5 className="font-bold text-blue-950 text-lg">Ringkasan Narasi Sejarah</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Judul Narasi (Bahasa Indonesia)
            </label>
            <input
              type="text"
              value={history.titleId}
              onChange={e => setHistory({ ...history, titleId: e.target.value })}
              className="w-full bg-white rounded-xl p-3 text-sm font-bold text-blue-950 border border-slate-200 outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Judul Narasi (English)
            </label>
            <input
              type="text"
              value={history.titleEn || ''}
              onChange={e => setHistory({ ...history, titleEn: e.target.value })}
              className="w-full bg-white rounded-xl p-3 text-sm font-bold text-slate-700 border border-slate-200 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Ringkasan Sejarah (Bahasa Indonesia)
            </label>
            <textarea
              rows={5}
              value={history.summaryId}
              onChange={e => setHistory({ ...history, summaryId: e.target.value })}
              className="w-full bg-white rounded-2xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-200 outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Ringkasan Sejarah (English)
            </label>
            <textarea
              rows={5}
              value={history.summaryEn || ''}
              onChange={e => setHistory({ ...history, summaryEn: e.target.value })}
              className="w-full bg-white rounded-2xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-200 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveAll()}
            className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-blue-800 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Teks Narasi'}
          </button>
        </div>
      </div>

      {/* Milestones Section */}
      <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h5 className="font-bold text-blue-950 text-lg">Linimasa / Tonggak Sejarah (Milestones)</h5>
            <p className="text-xs text-slate-500">Momen-momen penting dalam sejarah perkembangan sekolah.</p>
          </div>
          <button
            type="button"
            onClick={openAddMilestone}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Tambah Linimasa
          </button>
        </div>

        <div className="space-y-4">
          {history.milestones.map((item, index) => (
            <div
              key={index}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-200 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-black">
                    {item.year}
                  </span>
                  <h6 className="font-bold text-blue-950 text-sm">{item.titleId}</h6>
                </div>
                <p className="text-xs text-slate-600 pl-1">{item.descId}</p>
                {item.titleEn && (
                  <p className="text-[11px] text-slate-400 italic pl-1">EN: {item.titleEn} — {item.descEn}</p>
                )}
              </div>
              <div className="flex gap-2 self-end md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => openEditMilestone(index)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMilestone(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {history.milestones.length === 0 && (
            <p className="text-center py-8 text-slate-400 italic text-sm">
              Belum ada linimasa. Klik tombol "+ Tambah Linimasa" untuk menambahkan.
            </p>
          )}
        </div>
      </div>

      {/* Modal Add/Edit Milestone */}
      {milestoneModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMilestoneModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h5 className="font-bold text-blue-950 text-lg">
                {editingMilestoneIndex !== null ? 'Edit Linimasa' : 'Tambah Linimasa Baru'}
              </h5>
              <button
                type="button"
                onClick={() => setMilestoneModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMilestone} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Tahun / Periode</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: 1987 atau 2024 - Sekarang"
                  value={milestoneForm.year}
                  onChange={e => setMilestoneForm({ ...milestoneForm, year: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-sm font-bold text-blue-950 border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Judul Peristiwa (ID)</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Pendirian & Operasional Perdana"
                  value={milestoneForm.titleId}
                  onChange={e => setMilestoneForm({ ...milestoneForm, titleId: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-sm font-semibold border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Judul Peristiwa (EN - Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Establishment & First Operations"
                  value={milestoneForm.titleEn || ''}
                  onChange={e => setMilestoneForm({ ...milestoneForm, titleEn: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-sm border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Keterangan / Uraian (ID)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Deskripsikan peristiwa bersejarah ini..."
                  value={milestoneForm.descId}
                  onChange={e => setMilestoneForm({ ...milestoneForm, descId: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-xs leading-relaxed border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Keterangan / Uraian (EN - Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="English description..."
                  value={milestoneForm.descEn || ''}
                  onChange={e => setMilestoneForm({ ...milestoneForm, descEn: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-xs leading-relaxed border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMilestoneModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow hover:bg-blue-800 transition-all flex items-center gap-2"
                >
                  <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Linimasa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

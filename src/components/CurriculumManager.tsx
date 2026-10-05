import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Save, RotateCcw, X, Layers, CheckCircle } from 'lucide-react';
import { syncData } from '../lib/dataService';
import { CURRICULUM_INFO } from '../data/schoolStructure';
import { CurriculumInfo, CurriculumPillar } from '../types';

export const CurriculumManager: React.FC = () => {
  const [curriculum, setCurriculum] = useState<CurriculumInfo>(CURRICULUM_INFO);
  const [saving, setSaving] = useState(false);
  const [pillarModalOpen, setPillarModalOpen] = useState(false);
  const [editingPillarIndex, setEditingPillarIndex] = useState<number | null>(null);
  const [pillarForm, setPillarForm] = useState<CurriculumPillar>({
    titleId: '',
    titleEn: '',
    descId: '',
    descEn: ''
  });

  useEffect(() => {
    const unsub = syncData.subscribeCurriculum((val) => {
      if (val && val.title) {
        setCurriculum({
          title: val.title || CURRICULUM_INFO.title,
          titleEn: val.titleEn || CURRICULUM_INFO.titleEn,
          descriptionId: val.descriptionId || CURRICULUM_INFO.descriptionId,
          descriptionEn: val.descriptionEn || CURRICULUM_INFO.descriptionEn,
          pillars: val.pillars || CURRICULUM_INFO.pillars
        });
      }
    });
    return () => unsub();
  }, []);

  const handleSaveAll = async (updatedData?: CurriculumInfo) => {
    setSaving(true);
    const dataToSave = updatedData || curriculum;
    try {
      await syncData.saveCurriculum(dataToSave);
      alert('Informasi Kurikulum berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan informasi kurikulum.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Kembalikan data kurikulum ke Kurikulum Merdeka default awal?')) {
      setCurriculum(CURRICULUM_INFO);
      await syncData.saveCurriculum(CURRICULUM_INFO);
      alert('Kurikulum berhasil direset ke data default.');
    }
  };

  const openAddPillar = () => {
    setEditingPillarIndex(null);
    setPillarForm({
      titleId: '',
      titleEn: '',
      descId: '',
      descEn: ''
    });
    setPillarModalOpen(true);
  };

  const openEditPillar = (index: number) => {
    setEditingPillarIndex(index);
    setPillarForm({ ...curriculum.pillars[index] });
    setPillarModalOpen(true);
  };

  const handleDeletePillar = async (index: number) => {
    if (window.confirm('Hapus pilar pembelajaran ini?')) {
      const updatedPillars = curriculum.pillars.filter((_, i) => i !== index);
      const updated = { ...curriculum, pillars: updatedPillars };
      setCurriculum(updated);
      await handleSaveAll(updated);
    }
  };

  const handleSavePillar = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedPillars = [...curriculum.pillars];
    if (editingPillarIndex !== null) {
      updatedPillars[editingPillarIndex] = pillarForm;
    } else {
      updatedPillars = [...updatedPillars, pillarForm];
    }
    const updated = { ...curriculum, pillars: updatedPillars };
    setCurriculum(updated);
    setPillarModalOpen(false);
    await handleSaveAll(updated);
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-teal-50/70 p-6 rounded-3xl border border-teal-100">
        <div>
          <h4 className="text-xl font-bold text-teal-950 flex items-center gap-2">
            <BookOpen className="text-teal-600" size={24} /> Kelola Kurikulum Sekolah
          </h4>
          <p className="text-sm text-slate-600 mt-1">
            Atur kurikulum aktif (Kurikulum Merdeka), filosofi pembelajaran, serta pilar penguatan karakter (P5).
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-red-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm shrink-0"
        >
          <RotateCcw size={14} /> Reset Kurikulum Awal
        </button>
      </div>

      {/* Main Info */}
      <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 space-y-6">
        <h5 className="font-bold text-blue-950 text-lg">Judul & Uraian Kurikulum</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Nama Kurikulum (ID)
            </label>
            <input
              type="text"
              value={curriculum.title}
              onChange={e => setCurriculum({ ...curriculum, title: e.target.value })}
              className="w-full bg-white rounded-xl p-3 text-sm font-bold text-blue-950 border border-slate-200 outline-none focus:border-teal-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Nama Kurikulum (EN)
            </label>
            <input
              type="text"
              value={curriculum.titleEn || ''}
              onChange={e => setCurriculum({ ...curriculum, titleEn: e.target.value })}
              className="w-full bg-white rounded-xl p-3 text-sm border border-slate-200 outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Deskripsi Kurikulum (ID)
            </label>
            <textarea
              rows={4}
              value={curriculum.descriptionId}
              onChange={e => setCurriculum({ ...curriculum, descriptionId: e.target.value })}
              className="w-full bg-white rounded-2xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-200 outline-none focus:border-teal-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Deskripsi Kurikulum (EN)
            </label>
            <textarea
              rows={4}
              value={curriculum.descriptionEn || ''}
              onChange={e => setCurriculum({ ...curriculum, descriptionEn: e.target.value })}
              className="w-full bg-white rounded-2xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-200 outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveAll()}
            className="bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-teal-800 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Judul & Deskripsi'}
          </button>
        </div>
      </div>

      {/* Pillars Section */}
      <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h5 className="font-bold text-blue-950 text-lg">Pilar Utama & Fokus Pembelajaran</h5>
            <p className="text-xs text-slate-500">Prinsip dasar pengajaran yang diterapkan di kelas SDN 1 Gapuk.</p>
          </div>
          <button
            type="button"
            onClick={openAddPillar}
            className="bg-teal-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-teal-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Tambah Pilar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {curriculum.pillars.map((pillar, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-teal-300 transition-all"
            >
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                  <h6 className="font-bold text-blue-950 text-sm">{pillar.titleId}</h6>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{pillar.descId}</p>
                {pillar.titleEn && (
                  <p className="text-[11px] text-slate-400 italic">EN: {pillar.titleEn} — {pillar.descEn}</p>
                )}
              </div>
              <div className="flex justify-end gap-1 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => openEditPillar(i)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePillar(i)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add / Edit Pillar */}
      {pillarModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPillarModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="font-bold text-blue-950 text-lg">
                {editingPillarIndex !== null ? 'Edit Pilar Pembelajaran' : 'Tambah Pilar Pembelajaran Baru'}
              </h5>
              <button
                type="button"
                onClick={() => setPillarModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePillar} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Judul Pilar (ID)</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Projek Penguatan Karakter (P5)"
                  value={pillarForm.titleId}
                  onChange={e => setPillarForm({ ...pillarForm, titleId: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-sm font-bold border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Judul Pilar (EN - Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Character Strengthening Project"
                  value={pillarForm.titleEn || ''}
                  onChange={e => setPillarForm({ ...pillarForm, titleEn: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-sm border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Uraian / Deskripsi (ID)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Penjelasan implementasi pilar ini..."
                  value={pillarForm.descId}
                  onChange={e => setPillarForm({ ...pillarForm, descId: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-xs leading-relaxed border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Uraian / Deskripsi (EN - Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="English explanation..."
                  value={pillarForm.descEn || ''}
                  onChange={e => setPillarForm({ ...pillarForm, descEn: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-xs leading-relaxed border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPillarModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-teal-600 text-white px-5 py-2 rounded-xl font-bold text-xs shadow hover:bg-teal-700 transition-all flex items-center gap-1.5"
                >
                  <Save size={14} /> Simpan Pilar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

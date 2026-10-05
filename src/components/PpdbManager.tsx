import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit2, Trash2, Save, RotateCcw, CheckCircle, FileCheck, ArrowRight, X } from 'lucide-react';
import { syncData } from '../lib/dataService';
import { PPDB_REQUIREMENTS, PPDB_FLOW } from '../data/schoolStructure';
import { PpdbSettings } from '../types';

export const PpdbManager: React.FC = () => {
  const [ppdb, setPpdb] = useState<PpdbSettings>({
    title: 'Penerimaan Peserta Didik Baru (PPDB)',
    subtitle: 'Tahun Ajaran 2026/2027',
    desc: 'SD Negeri 1 Gapuk membuka kesempatan bagi putra-putri Anda untuk bertumbuh, belajar, dan berprestasi bersama kami.',
    requirements: PPDB_REQUIREMENTS,
    flow: PPDB_FLOW
  });
  const [saving, setSaving] = useState(false);

  // Requirement Modal State
  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [editingReqIndex, setEditingReqIndex] = useState<number | null>(null);
  const [reqForm, setReqForm] = useState<{ text: string; highlight: boolean }>({ text: '', highlight: false });

  // Flow Modal State
  const [flowModalOpen, setFlowModalOpen] = useState(false);
  const [editingFlowIndex, setEditingFlowIndex] = useState<number | null>(null);
  const [flowForm, setFlowForm] = useState<{ step: string; title: string; desc: string }>({ step: '', title: '', desc: '' });

  useEffect(() => {
    const unsub = syncData.subscribePpdbSettings((val) => {
      if (val) {
        setPpdb({
          title: val.title || 'Penerimaan Peserta Didik Baru (PPDB)',
          subtitle: val.subtitle || 'Tahun Ajaran 2026/2027',
          desc: val.desc || 'SD Negeri 1 Gapuk membuka kesempatan bagi putra-putri Anda untuk bertumbuh, belajar, dan berprestasi bersama kami.',
          requirements: val.requirements && val.requirements.length > 0 ? val.requirements : PPDB_REQUIREMENTS,
          flow: val.flow && val.flow.length > 0 ? val.flow : PPDB_FLOW
        });
      }
    });
    return () => unsub();
  }, []);

  const handleSaveAll = async (updatedData?: PpdbSettings) => {
    setSaving(true);
    const dataToSave = updatedData || ppdb;
    try {
      await syncData.savePpdbSettings(dataToSave);
      alert('Pengaturan PPDB berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pengaturan PPDB.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Kembalikan pengaturan PPDB ke data standar awal?')) {
      const resetData: PpdbSettings = {
        title: 'Penerimaan Peserta Didik Baru (PPDB)',
        subtitle: 'Tahun Ajaran 2026/2027',
        desc: 'SD Negeri 1 Gapuk membuka kesempatan bagi putra-putri Anda untuk bertumbuh, belajar, dan berprestasi bersama kami.',
        requirements: PPDB_REQUIREMENTS,
        flow: PPDB_FLOW
      };
      setPpdb(resetData);
      await syncData.savePpdbSettings(resetData);
      alert('Pengaturan PPDB berhasil direset ke data default.');
    }
  };

  // Requirement Handlers
  const openAddReq = () => {
    setEditingReqIndex(null);
    setReqForm({ text: '', highlight: false });
    setReqModalOpen(true);
  };

  const openEditReq = (index: number) => {
    setEditingReqIndex(index);
    setReqForm({ ...ppdb.requirements[index], highlight: !!ppdb.requirements[index].highlight });
    setReqModalOpen(true);
  };

  const handleDeleteReq = async (index: number) => {
    if (window.confirm('Hapus syarat ini?')) {
      const updatedReqs = ppdb.requirements.filter((_, i) => i !== index);
      const updated = { ...ppdb, requirements: updatedReqs };
      setPpdb(updated);
      await handleSaveAll(updated);
    }
  };

  const handleSaveReq = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedReqs = [...ppdb.requirements];
    if (editingReqIndex !== null) {
      updatedReqs[editingReqIndex] = reqForm;
    } else {
      updatedReqs = [...updatedReqs, reqForm];
    }
    const updated = { ...ppdb, requirements: updatedReqs };
    setPpdb(updated);
    setReqModalOpen(false);
    await handleSaveAll(updated);
  };

  // Flow Handlers
  const openAddFlow = () => {
    setEditingFlowIndex(null);
    setFlowForm({ step: `${ppdb.flow.length + 1}`, title: '', desc: '' });
    setFlowModalOpen(true);
  };

  const openEditFlow = (index: number) => {
    setEditingFlowIndex(index);
    setFlowForm({ ...ppdb.flow[index] });
    setFlowModalOpen(true);
  };

  const handleDeleteFlow = async (index: number) => {
    if (window.confirm('Hapus tahapan alur ini?')) {
      const updatedFlow = ppdb.flow.filter((_, i) => i !== index);
      const updated = { ...ppdb, flow: updatedFlow };
      setPpdb(updated);
      await handleSaveAll(updated);
    }
  };

  const handleSaveFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedFlow = [...ppdb.flow];
    if (editingFlowIndex !== null) {
      updatedFlow[editingFlowIndex] = flowForm;
    } else {
      updatedFlow = [...updatedFlow, flowForm];
    }
    const updated = { ...ppdb, flow: updatedFlow };
    setPpdb(updated);
    setFlowModalOpen(false);
    await handleSaveAll(updated);
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-sky-50/70 p-6 rounded-3xl border border-sky-100">
        <div>
          <h4 className="text-xl font-bold text-sky-950 flex items-center gap-2">
            <UserCheck className="text-sky-600" size={24} /> Kelola PPDB (Penerimaan Siswa Baru)
          </h4>
          <p className="text-sm text-slate-600 mt-1">
            Atur judul, tahun ajaran, berkas persyaratan masuk, dan alur pendaftaran calon siswa baru.
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

      {/* Main Info */}
      <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 space-y-5">
        <h5 className="font-bold text-blue-950 text-lg">Informasi Umum PPDB</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Judul Halaman PPDB
            </label>
            <input
              type="text"
              value={ppdb.title || ''}
              onChange={e => setPpdb({ ...ppdb, title: e.target.value })}
              className="w-full bg-white rounded-xl p-3 text-sm font-bold text-blue-950 border border-slate-200 outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Tahun Ajaran / Subtitle
            </label>
            <input
              type="text"
              value={ppdb.subtitle || ''}
              onChange={e => setPpdb({ ...ppdb, subtitle: e.target.value })}
              className="w-full bg-white rounded-xl p-3 text-sm font-bold text-slate-700 border border-slate-200 outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Deskripsi Pengantar
          </label>
          <textarea
            rows={3}
            value={ppdb.desc || ''}
            onChange={e => setPpdb({ ...ppdb, desc: e.target.value })}
            className="w-full bg-white rounded-2xl p-4 text-xs text-slate-700 leading-relaxed border border-slate-200 outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveAll()}
            className="bg-sky-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow hover:bg-sky-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Info PPDB'}
          </button>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h5 className="font-bold text-blue-950 text-lg">Persyaratan Pendaftaran</h5>
            <p className="text-xs text-slate-500">Daftar dokumen dan kriteria umur yang wajib disiapkan orang tua.</p>
          </div>
          <button
            type="button"
            onClick={openAddReq}
            className="bg-sky-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-sky-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Tambah Syarat
          </button>
        </div>

        <div className="space-y-3">
          {ppdb.requirements.map((req, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center gap-4 hover:border-sky-300 transition-all"
            >
              <div className="flex items-center gap-3">
                <FileCheck size={18} className={req.highlight ? 'text-amber-500 shrink-0' : 'text-slate-400 shrink-0'} />
                <span className="text-xs font-semibold text-slate-800">{req.text}</span>
                {req.highlight && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-black uppercase shrink-0">
                    Wajib / Prioritas
                  </span>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEditReq(i)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteReq(i)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flow Section */}
      <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h5 className="font-bold text-blue-950 text-lg">Alur Pendaftaran Siswa Baru</h5>
            <p className="text-xs text-slate-500">Tahapan langkah dari awal pendaftaran hingga daftar ulang.</p>
          </div>
          <button
            type="button"
            onClick={openAddFlow}
            className="bg-sky-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-sky-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Tambah Tahap Alur
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ppdb.flow.map((item, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all"
            >
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-sm">
                    {item.step}
                  </span>
                  <h6 className="font-bold text-blue-950 text-sm">{item.title}</h6>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-11">{item.desc}</p>
              </div>
              <div className="flex justify-end gap-1 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => openEditFlow(i)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFlow(i)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add / Edit Requirement */}
      {reqModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReqModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="font-bold text-blue-950 text-base">
                {editingReqIndex !== null ? 'Edit Persyaratan' : 'Tambah Persyaratan Baru'}
              </h5>
              <button
                type="button"
                onClick={() => setReqModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveReq} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Teks Persyaratan</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Berusia 7 tahun atau paling rendah 6 tahun pada tanggal 1 Juli..."
                  value={reqForm.text}
                  onChange={e => setReqForm({ ...reqForm, text: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-xs leading-relaxed border border-slate-200 outline-none focus:border-sky-500"
                />
              </div>

              <label className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reqForm.highlight}
                  onChange={e => setReqForm({ ...reqForm, highlight: e.target.checked })}
                  className="rounded w-4 h-4 text-amber-600"
                />
                <span className="text-xs font-bold text-amber-900">
                  Tandai sebagai Syarat Utama / Prioritas (Highlight)
                </span>
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReqModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-sky-600 text-white px-5 py-2 rounded-xl font-bold text-xs shadow hover:bg-sky-700 transition-all flex items-center gap-1.5"
                >
                  <Save size={14} /> Simpan Syarat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Flow */}
      {flowModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setFlowModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="font-bold text-blue-950 text-base">
                {editingFlowIndex !== null ? 'Edit Tahap Alur PPDB' : 'Tambah Tahap Alur PPDB'}
              </h5>
              <button
                type="button"
                onClick={() => setFlowModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFlow} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-bold text-slate-500 block mb-1">Nomor Step</label>
                  <input
                    required
                    type="text"
                    placeholder="1"
                    value={flowForm.step}
                    onChange={e => setFlowForm({ ...flowForm, step: e.target.value })}
                    className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold text-center border border-slate-200 outline-none focus:border-sky-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 block mb-1">Judul Tahapan</label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: Pendaftaran Online / Offline"
                    value={flowForm.title}
                    onChange={e => setFlowForm({ ...flowForm, title: e.target.value })}
                    className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold border border-slate-200 outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Keterangan / Prosedur</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan apa yang harus dilakukan calon siswa atau orang tua pada tahap ini..."
                  value={flowForm.desc}
                  onChange={e => setFlowForm({ ...flowForm, desc: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-xs leading-relaxed border border-slate-200 outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFlowModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-sky-600 text-white px-5 py-2 rounded-xl font-bold text-xs shadow hover:bg-sky-700 transition-all flex items-center gap-1.5"
                >
                  <Save size={14} /> Simpan Tahapan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Network, Plus, Edit2, Trash2, Save, RotateCcw, X, Layers, Users } from 'lucide-react';
import { syncData } from '../lib/dataService';
import { ORG_STRUCTURE } from '../data/schoolStructure';
import { OrgStructureMember } from '../types';

export const OrgStructureManager: React.FC = () => {
  const [members, setMembers] = useState<OrgStructureMember[]>(ORG_STRUCTURE);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<OrgStructureMember>({
    role: '',
    roleEn: '',
    name: '',
    level: 3
  });

  useEffect(() => {
    const unsub = syncData.subscribeOrgStructure((val) => {
      if (val) {
        if (Array.isArray(val)) {
          setMembers(val);
        } else if (val.members && Array.isArray(val.members)) {
          setMembers(val.members);
        }
      }
    });
    return () => unsub();
  }, []);

  const handleSaveAll = async (updatedMembers?: OrgStructureMember[]) => {
    setSaving(true);
    const toSave = updatedMembers || members;
    try {
      await syncData.saveOrgStructure({ members: toSave });
      alert('Struktur Organisasi berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan struktur organisasi.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Kembalikan bagan struktur organisasi ke daftar default awal?')) {
      setMembers(ORG_STRUCTURE);
      await syncData.saveOrgStructure({ members: ORG_STRUCTURE });
      alert('Struktur organisasi berhasil direset ke data default.');
    }
  };

  const openAddModal = () => {
    setEditingIndex(null);
    setForm({
      role: '',
      roleEn: '',
      name: '',
      level: 3
    });
    setModalOpen(true);
  };

  const openEditModal = (index: number) => {
    setEditingIndex(index);
    setForm({ ...members[index] });
    setModalOpen(true);
  };

  const handleDelete = async (index: number) => {
    if (window.confirm('Hapus jabatan ini dari struktur organisasi?')) {
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
      await handleSaveAll(updated);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: OrgStructureMember[];
    if (editingIndex !== null) {
      updated = [...members];
      updated[editingIndex] = form;
    } else {
      updated = [...members, form];
    }
    // Sort by level ascending
    updated.sort((a, b) => a.level - b.level);
    setMembers(updated);
    setModalOpen(false);
    await handleSaveAll(updated);
  };

  const getLevelLabel = (lvl: number) => {
    switch (lvl) {
      case 1: return 'Tingkat 1: Komite / Pengawas';
      case 2: return 'Tingkat 2: Kepala Sekolah';
      case 3: return 'Tingkat 3: Koordinator & Bendahara';
      case 4: return 'Tingkat 4: Tendik & Staf Teknis';
      default: return `Tingkat ${lvl}`;
    }
  };

  const getLevelBadgeColor = (lvl: number) => {
    switch (lvl) {
      case 1: return 'bg-amber-100 text-amber-800 border-amber-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 3: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 4: return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-indigo-50/70 p-6 rounded-3xl border border-indigo-100">
        <div>
          <h4 className="text-xl font-bold text-indigo-950 flex items-center gap-2">
            <Network className="text-indigo-600" size={24} /> Kelola Struktur Organisasi Sekolah
          </h4>
          <p className="text-sm text-slate-600 mt-1">
            Atur hierarki pimpinan, koordinator bidang, komite, dan tenaga kependidikan SDN 1 Gapuk.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-red-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm"
          >
            <RotateCcw size={14} /> Reset Awal
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus size={16} /> Tambah Jabatan
          </button>
        </div>
      </div>

      {/* Hierarchy Grouping View */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map(lvl => {
          const groupMembers = members.filter(m => m.level === lvl);
          if (groupMembers.length === 0) return null;

          return (
            <div key={lvl} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${getLevelBadgeColor(lvl)}`}>
                  {getLevelLabel(lvl)}
                </span>
                <span className="text-xs text-slate-400">({groupMembers.length} Personel)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupMembers.map((member) => {
                  const originalIndex = members.indexOf(member);
                  return (
                    <div
                      key={originalIndex}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-start gap-3 hover:border-indigo-300 transition-all"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {member.role}
                        </span>
                        <h6 className="font-bold text-blue-950 text-sm">{member.name}</h6>
                        {member.roleEn && (
                          <p className="text-[11px] text-slate-400 italic">EN: {member.roleEn}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditModal(originalIndex)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(originalIndex)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h5 className="font-bold text-blue-950 text-lg">
                {editingIndex !== null ? 'Edit Jabatan Struktur' : 'Tambah Jabatan Struktur Baru'}
              </h5>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Nama Jabatan (ID)</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Koordinator Kurikulum / Bendahara BOS"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-sm font-semibold border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Nama Jabatan (EN - Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Curriculum Coordinator"
                  value={form.roleEn || ''}
                  onChange={e => setForm({ ...form, roleEn: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-sm border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Nama Lengkap Pejabat & Gelar</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Siti Nurhaliza, S.Pd."
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-sm font-bold text-blue-950 border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Tingkatan Hirarki</label>
                <select
                  value={form.level}
                  onChange={e => setForm({ ...form, level: Number(e.target.value) })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-sm font-semibold border border-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value={1}>Tingkat 1 - Komite Sekolah / Dewan Pembina</option>
                  <option value={2}>Tingkat 2 - Kepala Sekolah</option>
                  <option value={3}>Tingkat 3 - Koordinator Bidang & Bendahara</option>
                  <option value={4}>Tingkat 4 - Staf Teknis, Operator, Perpustakaan, dll.</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Jabatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

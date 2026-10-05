import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Save, RotateCcw, Clock, MapPin, X, Tag } from 'lucide-react';
import { syncData, collections } from '../lib/dataService';
import { AGENDA_DATA } from '../data/schoolStructure';
import { AgendaItem } from '../types';

export const AgendaManager: React.FC = () => {
  const [agendas, setAgendas] = useState<AgendaItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Partial<AgendaItem>>({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    category: 'Akademik'
  });

  useEffect(() => {
    const unsub = syncData.subscribeAgenda((val) => {
      setAgendas(val as AgendaItem[]);
    });
    return () => unsub();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      title: '',
      date: '',
      time: '07:30 - 11:30 WITA',
      location: 'SDN 1 Gapuk',
      description: '',
      category: 'Akademik'
    });
    setModalOpen(true);
  };

  const openEditModal = (item: AgendaItem) => {
    setEditingItem(item);
    setForm({ ...item });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus agenda kegiatan ini?')) {
      try {
        await syncData.deleteItem(collections.agenda, id);
        alert('Agenda berhasil dihapus!');
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus agenda.');
      }
    }
  };

  const handleSeedDefaults = async () => {
    if (window.confirm('Muat data agenda kegiatan default awal?')) {
      try {
        for (const item of AGENDA_DATA) {
          await syncData.saveItem(collections.agenda, item);
        }
        alert('Agenda awal berhasil dimuat!');
      } catch (err) {
        console.error(err);
        alert('Gagal memuat agenda awal.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const itemToSave = {
        id: editingItem?.id || `agenda-${Date.now()}`,
        title: form.title || '',
        date: form.date || '',
        time: form.time || '',
        location: form.location || '',
        description: form.description || '',
        category: form.category || 'Akademik'
      };
      await syncData.saveItem(collections.agenda, itemToSave);
      setModalOpen(false);
      alert('Agenda berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan agenda.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-blue-50/70 p-6 rounded-3xl border border-blue-100">
        <div>
          <h4 className="text-xl font-bold text-blue-950 flex items-center gap-2">
            <Calendar className="text-blue-600" size={24} /> Kelola Agenda & Kegiatan Sekolah
          </h4>
          <p className="text-sm text-slate-600 mt-1">
            Jadwalkan kegiatan mendatang seperti ujian, upacara, rapat pleno, dan pentas seni sekolah.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {agendas.length === 0 && (
            <button
              type="button"
              onClick={handleSeedDefaults}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm"
            >
              <RotateCcw size={14} /> Muat Agenda Awal
            </button>
          )}
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus size={16} /> Tambah Agenda
          </button>
        </div>
      </div>

      {/* Agenda Items List */}
      <div className="space-y-4">
        {agendas.map((item) => (
          <div
            key={item.id}
            className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-200 hover:bg-white hover:shadow-md transition-all"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-black">
                  {item.category || 'Akademik'}
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Calendar size={14} className="text-blue-500" /> {item.date}
                </span>
                {item.time && (
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Clock size={14} className="text-amber-500" /> {item.time}
                  </span>
                )}
                {item.location && (
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <MapPin size={14} className="text-emerald-500" /> {item.location}
                  </span>
                )}
              </div>
              <h5 className="font-bold text-blue-950 text-base">{item.title}</h5>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{item.description}</p>
            </div>

            <div className="flex gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={() => openEditModal(item)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {agendas.length === 0 && (
          <div className="py-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Calendar size={48} className="mx-auto text-slate-300 mb-3" />
            <h5 className="font-bold text-slate-700 mb-1">Belum Ada Agenda Terjadwal</h5>
            <p className="text-xs text-slate-400 mb-4">Tambahkan agenda baru atau muat data agenda rekomendasi sekolah.</p>
            <button
              type="button"
              onClick={handleSeedDefaults}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow hover:bg-blue-700 transition-all inline-flex items-center gap-2"
            >
              <RotateCcw size={14} /> Muat Agenda Contoh
            </button>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Agenda */}
      {modalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h5 className="font-bold text-blue-950 text-lg">
                {editingItem ? 'Edit Agenda Kegiatan' : 'Tambah Agenda Kegiatan Baru'}
              </h5>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Judul Agenda</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Penilaian Sumatif Akhir Jenjang Kelas 6"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-sm font-bold text-blue-950 border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Tanggal Kegiatan</label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: 15 - 20 Maret 2026"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50 rounded-xl p-3 text-xs font-semibold border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-50 rounded-xl p-3 text-xs font-semibold border border-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Sosialisasi">Sosialisasi</option>
                    <option value="Ujian">Ujian</option>
                    <option value="Libur">Libur</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Waktu / Jam</label>
                  <input
                    type="text"
                    placeholder="Contoh: 07:30 - 11:30 WITA"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    className="w-full bg-slate-50 rounded-xl p-3 text-xs border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Lokasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Halaman Sekolah"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    className="w-full bg-slate-50 rounded-xl p-3 text-xs border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Deskripsi Kegiatan</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Uraian atau informasi penting mengenai agenda ini..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-xs leading-relaxed border border-slate-200 outline-none focus:border-blue-500"
                />
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
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

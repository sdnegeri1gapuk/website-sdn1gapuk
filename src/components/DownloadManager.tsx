import React, { useState, useEffect } from 'react';
import { Download, Plus, Edit2, Trash2, Save, RotateCcw, FileText, ExternalLink, X, Search } from 'lucide-react';
import { syncData, collections } from '../lib/dataService';
import { DOWNLOAD_ITEMS } from '../data/schoolStructure';
import { DownloadItem } from '../types';

export const DownloadManager: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DownloadItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const [form, setForm] = useState<Partial<DownloadItem>>({
    title: '',
    category: 'Formulir',
    fileType: 'PDF',
    fileSize: '250 KB',
    date: 'Mei 2026',
    description: '',
    fileUrl: ''
  });

  useEffect(() => {
    const unsub = syncData.subscribeDownloads((val) => {
      setDownloads(val as DownloadItem[]);
    });
    return () => unsub();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      title: '',
      category: 'Formulir',
      fileType: 'PDF',
      fileSize: '250 KB',
      date: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      description: '',
      fileUrl: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (item: DownloadItem) => {
    setEditingItem(item);
    setForm({ ...item });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus dokumen ini dari daftar download?')) {
      try {
        await syncData.deleteItem(collections.downloads, id);
        alert('Dokumen berhasil dihapus!');
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus dokumen.');
      }
    }
  };

  const handleSeedDefaults = async () => {
    if (window.confirm('Muat daftar berkas unduhan standar awal?')) {
      try {
        for (const item of DOWNLOAD_ITEMS) {
          await syncData.saveItem(collections.downloads, item);
        }
        alert('Dokumen awal berhasil dimuat!');
      } catch (err) {
        console.error(err);
        alert('Gagal memuat dokumen awal.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const itemToSave = {
        id: editingItem?.id || `dl-${Date.now()}`,
        title: form.title || '',
        category: form.category || 'Formulir',
        fileType: form.fileType || 'PDF',
        fileSize: form.fileSize || '250 KB',
        date: form.date || '',
        description: form.description || '',
        fileUrl: form.fileUrl || ''
      };
      await syncData.saveItem(collections.downloads, itemToSave);
      setModalOpen(false);
      alert('Dokumen berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan dokumen.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = downloads.filter(d => selectedCat === 'ALL' || d.category === selectedCat);

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-violet-50/70 p-6 rounded-3xl border border-violet-100">
        <div>
          <h4 className="text-xl font-bold text-violet-950 flex items-center gap-2">
            <Download className="text-violet-600" size={24} /> Kelola Pusat Berkas & Download
          </h4>
          <p className="text-sm text-slate-600 mt-1">
            Unggah dan sediakan formulir resmi, modul akademik, tata tertib, dan surat pernyataan untuk diunduh publik.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {downloads.length === 0 && (
            <button
              type="button"
              onClick={handleSeedDefaults}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-violet-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm"
            >
              <RotateCcw size={14} /> Muat Dokumen Awal
            </button>
          )}
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus size={16} /> Tambah Dokumen
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['ALL', 'Formulir', 'Akademik', 'Regulasi', 'Panduan'].map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCat === cat
                ? 'bg-violet-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat === 'ALL' ? 'Semua Kategori' : cat}
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-violet-200 hover:bg-white hover:shadow-md transition-all"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-black">
                  {item.category}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 rounded-md text-[10px] font-black uppercase">
                  {item.fileType}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{item.fileSize}</span>
                <span className="text-xs text-slate-400">• Rilis: {item.date}</span>
                {item.fileUrl && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <ExternalLink size={12} /> Link Eksternal Aktif
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

        {filtered.length === 0 && (
          <div className="py-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <FileText size={48} className="mx-auto text-slate-300 mb-3" />
            <h5 className="font-bold text-slate-700 mb-1">Tidak Ada Dokumen di Kategori Ini</h5>
            <p className="text-xs text-slate-400 mb-4">Tambahkan berkas baru atau muat berkas standar sekolah.</p>
            <button
              type="button"
              onClick={handleSeedDefaults}
              className="bg-violet-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow hover:bg-violet-700 transition-all inline-flex items-center gap-2"
            >
              <RotateCcw size={14} /> Muat Dokumen Contoh
            </button>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Document */}
      {modalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="font-bold text-blue-950 text-lg">
                {editingItem ? 'Edit Dokumen Unduhan' : 'Tambah Dokumen Unduhan Baru'}
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
                <label className="text-xs font-bold text-slate-500 block mb-1">Judul Dokumen / Berkas</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Formulir Pendaftaran Siswa Baru (PPDB) 2026/2027"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-sm font-bold text-blue-950 border border-slate-200 outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value as any })}
                    className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold border border-slate-200 outline-none focus:border-violet-500"
                  >
                    <option value="Formulir">Formulir</option>
                    <option value="Akademik">Akademik</option>
                    <option value="Regulasi">Regulasi</option>
                    <option value="Panduan">Panduan</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Tipe Format File</label>
                  <input
                    required
                    type="text"
                    placeholder="PDF, DOCX, XLSX"
                    value={form.fileType}
                    onChange={e => setForm({ ...form, fileType: e.target.value })}
                    className="w-full bg-slate-50 rounded-xl p-3 text-xs font-bold border border-slate-200 outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Perkiraan Ukuran File</label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: 245 KB atau 1.2 MB"
                    value={form.fileSize}
                    onChange={e => setForm({ ...form, fileSize: e.target.value })}
                    className="w-full bg-slate-50 rounded-xl p-3 text-xs border border-slate-200 outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Bulan & Tahun Rilis</label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: Mei 2026"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50 rounded-xl p-3 text-xs border border-slate-200 outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Keterangan Singkat Berkas</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Jelaskan isi atau fungsi dokumen ini..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-xs leading-relaxed border border-slate-200 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Link Berkas / Google Drive (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/... (Kosongkan jika ingin generate formulir otomatis)"
                  value={form.fileUrl || ''}
                  onChange={e => setForm({ ...form, fileUrl: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 text-xs border border-slate-200 outline-none focus:border-violet-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Jika dikosongkan, tombol unduh di website akan otomatis men-generate file resmi ber-kop SDN 1 Gapuk.
                </p>
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
                  className="bg-violet-600 text-white px-5 py-2 rounded-xl font-bold text-xs shadow hover:bg-violet-700 transition-all flex items-center gap-1.5"
                >
                  <Save size={14} /> {saving ? 'Menyimpan...' : 'Simpan Dokumen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

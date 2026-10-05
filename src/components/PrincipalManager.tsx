import React, { useState, useEffect } from 'react';
import { UserCheck, Save, RotateCcw, Upload, ImageIcon, CheckCircle, Quote } from 'lucide-react';
import { syncData } from '../lib/dataService';
import { PRINCIPAL_INFO } from '../data/schoolStructure';
import { PrincipalInfo } from '../types';

export const PrincipalManager: React.FC = () => {
  const [data, setData] = useState<PrincipalInfo>(PRINCIPAL_INFO);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const unsub = syncData.subscribePrincipal((val) => {
      if (val) {
        setData({
          name: val.name || PRINCIPAL_INFO.name,
          title: val.title || PRINCIPAL_INFO.title,
          titleEn: val.titleEn || PRINCIPAL_INFO.titleEn,
          nip: val.nip || PRINCIPAL_INFO.nip,
          photoUrl: val.photoUrl || PRINCIPAL_INFO.photoUrl,
          greetingId: val.greetingId || PRINCIPAL_INFO.greetingId,
          greetingEn: val.greetingEn || PRINCIPAL_INFO.greetingEn
        });
      }
    });
    return () => unsub();
  }, []);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar. Maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 1000;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/webp', 0.8);
        setData(prev => ({ ...prev, photoUrl: base64 }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await syncData.savePrincipal(data);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      alert('Data Kepala Sekolah berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data Kepala Sekolah.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Kembalikan ke data awal Kepala Sekolah default?')) {
      setData(PRINCIPAL_INFO);
      await syncData.savePrincipal(PRINCIPAL_INFO);
      alert('Data berhasil direset ke nilai awal.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-blue-50/70 p-6 rounded-3xl border border-blue-100">
        <div>
          <h4 className="text-xl font-bold text-blue-950 flex items-center gap-2">
            <UserCheck className="text-blue-600" size={24} /> Kelola Profil Kepala Sekolah
          </h4>
          <p className="text-sm text-slate-600 mt-1">
            Atur foto resmi, nama, NIP, gelar, serta sambutan hangat Kepala Sekolah yang tampil di website.
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

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Photo & Identity Section */}
          <div className="lg:col-span-1 bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Foto Resmi Kepala Sekolah
            </label>
            <div className="flex flex-col items-center">
              <div className="w-48 h-60 rounded-2xl overflow-hidden bg-slate-200 border-4 border-white shadow-xl mb-4 relative group">
                {data.photoUrl ? (
                  <img src={data.photoUrl} alt="Kepala Sekolah" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={48} />
                  </div>
                )}
              </div>
              <label className="cursor-pointer bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 mb-3">
                <Upload size={16} /> Unggah Foto Baru
                <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
              </label>
              <p className="text-[11px] text-slate-400 text-center">Atau masukkan URL gambar / Google Drive:</p>
              <input
                type="text"
                placeholder="https://..."
                value={data.photoUrl}
                onChange={e => setData({ ...data, photoUrl: e.target.value })}
                className="w-full mt-2 bg-white rounded-xl p-3 text-xs border border-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Nama Lengkap & Gelar</label>
                <input
                  required
                  type="text"
                  value={data.name}
                  onChange={e => setData({ ...data, name: e.target.value })}
                  className="w-full bg-white rounded-xl p-3 text-sm font-bold text-blue-950 border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Nomor Induk Pegawai (NIP)</label>
                <input
                  type="text"
                  value={data.nip}
                  onChange={e => setData({ ...data, nip: e.target.value })}
                  placeholder="Contoh: NIP. 19740512 199803 1 004"
                  className="w-full bg-white rounded-xl p-3 text-xs font-medium text-slate-700 border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Jabatan Resmi (ID)</label>
                <input
                  type="text"
                  value={data.title}
                  onChange={e => setData({ ...data, title: e.target.value })}
                  className="w-full bg-white rounded-xl p-3 text-xs text-slate-700 border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Jabatan Resmi (EN)</label>
                <input
                  type="text"
                  value={data.titleEn || ''}
                  onChange={e => setData({ ...data, titleEn: e.target.value })}
                  placeholder="Principal of SDN 1 Gapuk"
                  className="w-full bg-white rounded-xl p-3 text-xs text-slate-700 border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Greeting Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <Quote size={20} className="text-blue-600" />
                <label className="text-sm font-bold text-blue-950">
                  Sambutan Kepala Sekolah (Bahasa Indonesia)
                </label>
              </div>
              <textarea
                required
                rows={10}
                value={data.greetingId}
                onChange={e => setData({ ...data, greetingId: e.target.value })}
                placeholder="Tuliskan sambutan hangat Kepala Sekolah untuk para siswa, orang tua, dan masyarakat..."
                className="w-full bg-white rounded-2xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <Quote size={20} className="text-indigo-600" />
                <label className="text-sm font-bold text-blue-950">
                  Sambutan Kepala Sekolah (English Translation - Opsional)
                </label>
              </div>
              <textarea
                rows={8}
                value={data.greetingEn || ''}
                onChange={e => setData({ ...data, greetingEn: e.target.value })}
                placeholder="Write the English version of the principal's message..."
                className="w-full bg-white rounded-2xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-200 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
          {savedSuccess && (
            <span className="flex items-center gap-2 text-emerald-600 text-sm font-bold animate-pulse">
              <CheckCircle size={18} /> Berhasil disimpan!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl hover:bg-blue-800 transition-all flex items-center gap-2 disabled:bg-slate-400 cursor-pointer"
          >
            <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan Profil Kepala Sekolah'}
          </button>
        </div>
      </form>
    </div>
  );
};

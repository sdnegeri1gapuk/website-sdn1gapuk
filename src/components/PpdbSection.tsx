import React from 'react';
import { motion } from 'motion/react';
import { UserCheck, FileCheck, ArrowRight, Download, Calendar, ShieldCheck, Users, HelpCircle } from 'lucide-react';
import { PPDB_REQUIREMENTS, PPDB_FLOW } from '../data/schoolStructure';

interface PpdbSectionProps {
  lang: 'id' | 'en';
  onOpenRegistration: () => void;
}

export const PpdbSection: React.FC<PpdbSectionProps> = ({ lang, onOpenRegistration }) => {
  const downloadFormTemplate = () => {
    const content = `=====================================================
FORMULIR PENDAFTARAN PESERTA DIDIK BARU (PPDB)
SD NEGERI 1 GAPUK TAHUN AJARAN 2026/2027
Alamat: Dusun Gapuk Baru, Desa Gapuk, Kec. Suralaga, Kab. Lombok Timur
=====================================================

A. DATA CALON PESERTA DIDIK
1. Nama Lengkap           : ................................................
2. Nama Panggilan         : ................................................
3. Jenis Kelamin          : [ ] Laki-laki   [ ] Perempuan
4. NISN (jika ada)        : ................................................
5. NIK (No. KTP Anak)     : ................................................
6. Tempat, Tanggal Lahir  : ................................................
7. Agama                  : ................................................
8. Alamat Tempat Tinggal  : ................................................
                           RT/RW: ...... Dusun: ............................
                           Desa: Gapuk, Kec. Suralaga
9. Asal Sekolah TK/PAUD   : ................................................

B. DATA ORANG TUA / WALI
1. Nama Ayah Kandung      : ................................................
2. NIK Ayah               : ................................................
3. Pekerjaan Ayah         : ................................................
4. Nama Ibu Kandung       : ................................................
5. NIK Ibu                : ................................................
6. Pekerjaan Ibu          : ................................................
7. No. WhatsApp / HP Aktif: ................................................

C. BERKAS PERSYARATAN YANG DILAMPIRKAN:
[ ] 1. Fotokopi Akta Kelahiran (2 lembar)
[ ] 2. Fotokopi Kartu Keluarga (2 lembar)
[ ] 3. Fotokopi KTP Orang Tua (Ayah & Ibu)
[ ] 4. Pas Foto 3x4 Calon Siswa (3 lembar)
[ ] 5. Ijazah / SKL TK / PAUD (jika ada)

Mengetahui,                                       Gapuk, ........................ 2026
Orang Tua / Wali Murid,                           Petugas Pendaftaran,



( ..................................... )         ( ..................................... )
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Formulir_PPDB_SDN1Gapuk_2026_2027.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="ppdb" className="py-24 bg-gradient-to-b from-white via-blue-50/40 to-slate-50 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full box-border">
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-[3rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl mb-16">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block bg-blue-600/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-blue-200 mb-4 border border-blue-400/30">
              {lang === 'id' ? 'Penerimaan Peserta Didik Baru' : 'New Student Admission'}
            </span>
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
              PPDB SD Negeri 1 Gapuk <br />
              <span className="text-amber-300">{lang === 'id' ? 'Tahun Ajaran 2026/2027' : 'Academic Year 2026/2027'}</span>
            </h2>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
              {lang === 'id'
                ? 'Mari wujudkan masa depan cemerlang putra-putri Anda bersama keluarga besar SDN 1 Gapuk. Pendidikan berkarakter, lingkungan ramah anak, dan kurikulum modern berlandaskan iman & taqwa.'
                : 'Build a bright future for your children with SDN 1 Gapuk. Character-based education, child-friendly environment, and modern curriculum rooted in faith and values.'}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenRegistration}
                className="bg-amber-400 hover:bg-amber-500 text-blue-950 font-black px-8 py-4 rounded-2xl transition-all shadow-xl hover:shadow-amber-400/20 active:scale-95 flex items-center gap-2"
              >
                <span>{lang === 'id' ? 'Daftar Online Sekarang' : 'Register Online Now'}</span>
                <ArrowRight size={18} />
              </button>
              <button
                onClick={downloadFormTemplate}
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-4 rounded-2xl border border-white/20 transition-all flex items-center gap-2"
              >
                <Download size={18} />
                <span>{lang === 'id' ? 'Unduh Formulir Cetak' : 'Download Print Form'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2 Column Details: Persyaratan & Alur */}
        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* Persyaratan */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <FileCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-950">
                  {lang === 'id' ? 'Persyaratan Pendaftaran' : 'Admission Requirements'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'id' ? 'Dokumen wajib disiapkan oleh orang tua/wali murid' : 'Mandatory documents to prepare'}
                </p>
              </div>
            </div>

            <ul className="space-y-3.5">
              {PPDB_REQUIREMENTS.map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={14} />
                  </div>
                  <span className={req.highlight ? 'font-bold text-blue-950' : ''}>
                    {req.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Alur Pendaftaran */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <UserCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-950">
                  {lang === 'id' ? 'Alur Pendaftaran' : 'Registration Flow'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'id' ? 'Langkah mudah proses pendaftaran calon siswa' : 'Easy steps for prospective students'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {PPDB_FLOW.map((flow, i) => (
                <div key={i} className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100/70">
                  <div className="w-8 h-8 rounded-xl bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                    {flow.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{flow.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{flow.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Callout Notice */}
        <div className="bg-blue-50/60 rounded-3xl p-6 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HelpCircle size={24} className="text-blue-700 shrink-0" />
            <p className="text-xs md:text-sm text-blue-900 font-medium">
              {lang === 'id'
                ? 'Butuh bantuan seputar PPDB? Hubungi panitia via WhatsApp resmi sekolah di 085939324177.'
                : 'Need assistance with PPDB? Contact the school admission committee on WhatsApp at 085939324177.'}
            </p>
          </div>
          <button
            onClick={onOpenRegistration}
            className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shrink-0 transition-all shadow-md active:scale-95"
          >
            {lang === 'id' ? 'Buka Formulir' : 'Open Form'}
          </button>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, CheckCircle, Search, Filter } from 'lucide-react';
import { DOWNLOAD_ITEMS } from '../data/schoolStructure';
import { DownloadItem } from '../types';

interface DownloadSectionProps {
  lang: 'id' | 'en';
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({ lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const categories = ['ALL', 'Formulir', 'Akademik', 'Regulasi', 'Panduan'];

  const filteredItems = DOWNLOAD_ITEMS.filter(item => {
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleDownload = (item: DownloadItem) => {
    setDownloadingId(item.id);

    // Create a formatted printable/downloadable text or file blob
    const content = `=====================================================
PEMERINTAH KABUPATEN LOMBOK TIMUR
DINAS PENDIDIKAN DAN KEBUDAYAAN
SD NEGERI 1 GAPUK
Alamat: Dusun Gapuk Baru, Desa Gapuk, Kec. Suralaga, Kab. Lombok Timur
=====================================================

DOKUMEN RESMI SEKOLAH
Nama Dokumen : ${item.title}
Kategori     : ${item.category}
Format File  : ${item.fileType}
Ukuran       : ${item.fileSize}
Tanggal Rilis: ${item.date}

DESKRIPSI:
${item.description || 'Dokumen resmi diterbitkan oleh SD Negeri 1 Gapuk.'}

-----------------------------------------------------
Catatan: Dokumen ini diterbitkan secara resmi melalui Portal Web SDN 1 Gapuk.
Untuk verifikasi keabsahan dokumen fisik, silakan hubungi bagian tata usaha sekolah.

SD NEGERI 1 GAPUK
NPSN: 50202868 | Terakreditasi B
=====================================================
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.title.replace(/[/\\?%*:|"<>]/g, '_')}.${item.fileType.toLowerCase() === 'pdf' ? 'txt' : 'doc'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setDownloadingId(null);
    }, 1200);
  };

  return (
    <section id="download" className="py-24 bg-slate-50 border-t border-slate-200/70 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full box-border">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-blue-600 font-bold uppercase tracking-wider text-xs bg-blue-50 px-4 py-1.5 rounded-full inline-block mb-3">
            {lang === 'id' ? 'Pusat Unduhan' : 'Download Center'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-950 mb-3">
            {lang === 'id' ? 'Dokumen & Berkas Resmi' : 'Official Documents & Files'}
          </h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            {lang === 'id' 
              ? 'Unduh formulir pendaftaran, buku tata tertib, kalender pendidikan, dan panduan akademik resmi SDN 1 Gapuk.'
              : 'Download registration forms, school rules, academic calendar, and official guides of SDN 1 Gapuk.'}
          </p>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full mt-4" />
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 w-full">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-800 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'ALL' ? (lang === 'id' ? 'Semua Berkas' : 'All Files') : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'id' ? 'Cari nama dokumen...' : 'Search document...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Download Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-w-0">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                      {item.fileType} • {item.fileSize}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {item.date}
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-700 transition-colors">
                        {item.title}
                      </h3>
                      <span className="inline-block text-[10px] font-semibold text-blue-600 mt-1">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-6">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleDownload(item)}
                    disabled={downloadingId === item.id}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white font-bold text-xs transition-all active:scale-95 group-hover:bg-blue-600 group-hover:text-white shadow-xs"
                  >
                    {downloadingId === item.id ? (
                      <>
                        <CheckCircle size={15} className="animate-spin text-emerald-400" />
                        <span>{lang === 'id' ? 'Mengunduh...' : 'Downloading...'}</span>
                      </>
                    ) : (
                      <>
                        <Download size={15} />
                        <span>{lang === 'id' ? 'Unduh Dokumen' : 'Download Document'}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-400 italic bg-white rounded-3xl border border-slate-200/60">
              <FileText size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm">{lang === 'id' ? 'Dokumen tidak ditemukan.' : 'No documents found.'}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

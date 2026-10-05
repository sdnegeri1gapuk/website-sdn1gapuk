import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Newspaper, Bell, Calendar as CalendarIcon, 
  MapPin, Clock, ChevronRight, FileText, Download
} from 'lucide-react';
import { NewsItem, AgendaItem } from '../types';
import { AGENDA_DATA, ACADEMIC_CALENDAR } from '../data/schoolStructure';

interface InformasiSectionProps {
  lang: 'id' | 'en';
  newsList: NewsItem[];
  onSelectNews: (news: NewsItem) => void;
  onViewAllNews: () => void;
}

export const InformasiSection: React.FC<InformasiSectionProps> = ({
  lang,
  newsList,
  onSelectNews,
  onViewAllNews
}) => {
  const [activeTab, setActiveTab] = useState<'berita' | 'pengumuman' | 'agenda' | 'kalender'>('berita');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#berita') setActiveTab('berita');
      else if (hash === '#pengumuman') setActiveTab('pengumuman');
      else if (hash === '#agenda') setActiveTab('agenda');
      else if (hash === '#kalender-pendidikan' || hash === '#kalender') setActiveTab('kalender');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const beritaItems = newsList.filter(n => n.category?.toLowerCase() !== 'pengumuman');
  const pengumumanItems = newsList.filter(n => n.category?.toLowerCase() === 'pengumuman');

  const tabs = [
    { id: 'berita', label: lang === 'id' ? 'Berita Kegiatan' : 'News', icon: Newspaper, hash: '#berita' },
    { id: 'pengumuman', label: lang === 'id' ? 'Pengumuman Resmi' : 'Announcements', icon: Bell, hash: '#pengumuman' },
    { id: 'agenda', label: lang === 'id' ? 'Agenda Sekolah' : 'Agenda & Events', icon: CalendarIcon, hash: '#agenda' },
    { id: 'kalender', label: lang === 'id' ? 'Kalender Pendidikan' : 'Academic Calendar', icon: Clock, hash: '#kalender-pendidikan' }
  ];

  return (
    <section id="informasi" className="py-24 bg-slate-50/60 w-full overflow-hidden border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full box-border">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-blue-600 font-bold uppercase tracking-wider text-xs bg-blue-50 px-4 py-1.5 rounded-full inline-block mb-3">
            {lang === 'id' ? 'Pusat Informasi' : 'Information Center'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-950 mb-3">
            {lang === 'id' ? 'Kabar, Pengumuman & Agenda' : 'News, Notices & School Agenda'}
          </h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            {lang === 'id'
              ? 'Dapatkan berita terkini kegiatan belajar, surat edaran resmi, agenda penting, serta kalender pendidikan sekolah.'
              : 'Stay updated with school activities, official notices, upcoming agendas, and the academic calendar.'}
          </p>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full mt-4" />
        </div>

        {/* Segmented Switcher Controls */}
        <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-4 mb-12 scrollbar-none w-full">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  window.history.replaceState(null, '', tab.hash);
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-blue-800 text-white shadow-lg shadow-blue-900/15 scale-105'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Berita */}
        {activeTab === 'berita' && (
          <div id="berita">
            <div className="flex justify-between items-center mb-8">
              <p className="text-xs md:text-sm text-slate-500">
                {lang === 'id' ? 'Liputan kegiatan edukatif dan prestasi siswa SDN 1 Gapuk' : 'Coverage of educational events and student achievements'}
              </p>
              <button
                onClick={onViewAllNews}
                className="text-blue-700 hover:text-blue-800 font-bold text-xs md:text-sm flex items-center gap-1.5 transition-all"
              >
                <span>{lang === 'id' ? 'Lihat Semua Berita' : 'View All News'}</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {beritaItems.length > 0 ? (
                beritaItems.slice(0, 6).map((news, i) => (
                  <motion.div
                    key={news.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => onSelectNews(news)}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer border border-slate-100 flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-48 overflow-hidden bg-slate-200">
                        <img
                          src={news.imageUrl}
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between text-[11px] mb-3">
                          <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {news.category}
                          </span>
                          <span className="text-slate-400 flex items-center gap-1 font-medium">
                            <Clock size={12} /> {news.date}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-blue-950 group-hover:text-blue-700 transition-colors line-clamp-2 mb-2">
                          {news.title}
                        </h3>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                          {news.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center text-blue-600 font-bold text-xs">
                      <span>{lang === 'id' ? 'Baca Selengkapnya' : 'Read Full Story'}</span>
                      <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center text-slate-400 italic">
                  Belum ada berita yang dipublikasikan.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Pengumuman */}
        {activeTab === 'pengumuman' && (
          <div id="pengumuman" className="space-y-4 max-w-4xl mx-auto">
            {pengumumanItems.length > 0 ? (
              pengumumanItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => onSelectNews(item)}
                  className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Bell size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        {lang === 'id' ? 'Pengumuman Resmi' : 'Official Notice'}
                      </span>
                      <span className="text-[11px] text-slate-400">• {item.date}</span>
                    </div>
                    <h3 className="font-bold text-base text-blue-950 group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 shrink-0 self-center group-hover:translate-x-1 transition-transform" />
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-slate-400 italic bg-white rounded-3xl border border-slate-100">
                <Bell size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm">{lang === 'id' ? 'Tidak ada pengumuman saat ini.' : 'No notices at this time.'}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Agenda Kegiatan */}
        {activeTab === 'agenda' && (
          <div id="agenda" className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {AGENDA_DATA.map((ag) => (
              <div
                key={ag.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {ag.category}
                    </span>
                    <span className="text-xs font-bold text-blue-900 bg-slate-100 px-3 py-1 rounded-xl">
                      {ag.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-blue-950 mb-2 leading-snug">
                    {ag.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4">
                    {ag.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock size={13} className="text-blue-600" />
                    <span>{ag.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin size={13} className="text-blue-600" />
                    <span>{ag.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: Kalender Pendidikan */}
        {activeTab === 'kalender' && (
          <div id="kalender-pendidikan" className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Semester Ganjil */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-950">Semester Ganjil 2026</h3>
                  <p className="text-xs text-slate-400">{ACADEMIC_CALENDAR.semesterGanjil.period}</p>
                </div>
              </div>

              <div className="space-y-3.5">
                {ACADEMIC_CALENDAR.semesterGanjil.events.map((ev, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <span className="font-mono font-bold text-blue-700 shrink-0 w-32 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      {ev.date}
                    </span>
                    <span className="text-slate-700 font-medium pt-0.5">{ev.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Semester Genap */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-950">Semester Genap 2027</h3>
                  <p className="text-xs text-slate-400">{ACADEMIC_CALENDAR.semesterGenap.period}</p>
                </div>
              </div>

              <div className="space-y-3.5">
                {ACADEMIC_CALENDAR.semesterGenap.events.map((ev, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <span className="font-mono font-bold text-indigo-700 shrink-0 w-32 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      {ev.date}
                    </span>
                    <span className="text-slate-700 font-medium pt-0.5">{ev.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

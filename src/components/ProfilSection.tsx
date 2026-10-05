import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, BookOpen, Clock, Users, Award, 
  ChevronRight, ArrowLeft, ArrowRight, Quote, Landmark, Network
} from 'lucide-react';
import { StaffItem, PrincipalInfo, SchoolHistoryInfo, OrgStructureMember } from '../types';
import { PRINCIPAL_INFO, SCHOOL_HISTORY, ORG_STRUCTURE } from '../data/schoolStructure';

interface ProfilSectionProps {
  lang: 'id' | 'en';
  profile: { vision: string; mission: string; profileImage?: string };
  staffList: StaffItem[];
  principalInfo?: PrincipalInfo;
  schoolHistory?: SchoolHistoryInfo;
  orgStructure?: OrgStructureMember[];
}

export const ProfilSection: React.FC<ProfilSectionProps> = ({ 
  lang, 
  profile, 
  staffList,
  principalInfo,
  schoolHistory,
  orgStructure
}) => {
  const activePrincipal = principalInfo || PRINCIPAL_INFO;
  const activeHistory = schoolHistory || SCHOOL_HISTORY;
  const activeOrg = orgStructure && orgStructure.length > 0 ? orgStructure : ORG_STRUCTURE;

  const [activeTab, setActiveTab] = useState<'sejarah' | 'visi' | 'kepala' | 'guru' | 'struktur'>('sejarah');
  const staffScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#sejarah') setActiveTab('sejarah');
      else if (hash === '#visi-misi') setActiveTab('visi');
      else if (hash === '#kepala-sekolah') setActiveTab('kepala');
      else if (hash === '#guru-tendik') setActiveTab('guru');
      else if (hash === '#struktur-organisasi') setActiveTab('struktur');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const scrollStaff = (direction: 'left' | 'right') => {
    if (staffScrollRef.current) {
      const scrollAmount = 300;
      staffScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const tabs = [
    { id: 'sejarah', label: lang === 'id' ? 'Sejarah' : 'History', icon: Landmark, hash: '#sejarah' },
    { id: 'visi', label: lang === 'id' ? 'Visi & Misi' : 'Vision & Mission', icon: Trophy, hash: '#visi-misi' },
    { id: 'kepala', label: lang === 'id' ? 'Kepala Sekolah' : 'Principal', icon: Award, hash: '#kepala-sekolah' },
    { id: 'guru', label: lang === 'id' ? 'Guru & Tendik' : 'Staff & Teachers', icon: Users, hash: '#guru-tendik' },
    { id: 'struktur', label: lang === 'id' ? 'Struktur Organisasi' : 'Organization', icon: Network, hash: '#struktur-organisasi' },
  ];

  return (
    <section id="profil" className="py-24 bg-white w-full overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full box-border">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-blue-600 font-bold uppercase tracking-wider text-xs bg-blue-50 px-4 py-1.5 rounded-full inline-block mb-3">
            {lang === 'id' ? 'Tentang Kami' : 'About Us'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-950 mb-3">
            {lang === 'id' ? 'Profil SD Negeri 1 Gapuk' : 'Profile of SD Negeri 1 Gapuk'}
          </h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            {lang === 'id'
              ? 'Menelusuri jejak langkah, kepemimpinan, visi misi, dedikasi tenaga pendidik, dan struktur organisasi sekolah.'
              : 'Discovering our journey, leadership, vision and mission, dedicated educators, and organizational hierarchy.'}
          </p>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full mt-4" />
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-4 mb-12 scrollbar-none w-full">
          {tabs.map((tab) => {
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
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Kepala Sekolah */}
        {activeTab === 'kepala' && (
          <div id="kepala-sekolah" className="bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm">
            <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
              <div className="md:col-span-4 text-center md:text-left">
                <div className="relative inline-block mx-auto md:mx-0 aspect-[3/4] w-56 md:w-full rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-200">
                  <img
                    src={activePrincipal.photoUrl}
                    alt={activePrincipal.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-white text-[11px] font-bold tracking-wider uppercase">
                      {lang === 'id' ? activePrincipal.title : (activePrincipal.titleEn || activePrincipal.title)}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-bold text-blue-950">{activePrincipal.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{activePrincipal.nip}</p>
                </div>
              </div>

              <div className="md:col-span-8 space-y-6">
                <div className="flex items-center gap-3 text-blue-700">
                  <Quote size={32} className="opacity-40" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {lang === 'id' ? 'Sambutan Kepala Sekolah' : 'Principal Welcome Address'}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-blue-950 leading-snug">
                  {lang === 'id'
                    ? 'Bersinergi Membentuk Generasi Cerdas Berkarakter'
                    : 'Collaborating to Shape a Smart & Character-Driven Generation'}
                </h3>
                <div className="text-slate-600 text-sm md:text-base leading-relaxed space-y-4 whitespace-pre-line bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-2xs">
                  {lang === 'id' ? activePrincipal.greetingId : (activePrincipal.greetingEn || activePrincipal.greetingId)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Visi & Misi */}
        {activeTab === 'visi' && (
          <div id="visi-misi" className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video rounded-3xl overflow-hidden shadow-xl"
            >
              <img
                src={profile?.profileImage || 'https://images.unsplash.com/photo-1523050335392-93851179ae22?auto=format&fit=crop&q=80'}
                className="w-full h-full object-cover"
                alt="Visi Misi"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-blue-950 mb-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700">
                    <Trophy size={18} />
                  </div>
                  <span>{lang === 'id' ? 'Visi Sekolah' : 'School Vision'}</span>
                </h3>
                <p className="text-slate-700 leading-relaxed italic text-base">
                  "{profile?.vision || ''}"
                </p>
              </div>

              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-blue-950 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700">
                    <BookOpen size={18} />
                  </div>
                  <span>{lang === 'id' ? 'Misi Sekolah' : 'School Mission'}</span>
                </h3>
                <ul className="space-y-3 text-slate-700 text-sm">
                  {(profile?.mission || '').split('\n').filter(Boolean).map((point, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Sejarah */}
        {activeTab === 'sejarah' && (
          <div id="sejarah" className="space-y-10">
            <div className="bg-blue-50/60 p-8 rounded-3xl border border-blue-100 text-slate-700 text-sm md:text-base leading-relaxed">
              <h3 className="text-xl font-bold text-blue-950 mb-3 flex items-center gap-2">
                <Landmark size={22} className="text-blue-700" />
                <span>{lang === 'id' ? activeHistory.titleId : (activeHistory.titleEn || activeHistory.titleId)}</span>
              </h3>
              <p>{lang === 'id' ? activeHistory.summaryId : (activeHistory.summaryEn || activeHistory.summaryId)}</p>
            </div>

            {/* Milestones Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeHistory.milestones.map((m, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <span className="font-mono text-2xl font-black text-blue-700 block mb-2">{m.year}</span>
                    <h4 className="font-bold text-slate-900 text-base mb-2">
                      {lang === 'id' ? m.titleId : (m.titleEn || m.titleId)}
                    </h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {lang === 'id' ? m.descId : (m.descEn || m.descId)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Guru & Tendik */}
        {activeTab === 'guru' && (
          <div id="guru-tendik" className="relative group">
            <div className="flex justify-between items-center mb-6">
              <p className="text-slate-500 text-xs md:text-sm">
                {lang === 'id' ? 'Daftar dewan guru dan tenaga kependidikan aktif SDN 1 Gapuk' : 'List of active teachers and staff of SDN 1 Gapuk'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollStaff('left')}
                  className="p-2.5 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={() => scrollStaff('right')}
                  className="p-2.5 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div
              ref={staffScrollRef}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
            >
              {staffList.length > 0 ? (
                staffList.map((person, i) => (
                  <div key={person.id || i} className="group/item shrink-0 w-48 md:w-56 snap-center bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <div className="relative mb-4">
                      <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-sm bg-slate-200">
                        <img
                          src={person.imageUrl || 'https://images.unsplash.com/photo-1544168190-79c17527004f?auto=format&fit=crop&q=80'}
                          alt={person.name}
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-xl shadow-xs border border-slate-100 whitespace-nowrap">
                        <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wider">{person.position}</p>
                      </div>
                    </div>
                    <div className="text-center mt-3">
                      <h4 className="font-bold text-sm text-blue-950 leading-tight">{person.name}</h4>
                      {person.education && <p className="text-[10px] text-slate-400 mt-1">{person.education}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full py-16 text-center text-slate-400 italic">
                  Belum ada data tenaga pendidik.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Struktur Organisasi */}
        {activeTab === 'struktur' && (
          <div id="struktur-organisasi" className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h3 className="text-2xl font-bold text-blue-950 mb-2">
                {lang === 'id' ? 'Bagan Struktur Organisasi Sekolah' : 'School Organization Chart'}
              </h3>
              <p className="text-slate-500 text-xs">
                {lang === 'id' ? 'Tata kelola kepemimpinan dan pembagian tugas di SD Negeri 1 Gapuk' : 'Governance and roles at SD Negeri 1 Gapuk'}
              </p>
            </div>

            {/* Tree Chart Visual */}
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Level 1: Komite */}
              {activeOrg.find(x => x.level === 1) && (
                <div className="flex justify-center">
                  <div className="bg-amber-100 border-2 border-amber-300 text-amber-900 rounded-2xl px-6 py-3 text-center shadow-xs">
                    <p className="text-[10px] font-black uppercase tracking-wider">{lang === 'id' ? activeOrg.find(x => x.level === 1)?.role : (activeOrg.find(x => x.level === 1)?.roleEn || activeOrg.find(x => x.level === 1)?.role)}</p>
                    <p className="text-sm font-bold">{activeOrg.find(x => x.level === 1)?.name}</p>
                  </div>
                </div>
              )}

              <div className="w-0.5 h-6 bg-slate-300 mx-auto" />

              {/* Level 2: Kepala Sekolah */}
              <div className="flex justify-center">
                <div className="bg-blue-800 text-white rounded-2xl px-8 py-4 text-center shadow-md border-2 border-blue-600">
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-200">
                    {lang === 'id' ? (activeOrg.find(x => x.level === 2)?.role || 'Kepala Sekolah') : (activeOrg.find(x => x.level === 2)?.roleEn || 'Principal')}
                  </p>
                  <p className="text-base font-bold">{activeOrg.find(x => x.level === 2)?.name || activePrincipal.name}</p>
                </div>
              </div>

              <div className="w-0.5 h-6 bg-slate-300 mx-auto" />

              {/* Level 3: Koordinator Unit */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {activeOrg.filter(x => x.level === 3).map((item, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center shadow-2xs">
                    <p className="text-[9px] font-bold text-blue-700 uppercase tracking-tight line-clamp-1">{lang === 'id' ? item.role : (item.roleEn || item.role)}</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">{item.name}</p>
                  </div>
                ))}
              </div>

              {activeOrg.filter(x => x.level === 4).length > 0 && (
                <>
                  <div className="w-0.5 h-6 bg-slate-300 mx-auto" />

                  {/* Level 4: Pelaksana Teknis & Staf */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                    {activeOrg.filter(x => x.level === 4).map((item, idx) => (
                      <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center shadow-2xs">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{lang === 'id' ? item.role : (item.roleEn || item.role)}</p>
                        <p className="text-xs font-bold text-slate-800 mt-1">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, Calendar as CalendarIcon, Clock, 
  Tent, Music, Cpu, Trophy, Palette, Target, 
  Mic2, Heart, Camera, Monitor, Users, Globe, 
  Star, ChevronRight, CheckCircle2, Sparkles
} from 'lucide-react';
import { ScheduleItem, ExtraItem, CurriculumInfo } from '../types';
import { CURRICULUM_INFO } from '../data/schoolStructure';

interface AkademikSectionProps {
  lang: 'id' | 'en';
  scheduleList: ScheduleItem[];
  extraList: ExtraItem[];
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  onSelectExtra: (extra: ExtraItem) => void;
  curriculumData?: CurriculumInfo;
}

export const AkademikSection: React.FC<AkademikSectionProps> = ({
  lang,
  scheduleList,
  extraList,
  selectedGrade,
  setSelectedGrade,
  onSelectExtra,
  curriculumData
}) => {
  const activeCurriculum = curriculumData || CURRICULUM_INFO;

  const [activeSubTab, setActiveSubTab] = useState<'kurikulum' | 'jadwal' | 'ekskul'>('kurikulum');
  const [activeDay, setActiveDay] = useState<string>('ALL');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#kurikulum') setActiveSubTab('kurikulum');
      else if (hash === '#jadwal') setActiveSubTab('jadwal');
      else if (hash === '#ekstrakurikuler') setActiveSubTab('ekskul');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const uniqueGrades = Array.from(new Set(scheduleList.map(s => s.grade))).sort();
  const gradesToDisplay = uniqueGrades.length > 0 ? uniqueGrades : ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const tabs = [
    { id: 'kurikulum', label: lang === 'id' ? 'Kurikulum Merdeka' : 'Curriculum', icon: BookOpen, hash: '#kurikulum' },
    { id: 'jadwal', label: lang === 'id' ? 'Jadwal Pelajaran' : 'Class Timetable', icon: CalendarIcon, hash: '#jadwal' },
    { id: 'ekskul', label: lang === 'id' ? 'Ekstrakurikuler' : 'Extracurriculars', icon: Trophy, hash: '#ekstrakurikuler' }
  ];

  return (
    <section id="akademik" className="py-24 bg-white w-full overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full box-border">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-blue-600 font-bold uppercase tracking-wider text-xs bg-blue-50 px-4 py-1.5 rounded-full inline-block mb-3">
            {lang === 'id' ? 'Layanan Akademik' : 'Academic Services'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-950 mb-3">
            {lang === 'id' ? 'Kurikulum, Jadwal & Ekstrakurikuler' : 'Curriculum, Timetable & Clubs'}
          </h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            {lang === 'id'
              ? 'Program pembelajaran komprehensif, jadwal belajar teratur, serta kegiatan ekstrakurikuler pembentuk bakat dan minat peserta didik.'
              : 'Comprehensive learning programs, structured timetables, and extracurricular clubs to foster talents and character.'}
          </p>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full mt-4" />
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-4 mb-12 scrollbar-none w-full">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any);
                  window.history.replaceState(null, '', tab.hash);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-blue-800 text-white shadow-lg shadow-blue-900/15 scale-105'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SUB-TAB 1: Kurikulum */}
        {activeSubTab === 'kurikulum' && (
          <div id="kurikulum" className="space-y-12">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg">
              <div className="relative z-10 max-w-3xl">
                <span className="text-amber-300 font-mono text-xs font-bold uppercase tracking-widest block mb-2">
                  {lang === 'id' ? 'Standar Nasional Pendidikan' : 'National Education Standard'}
                </span>
                <h3 className="text-2xl md:text-4xl font-bold mb-4">
                  {lang === 'id' ? activeCurriculum.title : (activeCurriculum.titleEn || activeCurriculum.title)}
                </h3>
                <p className="text-blue-100 text-sm md:text-base leading-relaxed">
                  {lang === 'id' ? activeCurriculum.descriptionId : (activeCurriculum.descriptionEn || activeCurriculum.descriptionId)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeCurriculum.pillars.map((pillar, i) => (
                <div key={i} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-4">
                      <Sparkles size={20} />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base mb-2">
                      {lang === 'id' ? pillar.titleId : (pillar.titleEn || pillar.titleId)}
                    </h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {lang === 'id' ? pillar.descId : (pillar.descEn || pillar.descId)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 6 Dimensi Profil Pelajar Pancasila */}
            <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100">
              <h4 className="text-lg font-bold text-blue-950 mb-4 text-center">
                {lang === 'id' ? '6 Dimensi Profil Pelajar Pancasila (P5)' : '6 Dimensions of the Pancasila Student Profile'}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                {[
                  'Beriman & Bertakwa',
                  'Berkebinekaan Global',
                  'Bergotong Royong',
                  'Mandiri',
                  'Bernalar Kritis',
                  'Kreatif'
                ].map((dim, i) => (
                  <div key={i} className="bg-white p-3.5 rounded-2xl border border-blue-100/60 shadow-2xs">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold inline-flex items-center justify-center mb-2">
                      {i + 1}
                    </span>
                    <p className="font-bold text-xs text-blue-950 leading-tight">{dim}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: Jadwal Pelajaran */}
        {activeSubTab === 'jadwal' && (
          <div id="jadwal" className="space-y-8">
            {/* Grade Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {gradesToDisplay.map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all ${
                    selectedGrade === grade
                      ? 'bg-blue-800 text-white shadow-md scale-105'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>

            {/* Day Filter Pills */}
            <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {['ALL', ...days].map((day) => {
                const label = day === 'ALL'
                  ? (lang === 'id' ? '🌟 Semua Hari (1 Halaman)' : '🌟 All Days')
                  : (lang === 'id' ? day : {
                      'Senin': 'Monday',
                      'Selasa': 'Tuesday',
                      'Rabu': 'Wednesday',
                      'Kamis': 'Thursday',
                      'Jumat': 'Friday',
                      'Sabtu': 'Saturday'
                    }[day] || day);
                const isSelected = activeDay === day;

                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Weekly Timetable Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {days
                .filter(d => activeDay === 'ALL' || activeDay === d)
                .map((day) => {
                  const daySchedule = scheduleList.find(s =>
                    (s.day?.toLowerCase() === day.toLowerCase() ||
                     (day === 'Senin' && s.day?.toLowerCase() === 'monday') ||
                     (day === 'Selasa' && s.day?.toLowerCase() === 'tuesday') ||
                     (day === 'Rabu' && s.day?.toLowerCase() === 'wednesday') ||
                     (day === 'Kamis' && s.day?.toLowerCase() === 'thursday') ||
                     (day === 'Jumat' && s.day?.toLowerCase() === 'friday') ||
                     (day === 'Sabtu' && s.day?.toLowerCase() === 'saturday')) &&
                    (s.grade === selectedGrade ||
                     (selectedGrade === 'Grade 1' && s.grade === 'Kelas 1') ||
                     (selectedGrade === 'Grade 2' && s.grade === 'Kelas 2') ||
                     (selectedGrade === 'Grade 3' && s.grade === 'Kelas 3') ||
                     (selectedGrade === 'Grade 4' && s.grade === 'Kelas 4') ||
                     (selectedGrade === 'Grade 5' && s.grade === 'Kelas 5') ||
                     (selectedGrade === 'Grade 6' && s.grade === 'Kelas 6'))
                  );
                  const subjects = daySchedule?.subjects || [];
                  const dayName = lang === 'id' ? day : {
                    'Senin': 'Monday',
                    'Selasa': 'Tuesday',
                    'Rabu': 'Wednesday',
                    'Kamis': 'Thursday',
                    'Jumat': 'Friday',
                    'Sabtu': 'Saturday'
                  }[day] || day;

                  return (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Day Header */}
                        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200/70">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                              <CalendarIcon size={16} />
                            </div>
                            <div>
                              <h4 className="font-bold text-base text-blue-950">{dayName}</h4>
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{selectedGrade}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${subjects.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                            {subjects.length > 0 ? `${subjects.length} ${lang === 'id' ? 'Mapel' : 'Subjects'}` : (lang === 'id' ? 'Libur' : 'No Class')}
                          </span>
                        </div>

                        {/* Subjects List */}
                        <div className="space-y-2">
                          {subjects.length > 0 ? (
                            subjects.map((sub, idx) => (
                              <div
                                key={idx}
                                className="bg-white p-2.5 rounded-2xl flex items-center justify-between gap-2 border border-slate-100"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <BookOpen size={11} />
                                  </div>
                                  <span className="font-bold text-xs text-slate-800 break-words line-clamp-1">{sub.name}</span>
                                </div>
                                <span className="font-mono text-[10px] font-bold text-blue-700 bg-slate-50 px-2 py-0.5 rounded-md shrink-0 border border-slate-100">
                                  {sub.time}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="py-8 text-center text-slate-400 text-xs italic">
                              Tidak ada jadwal pelajaran
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        )}

        {/* SUB-TAB 3: Ekstrakurikuler */}
        {activeSubTab === 'ekskul' && (
          <div id="ekstrakurikuler" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {extraList.length > 0 ? (
              extraList.map((extra, i) => (
                <motion.div
                  key={extra.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onSelectExtra(extra)}
                  className="bg-slate-50 p-7 rounded-[2rem] border border-slate-100 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 bg-white group-hover:bg-blue-600 rounded-2xl flex items-center justify-center text-blue-700 group-hover:text-white mb-6 transition-all duration-300 shadow-xs">
                      {extra.icon === 'Tent' && <Tent size={28} />}
                      {extra.icon === 'Music' && <Music size={28} />}
                      {extra.icon === 'Cpu' && <Cpu size={28} />}
                      {extra.icon === 'Trophy' && <Trophy size={28} />}
                      {extra.icon === 'Palette' && <Palette size={28} />}
                      {extra.icon === 'Target' && <Target size={28} />}
                      {extra.icon === 'BookOpen' && <BookOpen size={28} />}
                      {extra.icon === 'Mic2' && <Mic2 size={28} />}
                      {extra.icon === 'Heart' && <Heart size={28} />}
                      {extra.icon === 'Camera' && <Camera size={28} />}
                      {extra.icon === 'Monitor' && <Monitor size={28} />}
                      {extra.icon === 'Users' && <Users size={28} />}
                      {extra.icon === 'Globe' && <Globe size={28} />}
                      {(!extra.icon || extra.icon === 'Star') && <Star size={28} />}
                    </div>

                    <h4 className="font-bold text-xl text-blue-950 mb-2 group-hover:text-blue-700 transition-colors">
                      {extra.name}
                    </h4>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                      {extra.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Clock size={14} className="text-blue-600" />
                      <span className="truncate max-w-[150px]">{extra.schedule || (lang === 'id' ? 'Jadwal Rutin' : 'Weekly')}</span>
                    </div>
                    <span className="font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {lang === 'id' ? 'Detail' : 'Details'} <ChevronRight size={14} />
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-slate-400 italic">
                Belum ada data kegiatan ekstrakurikuler.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

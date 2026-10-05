/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, Phone, Mail, MapPin, 
  ChevronRight, Calendar, Users, 
  Trophy, BookOpen, Clock, Tent, 
  Music, Cpu, Instagram, Facebook, Twitter,
  Settings, Palette, Target, Mic2, Heart,
  Camera, Monitor, Globe, Star, ArrowLeft, ArrowRight
} from 'lucide-react';
import { syncData } from './lib/dataService';
import { translations } from './lib/translations';
import { 
  useTranslatedProfile, 
  useTranslatedNews, 
  useTranslatedExtras, 
  useTranslatedStaff, 
  useTranslatedAchievements, 
  useTranslatedSchedule 
} from './lib/translationService';
import { 
  NewsItem, GalleryItem, ScheduleItem, ExtraItem, StaffItem, AchievementItem,
  AgendaItem, DownloadItem, PrincipalInfo, SchoolHistoryInfo, OrgStructureMember, 
  CurriculumInfo, AcademicCalendarInfo, PpdbSettings 
} from './types';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { Navigation } from './components/Navigation';
import { ProfilSection } from './components/ProfilSection';
import { InformasiSection } from './components/InformasiSection';
import { AkademikSection } from './components/AkademikSection';
import { PpdbSection } from './components/PpdbSection';
import { DownloadSection } from './components/DownloadSection';
import { auth, onAuthStateChanged, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const NavLink = ({ href, children, onClick, scrolled }: { href: string; children: React.ReactNode; onClick?: () => void, scrolled?: boolean }) => (
  <a 
    href={href} 
    onClick={onClick}
    className={`${scrolled ? 'text-slate-600 hover:text-blue-700' : 'text-white hover:text-blue-200'} font-medium transition-colors duration-200`}
  >
    {children}
  </a>
);

// Modal Component Wrapper
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative z-10 scrollbar-none"
        >
          <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-slate-100 flex justify-between items-center z-20">
            <h3 className="text-xl font-bold text-blue-950">{title}</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-8">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function App() {
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const t = translations[lang];

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [extraData, setExtraData] = useState<ExtraItem[]>([]);
  const [staffData, setStaffData] = useState<StaffItem[]>([]);
  const [achievementsData, setAchievementsData] = useState<AchievementItem[]>([]);
  const [agendaData, setAgendaData] = useState<AgendaItem[]>([]);
  const [downloadsData, setDownloadsData] = useState<DownloadItem[]>([]);
  const [principalData, setPrincipalData] = useState<PrincipalInfo | undefined>(undefined);
  const [historyData, setHistoryData] = useState<SchoolHistoryInfo | undefined>(undefined);
  const [orgStructureData, setOrgStructureData] = useState<OrgStructureMember[] | undefined>(undefined);
  const [curriculumData, setCurriculumData] = useState<CurriculumInfo | undefined>(undefined);
  const [calendarData, setCalendarData] = useState<AcademicCalendarInfo | undefined>(undefined);
  const [ppdbData, setPpdbData] = useState<PpdbSettings | undefined>(undefined);
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const staffScrollRef = useRef<HTMLDivElement>(null);

  const scrollStaff = (direction: 'left' | 'right') => {
    if (staffScrollRef.current) {
      const scrollAmount = 300;
      staffScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  const [stats, setStats] = useState({
    studentCount: '136',
    teacherCount: '12',
    accreditation: 'B',
    foundationYear: '1987'
  });
  const [profile, setProfile] = useState({
    vision: 'Menjadi lembaga pendidikan dasar yang unggul dalam prestasi, berkarakter mulia, dan berwawasan teknologi masa depan berdasarkan iman dan taqwa.',
    mission: 'Menanamkan nilai karakter dan budi pekerti luhur sejak dini.\nMenyelenggarakan pembelajaran kreatif dan inovatif berbasis IT.\nMengembangkan potensi bakat siswa melalui berbagai ekstrakurikuler.',
    heroImage: 'https://images.unsplash.com/photo-1544717297-fa95b3ee51f3?auto=format&fit=crop&q=80',
    profileImage: 'https://images.unsplash.com/photo-1523050335392-93851179ae22?auto=format&fit=crop&q=80'
  });

  // Dynamic Content Translations for EN/ID
  const displayProfile = useTranslatedProfile(profile, lang);
  const displayNews = useTranslatedNews(newsData, lang);
  const displayExtras = useTranslatedExtras(extraData, lang);
  const displayStaff = useTranslatedStaff(staffData, lang);
  const displayAchievements = useTranslatedAchievements(achievementsData, lang);
  const displaySchedule = useTranslatedSchedule(scheduleData, lang);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('Kelas 1');
  
  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Registration Form State
  const [regForm, setRegForm] = useState({
    studentName: '',
    birthPlace: '',
    birthDate: '',
    parentName: '',
    whatsapp: '',
    address: ''
  });

  // Modal States
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedExtra, setSelectedExtra] = useState<ExtraItem | null>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<GalleryItem | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isAllNewsOpen, setIsAllNewsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      const userEmail = user?.email?.toLowerCase();
      const isMasterAdmin = userEmail === 'wathan045@gmail.com' || userEmail === 'sdnegeri1gapuk@gmail.com';
      
      let isAdditionalAdmin = false;
      if (userEmail && !isMasterAdmin) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', userEmail));
          isAdditionalAdmin = adminDoc.exists();
        } catch (err) {
          console.error("Admin check failed:", err);
        }
      }

      if (user && (isMasterAdmin || isAdditionalAdmin)) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    // Subscribe to Firebase data
    const unsubNews = syncData.subscribeNews(setNewsData);
    const unsubGallery = syncData.subscribeGallery(setGalleryData);
    const unsubSchedules = syncData.subscribeSchedules((data) => {
      setScheduleData(data);
      // Automatically select the first available grade if current selection is not in data
      const uniqueGrades = Array.from(new Set(data.map(s => s.grade))).sort();
      if (uniqueGrades.length > 0 && (!selectedGrade || !uniqueGrades.includes(selectedGrade))) {
        setSelectedGrade(uniqueGrades[0]);
      }
    });
    const unsubExtras = syncData.subscribeExtra(setExtraData);
    const unsubStaff = syncData.subscribeStaff(setStaffData);
    const unsubAchievements = syncData.subscribeAchievements(setAchievementsData);
    const unsubAgenda = syncData.subscribeAgenda(setAgendaData);
    const unsubDownloads = syncData.subscribeDownloads(setDownloadsData);
    const unsubPrincipal = syncData.subscribePrincipal((val) => {
      if (val) setPrincipalData(val);
    });
    const unsubHistory = syncData.subscribeHistory((val) => {
      if (val) setHistoryData(val);
    });
    const unsubOrg = syncData.subscribeOrgStructure((val) => {
      if (val?.members) setOrgStructureData(val.members);
      else if (Array.isArray(val)) setOrgStructureData(val);
    });
    const unsubCurriculum = syncData.subscribeCurriculum((val) => {
      if (val) setCurriculumData(val);
    });
    const unsubCalendar = syncData.subscribeAcademicCalendar((val) => {
      if (val) setCalendarData(val);
    });
    const unsubPpdb = syncData.subscribePpdbSettings((val) => {
      if (val) setPpdbData(val);
    });
    const unsubStats = syncData.subscribeStats((val) => {
      if (val) setStats(prev => ({ ...prev, ...val }));
    });
    const unsubProfile = syncData.subscribeProfile((val) => {
      if (val) setProfile(prev => ({ ...prev, ...val }));
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubNews();
      unsubGallery();
      unsubSchedules();
      unsubExtras();
      unsubStaff();
      unsubAchievements();
      unsubAgenda();
      unsubDownloads();
      unsubPrincipal();
      unsubHistory();
      unsubOrg();
      unsubCurriculum();
      unsubCalendar();
      unsubPpdb();
      unsubStats();
      unsubProfile();
    };
  }, []);

  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md py-4">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="https://lh3.googleusercontent.com/d/1sUaFfYHajE5E__zoW7DGQM9odSDDnwHg" alt="Logo" className="w-10 h-10 object-contain" />
              <h1 className="font-bold text-blue-900">ADMIN PANEL - SDN 1 GAPUK</h1>
            </div>
            <button onClick={() => setIsAdminMode(false)} className="text-slate-600 font-bold hover:text-blue-700 transition-colors">Kembali ke Website</button>
          </div>
        </nav>
        {isLoggedIn ? (
          <AdminDashboard onLogout={() => setIsLoggedIn(false)} />
        ) : (
          <Login onLogin={(success) => setIsLoggedIn(success)} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 w-full max-w-full overflow-x-hidden">
      {/* Hierarchical Navigation matching school structure */}
      <Navigation lang={lang} setLang={setLang} scrolled={scrolled} />

      <main>
        {/* Hero Section */}
        <section id="beranda" className="relative h-[105vh] flex items-center overflow-hidden pt-12 pb-40">
          <div className="absolute inset-0 z-0">
            <img 
              src={displayProfile?.heroImage || 'https://images.unsplash.com/photo-1544717297-fa95b3ee51f3?auto=format&fit=crop&q=80'} 
              className="w-full h-full object-cover brightness-[0.4]"
              alt="SDN 1 Gapuk"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 w-full mt-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl text-white pt-14"
            >
              <span className="inline-block bg-blue-600/30 backdrop-blur-md border border-blue-400/30 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 tracking-wide uppercase">
                {t.hero.welcome}
              </span>
              <h2 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
                {t.hero.futureTitle} <br /> <span className="text-blue-400">{t.hero.futureSub}</span>
              </h2>
              <p className="text-lg text-slate-200 mb-10 leading-relaxed max-w-lg">
                {t.hero.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setIsRegistrationOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 transition-all shadow-xl hover:shadow-blue-500/20 active:scale-95 group"
                >
                  {t.hero.registerNow} <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="#visi-misi" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-full font-bold transition-all active:scale-95">
                  {t.hero.knowUs}
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-20 md:-mt-16 mt-10 max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t.stats.activeStudents, value: stats.studentCount, icon: Users },
              { label: t.stats.teachers, value: stats.teacherCount, icon: BookOpen },
              { label: t.stats.accreditation, value: stats.accreditation, icon: Trophy },
              { label: t.stats.foundationYear, value: stats.foundationYear, icon: Clock },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center text-center border border-slate-100"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  <stat.icon size={24} />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-1">{stat.value}</h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 2. PROFIL (Sejarah, Visi & Misi, Kepala Sekolah, Guru & Tendik, Struktur Organisasi) */}
        <ProfilSection 
          lang={lang} 
          profile={displayProfile} 
          staffList={displayStaff} 
          principalInfo={principalData}
          schoolHistory={historyData}
          orgStructure={orgStructureData}
        />

        {/* 3. INFORMASI (Berita, Pengumuman, Agenda, Kalender Pendidikan) */}
        <InformasiSection 
          lang={lang} 
          newsList={displayNews} 
          onSelectNews={setSelectedNews} 
          onViewAllNews={() => setIsAllNewsOpen(true)} 
          agendaList={agendaData}
          calendarData={calendarData}
        />

        {/* 4. AKADEMIK (Kurikulum, Jadwal Pelajaran, Ekstrakurikuler) */}
        <AkademikSection 
          lang={lang} 
          scheduleList={displaySchedule} 
          extraList={displayExtras} 
          selectedGrade={selectedGrade} 
          setSelectedGrade={setSelectedGrade} 
          onSelectExtra={setSelectedExtra} 
          curriculumData={curriculumData}
        />

        {/* 5. PRESTASI */}
        <section id="prestasi" className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-xl">
                <span className="text-blue-600 font-black uppercase tracking-[0.2em] text-xs mb-4 block">
                  {lang === 'id' ? 'Prestasi Terkini' : 'Recent Achievements'}
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-blue-950 leading-tight">
                  {lang === 'id' ? 'Kebanggaan' : 'Our Proud'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{lang === 'id' ? 'Terbaik Kami' : 'Excellence'}</span>
                </h2>
                <div className="w-24 h-1.5 bg-blue-600 mt-6 rounded-full" />
              </div>
              <p className="text-slate-500 max-w-md text-sm leading-relaxed">
                {lang === 'id' 
                  ? 'Apresiasi untuk dedikasi dan kerja keras siswa serta tenaga pendidik SDN 1 Gapuk dalam berbagai ajang kompetisi.'
                  : 'Appreciation for the dedication and hard work of students and educators of SDN 1 Gapuk across various competitions.'}
              </p>
            </div>

            {displayAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayAchievements.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500"
                  >
                    <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 bg-slate-200">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-200">
                          <Trophy size={60} />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg ${
                          item.type === 'Guru' 
                          ? 'bg-purple-600/90 text-white' 
                          : 'bg-orange-600/90 text-white'
                        }`}>
                          {lang === 'id' ? item.type : (item.type === 'Guru' ? 'Teacher' : 'Student')}
                        </span>
                        {item.category && (
                          <span className="bg-white/90 backdrop-blur-md text-slate-800 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="px-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.date}</span>
                      </div>
                      <h3 className="text-xl font-bold text-blue-950 mb-3 group-hover:text-blue-700 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <Trophy size={60} className="mx-auto text-slate-200 mb-6" />
                <h4 className="text-slate-800 font-bold mb-2">{lang === 'id' ? 'Prestasi Belum Tersedia' : 'Achievements Not Available'}</h4>
                <p className="text-slate-500 text-sm italic">{lang === 'id' ? 'Belum ada data prestasi yang ditambahkan oleh admin.' : 'No achievement data has been added yet.'}</p>
              </div>
            )}
          </div>
        </section>

        {/* 6. GALERI */}
        <section id="galeri" className="py-24 bg-blue-950 text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 italic serif">{t.gallery.title}</h2>
              <p className="text-blue-200">{t.gallery.description}</p>
              <div className="w-20 h-1.5 bg-blue-500 mx-auto rounded-full mt-6" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
              {(showAllGallery ? galleryData : galleryData.slice(0, 5)).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedGalleryImage(item)}
                  className={`relative group overflow-hidden rounded-2xl cursor-pointer ${
                    i === 0 ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <p className="font-bold text-sm tracking-wide uppercase">{item.title}</p>
                  </div>
                </motion.div>
              ))}
              {galleryData.length === 0 && (
                <div className="col-span-4 text-center py-10 text-blue-300 italic">{t.gallery.empty}</div>
              )}
            </div>

            {galleryData.length > 5 && (
              <div className="text-center mt-12">
                <button 
                  onClick={() => setShowAllGallery(!showAllGallery)}
                  className="bg-blue-600/20 hover:bg-blue-600 border border-blue-500/50 text-white px-10 py-3.5 rounded-full font-bold transition-all shadow-lg active:scale-95"
                >
                  {showAllGallery ? t.gallery.showLess : t.gallery.showMore}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 7. PPDB */}
        <PpdbSection lang={lang} onOpenRegistration={() => setIsRegistrationOpen(true)} ppdbData={ppdbData} />

        {/* 8. DOWNLOAD */}
        <DownloadSection lang={lang} downloadList={downloadsData} />

        {/* Contact Section */}
        <section id="kontak" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-20">
            <div>
              <h2 className="text-3xl font-bold text-blue-950 mb-6">{t.contact.title}</h2>
              <p className="text-slate-500 mb-10 leading-relaxed">
                {t.contact.description}
              </p>
              
              <div className="space-y-8">
                <a 
                  href="https://maps.app.goo.gl/T9xSZRxH5SJvfjeJ9" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start gap-6 group cursor-pointer"
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 shrink-0 group-hover:bg-blue-100 transition-colors">
                    <MapPin size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-700 transition-colors">{t.contact.address}</h4>
                    <p className="text-slate-500">{t.contact.addressVal}</p>
                  </div>
                </a>

                <a 
                  href="https://wa.me/6285939324177" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start gap-6 group cursor-pointer"
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Phone size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-700 transition-colors">{t.contact.phone}</h4>
                    <p className="text-slate-500">085939324177</p>
                  </div>
                </a>

                <a 
                  href="mailto:sdn01gapuk@gmail.com" 
                  className="flex items-start gap-6 group cursor-pointer"
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Mail size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-700 transition-colors">{t.contact.email}</h4>
                    <p className="text-slate-500">sdn01gapuk@gmail.com</p>
                  </div>
                </a>
              </div>

              <div className="mt-12 flex gap-4">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-700 hover:text-white transition-all">
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[3rem] shadow-inner border border-slate-200">
              <h3 className="text-2xl font-bold text-blue-950 mb-8">{t.contact.sendMessage}</h3>
              <form 
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  
                  const mailtoLink = `mailto:sdn01gapuk@gmail.com?subject=${encodeURIComponent(formData.subject || 'Pesan dari Website SDN 1 Gapuk')}&body=${encodeURIComponent(`Nama: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`;
                  
                  window.location.href = mailtoLink;
                  
                  setTimeout(() => {
                    alert(t.contact.success);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                    setIsSubmitting(false);
                  }, 500);
                }}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <input 
                    required
                    type="text" 
                    placeholder={t.contact.formName} 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-white border-none rounded-2xl py-4 px-6 shadow-sm focus:ring-2 focus:ring-blue-500 w-full outline-none" 
                  />
                  <input 
                    required
                    type="email" 
                    placeholder={t.contact.formEmail} 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-white border-none rounded-2xl py-4 px-6 shadow-sm focus:ring-2 focus:ring-blue-500 w-full outline-none" 
                  />
                </div>
                <input 
                  required
                  type="text" 
                  placeholder={t.contact.formSubject} 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="bg-white border-none rounded-2xl py-4 px-6 shadow-sm focus:ring-2 focus:ring-blue-500 w-full outline-none" 
                />
                <textarea 
                  required
                  rows={4} 
                  placeholder={t.contact.formMessage} 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="bg-white border-none rounded-2xl py-4 px-6 shadow-sm focus:ring-2 focus:ring-blue-500 w-full outline-none resize-none"
                ></textarea>
                <button 
                  disabled={isSubmitting}
                  className="bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95"
                >
                  {isSubmitting ? t.contact.sending : t.contact.sendButton}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-16 pb-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Main Footer Sitemap Grid reflecting School Tree */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10 text-left">
            {/* School Profile Brand */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 flex items-center justify-center bg-white rounded-xl p-1">
                  <img 
                    src="https://lh3.googleusercontent.com/d/1sUaFfYHajE5E__zoW7DGQM9odSDDnwHg" 
                    alt="Logo SDN 1 Gapuk" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="font-black text-white text-base leading-tight">SDN 1 GAPUK</h3>
                  <p className="text-[10px] text-blue-300 font-semibold tracking-wider uppercase">Suralaga, Lombok Timur</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                {lang === 'id' 
                  ? 'Mewujudkan generasi unggul berprestasi, berkarakter mulia, dan berwawasan teknologi berlandaskan iman & taqwa.' 
                  : 'Nurturing generations of excellence, noble character, and tech wisdom grounded in faith.'}
              </p>
              <span className="inline-block bg-blue-900/60 border border-blue-500/30 text-blue-300 font-mono text-[10px] px-2.5 py-1 rounded-md">
                NPSN: 50202868 • AKREDITASI B
              </span>
            </div>

            {/* Menu: PROFIL */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-blue-500/30 pb-2">
                {lang === 'id' ? 'PROFIL' : 'PROFILE'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#sejarah" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Sejarah Sekolah' : 'History'}</a></li>
                <li><a href="#visi-misi" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Visi & Misi' : 'Vision & Mission'}</a></li>
                <li><a href="#kepala-sekolah" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Kepala Sekolah' : 'Principal'}</a></li>
                <li><a href="#guru-tendik" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Guru & Tendik' : 'Staff & Teachers'}</a></li>
                <li><a href="#struktur-organisasi" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Struktur Organisasi' : 'Organization'}</a></li>
              </ul>
            </div>

            {/* Menu: INFORMASI */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-blue-500/30 pb-2">
                {lang === 'id' ? 'INFORMASI' : 'INFORMATION'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#berita" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Berita Kegiatan' : 'News'}</a></li>
                <li><a href="#pengumuman" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Pengumuman Resmi' : 'Announcements'}</a></li>
                <li><a href="#agenda" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Agenda Sekolah' : 'School Agenda'}</a></li>
                <li><a href="#kalender-pendidikan" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Kalender Pendidikan' : 'Academic Calendar'}</a></li>
              </ul>
            </div>

            {/* Menu: AKADEMIK */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-blue-500/30 pb-2">
                {lang === 'id' ? 'AKADEMIK' : 'ACADEMICS'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#kurikulum" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Kurikulum Merdeka' : 'Curriculum'}</a></li>
                <li><a href="#jadwal" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Jadwal Pelajaran' : 'Class Timetable'}</a></li>
                <li><a href="#ekstrakurikuler" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Ekstrakurikuler' : 'Extracurriculars'}</a></li>
              </ul>
            </div>

            {/* Menu: PRESTASI, GALERI, PPDB, DOWNLOAD, KONTAK */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-blue-500/30 pb-2">
                {lang === 'id' ? 'LAYANAN' : 'SERVICES'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#prestasi" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Prestasi Siswa & Guru' : 'Achievements'}</a></li>
                <li><a href="#galeri" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Galeri Foto' : 'Photo Gallery'}</a></li>
                <li><a href="#ppdb" className="hover:text-amber-400 text-amber-300 font-bold transition-colors">{lang === 'id' ? 'PPDB 2026/2027' : 'Admission (PPDB)'}</a></li>
                <li><a href="#download" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Pusat Download' : 'Download Center'}</a></li>
                <li><a href="#kontak" className="hover:text-blue-400 transition-colors">{lang === 'id' ? 'Kontak & Lokasi' : 'Contact & Location'}</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>{t.footer.copyright}</p>
            <div className="flex items-center gap-6">
              <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-blue-400 transition-colors">Privacy Policy</button>
              <button onClick={() => setIsTermsOpen(true)} className="hover:text-blue-400 transition-colors">Terms of Service</button>
              <a href="https://rumah.pendidikan.go.id/ruang/murid" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">E-Learning</a>
              <button 
                onClick={() => setIsAdminMode(true)}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors font-bold uppercase tracking-wider text-[11px]"
              >
                <Settings size={13} /> {t.footer.loginAdmin}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* List Semua Berita Modal */}
      <Modal 
        isOpen={isAllNewsOpen} 
        onClose={() => setIsAllNewsOpen(false)} 
        title={lang === 'id' ? 'Daftar Berita & Pengumuman' : 'News & Announcements'}
      >
        <div className="space-y-2">
          {displayNews.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {displayNews.map((news) => (
                <button 
                  key={news.id}
                  onClick={() => {
                    setSelectedNews(news);
                    setIsAllNewsOpen(false);
                  }}
                  className="w-full py-5 flex gap-5 text-left group hover:bg-slate-50 transition-all rounded-2xl px-2 mb-2"
                >
                  <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden shadow-sm">
                    <img src={news.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        {news.category}
                      </span>
                      <span className="text-slate-400 text-[10px] flex items-center gap-1 font-medium">
                        <Calendar size={10} /> {news.date}
                      </span>
                    </div>
                    <h4 className="font-bold text-blue-950 group-hover:text-blue-700 transition-colors line-clamp-2 text-sm">
                      {news.title}
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-1 line-clamp-2 font-medium">
                      {news.excerpt}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-slate-400 font-medium italic">{t.news.empty}</p>
          )}
        </div>
      </Modal>

      {/* Detail Berita Modal */}
      <Modal 
        isOpen={selectedNews !== null} 
        onClose={() => setSelectedNews(null)} 
        title={lang === 'id' ? 'Detail Berita & Pengumuman' : 'News & Announcement Detail'}
      >
        {(() => {
          const activeNews = selectedNews ? (displayNews.find(n => n.id === selectedNews.id) || selectedNews) : null;
          if (!activeNews) return null;
          return (
            <div className="space-y-6">
              <img 
                src={activeNews.imageUrl} 
                alt={activeNews.title} 
                className="w-full h-64 object-cover rounded-3xl shadow-lg"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center gap-3">
                <span className="bg-blue-50 text-blue-700 text-xs font-bold uppercase px-3 py-1 rounded-full">
                  {activeNews.category}
                </span>
                <span className="text-slate-400 text-sm flex items-center gap-1">
                  <Calendar size={14} /> {activeNews.date}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-blue-950 leading-tight">
                {activeNews.title}
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                  {activeNews.content}
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="bg-blue-700 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-800 transition-colors"
                >
                  {lang === 'id' ? 'Tutup Review' : 'Close'}
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Detail Ekstrakurikuler Modal */}
      <Modal 
        isOpen={selectedExtra !== null} 
        onClose={() => setSelectedExtra(null)} 
        title={lang === 'id' ? 'Detail Ekstrakurikuler' : 'Extracurricular Detail'}
      >
        {(() => {
          const activeExtra = selectedExtra ? (displayExtras.find(e => e.id === selectedExtra.id) || selectedExtra) : null;
          if (!activeExtra) return null;
          return (
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-700">
                  {activeExtra.icon === 'Tent' && <Tent size={40} />}
                  {activeExtra.icon === 'Music' && <Music size={40} />}
                  {activeExtra.icon === 'Cpu' && <Cpu size={40} />}
                  {activeExtra.icon === 'Trophy' && <Trophy size={40} />}
                  {activeExtra.icon === 'Palette' && <Palette size={40} />}
                  {activeExtra.icon === 'Target' && <Target size={40} />}
                  {activeExtra.icon === 'BookOpen' && <BookOpen size={40} />}
                  {activeExtra.icon === 'Mic2' && <Mic2 size={40} />}
                  {activeExtra.icon === 'Heart' && <Heart size={40} />}
                  {activeExtra.icon === 'Camera' && <Camera size={40} />}
                  {activeExtra.icon === 'Monitor' && <Monitor size={40} />}
                  {activeExtra.icon === 'Users' && <Users size={40} />}
                  {activeExtra.icon === 'Globe' && <Globe size={40} />}
                  {(!activeExtra.icon || activeExtra.icon === 'Star') && <Star size={40} />}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-blue-950">{activeExtra.name}</h2>
                  <p className="text-blue-600 font-semibold">{activeExtra.coach}</p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Clock size={14} /> {lang === 'id' ? 'Jadwal Latihan' : 'Practice Schedule'}
                  </h4>
                  <p className="font-bold text-slate-800">{activeExtra.schedule}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Users size={14} /> {lang === 'id' ? 'Status' : 'Status'}
                  </h4>
                  <p className="font-bold text-slate-800 text-green-600">
                    {lang === 'id' ? 'Terbuka untuk Anggota Baru' : 'Open for New Members'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-blue-950">{lang === 'id' ? 'Tentang Kegiatan' : 'About the Activity'}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {activeExtra.longDescription}
                </p>
              </div>

              <button 
                onClick={() => setSelectedExtra(null)}
                className="w-full bg-blue-700 text-white py-4 rounded-3xl font-bold hover:bg-blue-800 transition-colors"
              >
                {lang === 'id' ? 'Kembali ke Menu' : 'Back to Menu'}
              </button>
            </div>
          );
        })()}
      </Modal>

      {/* Registration Form Modal */}
      <Modal 
        isOpen={isRegistrationOpen} 
        onClose={() => setIsRegistrationOpen(false)} 
        title={t.registration.title}
      >
        <div className="space-y-8">
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4 items-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
              <Users size={24} />
            </div>
            <div>
              <p className="text-blue-900 font-bold">Pendaftaran TA 2026/2027</p>
              <p className="text-blue-700 text-sm italic">{lang === 'id' ? 'Mohon isi data dengan lengkap dan teliti.' : 'Please fill in the data completely and carefully.'}</p>
            </div>
          </div>

          <form 
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              const message = `${t.registration.waMessage}\n\n📝 *${t.registration.waStudentTitle}*\n- Nama: ${regForm.studentName}\n- Tempat Lahir: ${regForm.birthPlace}\n- Tgl Lahir: ${regForm.birthDate}\n\n👤 *${t.registration.waParentTitle}*\n- Nama: ${regForm.parentName}\n- WhatsApp: ${regForm.whatsapp}\n- Alamat: ${regForm.address}\n\n${t.registration.waClosing}`;

              const whatsappUrl = `https://wa.me/6285939324177?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
              
              alert(t.registration.alertSuccess);
              setIsRegistrationOpen(false);
            }}
          >
            <div className="space-y-4">
              <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-4">{t.registration.studentInfo}</h4>
              <input 
                required 
                type="text" 
                placeholder={t.registration.studentName}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 outline-none" 
                value={regForm.studentName}
                onChange={e => setRegForm({...regForm, studentName: e.target.value})}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <input 
                  required 
                  type="text" 
                  placeholder={t.registration.birthPlace}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={regForm.birthPlace}
                  onChange={e => setRegForm({...regForm, birthPlace: e.target.value})}
                />
                <input 
                  required 
                  type="date" 
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 outline-none text-slate-500" 
                  value={regForm.birthDate}
                  onChange={e => setRegForm({...regForm, birthDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-4">{t.registration.parentInfo}</h4>
              <input 
                required 
                type="text" 
                placeholder={t.registration.parentName}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 outline-none" 
                value={regForm.parentName}
                onChange={e => setRegForm({...regForm, parentName: e.target.value})}
              />
              <input 
                required 
                type="tel" 
                placeholder={t.registration.whatsapp}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 outline-none" 
                value={regForm.whatsapp}
                onChange={e => setRegForm({...regForm, whatsapp: e.target.value})}
              />
              <textarea 
                required 
                rows={3} 
                placeholder={t.registration.address}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={regForm.address}
                onChange={e => setRegForm({...regForm, address: e.target.value})}
              ></textarea>
            </div>

            <button type="submit" className="w-full bg-blue-700 text-white py-5 rounded-3xl font-bold text-lg hover:bg-blue-800 transition-all shadow-xl active:scale-95">
              {t.registration.submitButton}
            </button>
          </form>
        </div>
      </Modal>

      {/* Gallery Image Modal */}
      <Modal 
        isOpen={selectedGalleryImage !== null} 
        onClose={() => setSelectedGalleryImage(null)} 
        title={selectedGalleryImage?.title || 'Galeri Foto'}
      >
        {selectedGalleryImage && (
          <div className="space-y-4">
            <img 
              src={selectedGalleryImage.imageUrl} 
              alt={selectedGalleryImage.title} 
              className="w-full h-auto max-h-[60vh] object-contain rounded-2xl shadow-lg"
              referrerPolicy="no-referrer"
            />
            <p className="text-slate-500 text-center text-sm font-medium">
              {selectedGalleryImage.title}
            </p>
          </div>
        )}
      </Modal>
      {/* Privacy Policy Modal */}
      <Modal 
        isOpen={isPrivacyOpen} 
        onClose={() => setIsPrivacyOpen(false)} 
        title="Kebijakan Privasi SD Negeri 1 Gapuk"
      >
        <div className="max-w-none text-slate-600 text-sm leading-relaxed space-y-6">
          <p>Selamat datang di situs resmi SD Negeri 1 Gapuk. Kami berkomitmen untuk melindungi privasi dan keamanan data pribadi seluruh warga sekolah, terutama siswa, orang tua, dan tenaga pendidik. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.</p>
          
          <section>
            <h4 className="text-blue-900 font-bold mb-2">1. Informasi yang Kami Kumpulkan</h4>
            <p>Kami mengumpulkan informasi terbatas yang bertujuan untuk mendukung kegiatan administrasi dan komunikasi pendidikan, yaitu:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Identitas Pribadi: Nama lengkap siswa dan orang tua/wali.</li>
              <li>Kontak: Alamat email, nomor telepon/WhatsApp, dan alamat rumah.</li>
              <li>Data Akademik: Nomor Induk Siswa Nasional (NISN) dan data kelas (digunakan pada formulir tertentu).</li>
              <li>Data Teknis: Alamat IP dan jenis perangkat yang digunakan untuk mengakses situs guna optimalisasi tampilan web.</li>
            </ul>
          </section>

          <section>
            <h4 className="text-blue-900 font-bold mb-2">2. Penggunaan Informasi</h4>
            <p>Informasi yang Anda berikan kepada SD Negeri 1 Gapuk akan digunakan untuk:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Mempermudah proses administrasi dan pendaftaran siswa baru secara daring.</li>
              <li>Mengirimkan informasi penting terkait kalender akademik dan kegiatan sekolah.</li>
              <li>Menampilkan dokumentasi kegiatan siswa dan prestasi sekolah (dengan tetap menjaga etika dan privasi anak).</li>
              <li>Meningkatkan layanan keamanan dan kenyamanan navigasi pada situs web kami.</li>
            </ul>
          </section>

          <section>
            <h4 className="text-blue-900 font-bold mb-2">3. Perlindungan Data Anak</h4>
            <p>Sebagai institusi pendidikan dasar, kami sangat berhati-hati terhadap data anak di bawah umur:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Kami tidak akan pernah menjual atau memberikan data pribadi siswa kepada pihak ketiga untuk kepentingan iklan atau komersial.</li>
              <li>Pengunggahan foto atau identitas siswa di situs web dilakukan dengan prinsip edukatif dan perlindungan anak.</li>
              <li>Kami menyarankan orang tua untuk tetap memantau aktivitas daring putra-putrinya.</li>
            </ul>
          </section>

          <section>
            <h4 className="text-blue-900 font-bold mb-2">4. Keamanan Informasi</h4>
            <p>Kami menggunakan prosedur pengamanan fisik dan elektronik untuk melindungi data Anda dari akses yang tidak sah. Akses terhadap database informasi pribadi hanya diberikan kepada staf sekolah yang berkepentingan langsung dengan tugas administratif.</p>
          </section>

          <section>
            <h4 className="text-blue-900 font-bold mb-2">5. Hak Orang Tua dan Wali Murid</h4>
            <p>Anda memiliki hak penuh untuk:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Menanyakan data apa saja yang kami simpan mengenai putra-putri Anda.</li>
              <li>Meminta perbaikan jika terdapat kesalahan data identitas.</li>
              <li>Meminta penghapusan data kontak jika sudah tidak lagi menjadi bagian dari komunitas sekolah.</li>
            </ul>
          </section>

          <section>
            <h4 className="text-blue-900 font-bold mb-2">6. Perubahan Kebijakan</h4>
            <p>SD Negeri 1 Gapuk berhak memperbarui kebijakan ini sewaktu-waktu guna mengikuti perkembangan regulasi perlindungan data di Indonesia. Setiap perubahan akan diumumkan secara transparan melalui halaman ini.</p>
          </section>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h4 className="text-blue-900 font-bold mb-3 font-sans">Kontak Informasi</h4>
            <div className="space-y-1 text-xs">
              <p><span className="font-bold">Nama Sekolah:</span> SD Negeri 1 Gapuk</p>
              <p><span className="font-bold">Alamat:</span> Dusun Gapuk Baru, Desa Gapuk, Kecamatan Suralaga, Kab. Lombok Timur</p>
              <p><span className="font-bold">Email:</span> wathan045@gmail.com</p>
              <p><span className="font-bold">Telepon/WA:</span> 085939324177</p>
              <p className="mt-4 text-slate-400 italic">Terakhir diperbarui: 11 Mei 2026</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal 
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
        title="Ketentuan Layanan SD Negeri 1 Gapuk"
      >
        <div className="max-w-none text-slate-600 text-sm leading-relaxed space-y-6">
          <p>Selamat datang di situs web resmi SD Negeri 1 Gapuk. Dengan mengakses atau menggunakan situs ini, Anda dianggap telah membaca, memahami, dan menyetujui untuk terikat oleh ketentuan-ketentuan berikut.</p>

          <section>
            <h4 className="text-blue-900 font-bold mb-2">1. Penerimaan Ketentuan</h4>
            <p>Situs ini disediakan untuk tujuan informasi pendidikan, komunikasi sekolah, dan layanan administrasi bagi siswa serta orang tua. Jika Anda tidak menyetujui salah satu bagian dari ketentuan ini, kami sarankan untuk tidak melanjutkan penggunaan situs ini.</p>
          </section>

          <section>
            <h4 className="text-blue-900 font-bold mb-2">2. Hak Kekayaan Intelektual</h4>
            <p>Seluruh konten yang ada di situs ini, termasuk namun tidak terbatas pada teks, logo, foto kegiatan, video, dan desain grafis, adalah milik SD Negeri 1 Gapuk kecuali disebutkan lain. Pengunjung dilarang menyalin, mendistribusikan, atau menggunakan konten situs untuk kepentingan komersial tanpa izin tertulis dari pihak sekolah.</p>
          </section>

          <section>
            <h4 className="text-blue-900 font-bold mb-2">3. Penggunaan yang Diizinkan</h4>
            <p>Anda setuju untuk menggunakan situs ini hanya untuk tujuan yang sah. Anda dilarang untuk:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Menggunakan situs dengan cara yang dapat merusak, melumpuhkan, atau membebani server sekolah.</li>
              <li>Melakukan tindakan "spamming" pada formulir kontak atau komentar.</li>
              <li>Mengambil atau menyebarluaskan foto siswa yang ada di website ini untuk tujuan yang melanggar hukum atau asusila.</li>
            </ul>
          </section>

          <section>
            <h4 className="text-blue-900 font-bold mb-2">4. Akurasi Informasi</h4>
            <p>Kami berupaya sebaik mungkin untuk menyediakan informasi yang akurat (seperti jadwal ujian, pengumuman libur, dll). Namun, SD Negeri 1 Gapuk tidak bertanggung jawab atas kerugian yang timbul jika terjadi kesalahan teknis atau keterlambatan pembaruan informasi. Kami menyarankan untuk tetap melakukan konfirmasi langsung ke sekolah untuk hal-hal yang bersifat krusial.</p>
          </section>

          <section>
            <h4 className="text-blue-900 font-bold mb-2">5. Link Pihak Ketiga</h4>
            <p>Situs kami mungkin berisi tautan ke situs web lain (seperti Dapodik, portal Kemendikbud, atau aplikasi belajar). Kami tidak bertanggung jawab atas isi atau kebijakan privasi pada situs-situs luar tersebut.</p>
          </section>

          <section>
            <h4 className="text-blue-900 font-bold mb-2">6. Pembatasan Tanggung Jawab</h4>
            <p>Sekolah tidak bertanggung jawab atas segala bentuk kerusakan atau virus yang mungkin menginfeksi perangkat komputer Anda saat mengakses situs ini atau mengunduh materi dari situs ini.</p>
          </section>

          <section>
            <h4 className="text-blue-900 font-bold mb-2">7. Perubahan Ketentuan</h4>
            <p>Pihak sekolah berhak untuk mengubah atau memperbarui Ketentuan Layanan ini kapan saja tanpa pemberitahuan terlebih dahulu. Perubahan akan berlaku segera setelah dipublikasikan di halaman ini.</p>
          </section>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h4 className="text-blue-900 font-bold mb-3 font-sans">Informasi Kontak</h4>
            <div className="space-y-1 text-xs">
              <p><span className="font-bold">Nama Sekolah:</span> SD Negeri 1 Gapuk</p>
              <p><span className="font-bold">Alamat:</span> Dusun Gapuk Baru, Desa Gapuk, Kec. Suralaga, Kab. Lombok Timur</p>
              <p><span className="font-bold">Email:</span> wathan045@gmail.com</p>
              <p><span className="font-bold">Telepon:</span> 085939324177</p>
              <p className="mt-4 text-slate-400 italic">Terakhir diperbarui: 11 Mei 2026</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

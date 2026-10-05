import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, ChevronDown, ChevronRight, 
  Landmark, Trophy, Award, Users, Network,
  Newspaper, Bell, Calendar, Clock,
  BookOpen, CalendarDays, Compass, Download, Phone
} from 'lucide-react';
import { translations } from '../lib/translations';

interface NavigationProps {
  lang: 'id' | 'en';
  setLang: (lang: 'id' | 'en') => void;
  scrolled: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ lang, setLang, scrolled }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});

  const t = translations[lang];

  // Close dropdown on outside click
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileSubmenu = (key: string) => {
    setMobileExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setMobileExpanded({});
  };

  // Nav structure definition matching user request
  const menuStructure = [
    {
      id: 'beranda',
      label: t.nav.home,
      href: '#beranda',
      type: 'link'
    },
    {
      id: 'profil',
      label: t.nav.profil,
      type: 'dropdown',
      items: [
        { label: t.nav.sejarah, href: '#sejarah', icon: Landmark, desc: 'Perjalanan & tonggak sejarah sekolah' },
        { label: t.nav.visiMisi, href: '#visi-misi', icon: Trophy, desc: 'Visi luhur dan misi pendidikan dasar' },
        { label: t.nav.kepalaSekolah, href: '#kepala-sekolah', icon: Award, desc: 'Sambutan resmi & profil Kepala Sekolah' },
        { label: t.nav.guruTendik, href: '#guru-tendik', icon: Users, desc: 'Profil dewan guru dan tenaga kependidikan' },
        { label: t.nav.strukturOrganisasi, href: '#struktur-organisasi', icon: Network, desc: 'Bagan organisasi tata kelola sekolah' },
      ]
    },
    {
      id: 'informasi',
      label: t.nav.informasi,
      type: 'dropdown',
      items: [
        { label: t.nav.berita, href: '#berita', icon: Newspaper, desc: 'Warta liputan kegiatan belajar dan prestasi' },
        { label: t.nav.pengumuman, href: '#pengumuman', icon: Bell, desc: 'Surat edaran dan pengumuman resmi' },
        { label: t.nav.agenda, href: '#agenda', icon: Calendar, desc: 'Jadwal kegiatan dan agenda sekolah mendatang' },
        { label: t.nav.kalenderPendidikan, href: '#kalender-pendidikan', icon: Clock, desc: 'Kalender akademik semester ganjil & genap' },
      ]
    },
    {
      id: 'akademik',
      label: t.nav.akademik,
      type: 'dropdown',
      items: [
        { label: t.nav.kurikulum, href: '#kurikulum', icon: BookOpen, desc: 'Implementasi Kurikulum Merdeka & Projek P5' },
        { label: t.nav.jadwal, href: '#jadwal', icon: CalendarDays, desc: 'Jadwal pelajaran kelas 1 s/d 6' },
        { label: t.nav.ekskul, href: '#ekstrakurikuler', icon: Compass, desc: 'Wadah minat, bakat, seni & olahraga' },
      ]
    },
    {
      id: 'prestasi',
      label: t.nav.prestasi,
      href: '#prestasi',
      type: 'link'
    },
    {
      id: 'galeri',
      label: t.nav.galeri,
      href: '#galeri',
      type: 'link'
    },
    {
      id: 'ppdb',
      label: t.nav.ppdb,
      href: '#ppdb',
      type: 'badge'
    },
    {
      id: 'download',
      label: t.nav.download,
      href: '#download',
      type: 'link'
    },
    {
      id: 'kontak',
      label: t.nav.contact,
      href: '#kontak',
      type: 'link'
    }
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-3 border-b border-slate-100'
          : 'bg-gradient-to-b from-blue-950/90 via-blue-950/60 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center">
        {/* School Logo & Title */}
        <a href="#beranda" className="flex items-center gap-3 group">
          <div className="w-11 h-11 flex items-center justify-center bg-white rounded-xl shadow-xs p-1">
            <img
              src="https://lh3.googleusercontent.com/d/1sUaFfYHajE5E__zoW7DGQM9odSDDnwHg"
              alt="Logo SDN 1 Gapuk"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className={`font-black text-sm md:text-base leading-tight tracking-tight ${scrolled ? 'text-blue-950' : 'text-white'}`}>
              SDN 1 GAPUK
            </h1>
            <p className={`text-[10px] tracking-wider uppercase font-semibold ${scrolled ? 'text-slate-400' : 'text-blue-200'}`}>
              Suralaga, Lombok Timur
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {menuStructure.map((item) => {
            if (item.type === 'link') {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all ${
                    scrolled
                      ? 'text-slate-700 hover:text-blue-700 hover:bg-slate-50'
                      : 'text-white hover:text-blue-200 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </a>
              );
            }

            if (item.type === 'badge') {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 hover:bg-amber-500 text-blue-950 shadow-md transition-all active:scale-95 ml-1"
                >
                  {item.label}
                </a>
              );
            }

            if (item.type === 'dropdown') {
              const isOpen = activeDropdown === item.id;
              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    onClick={() => setActiveDropdown(isOpen ? null : item.id)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all ${
                      scrolled
                        ? 'text-slate-700 hover:text-blue-700 hover:bg-slate-50'
                        : 'text-white hover:text-blue-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
                  </button>

                  {/* Dropdown Menu Box */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 overflow-hidden"
                      >
                        <div className="space-y-1">
                          {item.items?.map((sub, i) => {
                            const Icon = sub.icon;
                            return (
                              <a
                                key={i}
                                href={sub.href}
                                onClick={() => setActiveDropdown(null)}
                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-700 flex items-center justify-center shrink-0 transition-colors mt-0.5">
                                  <Icon size={16} />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-xs text-slate-800 group-hover:text-blue-700 transition-colors">
                                    {sub.label}
                                  </p>
                                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                    {sub.desc}
                                  </p>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return null;
          })}

          {/* Language Switcher */}
          <div className={`flex items-center gap-1 border rounded-full p-1 ml-2 ${scrolled ? 'border-slate-200 bg-slate-50' : 'border-white/20 bg-white/10'}`}>
            <button
              onClick={() => setLang('id')}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                lang === 'id' ? 'bg-blue-600 text-white shadow-xs' : scrolled ? 'text-slate-400' : 'text-white/60'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLang('en')}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                lang === 'en' ? 'bg-blue-600 text-white shadow-xs' : scrolled ? 'text-slate-400' : 'text-white/60'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Mobile Navigation Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Quick Language Toggle */}
          <button
            onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
            className={`text-[11px] font-black w-8 h-8 rounded-full border flex items-center justify-center ${
              scrolled ? 'border-slate-200 text-blue-900' : 'border-white/30 text-white'
            }`}
          >
            {lang.toUpperCase()}
          </button>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-xl ${scrolled ? 'text-blue-950 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-slate-200 shadow-2xl overflow-y-auto max-h-[85vh] px-4 py-4"
          >
            <div className="space-y-1.5 pb-6">
              {menuStructure.map((item) => {
                if (item.type === 'link') {
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 rounded-2xl text-sm font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      {item.label}
                    </a>
                  );
                }

                if (item.type === 'badge') {
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="block mx-4 my-2 px-4 py-3 rounded-2xl text-sm font-black text-center uppercase tracking-wider bg-amber-400 text-blue-950 shadow-sm"
                    >
                      {item.label} 2026/2027
                    </a>
                  );
                }

                if (item.type === 'dropdown') {
                  const isExpanded = !!mobileExpanded[item.id];
                  return (
                    <div key={item.id} className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/50">
                      <button
                        onClick={() => toggleMobileSubmenu(item.id)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-800 text-left"
                      >
                        <span>{item.label}</span>
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white border-t border-slate-100 px-3 py-2 space-y-1"
                          >
                            {item.items?.map((sub, i) => {
                              const Icon = sub.icon;
                              return (
                                <a
                                  key={i}
                                  href={sub.href}
                                  onClick={closeMobileMenu}
                                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors text-xs font-semibold"
                                >
                                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                                    <Icon size={14} />
                                  </div>
                                  <span>{sub.label}</span>
                                </a>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* Quick Action Footer in Mobile Drawer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Bahasa: {lang === 'id' ? 'Indonesia' : 'English'}</span>
              <a
                href="#kontak"
                onClick={closeMobileMenu}
                className="flex items-center gap-1.5 text-blue-700 font-bold"
              >
                <Phone size={13} />
                <span>085939324177</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

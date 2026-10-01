/**
 * Translation service for SDN 1 Gapuk
 * Translates static and dynamic content (Visi Misi, Berita, Ekstrakurikuler, Staf, Jadwal, Prestasi)
 * Supports instant dictionary lookups and asynchronous auto-translation with persistent caching.
 */
import { useEffect, useState, useRef } from 'react';
import { NewsItem, ExtraItem, StaffItem, AchievementItem, ScheduleItem } from '../types';

// Common dictionary for instant, 0ms latency translation
const DICTIONARY: Record<string, string> = {
  // Common subjects
  'Matematika': 'Mathematics',
  'Bahasa Indonesia': 'Indonesian Language',
  'Bahasa Inggris': 'English Language',
  'IPA': 'Natural Science (IPA)',
  'IPS': 'Social Studies (IPS)',
  'IPAS': 'Natural & Social Sciences (IPAS)',
  'Pendidikan Agama': 'Religious Education',
  'Pendidikan Agama Islam': 'Islamic Religious Education',
  'PAI': 'Islamic Studies (PAI)',
  'Pendidikan Pancasila': 'Pancasila Civics',
  'PPKn': 'Civic Education (PPKn)',
  'PJOK': 'Physical Education & Health (PJOK)',
  'Penjas': 'Physical Education',
  'Seni Budaya': 'Arts & Culture',
  'SBdP': 'Arts, Culture & Crafts (SBdP)',
  'Muatan Lokal': 'Local Content',
  'Bahasa Sasak': 'Sasak Local Language',
  'TIK': 'ICT / Computer Skills',
  'Upacara Bendera': 'Flag Ceremony',
  'Senam Bersama': 'Morning Gymnastics',
  'Imtaq': 'Morning Prayer & Faith Building',
  'Literasi': 'Literacy Program',
  'Numerasi': 'Numeracy Program',

  // Days
  'Senin': 'Monday',
  'Selasa': 'Tuesday',
  'Rabu': 'Wednesday',
  'Kamis': 'Thursday',
  'Jumat': 'Friday',
  'Sabtu': 'Saturday',
  'Minggu': 'Sunday',

  // Grades
  'Kelas 1': 'Grade 1',
  'Kelas 2': 'Grade 2',
  'Kelas 3': 'Grade 3',
  'Kelas 4': 'Grade 4',
  'Kelas 5': 'Grade 5',
  'Kelas 6': 'Grade 6',

  // Staff positions
  'Kepala Sekolah': 'Principal',
  'Guru Kelas 1': '1st Grade Teacher',
  'Guru Kelas 2': '2nd Grade Teacher',
  'Guru Kelas 3': '3rd Grade Teacher',
  'Guru Kelas 4': '4th Grade Teacher',
  'Guru Kelas 5': '5th Grade Teacher',
  'Guru Kelas 6': '6th Grade Teacher',
  'Guru PJOK': 'Physical Education Teacher',
  'Guru Olahraga': 'Sports & Physical Education Teacher',
  'Guru PAI': 'Islamic Studies Teacher',
  'Guru Agama': 'Religious Studies Teacher',
  'Guru Bahasa Inggris': 'English Teacher',
  'Tenaga Administrasi': 'Administrative Staff',
  'Tata Usaha': 'Administrative Staff',
  'Operator Sekolah': 'School IT & Data Operator',
  'Penjaga Sekolah': 'School Caretaker & Security',
  'Satpam': 'School Security',
  'Pustakawan': 'School Librarian',

  // Categories
  'Akademik': 'Academic',
  'Prestasi': 'Achievements',
  'Kegiatan': 'Activities',
  'Pengumuman': 'Announcement',
  'Ekstrakurikuler': 'Extracurricular',
  'Fasilitas': 'Facilities',
  'Pendidikan': 'Education',
  'Guru': 'Teacher',
  'Siswa': 'Student',
  'Olahraga': 'Sports',
  'Seni & Budaya': 'Art & Culture',
  'Sains & Teknologi': 'Science & Tech',

  // Common Extracurricular Names
  'Pramuka': 'Scouts (Pramuka)',
  'Tari Tradisional': 'Traditional Dance',
  'Robotik': 'Robotics & Coding',
  'Sepak Bola': 'Soccer / Football',
  'Futsal': 'Futsal',
  'Drumband': 'Marching Band',
  'Pencak Silat': 'Martial Arts (Pencak Silat)',
  'Paduan Suara': 'School Choir',
  'Palang Merah Remaja': 'Junior Red Cross (PMR)',
  'PMR': 'Junior Red Cross (PMR)',
  'Dokter Kecil': 'Junior Health Squad',
  'Seni Lukis': 'Painting & Drawing',
  'Menggambar': 'Drawing Club',
  'Tahfidz Al-Qur\'an': 'Qur\'an Memorization (Tahfidz)',
  'Tahfidz': 'Tahfidz Qur\'an',
  'Klub Sains': 'Science Club',
  'Klub Matematika': 'Math Club',

  // Default Vision & Mission
  'Menjadi lembaga pendidikan dasar yang unggul dalam prestasi, berkarakter mulia, dan berwawasan teknologi masa depan berdasarkan iman dan taqwa.':
    'To be an elementary educational institution that excels in achievement, possesses noble character, and embraces future technology based on faith and piety.',
  'Menanamkan nilai karakter dan budi pekerti luhur sejak dini.\nMenyelenggarakan pembelajaran kreatif dan inovatif berbasis IT.\nMengembangkan potensi bakat siswa melalui berbagai ekstrakurikuler.':
    'Instilling character values and noble morals from an early age.\nOrganizing creative and innovative IT-based learning.\nDeveloping students\' talent potential through various extracurricular activities.'
};

// In-memory cache
const memoryCache = new Map<string, string>();

function getCacheKey(text: string): string {
  // simple hash for localStorage key
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return `sdn1_tr_${hash}`;
}

export async function translateTextToEnglish(text: string): Promise<string> {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (!trimmed) return text;

  // 1. Direct dictionary lookup
  if (DICTIONARY[trimmed]) {
    return DICTIONARY[trimmed];
  }

  // 2. Check memory cache
  if (memoryCache.has(trimmed)) {
    return memoryCache.get(trimmed)!;
  }

  // 3. Check localStorage cache
  try {
    const cached = localStorage.getItem(getCacheKey(trimmed));
    if (cached) {
      memoryCache.set(trimmed, cached);
      return cached;
    }
  } catch (e) {
    // ignore storage errors
  }

  // 4. Fallback if text consists of multiple lines (e.g. mission)
  if (trimmed.includes('\n')) {
    const lines = trimmed.split('\n');
    const translatedLines = await Promise.all(lines.map(line => translateTextToEnglish(line)));
    const result = translatedLines.join('\n');
    memoryCache.set(trimmed, result);
    try {
      localStorage.setItem(getCacheKey(trimmed), result);
    } catch (e) {}
    return result;
  }

  // 5. Request translation from Google Translate API
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(trimmed)}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((item: any) => item[0]).join('');
        if (translated) {
          memoryCache.set(trimmed, translated);
          try {
            localStorage.setItem(getCacheKey(trimmed), translated);
          } catch (e) {}
          return translated;
        }
      }
    }
  } catch (err) {
    console.warn('Auto translation network error:', err);
  }

  // Fallback to original text if unable to translate
  return text;
}

// React Hook: Translate Profile (Vision & Mission)
export function useTranslatedProfile(
  profile: { vision: string; mission: string; heroImage?: string; profileImage?: string },
  lang: 'id' | 'en'
) {
  const [translated, setTranslated] = useState(profile);

  useEffect(() => {
    if (lang === 'id') {
      setTranslated(profile);
      return;
    }

    let isMounted = true;

    // Instant dictionary check first
    const instantVision = DICTIONARY[profile.vision?.trim()] || profile.vision;
    const instantMission = DICTIONARY[profile.mission?.trim()] || profile.mission;
    setTranslated({
      ...profile,
      vision: instantVision,
      mission: instantMission,
    });

    // Translate asynchronously if dynamic/custom
    Promise.all([
      translateTextToEnglish(profile.vision),
      translateTextToEnglish(profile.mission),
    ]).then(([visionEn, missionEn]) => {
      if (isMounted) {
        setTranslated(prev => ({
          ...prev,
          vision: visionEn,
          mission: missionEn,
        }));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [profile.vision, profile.mission, lang]);

  return lang === 'id' ? profile : translated;
}

// React Hook: Translate News Items
export function useTranslatedNews(newsList: NewsItem[], lang: 'id' | 'en'): NewsItem[] {
  const [translated, setTranslated] = useState<NewsItem[]>(newsList);

  useEffect(() => {
    if (lang === 'id') {
      setTranslated(newsList);
      return;
    }

    let isMounted = true;

    const translateAll = async () => {
      const items = await Promise.all(
        newsList.map(async (item) => {
          const [titleEn, excerptEn, contentEn, categoryEn] = await Promise.all([
            translateTextToEnglish(item.title),
            translateTextToEnglish(item.excerpt),
            translateTextToEnglish(item.content || item.excerpt),
            translateTextToEnglish(item.category),
          ]);

          return {
            ...item,
            title: titleEn,
            excerpt: excerptEn,
            content: contentEn,
            category: categoryEn,
          };
        })
      );

      if (isMounted) {
        setTranslated(items);
      }
    };

    translateAll();

    return () => {
      isMounted = false;
    };
  }, [newsList, lang]);

  return lang === 'id' ? newsList : translated;
}

// React Hook: Translate Extracurricular Items
export function useTranslatedExtras(extrasList: ExtraItem[], lang: 'id' | 'en'): ExtraItem[] {
  const [translated, setTranslated] = useState<ExtraItem[]>(extrasList);

  useEffect(() => {
    if (lang === 'id') {
      setTranslated(extrasList);
      return;
    }

    let isMounted = true;

    const translateAll = async () => {
      const items = await Promise.all(
        extrasList.map(async (item) => {
          const [nameEn, descEn, longDescEn, schedEn] = await Promise.all([
            DICTIONARY[item.name] || translateTextToEnglish(item.name),
            translateTextToEnglish(item.description),
            translateTextToEnglish(item.longDescription || item.description),
            translateTextToEnglish(item.schedule),
          ]);

          return {
            ...item,
            name: nameEn,
            description: descEn,
            longDescription: longDescEn,
            schedule: schedEn,
          };
        })
      );

      if (isMounted) {
        setTranslated(items);
      }
    };

    translateAll();

    return () => {
      isMounted = false;
    };
  }, [extrasList, lang]);

  return lang === 'id' ? extrasList : translated;
}

// React Hook: Translate Staff Items
export function useTranslatedStaff(staffList: StaffItem[], lang: 'id' | 'en'): StaffItem[] {
  const [translated, setTranslated] = useState<StaffItem[]>(staffList);

  useEffect(() => {
    if (lang === 'id') {
      setTranslated(staffList);
      return;
    }

    let isMounted = true;

    const translateAll = async () => {
      const items = await Promise.all(
        staffList.map(async (item) => {
          const [posEn, eduEn] = await Promise.all([
            DICTIONARY[item.position] || translateTextToEnglish(item.position),
            item.education ? translateTextToEnglish(item.education) : Promise.resolve(item.education),
          ]);

          return {
            ...item,
            position: posEn,
            education: eduEn,
          };
        })
      );

      if (isMounted) {
        setTranslated(items);
      }
    };

    translateAll();

    return () => {
      isMounted = false;
    };
  }, [staffList, lang]);

  return lang === 'id' ? staffList : translated;
}

// React Hook: Translate Achievement Items
export function useTranslatedAchievements(achievements: AchievementItem[], lang: 'id' | 'en'): AchievementItem[] {
  const [translated, setTranslated] = useState<AchievementItem[]>(achievements);

  useEffect(() => {
    if (lang === 'id') {
      setTranslated(achievements);
      return;
    }

    let isMounted = true;

    const translateAll = async () => {
      const items = await Promise.all(
        achievements.map(async (item) => {
          const [titleEn, descEn, catEn] = await Promise.all([
            translateTextToEnglish(item.title),
            translateTextToEnglish(item.description),
            item.category ? (DICTIONARY[item.category] || translateTextToEnglish(item.category)) : Promise.resolve(''),
          ]);

          return {
            ...item,
            title: titleEn,
            description: descEn,
            category: catEn,
          };
        })
      );

      if (isMounted) {
        setTranslated(items);
      }
    };

    translateAll();

    return () => {
      isMounted = false;
    };
  }, [achievements, lang]);

  return lang === 'id' ? achievements : translated;
}

// React Hook: Translate Schedule Items (Subjects & Grade names)
export function useTranslatedSchedule(scheduleList: ScheduleItem[], lang: 'id' | 'en'): ScheduleItem[] {
  const [translated, setTranslated] = useState<ScheduleItem[]>(scheduleList);

  useEffect(() => {
    if (lang === 'id') {
      setTranslated(scheduleList);
      return;
    }

    let isMounted = true;

    const translateAll = async () => {
      const items = await Promise.all(
        scheduleList.map(async (item) => {
          const subjects = await Promise.all(
            item.subjects.map(async (sub) => {
              const nameEn = DICTIONARY[sub.name] || await translateTextToEnglish(sub.name);
              return {
                ...sub,
                name: nameEn,
              };
            })
          );

          return {
            ...item,
            grade: DICTIONARY[item.grade] || item.grade,
            subjects,
          };
        })
      );

      if (isMounted) {
        setTranslated(items);
      }
    };

    translateAll();

    return () => {
      isMounted = false;
    };
  }, [scheduleList, lang]);

  return lang === 'id' ? scheduleList : translated;
}

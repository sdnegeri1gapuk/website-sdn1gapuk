/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string; // Detail konten berita
  category: string;
  imageUrl: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
}

export interface ScheduleItem {
  id: string;
  grade: string; // "Kelas 1" - "Kelas 6"
  day: string;
  subjects: {
    time: string;
    name: string;
  }[];
}

export interface ExtraItem {
  id: string;
  name: string;
  description: string;
  longDescription: string; // Detail kegiatan ekskul
  schedule: string;
  coach: string;
  icon: string;
}

export interface StaffItem {
  id: string;
  name: string;
  position: string; // e.g. "Kepala Sekolah", "Guru Kelas 1", "Guru Olahraga"
  imageUrl: string;
  education?: string;
}

export interface Student {
  id: string;
  name: string;
  nisn: string;
  gradeLevel: string;
  className?: '6A' | '6B';
  updatedAt?: string;
  isArchived?: boolean;
}

export interface SubjectGrades {
  pai: number;
  pancasila: number;
  bIndo: number;
  matematika: number;
  ipas: number;
  pjok: number;
  seniBdaya: number;
  bInggris: number;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  semesters: {
    [semester: string]: SubjectGrades;
  };
  updatedAt: string;
}

export interface AppConfig {
  id: string;
  headerImageUrl: string;
  updatedAt?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  type: 'Guru' | 'Siswa';
  date: string;
  description: string;
  imageUrl?: string;
  category?: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category?: string;
}

export interface DownloadItem {
  id: string;
  title: string;
  category: 'Formulir' | 'Akademik' | 'Regulasi' | 'Panduan';
  fileType: string;
  fileSize: string;
  date: string;
  description?: string;
  fileUrl?: string;
}

export interface PrincipalInfo {
  name: string;
  title: string;
  titleEn?: string;
  nip: string;
  photoUrl: string;
  greetingId: string;
  greetingEn?: string;
}

export interface HistoryMilestone {
  year: string;
  titleId: string;
  titleEn?: string;
  descId: string;
  descEn?: string;
}

export interface SchoolHistoryInfo {
  titleId: string;
  titleEn?: string;
  summaryId: string;
  summaryEn?: string;
  milestones: HistoryMilestone[];
}

export interface OrgStructureMember {
  id?: string;
  role: string;
  roleEn?: string;
  name: string;
  level: number;
}

export interface CurriculumPillar {
  titleId: string;
  titleEn?: string;
  descId: string;
  descEn?: string;
}

export interface CurriculumInfo {
  title: string;
  titleEn?: string;
  descriptionId: string;
  descriptionEn?: string;
  pillars: CurriculumPillar[];
}

export interface CalendarEvent {
  date: string;
  title: string;
}

export interface AcademicCalendarInfo {
  semesterGanjil: {
    period: string;
    events: CalendarEvent[];
  };
  semesterGenap: {
    period: string;
    events: CalendarEvent[];
  };
}

export interface PpdbSettings {
  title?: string;
  subtitle?: string;
  desc?: string;
  requirements: Array<{ text: string; highlight?: boolean }>;
  flow: Array<{ step: string; title: string; desc: string }>;
}


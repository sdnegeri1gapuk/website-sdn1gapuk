/**
 * Data and Content for School Structure Hierarchy:
 * PROFIL (Sejarah, Visi Misi, Kepala Sekolah, Guru & Tendik, Struktur Organisasi)
 * INFORMASI (Berita, Pengumuman, Agenda, Kalender Pendidikan)
 * AKADEMIK (Kurikulum, Jadwal, Ekstrakurikuler)
 * PPDB
 * DOWNLOAD
 */
import { AgendaItem, DownloadItem } from '../types';

export const PRINCIPAL_INFO = {
  name: 'H. Lalu Ahmad Rusydi, S.Pd., M.Pd.',
  title: 'Kepala Sekolah SDN 1 Gapuk',
  titleEn: 'Principal of SDN 1 Gapuk',
  nip: 'NIP. 19740512 199803 1 004',
  photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80',
  greetingId: `Assalamu'alaikum Warahmatullahi Wabarakatuh,
Salam sejahtera bagi kita semua.

Puji syukur kita panjatkan ke hadirat Allah SWT atas rahmat dan karunia-Nya. Selamat datang di laman resmi SD Negeri 1 Gapuk, wadah informasi dan silaturahmi antara sekolah, orang tua, peserta didik, dan masyarakat luas.

SD Negeri 1 Gapuk berkomitmen menyelenggarakan pendidikan dasar yang tidak hanya berorientasi pada pencapaian prestasi akademik, tetapi juga penanaman budi pekerti luhur, pembentukan karakter religius, serta adaptasi terhadap perkembangan teknologi melalui Kurikulum Merdeka.

Kami percaya bahwa setiap anak memiliki potensi istimewa yang patut ditumbuhkembangkan dengan penuh kasih sayang dan dedikasi. Mari bersama-sama bersinergi mewujudkan masa depan gemilang bagi generasi penerus bangsa.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
  greetingEn: `Assalamu'alaikum Warahmatullahi Wabarakatuh,
Warm greetings to all of us.

Praise be to Allah SWT for His blessings and grace. Welcome to the official website of SD Negeri 1 Gapuk, an information and communication hub for our school, parents, students, and the wider community.

SD Negeri 1 Gapuk is committed to delivering primary education that not only focuses on academic excellence, but also fosters noble character, religious values, and adaptability to modern technology through the Merdeka Curriculum.

We firmly believe that every child possesses unique potential to be nurtured with care and dedication. Let us work together in synergy to realize a brighter future for the nation's next generation.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`
};

export const SCHOOL_HISTORY = {
  titleId: 'Sejarah Singkat SD Negeri 1 Gapuk',
  titleEn: 'Brief History of SD Negeri 1 Gapuk',
  summaryId: 'SD Negeri 1 Gapuk didirikan pada tahun 1987 di atas tanah hibah masyarakat Desa Gapuk, Kecamatan Suralaga, Kabupaten Lombok Timur. Berawal dari 3 ruang kelas sederhana dengan tenaga pengajar perintis, sekolah ini terus bertransformasi menjadi salah satu institusi pendidikan dasar terkemuka di wilayah Suralaga.',
  summaryEn: 'SD Negeri 1 Gapuk was established in 1987 on land granted by the community of Gapuk Village, Suralaga District, East Lombok. Starting from 3 modest classrooms with pioneering educators, the school has steadily transformed into one of the prominent primary educational institutions in Suralaga.',
  milestones: [
    {
      year: '1987',
      titleId: 'Pendirian & Operasional Perdana',
      titleEn: 'Establishment & First Operations',
      descId: 'Resmi berdiri dengan nama SDN Gapuk Baru untuk melayani kebutuhan pendidikan dasar masyarakat sekitar.',
      descEn: 'Officially founded as SDN Gapuk Baru to serve the primary education needs of the local community.'
    },
    {
      year: '2005',
      titleId: 'Perluasan Sarana & Perpustakaan',
      titleEn: 'Facility Expansion & Library',
      descId: 'Pembangunan ruang kelas baru, perpustakaan sekolah, serta lapangan olahraga multifungsi.',
      descEn: 'Construction of new classrooms, school library, and a multifunctional sports field.'
    },
    {
      year: '2018',
      titleId: 'Akreditasi B & Penguatan Karakter',
      titleEn: 'B Accreditation & Character Education',
      descId: 'Meraih akreditasi B dari BAN-S/M dengan peningkatan signifikan dalam prestasi ekstrakurikuler daerah.',
      descEn: 'Achieved B accreditation from BAN-S/M with significant achievements in regional extracurriculars.'
    },
    {
      year: '2024 - Sekarang',
      titleId: 'Implementasi Kurikulum Merdeka & Digitalisasi',
      titleEn: 'Merdeka Curriculum & Digitalization',
      descId: 'Penerapan Kurikulum Merdeka, adopsi TIK di kelas, serta program pembiasaan Profil Pelajar Pancasila.',
      descEn: 'Implementation of the Merdeka Curriculum, classroom ICT adoption, and Pancasila Student Profile programs.'
    }
  ]
};

export const ORG_STRUCTURE = [
  { role: 'Komite Sekolah', roleEn: 'School Committee', name: 'H. Suwardi, S.Sos.', level: 1 },
  { role: 'Kepala Sekolah', roleEn: 'School Principal', name: 'H. Lalu Ahmad Rusydi, S.Pd., M.Pd.', level: 2 },
  { role: 'Bendahara Sekolah / BOS', roleEn: 'School Treasurer / BOS', name: 'M. Zohdi, S.Pd.', level: 3 },
  { role: 'Koordinator Kurikulum', roleEn: 'Curriculum Coordinator', name: 'Siti Nurhaliza, S.Pd.', level: 3 },
  { role: 'Koordinator Kesiswaan & Ekskul', roleEn: 'Student Affairs Coordinator', name: 'Ahmad Kurniawan, S.Pd.', level: 3 },
  { role: 'Koordinator Sarana & Prasarana', roleEn: 'Infrastructure Coordinator', name: 'Dedi Pratama, S.Pd.', level: 3 },
  { role: 'Koordinator Humas & Komunikasi', roleEn: 'Public Relations Coordinator', name: 'Ratna Sari, S.Pd.', level: 3 },
  { role: 'Operator Data & SIM Sekolah', roleEn: 'IT & Data Operator', name: 'Wathan, S.Kom.', level: 4 },
  { role: 'Tenaga Perpustakaan & UKS', roleEn: 'Library & Health Caretaker', name: 'Baiq Nurul Hidayati, A.Ma.', level: 4 }
];

export const AGENDA_DATA: AgendaItem[] = [
  {
    id: 'ag-1',
    title: 'Penilaian Sumatif Tengah Semester (STS) Genap',
    date: '15 - 20 Maret 2026',
    time: '07:30 - 11:30 WITA',
    location: 'Ruang Kelas 1 - 6',
    description: 'Evaluasi berkala pemahaman capaian pembelajaran peserta didik untuk seluruh mata pelajaran.',
    category: 'Akademik'
  },
  {
    id: 'ag-2',
    title: 'Peringatan Hari Pendidikan Nasional & Gebyar Seni',
    date: '02 Mei 2026',
    time: '08:00 - 12:00 WITA',
    location: 'Halaman Utama SDN 1 Gapuk',
    description: 'Upacara bendera peringatan Hardiknas dilanjutkan dengan pementasan seni tari dan pameran karya siswa.',
    category: 'Kegiatan'
  },
  {
    id: 'ag-3',
    title: 'Sosialisasi & Rapat Pleno PPDB Tahun Ajaran 2026/2027',
    date: '20 Mei 2026',
    time: '09:00 - 11:30 WITA',
    location: 'Aula SDN 1 Gapuk',
    description: 'Pertemuan bersama komite sekolah dan perwakilan wali murid mengenai petunjuk teknis penerimaan siswa baru.',
    category: 'Sosialisasi'
  },
  {
    id: 'ag-4',
    title: 'Pelaksanaan ANBK (Asesmen Nasional Berbasis Komputer)',
    date: '24 - 27 Agustus 2026',
    time: '07:30 - 12:30 WITA',
    location: 'Laboratorium Komputer',
    description: 'Asesmen Nasional untuk peserta didik kelas 5 guna mengukur kompetensi literasi dan numerasi.',
    category: 'Ujian'
  }
];

export const ACADEMIC_CALENDAR = {
  semesterGanjil: {
    period: 'Juli - Desember 2026',
    events: [
      { date: '13 Juli 2026', title: 'Hari Pertama Masuk Sekolah & MPLS' },
      { date: '17 Agustus 2026', title: 'Peringatan HUT Kemerdekaan RI Ke-81' },
      { date: '21 - 26 September 2026', title: 'Penilaian Sumatif Tengah Semester Ganjil' },
      { date: '07 - 12 Desember 2026', title: 'Penilaian Sumatif Akhir Semester Ganjil' },
      { date: '19 Desember 2026', title: 'Pembagian Buku Laporan Hasil Belajar (Rapor)' },
      { date: '21 Des 2026 - 02 Jan 2027', title: 'Libur Akhir Semester Ganjil' }
    ]
  },
  semesterGenap: {
    period: 'Januari - Juni 2027',
    events: [
      { date: '04 Januari 2027', title: 'Hari Pertama Masuk Sekolah Semester Genap' },
      { date: '15 - 20 Maret 2027', title: 'Penilaian Sumatif Tengah Semester Genap' },
      { date: '17 - 22 Mei 2027', title: 'Ujian Sekolah Kelas 6 (Asesmen Akhir Jenjang)' },
      { date: '07 - 12 Juni 2027', title: 'Penilaian Sumatif Akhir Tahun (Kenaikan Kelas)' },
      { date: '19 Juni 2027', title: 'Pembagian Rapor & Pengumuman Kenaikan Kelas' },
      { date: '21 Juni - 10 Juli 2027', title: 'Libur Akhir Tahun Ajaran' }
    ]
  }
};

export const CURRICULUM_INFO = {
  title: 'Implementasi Kurikulum Merdeka',
  titleEn: 'Merdeka Curriculum Implementation',
  descriptionId: 'SD Negeri 1 Gapuk menerapkan Kurikulum Merdeka yang menitikberatkan pada pembelajaran bermakna, pengembangan potensi individual melalui pembelajaran berdiferensiasi, serta penguatan Profil Pelajar Pancasila.',
  descriptionEn: 'SD Negeri 1 Gapuk implements the Merdeka Curriculum focusing on meaningful learning, individual potential development through differentiated learning, and strengthening the Pancasila Student Profile.',
  pillars: [
    {
      titleId: 'Pembelajaran Berdiferensiasi',
      titleEn: 'Differentiated Learning',
      descId: 'Guru menyesuaikan konten, proses, dan produk belajar sesuai kesiapan, minat, serta gaya belajar siswa.',
      descEn: 'Teachers adapt content, process, and learning outcomes according to students readiness, interests, and learning styles.'
    },
    {
      titleId: 'Projek Penguatan Karakter (P5)',
      titleEn: 'Pancasilan Character Project (P5)',
      descId: 'Mengembangkan 6 dimensi karakter: Beriman & Bertakwa, Berkebinekaan Global, Mandiri, Gotong Royong, Bernalar Kritis, dan Kreatif.',
      descEn: 'Developing 6 character dimensions: Faithful & Pious, Global Diversity, Independent, Collaborative, Critical Thinking, and Creative.'
    },
    {
      titleId: 'Literasi & Numerasi Kontekstual',
      titleEn: 'Contextual Literacy & Numeracy',
      descId: 'Pembiasaan membaca 15 menit sebelum KBM dan penyelesaian masalah matematika berbasis kehidupan sehari-hari.',
      descEn: '15-minute daily reading habit and daily life-based mathematics problem-solving.'
    },
    {
      titleId: 'Pembiasaan Budaya Sekolah',
      titleEn: 'School Culture & Ethics',
      descId: 'Gerakan 5S (Senyum, Salam, Sapa, Sopan, Santun), sholat dhuha & doa pagi bersama, serta kebersihan lingkungan.',
      descEn: '5S ethical greeting movement, morning prayers, and environmental sustainability practices.'
    }
  ]
};

export const DOWNLOAD_ITEMS: DownloadItem[] = [
  {
    id: 'dl-1',
    title: 'Formulir Pendaftaran Siswa Baru (PPDB) 2026/2027',
    category: 'Formulir',
    fileType: 'PDF',
    fileSize: '245 KB',
    date: 'Mei 2026',
    description: 'Format formulir cetak pendaftaran calon siswa baru jalur offline.'
  },
  {
    id: 'dl-2',
    title: 'Tata Tertib & Kode Etik Peserta Didik SDN 1 Gapuk',
    category: 'Regulasi',
    fileType: 'PDF',
    fileSize: '410 KB',
    date: 'Juli 2026',
    description: 'Buku panduan tata tertib, hak, dan kewajiban peserta didik selama menempuh pendidikan.'
  },
  {
    id: 'dl-3',
    title: 'Kalender Pendidikan Resmi Tahun Ajaran 2026/2027',
    category: 'Akademik',
    fileType: 'PDF',
    fileSize: '680 KB',
    date: 'Juni 2026',
    description: 'Jadwal hari efektif sekolah, jadwal ujian, dan kalender libur semester.'
  },
  {
    id: 'dl-4',
    title: 'Panduan Kurikulum Merdeka & Projek Profil Pelajar Pancasila (P5)',
    category: 'Panduan',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    date: 'Januari 2026',
    description: 'Buku panduan pelaksanaan projek penguatan profil pelajar Pancasila bagi orang tua dan murid.'
  },
  {
    id: 'dl-5',
    title: 'Surat Pernyataan Kesanggupan Orang Tua / Wali Murid',
    category: 'Formulir',
    fileType: 'DOCX',
    fileSize: '115 KB',
    date: 'Mei 2026',
    description: 'Format surat pernyataan persetujuan tata tertib dan partisipasi sekolah.'
  }
];

export const PPDB_REQUIREMENTS = [
  { text: 'Berusia 7 (tujuh) tahun atau paling rendah 6 (enam) tahun pada tanggal 1 Juli 2026.', highlight: true },
  { text: 'Fotokopi Akta Kelahiran calon peserta didik (2 lembar).' },
  { text: 'Fotokopi Kartu Keluarga (KK) orang tua / wali murid (2 lembar).' },
  { text: 'Fotokopi KTP kedua orang tua / wali murid (masing-masing 1 lembar).' },
  { text: 'Ijazah / Surat Keterangan Lulus TK / PAUD (jika ada).' },
  { text: 'Pas foto berwarna calon peserta didik ukuran 3x4 (3 lembar).' }
];

export const PPDB_FLOW = [
  {
    step: '1',
    title: 'Pendaftaran Online / Offline',
    desc: 'Mengisi formulir pendaftaran melalui website ini atau hadir langsung ke ruang panitia PPDB sekolah.'
  },
  {
    step: '2',
    title: 'Verifikasi Berkas',
    desc: 'Penyerahan fotokopi berkas persyaratan ke sekolah untuk verifikasi keabsahan data kependudukan.'
  },
  {
    step: '3',
    title: 'Pengumuman Hasil Seleksi',
    desc: 'Pengumuman hasil seleksi penerimaan siswa baru dapat dicek via website atau papan pengumuman sekolah.'
  },
  {
    step: '4',
    title: 'Daftar Ulang & Pengambilan Seragam',
    desc: 'Wali murid melakukan konfirmasi daftar ulang dan persiapan Masa Pengenalan Lingkungan Sekolah (MPLS).'
  }
];

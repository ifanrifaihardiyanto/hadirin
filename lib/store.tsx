"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buatSiswa, type Siswa } from "./mock-data";

export interface Guru {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  mapel: string[];
  sekolah?: string;
}

export type UserRole = "guru" | "admin";

export type StatusPresensiGuru = "TEPAT_WAKTU" | "TERLAMBAT" | "IZIN_DINAS" | "SAKIT" | "CUTI";

export interface PresensiGuruRecord {
  id: string;
  guruId: string;
  nama: string;
  nip: string;
  jabatan: string;
  tanggal: string;
  jamMasuk: string;
  jamPulang?: string;
  status: StatusPresensiGuru;
  keterangan?: string;
  lokasi: string;
}

export interface CurrentUser {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  jabatan: string;
  sekolah: string;
}

export const USER_GURU_DEFAULT: CurrentUser = {
  id: "g1",
  nama: "Sari Wulandari, S.Pd",
  email: "sari.wulandari@sman3contoh.sch.id",
  role: "guru",
  jabatan: "Guru Pengajar Matematika",
  sekolah: "SMA Negeri 3 Contoh",
};

export const USER_ADMIN_DEFAULT: CurrentUser = {
  id: "admin-1",
  nama: "Drs. Hendra Wijaya, M.Pd",
  email: "admin@sman3contoh.sch.id",
  role: "admin",
  jabatan: "Kepala Sekolah",
  sekolah: "SMA Negeri 3 Contoh",
};

export type Ketercapaian = "TERCAPAI" | "PENGUATAN" | "REMEDIAL";

export interface JurnalEntry {
  id: string;
  jadwalId: string;
  guruId: string;
  guruNama: string;
  kelas: string;
  mapel: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  tanggal: string;
  materiPokok: string;
  tujuanPembelajaran?: string;
  catatanKejadian?: string;
  ketercapaian: Ketercapaian;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  totalSiswa: number;
}

export type JenisIzin = "SAKIT" | "IZIN" | "DISPENSASI";
export type StatusIzin = "MENUNGGU" | "DISETUJUI" | "DITOLAK";

export type StatusKasusBK = "DALAM_PEMBINAAN" | "PANGGILAN_ORTU" | "SELESAI" | "PERINGATAN_KERAS";
export type KategoriBK = "KEDISIPLINAN" | "ABSENSI_TINGGI" | "PRESTASI" | "KONSELING_PRIBADI";

export interface KasusBK {
  id: string;
  nis: string;
  namaSiswa: string;
  kelas: string;
  kategori: KategoriBK;
  poin: number; // positif (prestasi) atau negatif (pelanggaran)
  deskripsi: string;
  tindakan: string;
  status: StatusKasusBK;
  tanggalKasus: string;
  guruBK: string;
  waliKelas: string;
  nomorSuratPanggilan?: string;
  jadwalPanggilanOrtu?: string;
}

export interface PermohonanIzin {
  id: string;
  nis: string;
  namaSiswa: string;
  kelas: string;
  jenis: JenisIzin;
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
  status: StatusIzin;
  diajukanOleh: string;
  tanggalPengajuan: string;
  disetujuiOleh?: string;
}

export interface Kelas {
  id: string;
  nama: string;
}

export interface JadwalEntry {
  id: string;
  guruId: string;
  kelas: string;
  mapel: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
}

export const HARI: string[] = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export interface SlotWaktu {
  mulai: string;
  selesai: string;
}

export const SLOT_WAKTU: SlotWaktu[] = [
  { mulai: "07.00", selesai: "08.30" },
  { mulai: "08.30", selesai: "10.00" },
  { mulai: "10.15", selesai: "11.45" },
  { mulai: "12.30", selesai: "14.00" },
  { mulai: "14.00", selesai: "15.30" },
];

export const JAM_PER_SLOT = 1.5;
export const TARGET_JAM_MINGGU = 24;

export function jamMengajarMinggu(guruId: string, jadwal: JadwalEntry[]) {
  return jadwal.filter((j) => j.guruId === guruId).length * JAM_PER_SLOT;
}

export function cekBentrok(
  jadwal: JadwalEntry[],
  calon: { guruId: string; kelas: string; hari: string; jamMulai: string }
): string | null {
  const bentrokGuru = jadwal.find(
    (j) =>
      j.guruId === calon.guruId &&
      j.hari === calon.hari &&
      j.jamMulai === calon.jamMulai
  );
  if (bentrokGuru) {
    return `Guru ini sudah mengajar ${bentrokGuru.kelas} di jam yang sama pada hari ${calon.hari}.`;
  }
  const bentrokKelas = jadwal.find(
    (j) =>
      j.kelas === calon.kelas &&
      j.hari === calon.hari &&
      j.jamMulai === calon.jamMulai
  );
  if (bentrokKelas) {
    return `Kelas ${calon.kelas} sudah ada jadwal lain di jam yang sama pada hari ${calon.hari}.`;
  }
  return null;
}

export const HARI_INI = "Kamis";
export const CURRENT_GURU_ID = "g1";

export const daftarKelasAwal: Kelas[] = [
  { id: "k1", nama: "X IPA 1" },
  { id: "k2", nama: "X IPA 2" },
  { id: "k3", nama: "X IPS 1" },
  { id: "k4", nama: "XI IPA 1" },
  { id: "k5", nama: "XI IPA 2" },
  { id: "k6", nama: "XII IPA 1" },
];

const daftarGuruAwal: Guru[] = [
  {
    id: "g1",
    nama: "Sari Wulandari",
    email: "sari.wulandari@sman3contoh.sch.id",
    telepon: "0812-3456-7890",
    mapel: ["Matematika", "Bahasa Indonesia"],
    sekolah: "SMA Negeri 3 Contoh",
  },
  {
    id: "g2",
    nama: "Budi Santoso",
    email: "budi.santoso@sman3contoh.sch.id",
    telepon: "0813-1111-2222",
    mapel: ["Fisika"],
    sekolah: "SMA Negeri 3 Contoh",
  },
  {
    id: "g3",
    nama: "Rina Marlina",
    email: "rina.marlina@sman3contoh.sch.id",
    telepon: "0813-3333-4444",
    mapel: ["Bahasa Inggris"],
    sekolah: "SMA Negeri 3 Contoh",
  },
  {
    id: "g4",
    nama: "Agus Prabowo",
    email: "agus.prabowo@sman3contoh.sch.id",
    telepon: "0813-5555-6666",
    mapel: ["Biologi"],
    sekolah: "SMA Negeri 3 Contoh",
  },
  {
    id: "g5",
    nama: "Dewi Kusuma",
    email: "dewi.kusuma@sman3contoh.sch.id",
    telepon: "0813-7777-8888",
    mapel: ["Sejarah"],
    sekolah: "SMA Negeri 3 Contoh",
  },
];

const jadwalAwal: JadwalEntry[] = [
  { id: "j1", guruId: "g1", kelas: "X IPA 1", mapel: "Matematika", hari: "Senin", jamMulai: "07.00", jamSelesai: "08.30" },
  { id: "j2", guruId: "g1", kelas: "X IPA 1", mapel: "Matematika", hari: "Kamis", jamMulai: "07.00", jamSelesai: "08.30" },
  { id: "j3", guruId: "g1", kelas: "X IPA 2", mapel: "Bahasa Indonesia", hari: "Selasa", jamMulai: "08.30", jamSelesai: "10.00" },
  { id: "j4", guruId: "g1", kelas: "X IPA 2", mapel: "Bahasa Indonesia", hari: "Kamis", jamMulai: "08.30", jamSelesai: "10.00" },
  { id: "j5", guruId: "g1", kelas: "XI IPA 1", mapel: "Matematika", hari: "Senin", jamMulai: "10.15", jamSelesai: "11.45" },
  { id: "j6", guruId: "g1", kelas: "XI IPA 1", mapel: "Matematika", hari: "Kamis", jamMulai: "10.15", jamSelesai: "11.45" },
  { id: "j7", guruId: "g1", kelas: "XI IPA 2", mapel: "Matematika", hari: "Rabu", jamMulai: "08.30", jamSelesai: "10.00" },
  { id: "j7b", guruId: "g1", kelas: "XI IPA 2", mapel: "Matematika", hari: "Jumat", jamMulai: "07.00", jamSelesai: "08.30" },
  { id: "j7c", guruId: "g1", kelas: "X IPA 1", mapel: "Matematika", hari: "Selasa", jamMulai: "10.15", jamSelesai: "11.45" },
  { id: "j7d", guruId: "g1", kelas: "X IPA 2", mapel: "Bahasa Indonesia", hari: "Rabu", jamMulai: "12.30", jamSelesai: "14.00" },
  { id: "j7e", guruId: "g1", kelas: "XI IPA 1", mapel: "Matematika", hari: "Jumat", jamMulai: "08.30", jamSelesai: "10.00" },

  { id: "j8", guruId: "g2", kelas: "XI IPA 1", mapel: "Fisika", hari: "Kamis", jamMulai: "07.00", jamSelesai: "08.30" },
  { id: "j9", guruId: "g2", kelas: "XI IPA 2", mapel: "Fisika", hari: "Kamis", jamMulai: "08.30", jamSelesai: "10.00" },

  { id: "j10", guruId: "g3", kelas: "X IPA 1", mapel: "Bahasa Inggris", hari: "Kamis", jamMulai: "10.15", jamSelesai: "11.45" },
  { id: "j11", guruId: "g3", kelas: "X IPA 2", mapel: "Bahasa Inggris", hari: "Kamis", jamMulai: "12.30", jamSelesai: "14.00" },
  { id: "j12", guruId: "g3", kelas: "XI IPA 1", mapel: "Bahasa Inggris", hari: "Kamis", jamMulai: "14.00", jamSelesai: "15.30" },

  { id: "j13", guruId: "g4", kelas: "X IPS 1", mapel: "Biologi", hari: "Kamis", jamMulai: "07.00", jamSelesai: "08.30" },
  { id: "j14", guruId: "g4", kelas: "XII IPA 1", mapel: "Biologi", hari: "Kamis", jamMulai: "08.30", jamSelesai: "10.00" },

  { id: "j15", guruId: "g5", kelas: "X IPA 1", mapel: "Sejarah", hari: "Kamis", jamMulai: "12.30", jamSelesai: "14.00" },
  { id: "j16", guruId: "g5", kelas: "X IPA 2", mapel: "Sejarah", hari: "Kamis", jamMulai: "14.00", jamSelesai: "15.30" },
];

const absensiAwal = ["j2"];

const daftarJurnalAwal: JurnalEntry[] = [
  {
    id: "jur-1",
    jadwalId: "j1",
    guruId: "g1",
    guruNama: "Sari Wulandari",
    kelas: "X IPA 1",
    mapel: "Matematika",
    hari: "Senin",
    jamMulai: "07.00",
    jamSelesai: "08.30",
    tanggal: "Senin, 20 Juli 2026",
    materiPokok: "Pengantar Sistem Persamaan Linear Tiga Variabel (SPLTV)",
    tujuanPembelajaran: "Siswa mampu memodelkan masalah kontekstual ke dalam bentuk SPLTV",
    catatanKejadian: "Diskusi kelompok berjalan sangat aktif. Seluruh kelompok menyelesaikan LKPD tepat waktu.",
    ketercapaian: "TERCAPAI",
    hadir: 20,
    sakit: 0,
    izin: 0,
    alpha: 0,
    totalSiswa: 20,
  },
  {
    id: "jur-2",
    jadwalId: "j2",
    guruId: "g1",
    guruNama: "Sari Wulandari",
    kelas: "X IPA 1",
    mapel: "Matematika",
    hari: "Kamis",
    jamMulai: "07.00",
    jamSelesai: "08.30",
    tanggal: "Kamis, 23 Juli 2026",
    materiPokok: "Metode Eliminasi & Substitusi SPLTV",
    tujuanPembelajaran: "Siswa dapat menentukan himpunan penyelesaian SPLTV dengan metode eliminasi",
    catatanKejadian: "3 siswa memerlukan bimbingan tambahan pada eliminasi variabel kedua.",
    ketercapaian: "PENGUATAN",
    hadir: 18,
    sakit: 1,
    izin: 1,
    alpha: 0,
    totalSiswa: 20,
  },
  {
    id: "jur-3",
    jadwalId: "j3",
    guruId: "g1",
    guruNama: "Sari Wulandari",
    kelas: "X IPA 2",
    mapel: "Bahasa Indonesia",
    hari: "Selasa",
    jamMulai: "08.30",
    jamSelesai: "10.00",
    tanggal: "Selasa, 21 Juli 2026",
    materiPokok: "Struktur & Kaidah Kebahasaan Teks Laporan Hasil Observasi (LHO)",
    tujuanPembelajaran: "Menganalisis struktur pernyataan umum dan deskripsi bagian teks LHO",
    catatanKejadian: "Seluruh siswa menyelesaikan lembar kerja analisis teks LHO.",
    ketercapaian: "TERCAPAI",
    hadir: 19,
    sakit: 1,
    izin: 0,
    alpha: 0,
    totalSiswa: 20,
  },
];

export const daftarPresensiGuruAwal: PresensiGuruRecord[] = [
  {
    id: "pg-1",
    guruId: "g1",
    nama: "Sari Wulandari, S.Pd",
    nip: "19850412 200902 2 003",
    jabatan: "Guru Matematika / Wali Kelas X IPA 1",
    tanggal: "Kamis, 24 Juli 2026",
    jamMasuk: "06.42 WIB",
    jamPulang: "15.30 WIB",
    status: "TEPAT_WAKTU",
    keterangan: "Hadir sebelum apel pagi guru",
    lokasi: "Gerbang Utama SMA Negeri 3 Contoh",
  },
  {
    id: "pg-2",
    guruId: "g2",
    nama: "Budi Santoso, S.Pd",
    nip: "19820719 200801 1 005",
    jabatan: "Guru Fisika / Wali Kelas X IPA 2",
    tanggal: "Kamis, 24 Juli 2026",
    jamMasuk: "06.50 WIB",
    status: "TEPAT_WAKTU",
    keterangan: "Piket KBM Lab Fisika",
    lokasi: "Gedung B - SMA Negeri 3 Contoh",
  },
  {
    id: "pg-3",
    guruId: "g3",
    nama: "Rina Marlina, M.Pd",
    nip: "19881105 201202 2 004",
    jabatan: "Guru Bahasa Inggris / Pembina OSIS",
    tanggal: "Kamis, 24 Juli 2026",
    jamMasuk: "07.18 WIB",
    status: "TERLAMBAT",
    keterangan: "Kendala lalu lintas jalur tol Ciawi-Bogor",
    lokasi: "Gerbang Utama SMA Negeri 3 Contoh",
  },
  {
    id: "pg-4",
    guruId: "g4",
    nama: "Agus Prabowo, S.Pd",
    nip: "19790321 200501 1 002",
    jabatan: "Guru Biologi",
    tanggal: "Kamis, 24 Juli 2026",
    jamMasuk: "-",
    status: "IZIN_DINAS",
    keterangan: "Narasumber Workshop Kurikulum Merdeka di BBGP Jawa Barat (Surat Tugas No. 800/142/Disdik)",
    lokasi: "BBGP Jawa Barat, Bandung",
  },
  {
    id: "pg-5",
    guruId: "g5",
    nama: "Dewi Kusuma, S.Pd",
    nip: "19910214 201503 2 006",
    jabatan: "Guru Sejarah",
    tanggal: "Kamis, 24 Juli 2026",
    jamMasuk: "06.45 WIB",
    jamPulang: "15.35 WIB",
    status: "TEPAT_WAKTU",
    keterangan: "Hadir mengajar sesi pagi",
    lokasi: "Kampus SMA Negeri 3 Contoh",
  },
];

export const daftarKasusBKAwal: KasusBK[] = [
  {
    id: "bk-1",
    nis: "24009",
    namaSiswa: "Farhan Maulana",
    kelas: "X IPA 2",
    kategori: "ABSENSI_TINGGI",
    poin: -25,
    deskripsi: "Akumulasi alpha 5 kali berturut-turut tanpa surat izin resmi dari orang tua.",
    tindakan: "Panggilan orang tua ke ruang BK untuk klarifikasi komitmen kehadiran.",
    status: "PANGGILAN_ORTU",
    tanggalKasus: "23 Juli 2026",
    guruBK: "Dra. Endang Rahayu, M.Pd (Koord. BK)",
    waliKelas: "Budi Santoso, S.Pd",
    nomorSuratPanggilan: "421.3/089/SMA.03/BK/VII/2026",
    jadwalPanggilanOrtu: "Jumat, 25 Juli 2026 pukul 09.00 WIB",
  },
  {
    id: "bk-2",
    nis: "24005",
    namaSiswa: "Dedi Kurniawan",
    kelas: "X IPA 1",
    kategori: "KEDISIPLINAN",
    poin: -15,
    deskripsi: "Terlambat masuk sekolah lebih dari 3 kali dalam seminggu dan sering meninggalkan jam KBM ke-3.",
    tindakan: "Bimbingan konseling individual dan penugasan piket literasi perpustakaan.",
    status: "DALAM_PEMBINAAN",
    tanggalKasus: "22 Juli 2026",
    guruBK: "Dra. Endang Rahayu, M.Pd (Koord. BK)",
    waliKelas: "Sari Wulandari, S.Pd",
  },
  {
    id: "bk-3",
    nis: "24006",
    namaSiswa: "Gilang Pratama",
    kelas: "X IPA 1",
    kategori: "PRESTASI",
    poin: +30,
    deskripsi: "Mewakili sekolah dan meraih medali perak pada Olimpiade Sains Nasional (OSN) Matematika tingkat kota.",
    tindakan: "Pemberian piagam penghargaan pada upacara bendera dan poin apresiasi karakter.",
    status: "SELESAI",
    tanggalKasus: "21 Juli 2026",
    guruBK: "Dra. Endang Rahayu, M.Pd (Koord. BK)",
    waliKelas: "Sari Wulandari, S.Pd",
  },
];

const daftarIzinAwal: PermohonanIzin[] = [
  {
    id: "iz-1",
    nis: "24003",
    namaSiswa: "Aisyah Zahra",
    kelas: "X IPA 1",
    jenis: "SAKIT",
    tanggalMulai: "23 Juli 2026",
    tanggalSelesai: "24 Juli 2026",
    alasan: "Demam tinggi & radang tenggorokan (Surat dokter terlampir)",
    status: "DISETUJUI",
    diajukanOleh: "Wali Murid (Ibu Ratna)",
    tanggalPengajuan: "23 Juli 2026 06.30",
    disetujuiOleh: "Sari Wulandari, S.Pd (Wali Kelas)",
  },
  {
    id: "iz-2",
    nis: "24006",
    namaSiswa: "Gilang Pratama",
    kelas: "X IPA 1",
    jenis: "DISPENSASI",
    tanggalMulai: "23 Juli 2026",
    tanggalSelesai: "23 Juli 2026",
    alasan: "Mewakili sekolah dalam Olimpiade Sains Nasional (OSN) Matematika",
    status: "DISETUJUI",
    diajukanOleh: "Pembina OSIS / Ekstrakurikuler",
    tanggalPengajuan: "22 Juli 2026 14.15",
    disetujuiOleh: "Drs. Hendra Wijaya (Kepala Sekolah)",
  },
  {
    id: "iz-3",
    nis: "24007",
    namaSiswa: "Hafiz Aditya",
    kelas: "XI IPA 1",
    jenis: "IZIN",
    tanggalMulai: "23 Juli 2026",
    tanggalSelesai: "23 Juli 2026",
    alasan: "Keperluan keluarga di luar kota (Pernikahan saudara kandung)",
    status: "MENUNGGU",
    diajukanOleh: "Wali Murid (Bpk. Subagio)",
    tanggalPengajuan: "23 Juli 2026 07.10",
  },
];

interface StoreValue {
  daftarGuru: Guru[];
  daftarKelas: Kelas[];
  jadwal: JadwalEntry[];
  absensiTersimpanHariIni: string[];
  absensiRecord: Record<string, Siswa[]>;
  jurnalList: JurnalEntry[];
  daftarIzin: PermohonanIzin[];
  kasusBKList: KasusBK[];
  presensiGuruList: PresensiGuruRecord[];
  checkInGuru: (guruId: string, status?: StatusPresensiGuru, keterangan?: string) => void;
  checkOutGuru: (guruId: string) => void;
  tambahKasusBK: (kasus: Omit<KasusBK, "id">) => void;
  updateStatusKasusBK: (id: string, status: StatusKasusBK, tindakan?: string) => void;
  currentUser: CurrentUser;
  tambahGuru: (guru: Omit<Guru, "id">) => void;
  tambahJadwal: (entry: Omit<JadwalEntry, "id">) => void;
  hapusJadwal: (id: string) => void;
  simpanAbsensi: (jadwalId: string, siswaList: Siswa[]) => void;
  ambilDataSiswa: (jadwalId: string) => Siswa[];
  simpanJurnal: (entry: Omit<JurnalEntry, "id">) => void;
  tambahIzin: (izin: Omit<PermohonanIzin, "id" | "status" | "tanggalPengajuan">) => void;
  updateStatusIzin: (id: string, status: StatusIzin, approverNama?: string) => void;
  loginAs: (role: UserRole, email?: string) => void;
  logout: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [daftarGuru, setDaftarGuru] = useState<Guru[]>(daftarGuruAwal);
  const [daftarKelas] = useState<Kelas[]>(daftarKelasAwal);
  const [jadwal, setJadwal] = useState<JadwalEntry[]>(jadwalAwal);
  const [absensiTersimpanHariIni, setAbsensiTersimpanHariIni] =
    useState<string[]>(absensiAwal);
  const [absensiRecord, setAbsensiRecord] = useState<Record<string, Siswa[]>>({
    j2: buatSiswa(),
  });
  const [jurnalList, setJurnalList] = useState<JurnalEntry[]>(daftarJurnalAwal);
  const [daftarIzin, setDaftarIzin] = useState<PermohonanIzin[]>(daftarIzinAwal);
  const [kasusBKList, setKasusBKList] = useState<KasusBK[]>(daftarKasusBKAwal);
  const [presensiGuruList, setPresensiGuruList] = useState<PresensiGuruRecord[]>(daftarPresensiGuruAwal);

  const [currentUser, setCurrentUser] = useState<CurrentUser>(USER_GURU_DEFAULT);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hadirin_session_user");
      if (saved) {
        setCurrentUser(JSON.parse(saved) as CurrentUser);
      }
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      daftarGuru,
      daftarKelas,
      jadwal,
      absensiTersimpanHariIni,
      absensiRecord,
      jurnalList,
      daftarIzin,
      kasusBKList,
      presensiGuruList,
      checkInGuru: (guruId: string, customStatus?: StatusPresensiGuru, keterangan?: string) => {
        const jamSekarang = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
        const guru = daftarGuru.find((g) => g.id === guruId) || {
          nama: "Sari Wulandari, S.Pd",
          id: guruId,
        };
        const status: StatusPresensiGuru = customStatus || (new Date().getHours() < 7 ? "TEPAT_WAKTU" : "TERLAMBAT");

        setPresensiGuruList((prev) => {
          const existing = prev.find((p) => p.guruId === guruId);
          if (existing) {
            return prev.map((p) =>
              p.guruId === guruId
                ? { ...p, jamMasuk: jamSekarang, status, keterangan: keterangan || p.keterangan }
                : p
            );
          }
          return [
            {
              id: `pg-${Date.now()}`,
              guruId,
              nama: guru.nama,
              nip: "19850412 200902 2 003",
              jabatan: "Guru Pengajar",
              tanggal: "Kamis, 24 Juli 2026",
              jamMasuk: jamSekarang,
              status,
              keterangan: keterangan || (status === "TEPAT_WAKTU" ? "Presensi mandiri pagi" : "Presensi terlambat"),
              lokasi: "SMA Negeri 3 Contoh",
            },
            ...prev,
          ];
        });
      },
      checkOutGuru: (guruId: string) => {
        const jamSekarang = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
        setPresensiGuruList((prev) =>
          prev.map((p) =>
            p.guruId === guruId ? { ...p, jamPulang: jamSekarang } : p
          )
        );
      },
      currentUser,
      tambahGuru: (guru) =>
        setDaftarGuru((prev) => [
          ...prev,
          { ...guru, id: `g-${Date.now()}` },
        ]),
      tambahJadwal: (entry) =>
        setJadwal((prev) => [...prev, { ...entry, id: `j-${Date.now()}` }]),
      hapusJadwal: (id) =>
        setJadwal((prev) => prev.filter((j) => j.id !== id)),
      simpanAbsensi: (jadwalId: string, siswaList: Siswa[]) => {
        setAbsensiRecord((prev) => ({ ...prev, [jadwalId]: siswaList }));
        setAbsensiTersimpanHariIni((prev) =>
          prev.includes(jadwalId) ? prev : [...prev, jadwalId]
        );
      },
      ambilDataSiswa: (jadwalId: string) => {
        if (absensiRecord[jadwalId]) {
          return absensiRecord[jadwalId];
        }
        return buatSiswa();
      },
      simpanJurnal: (entry: Omit<JurnalEntry, "id">) => {
        setJurnalList((prev) => [
          { ...entry, id: `jur-${Date.now()}` },
          ...prev.filter((j) => j.jadwalId !== entry.jadwalId),
        ]);
      },
      tambahIzin: (izin) => {
        const jamSekarang = new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const tanggalSekarang = `23 Juli 2026 ${jamSekarang}`;
        setDaftarIzin((prev) => [
          {
            ...izin,
            id: `iz-${Date.now()}`,
            status: "MENUNGGU",
            tanggalPengajuan: tanggalSekarang,
          },
          ...prev,
        ]);
      },
      tambahKasusBK: (kasus: Omit<KasusBK, "id">) => {
        setKasusBKList((prev) => [
          { ...kasus, id: `bk-${Date.now()}` },
          ...prev,
        ]);
      },
      updateStatusKasusBK: (id: string, status: StatusKasusBK, tindakan?: string) => {
        setKasusBKList((prev) =>
          prev.map((k) =>
            k.id === id
              ? { ...k, status, tindakan: tindakan || k.tindakan }
              : k
          )
        );
      },
      updateStatusIzin: (id: string, status: StatusIzin, approverNama?: string) => {
        setDaftarIzin((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status,
                  disetujuiOleh:
                    approverNama ||
                    (status === "DISETUJUI"
                      ? "Sari Wulandari, S.Pd (Wali Kelas)"
                      : undefined),
                }
              : i
          )
        );
      },
      loginAs: (role: UserRole, email?: string) => {
        const user: CurrentUser =
          role === "admin"
            ? {
                ...USER_ADMIN_DEFAULT,
                email: email || USER_ADMIN_DEFAULT.email,
              }
            : {
                ...USER_GURU_DEFAULT,
                email: email || USER_GURU_DEFAULT.email,
              };
        setCurrentUser(user);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("hadirin_session_user", JSON.stringify(user));
          } catch {
            // ignore localStorage error
          }
        }
      },
      logout: () => {
        setCurrentUser(USER_GURU_DEFAULT);
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("hadirin_session_user");
          } catch {
            // ignore
          }
        }
      },
    }),
    [
      daftarGuru,
      daftarKelas,
      jadwal,
      absensiTersimpanHariIni,
      absensiRecord,
      jurnalList,
      daftarIzin,
      kasusBKList,
      presensiGuruList,
      currentUser,
    ]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore harus dipakai di dalam <StoreProvider>");
  }
  return ctx;
}

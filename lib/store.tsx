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

export type UserRole =
  | "super_admin"
  | "admin_sekolah"
  | "kepsek"
  | "tu"
  | "guru"
  | "siswa"
  | "orang_tua"
  | "admin";

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


export interface MataPelajaran {
  id: string;
  kode: string;
  nama: string;
  kelompok: "A (Wajib)" | "B (Umum)" | "C (Peminatan)" | "Muatan Lokal";
  tingkat: "Semua Tingkat" | "Kelas X" | "Kelas XI" | "Kelas XII";
  bebanJam: number;
  guruPengampu: string;
  status: "AKTIF" | "NONAKTIF";
}

export const daftarMapelAwal: MataPelajaran[] = [
  { id: "mp-1", kode: "MAT-W", nama: "Matematika Wajib", kelompok: "A (Wajib)", tingkat: "Semua Tingkat", bebanJam: 4, guruPengampu: "Sari Wulandari, S.Pd", status: "AKTIF" },
  { id: "mp-2", kode: "IND-W", nama: "Bahasa Indonesia", kelompok: "A (Wajib)", tingkat: "Semua Tingkat", bebanJam: 4, guruPengampu: "Dewi Lestari, M.Pd", status: "AKTIF" },
  { id: "mp-3", kode: "ING-W", nama: "Bahasa Inggris", kelompok: "A (Wajib)", tingkat: "Semua Tingkat", bebanJam: 3, guruPengampu: "Rian Pratama, S.Pd", status: "AKTIF" },
  { id: "mp-4", kode: "PAI-W", nama: "Pendidikan Agama & Budi Pekerti", kelompok: "A (Wajib)", tingkat: "Semua Tingkat", bebanJam: 3, guruPengampu: "Ahmad Fauzi, S.Pd", status: "AKTIF" },
  { id: "mp-5", kode: "PPKN-W", nama: "Pendidikan Pancasila", kelompok: "A (Wajib)", tingkat: "Semua Tingkat", bebanJam: 2, guruPengampu: "Drs. Hendra Wijaya, M.Pd", status: "AKTIF" },
  { id: "mp-6", kode: "FIS-P", nama: "Fisika Peminatan", kelompok: "C (Peminatan)", tingkat: "Kelas X", bebanJam: 4, guruPengampu: "Bambang Santoso, M.Si", status: "AKTIF" },
  { id: "mp-7", kode: "BIO-P", nama: "Biologi Peminatan", kelompok: "C (Peminatan)", tingkat: "Kelas X", bebanJam: 4, guruPengampu: "Dr. Retno Wahyuni", status: "AKTIF" },
  { id: "mp-8", kode: "KIM-P", nama: "Kimia Peminatan", kelompok: "C (Peminatan)", tingkat: "Kelas XI", bebanJam: 4, guruPengampu: "Agus Salim, M.Pd", status: "AKTIF" },
  { id: "mp-9", kode: "INF-B", nama: "Informatika & Koding", kelompok: "B (Umum)", tingkat: "Kelas X", bebanJam: 3, guruPengampu: "Rifqi Pratama, S.Kom", status: "AKTIF" },
  { id: "mp-10", kode: "PJK-B", nama: "Pendidikan Jasmani & Olahraga", kelompok: "B (Umum)", tingkat: "Semua Tingkat", bebanJam: 3, guruPengampu: "Hadi Purnomo, S.Pd", status: "AKTIF" },
  { id: "mp-11", kode: "BD-ML", nama: "Bahasa Daerah (Sunda/Jawa)", kelompok: "Muatan Lokal", tingkat: "Kelas X", bebanJam: 2, guruPengampu: "Siti Rahmawati, S.Pd", status: "AKTIF" },
];

export interface SiswaInduk {
  id: string;
  nisn: string;
  nis: string;
  nama: string;
  gender: "L" | "P";
  kelas: string;
  waliKelas: string;
  namaWali: string;
  teleponWali: string;
  status: "AKTIF" | "MUTASI" | "ALUMNI";
}

export const daftarSiswaIndukAwal: SiswaInduk[] = [
  { id: "s-1", nisn: "0067891234", nis: "24001", nama: "Ahmad Fadillah", gender: "L", kelas: "X IPA 1", waliKelas: "Sari Wulandari, S.Pd", namaWali: "Rahmat Fadillah", teleponWali: "0812-1111-2222", status: "AKTIF" },
  { id: "s-2", nisn: "0067891235", nis: "24002", nama: "Bunga Citra", gender: "P", kelas: "X IPA 1", waliKelas: "Sari Wulandari, S.Pd", namaWali: "Ir. Bambang S.", teleponWali: "0812-2222-3333", status: "AKTIF" },
  { id: "s-3", nisn: "0067891236", nis: "24003", nama: "Dedi Kurniawan", gender: "L", kelas: "X IPA 1", waliKelas: "Sari Wulandari, S.Pd", namaWali: "Kurnia Sandi", teleponWali: "0812-3333-4444", status: "AKTIF" },
  { id: "s-4", nisn: "0067891237", nis: "24004", nama: "Eka Putri", gender: "P", kelas: "X IPA 2", waliKelas: "Bambang Santoso, M.Si", namaWali: "Hj. Ratna Sari", teleponWali: "0813-4444-5555", status: "AKTIF" },
  { id: "s-5", nisn: "0067891238", nis: "24005", nama: "Farhan Maulana", gender: "L", kelas: "X IPA 2", waliKelas: "Bambang Santoso, M.Si", namaWali: "Maulana Malik", teleponWali: "0813-5555-6666", status: "AKTIF" },
  { id: "s-6", nisn: "0067891239", nis: "24006", nama: "Gita Ramadhani", gender: "P", kelas: "XI IPA 1", waliKelas: "Dewi Lestari, M.Pd", namaWali: "Ramadhan Effendi", teleponWali: "0815-6666-7777", status: "AKTIF" },
  { id: "s-7", nisn: "0067891240", nis: "24007", nama: "Hafiz Aditya", gender: "L", kelas: "XI IPA 1", waliKelas: "Dewi Lestari, M.Pd", namaWali: "Aditya Pratama", teleponWali: "0815-7777-8888", status: "AKTIF" },
  { id: "s-8", nisn: "0067891241", nis: "24008", nama: "Indah Permata", gender: "P", kelas: "XI IPA 2", waliKelas: "Ahmad Fauzi, S.Pd", namaWali: "Permata Wijaya", teleponWali: "0816-8888-9999", status: "AKTIF" },
  { id: "s-9", nisn: "0067891242", nis: "24009", nama: "Joko Prasetyo", gender: "L", kelas: "XI IPA 2", waliKelas: "Ahmad Fauzi, S.Pd", namaWali: "Prasetyo Utomo", teleponWali: "0817-9999-0000", status: "AKTIF" },
  { id: "s-10", nisn: "0067891243", nis: "24010", nama: "Kirana Salsabila", gender: "P", kelas: "XII IPA 1", waliKelas: "Rian Pratama, S.Pd", namaWali: "H. Hendro Suwito", teleponWali: "0818-1234-5678", status: "AKTIF" },
  { id: "s-11", nisn: "0067891244", nis: "24011", nama: "Lutfi Hakim", gender: "L", kelas: "XII IPA 1", waliKelas: "Rian Pratama, S.Pd", namaWali: "Lukman Hakim", teleponWali: "0818-2345-6789", status: "AKTIF" },
  { id: "s-12", nisn: "0067891245", nis: "24012", nama: "Mutiara Anjani", gender: "P", kelas: "XII IPS 1", waliKelas: "Dr. Retno Wahyuni", namaWali: "Anjani Dewi", teleponWali: "0819-3456-7890", status: "AKTIF" },
];


export interface TagihanSPP {
  id: string;
  noKwitansi: string;
  siswaId: string;
  siswaNama: string;
  nisn: string;
  kelas: string;
  bulan: string;
  nominal: number;
  status: "LUNAS" | "BELUM_BAYAR" | "MENUNGGU_KONFIRMASI";
  tanggalBayar?: string;
  metodeBayar?: "TRANSFER_BANK" | "TUNAI_KASIR" | "QRIS";
  catatan?: string;
}

export const daftarTagihanSPPAwal: TagihanSPP[] = [
  { id: "spp-1", noKwitansi: "KW-202607-001", siswaId: "s-1", siswaNama: "Ahmad Fadillah", nisn: "0067891234", kelas: "X IPA 1", bulan: "Juli 2026", nominal: 350000, status: "LUNAS", tanggalBayar: "2026-07-05", metodeBayar: "TRANSFER_BANK", catatan: "Transfer BCA Virtual Account" },
  { id: "spp-2", noKwitansi: "KW-202607-002", siswaId: "s-2", siswaNama: "Bunga Citra", nisn: "0067891235", kelas: "X IPA 1", bulan: "Juli 2026", nominal: 350000, status: "LUNAS", tanggalBayar: "2026-07-08", metodeBayar: "QRIS", catatan: "Pembayaran QRIS Hadirin" },
  { id: "spp-3", noKwitansi: "KW-202607-003", siswaId: "s-3", siswaNama: "Dedi Kurniawan", nisn: "0067891236", kelas: "X IPA 1", bulan: "Juli 2026", nominal: 350000, status: "BELUM_BAYAR" },
  { id: "spp-4", noKwitansi: "KW-202607-004", siswaId: "s-4", siswaNama: "Eka Putri", nisn: "0067891237", kelas: "X IPA 2", bulan: "Juli 2026", nominal: 350000, status: "LUNAS", tanggalBayar: "2026-07-10", metodeBayar: "TUNAI_KASIR", catatan: "Bayar Tunai di TU Sekolah" },
  { id: "spp-5", noKwitansi: "KW-202607-005", siswaId: "s-5", siswaNama: "Farhan Maulana", nisn: "0067891238", kelas: "X IPA 2", bulan: "Juli 2026", nominal: 350000, status: "BELUM_BAYAR" },
  { id: "spp-6", noKwitansi: "KW-202607-006", siswaId: "s-6", siswaNama: "Gita Ramadhani", nisn: "0067891239", kelas: "XI IPA 1", bulan: "Juli 2026", nominal: 400000, status: "LUNAS", tanggalBayar: "2026-07-04", metodeBayar: "TRANSFER_BANK", catatan: "Transfer Bank Mandiri" },
  { id: "spp-7", noKwitansi: "KW-202607-007", siswaId: "s-7", siswaNama: "Hafiz Aditya", nisn: "0067891240", kelas: "XI IPA 1", bulan: "Juli 2026", nominal: 400000, status: "MENUNGGU_KONFIRMASI", tanggalBayar: "2026-07-12", metodeBayar: "TRANSFER_BANK", catatan: "Menunggu verifikasi bukti transfer" },
  { id: "spp-8", noKwitansi: "KW-202607-008", siswaId: "s-8", siswaNama: "Indah Permata", nisn: "0067891241", kelas: "XI IPA 2", bulan: "Juli 2026", nominal: 400000, status: "LUNAS", tanggalBayar: "2026-07-07", metodeBayar: "QRIS" },
  { id: "spp-9", noKwitansi: "KW-202607-009", siswaId: "s-9", siswaNama: "Joko Prasetyo", nisn: "0067891242", kelas: "XI IPA 2", bulan: "Juli 2026", nominal: 400000, status: "BELUM_BAYAR" },
  { id: "spp-10", noKwitansi: "KW-202607-010", siswaId: "s-10", siswaNama: "Kirana Salsabila", nisn: "0067891243", kelas: "XII IPA 1", bulan: "Juli 2026", nominal: 450000, status: "LUNAS", tanggalBayar: "2026-07-02", metodeBayar: "TRANSFER_BANK" },
  { id: "spp-11", noKwitansi: "KW-202607-011", siswaId: "s-11", siswaNama: "Lutfi Hakim", nisn: "0067891244", kelas: "XII IPA 1", bulan: "Juli 2026", nominal: 450000, status: "LUNAS", tanggalBayar: "2026-07-03", metodeBayar: "TUNAI_KASIR" },
  { id: "spp-12", noKwitansi: "KW-202607-012", siswaId: "s-12", siswaNama: "Mutiara Anjani", nisn: "0067891245", kelas: "XII IPS 1", bulan: "Juli 2026", nominal: 450000, status: "BELUM_BAYAR" },
];


export interface Tugas {
  id: string;
  judul: string;
  mapel: string;
  kelas: string;
  guruNama: string;
  deadline: string;
  deskripsi: string;
  totalSiswa: number;
  sudahMengumpulkan: number;
  sudahDinilai: number;
  status: "AKTIF" | "SELESAI" | "DRAFT";
}

export const daftarTugasAwal: Tugas[] = [
  { id: "t-1", judul: "Latihan Persamaan Kuadrat & Aljabar", mapel: "Matematika Wajib", kelas: "X IPA 1", guruNama: "Sari Wulandari, S.Pd", deadline: "2026-08-05 23:59", deskripsi: "Kerjakan 10 soal pada modul hal. 42 lalu kumpulkan dalam format PDF.", totalSiswa: 20, sudahMengumpulkan: 18, sudahDinilai: 15, status: "AKTIF" },
  { id: "t-2", judul: "Teks Laporan Hasil Observasi Lapangan", mapel: "Bahasa Indonesia", kelas: "X IPA 1", guruNama: "Dewi Lestari, M.Pd", deadline: "2026-08-08 23:59", deskripsi: "Laporan observasi ekosistem taman sekolah minimal 500 kata dengan struktur yang tepat.", totalSiswa: 20, sudahMengumpulkan: 12, sudahDinilai: 8, status: "AKTIF" },
  { id: "t-3", judul: "Praktikum Hukum Newton & Gerak Lurus", mapel: "Fisika Peminatan", kelas: "X IPA 2", guruNama: "Bambang Santoso, M.Si", deadline: "2026-07-28 23:59", deskripsi: "Laporan praktikum mandiri dengan grafik percepatan.", totalSiswa: 20, sudahMengumpulkan: 20, sudahDinilai: 20, status: "SELESAI" },
  { id: "t-4", judul: "Essay Opinion: Digital Transformation in Education", mapel: "Bahasa Inggris", kelas: "XI IPA 1", guruNama: "Rian Pratama, S.Pd", deadline: "2026-08-10 23:59", deskripsi: "Write an opinion essay arguing the pros and cons of AI in schools.", totalSiswa: 20, sudahMengumpulkan: 9, sudahDinilai: 4, status: "AKTIF" },
];

export interface MateriAjar {
  id: string;
  judul: string;
  mapel: string;
  kelas: string;
  guruNama: string;
  tipe: "PDF" | "VIDEO" | "SLIDE" | "DOKUMEN";
  fileUrl: string;
  ukuranFile: string;
  tanggalUpload: string;
}

export const daftarMateriAwal: MateriAjar[] = [
  { id: "m-1", judul: "Modul 01 - Pengenalan Fungsi & Persamaan Kuadrat", mapel: "Matematika Wajib", kelas: "X IPA 1", guruNama: "Sari Wulandari, S.Pd", tipe: "PDF", fileUrl: "#", ukuranFile: "2.4 MB", tanggalUpload: "2026-07-15" },
  { id: "m-2", judul: "Slide PPT - Struktur & Kaidah Teks Observasi", mapel: "Bahasa Indonesia", kelas: "X IPA 1", guruNama: "Dewi Lestari, M.Pd", tipe: "SLIDE", fileUrl: "#", ukuranFile: "4.1 MB", tanggalUpload: "2026-07-17" },
  { id: "m-3", judul: "Video Animasi - Hukum Gerak Newton I, II, & III", mapel: "Fisika Peminatan", kelas: "X IPA 2", guruNama: "Bambang Santoso, M.Si", tipe: "VIDEO", fileUrl: "#", ukuranFile: "18.5 MB", tanggalUpload: "2026-07-20" },
  { id: "m-4", judul: "Modul Praktikum - Sel & Jaringan Tumbuhan", mapel: "Biologi Peminatan", kelas: "X IPA 1", guruNama: "Dr. Retno Wahyuni", tipe: "PDF", fileUrl: "#", ukuranFile: "3.2 MB", tanggalUpload: "2026-07-22" },
  { id: "m-5", judul: "Handout - Analytical Exposition Text", mapel: "Bahasa Inggris", kelas: "XI IPA 1", guruNama: "Rian Pratama, S.Pd", tipe: "DOKUMEN", fileUrl: "#", ukuranFile: "1.1 MB", tanggalUpload: "2026-07-24" },
];

export interface NilaiSiswa {
  id: string;
  siswaId: string;
  siswaNama: string;
  nisn: string;
  kelas: string;
  mapel: string;
  nilaiTugas: number;
  nilaiFormatif: number;
  nilaiSumatif: number;
  nilaiAkhir: number;
  predikat: "A" | "B" | "C" | "D";
  capaianKompetensi: string;
}

export const daftarNilaiAwal: NilaiSiswa[] = [
  { id: "n-1", siswaId: "s-1", siswaNama: "Ahmad Fadillah", nisn: "0067891234", kelas: "X IPA 1", mapel: "Matematika Wajib", nilaiTugas: 88, nilaiFormatif: 85, nilaiSumatif: 90, nilaiAkhir: 88, predikat: "A", capaianKompetensi: "Sangat menguasai konsep fungsi aljabar dan pemecahan masalah persamaan kuadrat." },
  { id: "n-2", siswaId: "s-2", siswaNama: "Bunga Citra", nisn: "0067891235", kelas: "X IPA 1", mapel: "Matematika Wajib", nilaiTugas: 92, nilaiFormatif: 90, nilaiSumatif: 94, nilaiAkhir: 92, predikat: "A", capaianKompetensi: "Istimewa dalam penalaran matematis dan pemodelan grafik fungsi." },
  { id: "n-3", siswaId: "s-3", siswaNama: "Dedi Kurniawan", nisn: "0067891236", kelas: "X IPA 1", mapel: "Matematika Wajib", nilaiTugas: 75, nilaiFormatif: 72, nilaiSumatif: 74, nilaiAkhir: 74, predikat: "C", capaianKompetensi: "Cukup memahami konsep aljabar, perlu penguatan dalam latihan perhitungan akar persamaan." },
  { id: "n-4", siswaId: "s-4", siswaNama: "Eka Putri", nisn: "0067891237", kelas: "X IPA 2", mapel: "Matematika Wajib", nilaiTugas: 85, nilaiFormatif: 84, nilaiSumatif: 86, nilaiAkhir: 85, predikat: "B", capaianKompetensi: "Menguasai konsep fungsi kuadrat dengan baik serta aktif dalam penugasan mandiri." },
  { id: "n-5", siswaId: "s-5", siswaNama: "Farhan Maulana", nisn: "0067891238", kelas: "X IPA 2", mapel: "Matematika Wajib", nilaiTugas: 78, nilaiFormatif: 76, nilaiSumatif: 80, nilaiAkhir: 78, predikat: "B", capaianKompetensi: "Mampu menyelesaikan persoalan matematika dasar dan persamaan linear." },
  { id: "n-6", siswaId: "s-6", siswaNama: "Gita Ramadhani", nisn: "0067891239", kelas: "XI IPA 1", mapel: "Bahasa Inggris", nilaiTugas: 95, nilaiFormatif: 92, nilaiSumatif: 94, nilaiAkhir: 94, predikat: "A", capaianKompetensi: "Sangat fasih dalam penulisan essay argumentatif dan penguasaan vocabulary akademik." },
  { id: "n-7", siswaId: "s-7", siswaNama: "Hafiz Aditya", nisn: "0067891240", kelas: "XI IPA 1", mapel: "Bahasa Inggris", nilaiTugas: 82, nilaiFormatif: 80, nilaiSumatif: 84, nilaiAkhir: 82, predikat: "B", capaianKompetensi: "Mampu menyusun opini dan mengekspresikan ide dalam bahasa Inggris secara terstruktur." },
  { id: "n-8", siswaId: "s-8", siswaNama: "Indah Permata", nisn: "0067891241", kelas: "XI IPA 2", mapel: "Fisika Peminatan", nilaiTugas: 88, nilaiFormatif: 86, nilaiSumatif: 89, nilaiAkhir: 88, predikat: "A", capaianKompetensi: "Sangat baik dalam analisis gerak rotasi dan penerapan hukum dinamika Newton." },
];

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

export const USER_SUPER_ADMIN_DEFAULT: CurrentUser = {
  id: "sa-1",
  nama: "Rifqi Pratama, S.Kom",
  email: "owner@hadirin.id",
  role: "super_admin",
  jabatan: "SaaS Platform Owner",
  sekolah: "Hadirin Cloud Platform (Multi-Tenant)",
};

export const USER_ADMIN_SEKOLAH_DEFAULT: CurrentUser = {
  id: "as-1",
  nama: "Ahmad Fauzi, S.Pd",
  email: "admin@sman3contoh.sch.id",
  role: "admin_sekolah",
  jabatan: "Admin Institusi Sekolah",
  sekolah: "SMA Negeri 3 Contoh",
};

export const USER_KEPSEK_DEFAULT: CurrentUser = {
  id: "admin-1",
  nama: "Drs. Hendra Wijaya, M.Pd",
  email: "kepsek@sman3contoh.sch.id",
  role: "kepsek",
  jabatan: "Kepala Sekolah",
  sekolah: "SMA Negeri 3 Contoh",
};

export const USER_TU_DEFAULT: CurrentUser = {
  id: "tu-1",
  nama: "Dra. Hj. Sri Wahyuni, M.Ak",
  email: "tu@sman3contoh.sch.id",
  role: "tu",
  jabatan: "Kaur Tata Usaha & Keuangan",
  sekolah: "SMA Negeri 3 Contoh",
};

export const USER_SISWA_DEFAULT: CurrentUser = {
  id: "s1",
  nama: "Ahmad Fadillah",
  email: "ahmad.fadillah@sman3contoh.sch.id",
  role: "siswa",
  jabatan: "Siswa Kelas X IPA 1 (NIS 24001)",
  sekolah: "SMA Negeri 3 Contoh",
};

export const USER_ORTU_DEFAULT: CurrentUser = {
  id: "ortu-1",
  nama: "Bpk. Rahmat Fadillah",
  email: "ortu.ahmad@gmail.com",
  role: "orang_tua",
  jabatan: "Wali Murid - Ahmad Fadillah",
  sekolah: "SMA Negeri 3 Contoh",
};

export const USER_ADMIN_DEFAULT: CurrentUser = USER_ADMIN_SEKOLAH_DEFAULT;

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
  tingkat?: "Kelas X" | "Kelas XI" | "Kelas XII";
  jurusan?: "MIPA" | "IPS" | "Umum / Fase E" | "Bahasa";
  waliKelas?: string;
  ruangan?: string;
  kapasitas?: number;
  kurikulum?: "Kurikulum Merdeka" | "Kurikulum 2013";
  tahunAjaran?: string;
  semester?: "Ganjil" | "Genap";
  status?: "AKTIF" | "ARSIP";
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

export interface AgendaAkademik {
  id: string;
  judul: string;
  kategori: "UJIAN" | "LIBUR" | "KBM" | "RAPOR" | "KEGIATAN_SEKOLAH" | "RAPAT_GURU";
  tanggalMulai: string;
  tanggalSelesai: string;
  sasaran: "SEMUA" | "GURU" | "SISWA" | "ORANG_TUA";
  keterangan?: string;
  warna?: "emerald" | "sky" | "amber" | "rose" | "purple" | "indigo";
}

export const daftarAgendaAkademikAwal: AgendaAkademik[] = [
  {
    id: "ag-1",
    judul: "Masa Pengenalan Lingkungan Sekolah (MPLS) Siswa Baru",
    kategori: "KEGIATAN_SEKOLAH",
    tanggalMulai: "2024-07-15",
    tanggalSelesai: "2024-07-19",
    sasaran: "SEMUA",
    keterangan: "Kegiatan orientasi lingkungan dan pembentukan karakter bagi peserta didik kelas X.",
    warna: "sky",
  },
  {
    id: "ag-2",
    judul: "Awal Masuk KBM Efektif Semester Ganjil 2024/2025",
    kategori: "KBM",
    tanggalMulai: "2024-07-22",
    tanggalSelesai: "2024-07-22",
    sasaran: "SEMUA",
    keterangan: "Hari pertama KBM tatap muka aktif seluruh tingkatan kelas X, XI, dan XII.",
    warna: "emerald",
  },
  {
    id: "ag-3",
    judul: "Peringatan HUT Kemerdekaan RI ke-79 & Libur Nasional",
    kategori: "LIBUR",
    tanggalMulai: "2024-08-17",
    tanggalSelesai: "2024-08-17",
    sasaran: "SEMUA",
    keterangan: "Upacara bendera HUT RI ke-79 dan perlombaan semarak kemerdekaan antarkelas.",
    warna: "rose",
  },
  {
    id: "ag-4",
    judul: "Penilaian Tengah Semester (PTS) / Formatif Tengah Ganjil",
    kategori: "UJIAN",
    tanggalMulai: "2024-09-16",
    tanggalSelesai: "2024-09-20",
    sasaran: "SISWA",
    keterangan: "Ujian tertulis dan praktik tengah semester berbasis CBT.",
    warna: "amber",
  },
  {
    id: "ag-5",
    judul: "Asesmen Nasional Berbasis Komputer (ANBK) Tingkat SMA",
    kategori: "UJIAN",
    tanggalMulai: "2024-10-14",
    tanggalSelesai: "2024-10-17",
    sasaran: "SISWA",
    keterangan: "Pelaksanaan ANBK sampling siswa kelas XI di Laboratorium Multimedia.",
    warna: "purple",
  },
  {
    id: "ag-6",
    judul: "Peringatan Hari Sumpah Pemuda & Pentas Bulan Bahasa",
    kategori: "KEGIATAN_SEKOLAH",
    tanggalMulai: "2024-10-28",
    tanggalSelesai: "2024-10-28",
    sasaran: "SEMUA",
    keterangan: "Gebyar lomba literasi puisi, pidato 3 bahasa, dan penampilan minat bakat seni.",
    warna: "indigo",
  },
  {
    id: "ag-7",
    judul: "Upacara Hari Guru Nasional & Rapat Koordinasi PTK",
    kategori: "RAPAT_GURU",
    tanggalMulai: "2024-11-25",
    tanggalSelesai: "2024-11-25",
    sasaran: "GURU",
    keterangan: "Apresiasi guru berprestasi dan rapat persiapan Penilaian Akhir Semester.",
    warna: "sky",
  },
  {
    id: "ag-8",
    judul: "Penilaian Akhir Semester (PAS) / Sumatif Akhir Semester",
    kategori: "UJIAN",
    tanggalMulai: "2024-12-02",
    tanggalSelesai: "2024-12-13",
    sasaran: "SISWA",
    keterangan: "Pekan asesmen sumatif serentak semester ganjil seluruh mata pelajaran.",
    warna: "rose",
  },
  {
    id: "ag-9",
    judul: "Pekan Remedial & Rapat Pleno Nilai Rapor",
    kategori: "RAPAT_GURU",
    tanggalMulai: "2024-12-16",
    tanggalSelesai: "2024-12-19",
    sasaran: "GURU",
    keterangan: "Input nilai akhir rapor pada sistem Hadirin dan pengesahan oleh Kepala Sekolah.",
    warna: "amber",
  },
  {
    id: "ag-10",
    judul: "Pembagian E-Rapor Hasil Belajar Semester Ganjil",
    kategori: "RAPOR",
    tanggalMulai: "2024-12-20",
    tanggalSelesai: "2024-12-20",
    sasaran: "ORANG_TUA",
    keterangan: "Pengambilan lembar rapor oleh orang tua/wali murid di masing-masing rombel.",
    warna: "emerald",
  },
  {
    id: "ag-11",
    judul: "Libur Akhir Semester Ganjil 2024/2025",
    kategori: "LIBUR",
    tanggalMulai: "2024-12-23",
    tanggalSelesai: "2025-01-04",
    sasaran: "SEMUA",
    keterangan: "Masa libur semester ganjil siswa dan cuti bersama pendidik.",
    warna: "rose",
  },
  {
    id: "ag-12",
    judul: "Awal Masuk KBM Efektif Semester Genap 2024/2025",
    kategori: "KBM",
    tanggalMulai: "2025-01-06",
    tanggalSelesai: "2025-01-06",
    sasaran: "SEMUA",
    keterangan: "Hari pertama KBM semester genap dan penyesuaian jadwal pelajaran.",
    warna: "emerald",
  },
];

export interface Pengumuman {
  id: string;
  judul: string;
  konten: string;
  kategori: "AKADEMIK" | "KEUANGAN" | "EVENT" | "PENTING" | "LIBUR";
  sasaran: "SEMUA" | "GURU" | "SISWA" | "ORANG_TUA";
  prioritas: "TINGGI" | "NORMAL";
  tanggal: string;
  penulis: string;
  lampiran?: string;
  status: "DITERBITKAN" | "DRAFT";
  pin: boolean;
}

export const daftarPengumumanAwal: Pengumuman[] = [
  {
    id: "p-1",
    judul: "Pemberitahuan Pelaksanaan Penilaian Tengah Semester (PTS) Ganjil 2024/2025",
    konten: "Diberitahukan kepada seluruh siswa dan dewan guru bahwa kegiatan Penilaian Tengah Semester (PTS) Ganjil akan dilaksanakan mulai tanggal 16 s/d 20 September 2024. Siswa dimohon mempersiapkan perlengkapan dan memastikan kehadiran tepat waktu.",
    kategori: "PENTING",
    sasaran: "SEMUA",
    prioritas: "TINGGI",
    tanggal: "2024-09-08",
    penulis: "Drs. Hendra Wijaya (Kepala Sekolah)",
    lampiran: "Jadwal_PTS_Ganjil_2024.pdf",
    status: "DITERBITKAN",
    pin: true,
  },
  {
    id: "p-2",
    judul: "Sosialisasi Pembayaran SPP & Iuran Komite Melalui Virtual Account Hadirin",
    konten: "Bapak/Ibu Orang Tua/Wali Murid yang kami hormati, mulai semester ini sekolah telah memberlakukan pembayaran SPP digital melalui nomor Virtual Account (Bank BSI & Mandiri) di menu Keuangan Portal Orang Tua/Siswa untuk kemudahan konfirmasi otomatis.",
    kategori: "KEUANGAN",
    sasaran: "ORANG_TUA",
    prioritas: "TINGGI",
    tanggal: "2024-08-25",
    penulis: "Bendahara & Tata Usaha",
    lampiran: "Panduan_Pembayaran_SPP.pdf",
    status: "DITERBITKAN",
    pin: true,
  },
  {
    id: "p-3",
    judul: "Rapat Pleno Koordinasi Dewan Pendidik & Penyelarasan Modul Kurikulum Merdeka",
    konten: "Undangan rapat dinas guru dan staf TU dalam rangka evaluasi KBM bulan pertama dan finalisasi pengisian Jurnal Mengajar Digital serta buku nilai asesmen.",
    kategori: "AKADEMIK",
    sasaran: "GURU",
    prioritas: "NORMAL",
    tanggal: "2024-08-15",
    penulis: "Wakasek Kurikulum",
    status: "DITERBITKAN",
    pin: false,
  },
  {
    id: "p-4",
    judul: "Semarak Bulan Bahasa & Peringatan Hari Sumpah Pemuda 2024",
    konten: "Akan diadakan serangkaian perlombaan antarkelas meliputi cipta & baca puisi, debat bahasa Inggris, pidato bahasa daerah, dan bazar karya seni siswa.",
    kategori: "EVENT",
    sasaran: "SISWA",
    prioritas: "NORMAL",
    tanggal: "2024-10-01",
    penulis: "Pembina OSIS",
    status: "DITERBITKAN",
    pin: false,
  },
  {
    id: "p-5",
    judul: "Surat Edaran Libur Resmi Peringatan HUT Kemerdekaan RI ke-79",
    konten: "Sehubungan dengan peringatan Hari Kemerdekaan RI, kegiatan belajar mengajar diliburkan pada hari Sabtu, 17 Agustus 2024. Siswa dan PTK wajib mengikuti upacara bendera di lapangan upacara utama.",
    kategori: "LIBUR",
    sasaran: "SEMUA",
    prioritas: "NORMAL",
    tanggal: "2024-08-12",
    penulis: "Kepala Sekolah",
    lampiran: "Edaran_Upacara_HUT_RI.pdf",
    status: "DITERBITKAN",
    pin: false,
  },
];

export interface PendaftarPPDB {
  id: string;
  noPendaftaran: string;
  nama: string;
  nisn: string;
  nik: string;
  asalSekolah: string;
  jalur: "ZONASI" | "PRESTASI" | "AFIRMASI" | "MUTASI";
  pilihanJurusan: "MIPA" | "IPS" | "BAHASA";
  nilaiRataRapor: number;
  namaWali: string;
  teleponWali: string;
  statusVerifikasi: "MENUNGGU" | "TERVERIFIKASI" | "PERBAIKAN" | "DITOLAK";
  statusKelulusan: "LULUS" | "CADANGAN" | "TIDAK_LULUS" | "PROSES";
  berkasKK: boolean;
  berkasAkta: boolean;
  berkasRapor: boolean;
  tanggalDaftar: string;
  catatanVerifikasi?: string;
}

export const daftarPPDBAwal: PendaftarPPDB[] = [
  {
    id: "ppdb-1",
    noPendaftaran: "PPDB-2024-001",
    nama: "Ananda Rizky Pratama",
    nisn: "0081234567",
    nik: "3201234567890001",
    asalSekolah: "SMP Negeri 1 Contoh",
    jalur: "PRESTASI",
    pilihanJurusan: "MIPA",
    nilaiRataRapor: 92.4,
    namaWali: "H. Pratama Wijaya",
    teleponWali: "0812-9876-5432",
    statusVerifikasi: "TERVERIFIKASI",
    statusKelulusan: "LULUS",
    berkasKK: true,
    berkasAkta: true,
    berkasRapor: true,
    tanggalDaftar: "2024-06-10",
    catatanVerifikasi: "Berkas lengkap dan piagam juara 1 OSN Matematika terverifikasi valid.",
  },
  {
    id: "ppdb-2",
    noPendaftaran: "PPDB-2024-002",
    nama: "Clarissa Putri Maharani",
    nisn: "0081234568",
    nik: "3201234567890002",
    asalSekolah: "SMP Negeri 3 Jakarta",
    jalur: "ZONASI",
    pilihanJurusan: "MIPA",
    nilaiRataRapor: 88.5,
    namaWali: "Bambang Maharani",
    teleponWali: "0813-1122-3344",
    statusVerifikasi: "TERVERIFIKASI",
    statusKelulusan: "LULUS",
    berkasKK: true,
    berkasAkta: true,
    berkasRapor: true,
    tanggalDaftar: "2024-06-11",
    catatanVerifikasi: "Jarak domisili 450 meter dari sekolah (Radius Zonasi 1).",
  },
  {
    id: "ppdb-3",
    noPendaftaran: "PPDB-2024-003",
    nama: "Dimas Arya Pangestu",
    nisn: "0081234569",
    nik: "3201234567890003",
    asalSekolah: "SMP Islam Terpadu Al-Falah",
    jalur: "AFIRMASI",
    pilihanJurusan: "IPS",
    nilaiRataRapor: 85.0,
    namaWali: "Suryono Pangestu",
    teleponWali: "0815-5566-7788",
    statusVerifikasi: "TERVERIFIKASI",
    statusKelulusan: "PROSES",
    berkasKK: true,
    berkasAkta: true,
    berkasRapor: true,
    tanggalDaftar: "2024-06-12",
    catatanVerifikasi: "Kartu Indonesia Pintar (KIP) aktif terdaftar di DTKS.",
  },
  {
    id: "ppdb-4",
    noPendaftaran: "PPDB-2024-004",
    nama: "Fanya Aulia Rahma",
    nisn: "0081234570",
    nik: "3201234567890004",
    asalSekolah: "SMP Negeri 5 Depok",
    jalur: "MUTASI",
    pilihanJurusan: "MIPA",
    nilaiRataRapor: 89.0,
    namaWali: "Kolonel Rahmat Hidayat",
    teleponWali: "0818-9900-1122",
    statusVerifikasi: "MENUNGGU",
    statusKelulusan: "PROSES",
    berkasKK: true,
    berkasAkta: true,
    berkasRapor: false,
    tanggalDaftar: "2024-06-14",
    catatanVerifikasi: "Menunggu kelengkapan scan rapor semester 1-5 yang belum terunggah.",
  },
  {
    id: "ppdb-5",
    noPendaftaran: "PPDB-2024-005",
    nama: "Gilang Ramadhan",
    nisn: "0081234571",
    nik: "3201234567890005",
    asalSekolah: "SMP Bina Bangsa",
    jalur: "ZONASI",
    pilihanJurusan: "IPS",
    nilaiRataRapor: 81.2,
    namaWali: "Ramadhani",
    teleponWali: "0819-3344-5566",
    statusVerifikasi: "PERBAIKAN",
    statusKelulusan: "PROSES",
    berkasKK: false,
    berkasAkta: true,
    berkasRapor: true,
    tanggalDaftar: "2024-06-15",
    catatanVerifikasi: "Foto Kartu Keluarga (KK) buram dan tidak terbaca jelas.",
  },
];


export interface AsetSarpras {
  id: string;
  kodeAset: string;
  namaAset: string;
  kategori: "ELEKTRONIK" | "MEDIA_AJAR" | "FURNITUR" | "LABORATORIUM" | "OLAHRAGA" | "KENDARAAN";
  merkModel: string;
  kondisi: "BAIK" | "RUSAK_RINGAN" | "RUSAK_BERAT";
  lokasi: string;
  jumlahTotal: number;
  jumlahTersedia: number;
  tahunPengadaan: number;
  sumberDana: "BOS_REGULER" | "BOS_KINERJA" | "KOMITE" | "HIBAH_PEMDA";
  keterangan?: string;
}

export interface PeminjamanSarpras {
  id: string;
  kodePinjam: string;
  asetId: string;
  namaAset: string;
  kodeAset: string;
  namaPeminjam: string;
  rolePeminjam: "GURU" | "SISWA" | "STAF_TU";
  kontakPeminjam: string;
  jumlahUnit: number;
  tanggalPinjam: string;
  batasKembali: string;
  tanggalKembali?: string;
  keperluan: string;
  status: "DIPINJAM" | "KEMBALI" | "TERLAMBAT";
  kondisiKembali?: "BAIK" | "RUSAK" | "HILANG";
  catatanPengembalian?: string;
}

export const daftarAsetSarprasAwal: AsetSarpras[] = [
  {
    id: "ast-1",
    kodeAset: "AST-TIK-001",
    namaAset: "Laptop Asus ExpertBook Core i5",
    kategori: "ELEKTRONIK",
    merkModel: "Asus ExpertBook B1400",
    kondisi: "BAIK",
    lokasi: "Laboratorium Komputer 1",
    jumlahTotal: 36,
    jumlahTersedia: 34,
    tahunPengadaan: 2023,
    sumberDana: "BOS_KINERJA",
    keterangan: "Unit inventaris pembelajaran informatika & ANBK.",
  },
  {
    id: "ast-2",
    kodeAset: "AST-MED-002",
    namaAset: "Proyektor LCD Epson 3300 Lumens HDMI",
    kategori: "MEDIA_AJAR",
    merkModel: "Epson EB-E500",
    kondisi: "BAIK",
    lokasi: "Ruang Guru & Media",
    jumlahTotal: 12,
    jumlahTersedia: 10,
    tahunPengadaan: 2022,
    sumberDana: "BOS_REGULER",
    keterangan: "Dapat dipinjam untuk presentasi ruang kelas & aula.",
  },
  {
    id: "ast-3",
    kodeAset: "AST-LAB-003",
    namaAset: "Mikroskop Binokuler Siswa 1600x",
    kategori: "LABORATORIUM",
    merkModel: "Olympus CX23",
    kondisi: "BAIK",
    lokasi: "Laboratorium Biologi",
    jumlahTotal: 20,
    jumlahTersedia: 20,
    tahunPengadaan: 2023,
    sumberDana: "HIBAH_PEMDA",
    keterangan: "Perangkat praktikum struktur sel dan mikroorganisme.",
  },
  {
    id: "ast-4",
    kodeAset: "AST-OLR-004",
    namaAset: "Set Bola Basket Standar Perbasi",
    kategori: "OLAHRAGA",
    merkModel: "Molten GG7X Official Leather",
    kondisi: "BAIK",
    lokasi: "Gudang Olahraga & Lapangan",
    jumlahTotal: 15,
    jumlahTersedia: 12,
    tahunPengadaan: 2024,
    sumberDana: "KOMITE",
    keterangan: "Peralatan ekstrakurikuler & jam penjasorkes.",
  },
  {
    id: "ast-5",
    kodeAset: "AST-FUR-005",
    namaAset: "Meja & Kursi Siswa Kayu Solid Ergonomis",
    kategori: "FURNITUR",
    merkModel: "Informa School Series",
    kondisi: "RUSAK_RINGAN",
    lokasi: "Ruang Kelas X IPA 1",
    jumlahTotal: 36,
    jumlahTersedia: 34,
    tahunPengadaan: 2021,
    sumberDana: "BOS_REGULER",
    keterangan: "2 kursi membutuhkan perbaikan baut sandaran kaki.",
  },
  {
    id: "ast-6",
    kodeAset: "AST-MED-006",
    namaAset: "Speaker Portable Wireless & Mic Wireless",
    kategori: "MEDIA_AJAR",
    merkModel: "Baretone BT-3H1515BWR",
    kondisi: "BAIK",
    lokasi: "Ruang OSIS / Kesiswaan",
    jumlahTotal: 4,
    jumlahTersedia: 3,
    tahunPengadaan: 2023,
    sumberDana: "KOMITE",
    keterangan: "Perangkat sound apel pagi dan kegiatan ekstrakurikuler.",
  },
  {
    id: "ast-7",
    kodeAset: "AST-TIK-007",
    namaAset: "Printer Laser Multifungsi Duplex Network",
    kategori: "ELEKTRONIK",
    merkModel: "Canon imageCLASS MF244dw",
    kondisi: "RUSAK_BERAT",
    lokasi: "Ruang Tata Usaha",
    jumlahTotal: 3,
    jumlahTersedia: 2,
    tahunPengadaan: 2020,
    sumberDana: "BOS_REGULER",
    keterangan: "1 unit paper jam kronis & roller aus, menunggu teknisi servis.",
  },
];

export const daftarPeminjamanSarprasAwal: PeminjamanSarpras[] = [
  {
    id: "pjm-1",
    kodePinjam: "PJM-2024-001",
    asetId: "ast-2",
    namaAset: "Proyektor LCD Epson 3300 Lumens HDMI",
    kodeAset: "AST-MED-002",
    namaPeminjam: "Sari Wulandari, S.Pd",
    rolePeminjam: "GURU",
    kontakPeminjam: "0812-3456-7890",
    jumlahUnit: 1,
    tanggalPinjam: "2024-07-20",
    batasKembali: "2024-07-20",
    tanggalKembali: "2024-07-20",
    keperluan: "Presentasi Projek P5 Penguatan Karakter di Ruang Multimedia",
    status: "KEMBALI",
    kondisiKembali: "BAIK",
    catatanPengembalian: "Kembali tepat waktu dengan kabel lengkap dan tas bawaan.",
  },
  {
    id: "pjm-2",
    kodePinjam: "PJM-2024-002",
    asetId: "ast-1",
    namaAset: "Laptop Asus ExpertBook Core i5",
    kodeAset: "AST-TIK-001",
    namaPeminjam: "Ahmad Fauzi, S.Pd",
    rolePeminjam: "GURU",
    kontakPeminjam: "0813-4567-8901",
    jumlahUnit: 2,
    tanggalPinjam: "2024-07-24",
    batasKembali: "2024-07-26",
    keperluan: "Pelatihan Penginputan E-Rapor Guru Penggerak di Aula",
    status: "DIPINJAM",
  },
  {
    id: "pjm-3",
    kodePinjam: "PJM-2024-003",
    asetId: "ast-4",
    namaAset: "Set Bola Basket Standar Perbasi",
    kodeAset: "AST-OLR-004",
    namaPeminjam: "Farhan Maulana (Ketua OSIS)",
    rolePeminjam: "SISWA",
    kontakPeminjam: "0813-5555-6666",
    jumlahUnit: 3,
    tanggalPinjam: "2024-07-24",
    batasKembali: "2024-07-25",
    keperluan: "Latihan intensif persiapan turnamen DBL antar-SMA",
    status: "DIPINJAM",
  },
  {
    id: "pjm-4",
    kodePinjam: "PJM-2024-004",
    asetId: "ast-6",
    namaAset: "Speaker Portable Wireless & Mic Wireless",
    kodeAset: "AST-MED-006",
    namaPeminjam: "Rina Marlina, M.Pd",
    rolePeminjam: "GURU",
    kontakPeminjam: "0815-6789-0123",
    jumlahUnit: 1,
    tanggalPinjam: "2024-07-22",
    batasKembali: "2024-07-23",
    keperluan: "Latihan paduan suara peringatan HUT RI",
    status: "TERLAMBAT",
  },
];

export interface BukuPerpus {
  id: string;
  isbn: string;
  kodeBuku: string;
  judul: string;
  pengarang: string;
  penerbit: string;
  tahunTerbit: number;
  kategori: "BUKU_TEKS" | "FIKSI" | "SAINS" | "SEJARAH" | "AGAMA" | "REFERENSI";
  lokasiRak: string;
  jumlahEksemplar: number;
  eksemplarTersedia: number;
  tipeFormat: "FISIK" | "EBOOK" | "FISIK_DAN_EBOOK";
  ebookUrl?: string;
  sinopsis?: string;
}

export interface PeminjamanBuku {
  id: string;
  kodePinjam: string;
  bukuId: string;
  judulBuku: string;
  kodeBuku: string;
  namaPeminjam: string;
  nomorIdentitas: string;
  rolePeminjam: "SISWA" | "GURU" | "STAF";
  kelasAtauUnit: string;
  tanggalPinjam: string;
  batasKembali: string;
  tanggalKembali?: string;
  status: "DIPINJAM" | "KEMBALI" | "TERLAMBAT";
  denda: number;
  statusDenda: "TIDAK_ADA" | "BELUM_LUNAS" | "LUNAS";
  catatanPetugas?: string;
}

export const daftarBukuAwal: BukuPerpus[] = [
  {
    id: "bk-1",
    isbn: "978-602-244-325-4",
    kodeBuku: "BK-TEK-001",
    judul: "Matematika Tingkat Lanjut SMA/MA Kelas XI",
    pengarang: "Al Azhary Masta, dkk.",
    penerbit: "Pusat Kurikulum dan Perbukuan Kemendikbudristek",
    tahunTerbit: 2023,
    kategori: "BUKU_TEKS",
    lokasiRak: "Rak A-01 (MIPA)",
    jumlahEksemplar: 45,
    eksemplarTersedia: 40,
    tipeFormat: "FISIK_DAN_EBOOK",
    ebookUrl: "https://buku.kemdikbud.go.id/katalog/matematika-tingkat-lanjut-kelas-xi",
    sinopsis: "Buku teks utama Kurikulum Merdeka mencakup materi vektor, fungsi trigonometri, dan kalkulus diferensial.",
  },
  {
    id: "bk-2",
    isbn: "978-602-244-326-1",
    kodeBuku: "BK-TEK-002",
    judul: "Biologi untuk SMA/MA Kelas X (Fase E)",
    pengarang: "Rini Solihat, dkk.",
    penerbit: "Pusat Perbukuan Kemendikbud",
    tahunTerbit: 2022,
    kategori: "BUKU_TEKS",
    lokasiRak: "Rak A-02 (Biologi)",
    jumlahEksemplar: 38,
    eksemplarTersedia: 35,
    tipeFormat: "FISIK_DAN_EBOOK",
    ebookUrl: "https://buku.kemdikbud.go.id/katalog/biologi-kelas-x",
    sinopsis: "Memuat pemahaman konsep keanekaragaman hayati, virus dan peranannya, serta inovasi bioteknologi ramah lingkungan.",
  },
  {
    id: "bk-3",
    isbn: "978-979-3062-79-2",
    kodeBuku: "BK-FIK-003",
    judul: "Laskar Pelangi",
    pengarang: "Andrea Hirata",
    penerbit: "Bentang Pustaka",
    tahunTerbit: 2005,
    kategori: "FIKSI",
    lokasiRak: "Rak B-01 (Sastra & Novel)",
    jumlahEksemplar: 10,
    eksemplarTersedia: 8,
    tipeFormat: "FISIK",
    sinopsis: "Kisah inspiratif sepuluh anak laskar pelangi di Desa Gantung, Belitung dalam memperjuangkan hak pendidikan dasar.",
  },
  {
    id: "bk-4",
    isbn: "978-602-03-3160-7",
    kodeBuku: "BK-SNS-004",
    judul: "Kosmos: Menjelajah Jagat Raya dan Waktu",
    pengarang: "Carl Sagan (Terj. Bambang)",
    penerbit: "Kepustakaan Populer Gramedia (KPG)",
    tahunTerbit: 2016,
    kategori: "SAINS",
    lokasiRak: "Rak C-02 (Astronomi & Fisika)",
    jumlahEksemplar: 6,
    eksemplarTersedia: 5,
    tipeFormat: "FISIK",
    sinopsis: "Eksplorasi ilmiah tentang asal-usul alam semesta, bintang, tata surya, dan sains peradaban manusia.",
  },
  {
    id: "bk-5",
    isbn: "978-623-238-112-9",
    kodeBuku: "BK-SEJ-005",
    judul: "Sejarah Nasional Indonesia: Era Pergerakan dan Kemerdekaan",
    pengarang: "Prof. Dr. Sartono Kartodirdjo",
    penerbit: "Balai Pustaka",
    tahunTerbit: 2021,
    kategori: "SEJARAH",
    lokasiRak: "Rak D-01 (Sejarah)",
    jumlahEksemplar: 12,
    eksemplarTersedia: 11,
    tipeFormat: "FISIK_DAN_EBOOK",
    ebookUrl: "https://repositori.kemdikbud.go.id/sejarah-nasional",
    sinopsis: "Rujukan komprehensif sejarah pergerakan Budi Utomo, Sumpah Pemuda hingga proklamasi kemerdekaan Republik Indonesia.",
  },
  {
    id: "bk-6",
    isbn: "978-979-1102-88-9",
    kodeBuku: "BK-AGM-006",
    judul: "Fikih Sunnah dan Akhlak Mulia Generasi Muda",
    pengarang: "Sayyid Sabiq",
    penerbit: "Republika Penerbit",
    tahunTerbit: 2020,
    kategori: "AGAMA",
    lokasiRak: "Rak E-01 (Studi Islam)",
    jumlahEksemplar: 15,
    eksemplarTersedia: 14,
    tipeFormat: "FISIK",
    sinopsis: "Panduan ibadah praktis, etika pergaulan Islami, dan penguatan budi pekerti peserta didik.",
  },
  {
    id: "bk-7",
    isbn: "978-024-124-043-4",
    kodeBuku: "BK-REF-007",
    judul: "Ensiklopedia Sains dan Teknologi Bergambar Visual",
    pengarang: "DK Publishing Team",
    penerbit: "Dorling Kindersley / Erlangga",
    tahunTerbit: 2022,
    kategori: "REFERENSI",
    lokasiRak: "Rak F-03 (Ensiklopedia Meja Baca)",
    jumlahEksemplar: 5,
    eksemplarTersedia: 4,
    tipeFormat: "FISIK",
    sinopsis: "Buku referensi visual lengkap mengenai fisika terapan, robotika, anatomi tubuh, dan energi terbarukan.",
  },
];

export const daftarPeminjamanBukuAwal: PeminjamanBuku[] = [
  {
    id: "pb-1",
    kodePinjam: "SIP-2024-001",
    bukuId: "bk-3",
    judulBuku: "Laskar Pelangi",
    kodeBuku: "BK-FIK-003",
    namaPeminjam: "Ahmad Fadillah",
    nomorIdentitas: "0067891234",
    rolePeminjam: "SISWA",
    kelasAtauUnit: "X IPA 1",
    tanggalPinjam: "2024-07-15",
    batasKembali: "2024-07-22",
    tanggalKembali: "2024-07-21",
    status: "KEMBALI",
    denda: 0,
    statusDenda: "TIDAK_ADA",
    catatanPetugas: "Buku kembali dalam kondisi bersih dan bersampul.",
  },
  {
    id: "pb-2",
    kodePinjam: "SIP-2024-002",
    bukuId: "bk-1",
    judulBuku: "Matematika Tingkat Lanjut SMA/MA Kelas XI",
    kodeBuku: "BK-TEK-001",
    namaPeminjam: "Sari Wulandari, S.Pd",
    nomorIdentitas: "19850412 200902 2 003",
    rolePeminjam: "GURU",
    kelasAtauUnit: "Guru Matematika",
    tanggalPinjam: "2024-07-20",
    batasKembali: "2024-08-03",
    status: "DIPINJAM",
    denda: 0,
    statusDenda: "TIDAK_ADA",
    catatanPetugas: "Peminjaman bahan ajar modul kurikulum semester ganjil.",
  },
  {
    id: "pb-3",
    kodePinjam: "SIP-2024-003",
    bukuId: "bk-4",
    judulBuku: "Kosmos: Menjelajah Jagat Raya dan Waktu",
    kodeBuku: "BK-SNS-004",
    namaPeminjam: "Bunga Citra",
    nomorIdentitas: "0067891235",
    rolePeminjam: "SISWA",
    kelasAtauUnit: "X IPA 1",
    tanggalPinjam: "2024-07-18",
    batasKembali: "2024-07-25",
    status: "DIPINJAM",
    denda: 0,
    statusDenda: "TIDAK_ADA",
  },
  {
    id: "pb-4",
    kodePinjam: "SIP-2024-004",
    bukuId: "bk-7",
    judulBuku: "Ensiklopedia Sains dan Teknologi Bergambar Visual",
    kodeBuku: "BK-REF-007",
    namaPeminjam: "Farhan Maulana",
    nomorIdentitas: "0067891238",
    rolePeminjam: "SISWA",
    kelasAtauUnit: "X IPA 2",
    tanggalPinjam: "2024-07-10",
    batasKembali: "2024-07-17",
    status: "TERLAMBAT",
    denda: 7000,
    statusDenda: "BELUM_LUNAS",
    catatanPetugas: "Terlambat 7 hari pengembalian dari batas waktu.",
  },
];

export interface Ekstrakurikuler {
  id: string;
  nama: string;
  kategori: "WAJIB" | "OLAHRAGA" | "SENI_BUDAYA" | "SAINS_IPTEK" | "KEPEMIMPINAN" | "KEAGAMAAN";
  pembina: string;
  kontakPembina: string;
  hariLatihan: string;
  jamMulai: string;
  jamSelesai: string;
  lokasiLatihan: string;
  kuotaMaksimal: number;
  deskripsi?: string;
  prestasiTerbaru?: string;
}

export interface AnggotaEkskul {
  id: string;
  ekskulId: string;
  namaEkskul: string;
  siswaId: string;
  namaSiswa: string;
  nisn: string;
  kelas: string;
  jabatan: "KETUA" | "WAKIL" | "SEKRETARIS" | "BENDAHARA" | "ANGGOTA";
  predikatNilai: "SANGAT_BAIK" | "BAIK" | "CUKUP" | "KURANG";
  kehadiranPersen: number;
  catatanPembina?: string;
}

export const daftarEkskulAwal: Ekstrakurikuler[] = [
  {
    id: "eks-1",
    nama: "Pramuka Inti (Gugus Depan)",
    kategori: "WAJIB",
    pembina: "Hadi Purnomo, S.Pd",
    kontakPembina: "0812-1010-2020",
    hariLatihan: "Jumat",
    jamMulai: "15:30",
    jamSelesai: "17:15",
    lokasiLatihan: "Lapangan Utama & Panggung Terbuka",
    kuotaMaksimal: 60,
    deskripsi: "Pendidikan kepanduan pembentukan karakter, kedisiplinan, pioneering, dan survival.",
    prestasiTerbaru: "Juara 1 Lomba Tingkat Penegak Kwarcab 2024",
  },
  {
    id: "eks-2",
    nama: "Paskibra Sekolah",
    kategori: "KEPEMIMPINAN",
    pembina: "Rian Pratama, S.Pd",
    kontakPembina: "0812-2323-3434",
    hariLatihan: "Sabtu",
    jamMulai: "07:30",
    jamSelesai: "10:00",
    lokasiLatihan: "Lapangan Upacara Bendera",
    kuotaMaksimal: 35,
    deskripsi: "Pelatihan baris-berbaris presisi, kedisiplinan mental, dan formasi pengibaran bendera pusaka.",
    prestasiTerbaru: "Paskibraka Terbaik Tingkat Kota Tahun 2024",
  },
  {
    id: "eks-3",
    nama: "Palang Merah Remaja (PMR Wira)",
    kategori: "KEPEMIMPINAN",
    pembina: "Dr. Retno Wahyuni",
    kontakPembina: "0813-3434-4545",
    hariLatihan: "Rabu",
    jamMulai: "15:30",
    jamSelesai: "17:00",
    lokasiLatihan: "Ruang PMR & Unit Kesehatan Sekolah (UKS)",
    kuotaMaksimal: 30,
    deskripsi: "Pertolongan pertama pada kecelakaan (PPGD), donor darah, dan evakuasi kebencanaan.",
    prestasiTerbaru: "Juara Umum Jumbara PMR Wira Tingkat Provinsi 2023",
  },
  {
    id: "eks-4",
    nama: "Klub Futsal & Sepakbola",
    kategori: "OLAHRAGA",
    pembina: "Bambang Santoso, M.Si",
    kontakPembina: "0815-4545-5656",
    hariLatihan: "Selasa",
    jamMulai: "16:00",
    jamSelesai: "17:45",
    lokasiLatihan: "Lapangan Futsal Sekolah",
    kuotaMaksimal: 25,
    deskripsi: "Pembinaan taktik futsal, stamina fisik, dan partisipasi liga pelajar antar-SMA.",
    prestasiTerbaru: "Semifinalis Turnamen Futsal Pelajar Cup 2024",
  },
  {
    id: "eks-5",
    nama: "Bola Basket Putera & Puteri",
    kategori: "OLAHRAGA",
    pembina: "Hadi Purnomo, S.Pd",
    kontakPembina: "0816-5656-6767",
    hariLatihan: "Kamis",
    jamMulai: "15:30",
    jamSelesai: "17:30",
    lokasiLatihan: "Gelanggang Basket Outdoor",
    kuotaMaksimal: 25,
    deskripsi: "Pelatihan fundamental dribbling, shooting, set play, dan persiapan kompetisi DBL.",
    prestasiTerbaru: "Juara 2 Kejuaraan Antar-SMA Perbasi Cup",
  },
  {
    id: "eks-6",
    nama: "Robotika & Coding Tech",
    kategori: "SAINS_IPTEK",
    pembina: "Rifqi Pratama, S.Kom",
    kontakPembina: "0817-6767-7878",
    hariLatihan: "Sabtu",
    jamMulai: "08:30",
    jamSelesai: "11:00",
    lokasiLatihan: "Laboratorium Komputer 1",
    kuotaMaksimal: 20,
    deskripsi: "Pemrograman mikrokontroler Arduino/ESP32, sensor IoT, koding web, dan lomba robotik nasional.",
    prestasiTerbaru: "Medali Perunggu Kontes Robot Pintar Pelajar Nasional 2024",
  },
  {
    id: "eks-7",
    nama: "Karya Ilmiah Remaja (KIR Sains)",
    kategori: "SAINS_IPTEK",
    pembina: "Agus Salim, M.Pd",
    kontakPembina: "0818-7878-8989",
    hariLatihan: "Kamis",
    jamMulai: "15:30",
    jamSelesai: "17:00",
    lokasiLatihan: "Laboratorium Biologi & Kimia",
    kuotaMaksimal: 25,
    deskripsi: "Metodologi riset ilmiah, eksperimen laboratorium, penulisan karya tulis ilmiah (KTI), dan lomba OPSI.",
    prestasiTerbaru: "Finalis Olimpiade Penelitian Siswa Indonesia (OPSI) Kemendikbud",
  },
  {
    id: "eks-8",
    nama: "Seni Tari Tradisional & Kreasi",
    kategori: "SENI_BUDAYA",
    pembina: "Dewi Lestari, M.Pd",
    kontakPembina: "0819-8989-9090",
    hariLatihan: "Rabu",
    jamMulai: "15:30",
    jamSelesai: "17:00",
    lokasiLatihan: "Aula Serbaguna & Sanggar Seni",
    kuotaMaksimal: 25,
    deskripsi: "Pelestarian seni tari daerah nusantara, olah tubuh, koreografi pentas seni, dan FLS2N.",
    prestasiTerbaru: "Juara 1 FLS2N Tingkat Wilayah Cabang Seni Tari 2024",
  },
];

export const daftarAnggotaEkskulAwal: AnggotaEkskul[] = [
  {
    id: "ang-1",
    ekskulId: "eks-1",
    namaEkskul: "Pramuka Inti (Gugus Depan)",
    siswaId: "s-1",
    namaSiswa: "Ahmad Fadillah",
    nisn: "0067891234",
    kelas: "X IPA 1",
    jabatan: "KETUA",
    predikatNilai: "SANGAT_BAIK",
    kehadiranPersen: 96,
    catatanPembina: "Memimpin regu dengan sangat cakap dan disiplin tinggi.",
  },
  {
    id: "ang-2",
    ekskulId: "eks-1",
    namaEkskul: "Pramuka Inti (Gugus Depan)",
    siswaId: "s-2",
    namaSiswa: "Bunga Citra",
    nisn: "0067891235",
    kelas: "X IPA 1",
    jabatan: "BENDAHARA",
    predikatNilai: "SANGAT_BAIK",
    kehadiranPersen: 94,
    catatanPembina: "Pengelolaan logistik dan iuran kas sangat rapi.",
  },
  {
    id: "ang-3",
    ekskulId: "eks-2",
    namaEkskul: "Paskibra Sekolah",
    siswaId: "s-3",
    namaSiswa: "Dedi Kurniawan",
    nisn: "0067891236",
    kelas: "X IPA 1",
    jabatan: "ANGGOTA",
    predikatNilai: "BAIK",
    kehadiranPersen: 88,
    catatanPembina: "Postur dan langkah tegap baik, perlu peningkatan fokus.",
  },
  {
    id: "ang-4",
    ekskulId: "eks-3",
    namaEkskul: "Palang Merah Remaja (PMR Wira)",
    siswaId: "s-4",
    namaSiswa: "Eka Putri",
    nisn: "0067891237",
    kelas: "X IPA 2",
    jabatan: "SEKRETARIS",
    predikatNilai: "SANGAT_BAIK",
    kehadiranPersen: 95,
    catatanPembina: "Tanggap saat piket UKS dan cekatan dalam simulasi medis.",
  },
  {
    id: "ang-5",
    ekskulId: "eks-4",
    namaEkskul: "Klub Futsal & Sepakbola",
    siswaId: "s-5",
    namaSiswa: "Farhan Maulana",
    nisn: "0067891238",
    kelas: "X IPA 2",
    jabatan: "KETUA",
    predikatNilai: "SANGAT_BAIK",
    kehadiranPersen: 92,
    catatanPembina: "Kapten tim yang berdedikasi dan memiliki sportivitas tinggi.",
  },
  {
    id: "ang-6",
    ekskulId: "eks-6",
    namaEkskul: "Robotika & Coding Tech",
    siswaId: "s-7",
    namaSiswa: "Hafiz Aditya",
    nisn: "0067891240",
    kelas: "XI IPA 1",
    jabatan: "KETUA",
    predikatNilai: "SANGAT_BAIK",
    kehadiranPersen: 98,
    catatanPembina: "Menunjukkan inovasi luar biasa pada proyek robot line follower.",
  },
  {
    id: "ang-7",
    ekskulId: "eks-7",
    namaEkskul: "Karya Ilmiah Remaja (KIR Sains)",
    siswaId: "s-6",
    namaSiswa: "Gita Ramadhani",
    nisn: "0067891239",
    kelas: "XI IPA 1",
    jabatan: "WAKIL",
    predikatNilai: "SANGAT_BAIK",
    kehadiranPersen: 94,
    catatanPembina: "Karya tulis ilmiah tentang bio-pestisida berpotensi menang lomba.",
  },
  {
    id: "ang-8",
    ekskulId: "eks-8",
    namaEkskul: "Seni Tari Tradisional & Kreasi",
    siswaId: "s-8",
    namaSiswa: "Indah Permata",
    nisn: "0067891241",
    kelas: "XI IPA 2",
    jabatan: "ANGGOTA",
    predikatNilai: "BAIK",
    kehadiranPersen: 90,
    catatanPembina: "Penguasaan wiraga dan wirasa sangat luwes.",
  },
];

export interface AlumniRecord {
  id: string;
  nisn: string;
  nama: string;
  gender: "L" | "P";
  tahunLulus: number;
  jurusan: "MIPA" | "IPS" | "BAHASA";
  statusTracer: "KULIAH_PTN" | "KULIAH_PTS" | "BEKERJA" | "WIRAUSAHA" | "STUDI_LUAR_NEGERI" | "MENCARI_KERJA";
  instansiAtauKampus: string;
  posisiAtauJurusan: string;
  email: string;
  telepon: string;
  kotaDomisili: string;
  kesanPesan?: string;
  bersediaMentoring: boolean;
}

export const daftarAlumniAwal: AlumniRecord[] = [
  {
    id: "alm-1",
    nisn: "0031245678",
    nama: "Muhammad Rayhan Pratama",
    gender: "L",
    tahunLulus: 2021,
    jurusan: "MIPA",
    statusTracer: "KULIAH_PTN",
    instansiAtauKampus: "Institut Teknologi Bandung (ITB)",
    posisiAtauJurusan: "Teknik Informatika (S1)",
    email: "rayhan.pratama@alumni.itb.ac.id",
    telepon: "0812-9988-7766",
    kotaDomisili: "Bandung",
    kesanPesan: "Fasilitas lab komputer dan bimbingan guru olimpiade sangat membantu adaptasi di ITB.",
    bersediaMentoring: true,
  },
  {
    id: "alm-2",
    nisn: "0031245679",
    nama: "Nabila Aurelia Putri",
    gender: "P",
    tahunLulus: 2022,
    jurusan: "MIPA",
    statusTracer: "KULIAH_PTN",
    instansiAtauKampus: "Universitas Indonesia (UI)",
    posisiAtauJurusan: "Pendidikan Dokter / Kedokteran (S1)",
    email: "nabila.aurelia@ui.ac.id",
    telepon: "0813-1122-4455",
    kotaDomisili: "Depok / Jakarta",
    kesanPesan: "Pendidikan karakter dan kepemimpinan di SMA memberi modal ketahanan mental saat preklinik.",
    bersediaMentoring: true,
  },
  {
    id: "alm-3",
    nisn: "0021245680",
    nama: "Dimas Bagus Wicaksono",
    gender: "L",
    tahunLulus: 2021,
    jurusan: "IPS",
    statusTracer: "BEKERJA",
    instansiAtauKampus: "PT Telkom Indonesia (Persero) Tbk",
    posisiAtauJurusan: "Associate Product Specialist",
    email: "dimas.wicaksono@telkom.co.id",
    telepon: "0815-5566-8899",
    kotaDomisili: "Jakarta Selatan",
    kesanPesan: "Kultur aktif organisasi OSIS dan ekskul KIR sangat melatih problem solving di industri.",
    bersediaMentoring: false,
  },
  {
    id: "alm-4",
    nisn: "0031245681",
    nama: "Siti Rahmadani",
    gender: "P",
    tahunLulus: 2023,
    jurusan: "IPS",
    statusTracer: "WIRAUSAHA",
    instansiAtauKampus: "Karsa Kreasi Nusantara (Studio Branding & Agensi)",
    posisiAtauJurusan: "Founder & Creative Director",
    email: "siti.rahmadhani@karsakreasi.com",
    telepon: "0818-7788-9900",
    kotaDomisili: "Bogor",
    kesanPesan: "Bazar kewirausahaan sekolah dulu membuka minat saya membangun agensi kreatif sendiri.",
    bersediaMentoring: true,
  },
  {
    id: "alm-5",
    nisn: "0041245682",
    nama: "Kevin Jonathan Chandra",
    gender: "L",
    tahunLulus: 2023,
    jurusan: "MIPA",
    statusTracer: "STUDI_LUAR_NEGERI",
    instansiAtauKampus: "Nanyang Technological University (NTU)",
    posisiAtauJurusan: "Electrical & Electronic Engineering (B.Eng)",
    email: "kevin.jonathan@e.ntu.edu.sg",
    telepon: "+65 8123 4567",
    kotaDomisili: "Singapore",
    kesanPesan: "Bimbingan beasiswa Indonesia Maju dan pembekalan bahasa Inggris sekolah sangat berharga.",
    bersediaMentoring: true,
  },
  {
    id: "alm-6",
    nisn: "0041245683",
    nama: "Adinda Putri Maharani",
    gender: "P",
    tahunLulus: 2024,
    jurusan: "MIPA",
    statusTracer: "KULIAH_PTS",
    instansiAtauKampus: "Universitas Bina Nusantara (BINUS University)",
    posisiAtauJurusan: "Computer Science - Cyber Security",
    email: "adinda.putri@binus.ac.id",
    telepon: "0819-3344-7788",
    kotaDomisili: "Tangerang",
    kesanPesan: "Terima kasih kepada dewan guru atas bimbingan selama 3 tahun masa SMA yang menyenangkan.",
    bersediaMentoring: false,
  },
];

export interface UjianCBT {
  id: string;
  kodeUjian: string;
  judul: string;
  mapel: string;
  tingkatKelas: string;
  jenisUjian: "PTS" | "PAS" | "HARIAN" | "SIMULASI_ANBK" | "TRYOUT";
  tanggalUjian: string;
  jamMulai: string;
  jamSelesai: string;
  durasiMenit: number;
  tokenUjian: string;
  status: "DRAFT" | "AKTIF" | "SELESAI";
  jumlahSoal: number;
  kkm: number;
  acakSoal: boolean;
  acakOpsi: boolean;
}

export interface HasilSiswaCBT {
  id: string;
  ujianId: string;
  siswaId: string;
  namaSiswa: string;
  nisn: string;
  kelas: string;
  nilai: number;
  statusKelulusan: "LULUS" | "REMEDIAL";
  waktuMulai: string;
  waktuSelesai: string;
  statusPengerjaan: "SELESAI" | "SEDANG_MENGERJAKAN";
  jawabanBenar: number;
  jawabanSalah: number;
}

export const daftarUjianCBTAwal: UjianCBT[] = [
  {
    id: "cbt-1",
    kodeUjian: "CBT-PTS-MAT-01",
    judul: "Penilaian Tengah Semester (PTS) Matematika Wajib",
    mapel: "Matematika Wajib",
    tingkatKelas: "Kelas X",
    jenisUjian: "PTS",
    tanggalUjian: "2024-09-16",
    jamMulai: "07:30",
    jamSelesai: "09:00",
    durasiMenit: 90,
    tokenUjian: "MAT24X",
    status: "AKTIF",
    jumlahSoal: 25,
    kkm: 75,
    acakSoal: true,
    acakOpsi: true,
  },
  {
    id: "cbt-2",
    kodeUjian: "CBT-ANBK-SIM-02",
    judul: "Simulasi Mandiri CBT Literasi & Numerasi ANBK",
    mapel: "Informatika & Koding",
    tingkatKelas: "Kelas XI",
    jenisUjian: "SIMULASI_ANBK",
    tanggalUjian: "2024-10-14",
    jamMulai: "08:00",
    jamSelesai: "10:00",
    durasiMenit: 120,
    tokenUjian: "ANBK24",
    status: "AKTIF",
    jumlahSoal: 36,
    kkm: 70,
    acakSoal: true,
    acakOpsi: false,
  },
  {
    id: "cbt-3",
    kodeUjian: "CBT-PH-FIS-03",
    judul: "Penilaian Harian Formatif Vektor & Kinematika",
    mapel: "Fisika Peminatan",
    tingkatKelas: "Kelas X",
    jenisUjian: "HARIAN",
    tanggalUjian: "2024-08-28",
    jamMulai: "09:30",
    jamSelesai: "10:30",
    durasiMenit: 60,
    tokenUjian: "FISIK9",
    status: "SELESAI",
    jumlahSoal: 20,
    kkm: 75,
    acakSoal: false,
    acakOpsi: true,
  },
  {
    id: "cbt-4",
    kodeUjian: "CBT-PAS-BIO-04",
    judul: "Asesmen Sumatif Akhir Semester (SAS) Biologi Sel",
    mapel: "Biologi Peminatan",
    tingkatKelas: "Kelas X",
    jenisUjian: "PAS",
    tanggalUjian: "2024-12-05",
    jamMulai: "07:30",
    jamSelesai: "09:30",
    durasiMenit: 120,
    tokenUjian: "BIOSUM",
    status: "DRAFT",
    jumlahSoal: 40,
    kkm: 78,
    acakSoal: true,
    acakOpsi: true,
  },
];

export const daftarHasilCBTAwal: HasilSiswaCBT[] = [
  {
    id: "hcbt-1",
    ujianId: "cbt-1",
    siswaId: "s-1",
    namaSiswa: "Ahmad Fadillah",
    nisn: "0067891234",
    kelas: "X IPA 1",
    nilai: 88,
    statusKelulusan: "LULUS",
    waktuMulai: "07:31",
    waktuSelesai: "08:45",
    statusPengerjaan: "SELESAI",
    jawabanBenar: 22,
    jawabanSalah: 3,
  },
  {
    id: "hcbt-2",
    ujianId: "cbt-1",
    siswaId: "s-2",
    namaSiswa: "Bunga Citra",
    nisn: "0067891235",
    kelas: "X IPA 1",
    nilai: 92,
    statusKelulusan: "LULUS",
    waktuMulai: "07:30",
    waktuSelesai: "08:38",
    statusPengerjaan: "SELESAI",
    jawabanBenar: 23,
    jawabanSalah: 2,
  },
  {
    id: "hcbt-3",
    ujianId: "cbt-1",
    siswaId: "s-3",
    namaSiswa: "Dedi Kurniawan",
    nisn: "0067891236",
    kelas: "X IPA 1",
    nilai: 68,
    statusKelulusan: "REMEDIAL",
    waktuMulai: "07:35",
    waktuSelesai: "08:58",
    statusPengerjaan: "SELESAI",
    jawabanBenar: 17,
    jawabanSalah: 8,
  },
  {
    id: "hcbt-4",
    ujianId: "cbt-1",
    siswaId: "s-4",
    namaSiswa: "Eka Putri",
    nisn: "0067891237",
    kelas: "X IPA 2",
    nilai: 84,
    statusKelulusan: "LULUS",
    waktuMulai: "07:32",
    waktuSelesai: "08:49",
    statusPengerjaan: "SELESAI",
    jawabanBenar: 21,
    jawabanSalah: 4,
  },
  {
    id: "hcbt-5",
    ujianId: "cbt-1",
    siswaId: "s-5",
    namaSiswa: "Farhan Maulana",
    nisn: "0067891238",
    kelas: "X IPA 2",
    nilai: 72,
    statusKelulusan: "REMEDIAL",
    waktuMulai: "07:34",
    waktuSelesai: "-",
    statusPengerjaan: "SEDANG_MENGERJAKAN",
    jawabanBenar: 18,
    jawabanSalah: 7,
  },
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
  { id: "k1", nama: "X IPA 1", tingkat: "Kelas X", jurusan: "MIPA", waliKelas: "Sari Wulandari, S.Pd", ruangan: "R.101 (Gedung A Lt. 1)", kapasitas: 36, kurikulum: "Kurikulum Merdeka", tahunAjaran: "2024/2025", semester: "Ganjil", status: "AKTIF" },
  { id: "k2", nama: "X IPA 2", tingkat: "Kelas X", jurusan: "MIPA", waliKelas: "Bambang Santoso, M.Si", ruangan: "R.102 (Gedung A Lt. 1)", kapasitas: 36, kurikulum: "Kurikulum Merdeka", tahunAjaran: "2024/2025", semester: "Ganjil", status: "AKTIF" },
  { id: "k3", nama: "X IPS 1", tingkat: "Kelas X", jurusan: "IPS", waliKelas: "Dewi Lestari, M.Pd", ruangan: "R.103 (Gedung A Lt. 1)", kapasitas: 36, kurikulum: "Kurikulum Merdeka", tahunAjaran: "2024/2025", semester: "Ganjil", status: "AKTIF" },
  { id: "k4", nama: "XI IPA 1", tingkat: "Kelas XI", jurusan: "MIPA", waliKelas: "Ahmad Fauzi, S.Pd", ruangan: "R.201 (Gedung B Lt. 2)", kapasitas: 36, kurikulum: "Kurikulum Merdeka", tahunAjaran: "2024/2025", semester: "Ganjil", status: "AKTIF" },
  { id: "k5", nama: "XI IPA 2", tingkat: "Kelas XI", jurusan: "MIPA", waliKelas: "Rian Pratama, S.Pd", ruangan: "R.202 (Gedung B Lt. 2)", kapasitas: 36, kurikulum: "Kurikulum Merdeka", tahunAjaran: "2024/2025", semester: "Ganjil", status: "AKTIF" },
  { id: "k6", nama: "XII IPA 1", tingkat: "Kelas XII", jurusan: "MIPA", waliKelas: "Dr. Retno Wahyuni", ruangan: "R.301 (Gedung C Lt. 3)", kapasitas: 36, kurikulum: "Kurikulum 2013", tahunAjaran: "2024/2025", semester: "Ganjil", status: "AKTIF" },
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
  
  tahunAjaranAktif: string;
  semesterAktif: "Ganjil" | "Genap";
  setTahunAjaran: (tahun: string, semester: "Ganjil" | "Genap") => void;
  daftarMapel: MataPelajaran[];
  tambahMapel: (mapel: Omit<MataPelajaran, "id">) => void;
  hapusMapel: (id: string) => void;
  daftarSiswaInduk: SiswaInduk[];
  tambahSiswaInduk: (siswa: Omit<SiswaInduk, "id">) => void;
  hapusSiswaInduk: (id: string) => void;
  daftarTagihanSPP: TagihanSPP[];
  bayarTagihanSPP: (id: string, metode: "TRANSFER_BANK" | "TUNAI_KASIR" | "QRIS", catatan?: string) => void;
  tambahTagihanSPP: (tagihan: Omit<TagihanSPP, "id" | "noKwitansi">) => void;
  daftarTugas: Tugas[];
  tambahTugas: (tugas: Omit<Tugas, "id">) => void;
  hapusTugas: (id: string) => void;
  daftarMateri: MateriAjar[];
  tambahMateri: (materi: Omit<MateriAjar, "id">) => void;
  hapusMateri: (id: string) => void;
  daftarNilai: NilaiSiswa[];
  updateNilaiSiswa: (id: string, nilaiTugas: number, nilaiFormatif: number, nilaiSumatif: number) => void;
  tambahKelas: (kelas: Omit<Kelas, "id">) => void;
  hapusKelas: (id: string) => void;
  updateKelas: (id: string, data: Partial<Kelas>) => void;
  pindahSiswaRombel: (siswaId: string, kelasBaru: string) => void;
  daftarAgendaAkademik: AgendaAkademik[];
  tambahAgendaAkademik: (agenda: Omit<AgendaAkademik, "id">) => void;
  hapusAgendaAkademik: (id: string) => void;
  updateAgendaAkademik: (id: string, data: Partial<AgendaAkademik>) => void;
  daftarPengumuman: Pengumuman[];
  tambahPengumuman: (pengumuman: Omit<Pengumuman, "id">) => void;
  hapusPengumuman: (id: string) => void;
  updatePengumuman: (id: string, data: Partial<Pengumuman>) => void;
  togglePinPengumuman: (id: string) => void;
  daftarPPDB: PendaftarPPDB[];
  tambahPendaftarPPDB: (pendaftar: Omit<PendaftarPPDB, "id" | "noPendaftaran" | "tanggalDaftar" | "statusVerifikasi" | "statusKelulusan">) => string;
  updateStatusVerifikasiPPDB: (id: string, status: PendaftarPPDB["statusVerifikasi"], catatan?: string) => void;
  updateStatusKelulusanPPDB: (id: string, status: PendaftarPPDB["statusKelulusan"]) => void;
  daftarAsetSarpras: AsetSarpras[];
  tambahAsetSarpras: (aset: Omit<AsetSarpras, "id">) => void;
  updateAsetSarpras: (id: string, data: Partial<AsetSarpras>) => void;
  hapusAsetSarpras: (id: string) => void;
  daftarPeminjamanSarpras: PeminjamanSarpras[];
  tambahPeminjamanSarpras: (pinjam: Omit<PeminjamanSarpras, "id" | "kodePinjam" | "status">) => string;
  selesaikanPeminjamanSarpras: (id: string, kondisiKembali: "BAIK" | "RUSAK" | "HILANG", catatan?: string) => void;
  daftarBuku: BukuPerpus[];
  tambahBuku: (buku: Omit<BukuPerpus, "id">) => void;
  updateBuku: (id: string, data: Partial<BukuPerpus>) => void;
  hapusBuku: (id: string) => void;
  daftarPeminjamanBuku: PeminjamanBuku[];
  pinjamBuku: (pinjam: Omit<PeminjamanBuku, "id" | "kodePinjam" | "status" | "denda" | "statusDenda">) => string;
  kembalikanBuku: (id: string, denda?: number, catatan?: string) => void;
  bayarDendaBuku: (id: string) => void;
  daftarEkskul: Ekstrakurikuler[];
  tambahEkskul: (ekskul: Omit<Ekstrakurikuler, "id">) => void;
  updateEkskul: (id: string, data: Partial<Ekstrakurikuler>) => void;
  hapusEkskul: (id: string) => void;
  daftarAnggotaEkskul: AnggotaEkskul[];
  tambahAnggotaEkskul: (anggota: Omit<AnggotaEkskul, "id">) => void;
  hapusAnggotaEkskul: (id: string) => void;
  updateNilaiEkskul: (id: string, predikatNilai: AnggotaEkskul["predikatNilai"], kehadiranPersen: number, catatanPembina?: string) => void;
  daftarAlumni: AlumniRecord[];
  tambahAlumni: (alumni: Omit<AlumniRecord, "id">) => void;
  updateAlumni: (id: string, data: Partial<AlumniRecord>) => void;
  hapusAlumni: (id: string) => void;
  daftarUjianCBT: UjianCBT[];
  tambahUjianCBT: (ujian: Omit<UjianCBT, "id" | "tokenUjian">) => string;
  updateUjianCBT: (id: string, data: Partial<UjianCBT>) => void;
  hapusUjianCBT: (id: string) => void;
  regenerateTokenCBT: (id: string) => string;
  daftarHasilCBT: HasilSiswaCBT[];
  resetSesiCBT: (hasilId: string) => void;
  loginAs: (role: UserRole, email?: string) => void;
  logout: () => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [daftarGuru, setDaftarGuru] = useState<Guru[]>(daftarGuruAwal);
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>(daftarKelasAwal);
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

  
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState<string>("2024/2025");
  const [semesterAktif, setSemesterAktif] = useState<"Ganjil" | "Genap">("Ganjil");
  const [daftarMapel, setDaftarMapel] = useState<MataPelajaran[]>(daftarMapelAwal);
  const [daftarAgendaAkademik, setDaftarAgendaAkademik] = useState<AgendaAkademik[]>(daftarAgendaAkademikAwal);
  const [daftarPengumuman, setDaftarPengumuman] = useState<Pengumuman[]>(daftarPengumumanAwal);
  const [daftarPPDB, setDaftarPPDB] = useState<PendaftarPPDB[]>(daftarPPDBAwal);
  const [daftarAsetSarpras, setDaftarAsetSarpras] = useState<AsetSarpras[]>(daftarAsetSarprasAwal);
  const [daftarPeminjamanSarpras, setDaftarPeminjamanSarpras] = useState<PeminjamanSarpras[]>(daftarPeminjamanSarprasAwal);
  const [daftarBuku, setDaftarBuku] = useState<BukuPerpus[]>(daftarBukuAwal);
  const [daftarPeminjamanBuku, setDaftarPeminjamanBuku] = useState<PeminjamanBuku[]>(daftarPeminjamanBukuAwal);
  const [daftarEkskul, setDaftarEkskul] = useState<Ekstrakurikuler[]>(daftarEkskulAwal);
  const [daftarAnggotaEkskul, setDaftarAnggotaEkskul] = useState<AnggotaEkskul[]>(daftarAnggotaEkskulAwal);
  const [daftarAlumni, setDaftarAlumni] = useState<AlumniRecord[]>(daftarAlumniAwal);
  const [daftarUjianCBT, setDaftarUjianCBT] = useState<UjianCBT[]>(daftarUjianCBTAwal);
  const [daftarHasilCBT, setDaftarHasilCBT] = useState<HasilSiswaCBT[]>(daftarHasilCBTAwal);
  const [daftarSiswaInduk, setDaftarSiswaInduk] = useState<SiswaInduk[]>(daftarSiswaIndukAwal);

    const [daftarTagihanSPP, setDaftarTagihanSPP] = useState<TagihanSPP[]>(daftarTagihanSPPAwal);
    const [daftarTugas, setDaftarTugas] = useState<Tugas[]>(daftarTugasAwal);
  const [daftarMateri, setDaftarMateri] = useState<MateriAjar[]>(daftarMateriAwal);
  const [daftarNilai, setDaftarNilai] = useState<NilaiSiswa[]>(daftarNilaiAwal);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(USER_GURU_DEFAULT);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

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
      tahunAjaranAktif,
      semesterAktif,
      setTahunAjaran: (tahun: string, semester: "Ganjil" | "Genap") => {
        setTahunAjaranAktif(tahun);
        setSemesterAktif(semester);
      },
      daftarMapel,
      tambahMapel: (entry: Omit<MataPelajaran, "id">) => {
        const baru: MataPelajaran = { ...entry, id: "mp-" + Date.now() };
        setDaftarMapel((prev) => [baru, ...prev]);
      },
      hapusMapel: (id: string) => {
        setDaftarMapel((prev) => prev.filter((m) => m.id !== id));
      },
      daftarSiswaInduk,
      tambahSiswaInduk: (entry: Omit<SiswaInduk, "id">) => {
        const baru: SiswaInduk = { ...entry, id: "s-" + Date.now() };
        setDaftarSiswaInduk((prev) => [baru, ...prev]);
      },
      hapusSiswaInduk: (id: string) => {
        setDaftarSiswaInduk((prev) => prev.filter((s) => s.id !== id));
      },
      daftarTagihanSPP,
      bayarTagihanSPP: (id: string, metode: "TRANSFER_BANK" | "TUNAI_KASIR" | "QRIS", catatan?: string) => {
        setDaftarTagihanSPP((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "LUNAS" as const,
                  tanggalBayar: new Date().toISOString().split("T")[0],
                  metodeBayar: metode,
                  catatan: catatan || t.catatan,
                }
              : t
          )
        );
      },
      tambahTagihanSPP: (entry: Omit<TagihanSPP, "id" | "noKwitansi">) => {
        const id = "spp-" + Date.now();
        const noKwitansi = "KW-" + new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, "0") + "-" + String(Math.floor(100 + Math.random() * 900));
        setDaftarTagihanSPP((prev) => [{ ...entry, id, noKwitansi }, ...prev]);
      },
      daftarTugas,
      tambahTugas: (entry: Omit<Tugas, "id">) => {
        const baru: Tugas = { ...entry, id: "t-" + Date.now() };
        setDaftarTugas((prev) => [baru, ...prev]);
      },
      hapusTugas: (id: string) => {
        setDaftarTugas((prev) => prev.filter((t) => t.id !== id));
      },
      daftarMateri,
      tambahMateri: (entry: Omit<MateriAjar, "id">) => {
        const baru: MateriAjar = { ...entry, id: "m-" + Date.now() };
        setDaftarMateri((prev) => [baru, ...prev]);
      },
      hapusMateri: (id: string) => {
        setDaftarMateri((prev) => prev.filter((m) => m.id !== id));
      },
      daftarNilai,
      updateNilaiSiswa: (id: string, nilaiTugas: number, nilaiFormatif: number, nilaiSumatif: number) => {
        const akhir = Math.round(nilaiTugas * 0.3 + nilaiFormatif * 0.3 + nilaiSumatif * 0.4);
        const predikat: "A" | "B" | "C" | "D" =
          akhir >= 88 ? "A" : akhir >= 78 ? "B" : akhir >= 68 ? "C" : "D";
        setDaftarNilai((prev) =>
          prev.map((n) =>
            n.id === id
              ? {
                  ...n,
                  nilaiTugas,
                  nilaiFormatif,
                  nilaiSumatif,
                  nilaiAkhir: akhir,
                  predikat,
                }
              : n
          )
        );
      },
      tambahKelas: (entry: Omit<Kelas, "id">) => {
        const baru: Kelas = { ...entry, id: "k-" + Date.now() };
        setDaftarKelas((prev) => [...prev, baru]);
      },
      hapusKelas: (id: string) => {
        setDaftarKelas((prev) => prev.filter((k) => k.id !== id));
      },
      updateKelas: (id: string, data: Partial<Kelas>) => {
        setDaftarKelas((prev) => prev.map((k) => (k.id === id ? { ...k, ...data } : k)));
      },
      pindahSiswaRombel: (siswaId: string, kelasBaru: string) => {
        setDaftarSiswaInduk((prev) =>
          prev.map((s) => (s.id === siswaId ? { ...s, kelas: kelasBaru } : s))
        );
      },
      daftarAgendaAkademik,
      tambahAgendaAkademik: (entry: Omit<AgendaAkademik, "id">) => {
        const baru: AgendaAkademik = { ...entry, id: "ag-" + Date.now() };
        setDaftarAgendaAkademik((prev) => [baru, ...prev]);
      },
      hapusAgendaAkademik: (id: string) => {
        setDaftarAgendaAkademik((prev) => prev.filter((a) => a.id !== id));
      },
      updateAgendaAkademik: (id: string, data: Partial<AgendaAkademik>) => {
        setDaftarAgendaAkademik((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
      },
      daftarPengumuman,
      tambahPengumuman: (entry: Omit<Pengumuman, "id">) => {
        const baru: Pengumuman = { ...entry, id: "p-" + Date.now() };
        setDaftarPengumuman((prev) => [baru, ...prev]);
      },
      hapusPengumuman: (id: string) => {
        setDaftarPengumuman((prev) => prev.filter((p) => p.id !== id));
      },
      updatePengumuman: (id: string, data: Partial<Pengumuman>) => {
        setDaftarPengumuman((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
      },
      togglePinPengumuman: (id: string) => {
        setDaftarPengumuman((prev) => prev.map((p) => (p.id === id ? { ...p, pin: !p.pin } : p)));
      },
      daftarPPDB,
      tambahPendaftarPPDB: (entry: Omit<PendaftarPPDB, "id" | "noPendaftaran" | "tanggalDaftar" | "statusVerifikasi" | "statusKelulusan">) => {
        const noReg = "PPDB-2024-" + String(daftarPPDB.length + 1).padStart(3, "0");
        const todayStr = new Date().toISOString().split("T")[0];
        const baru: PendaftarPPDB = {
          ...entry,
          id: "ppdb-" + Date.now(),
          noPendaftaran: noReg,
          tanggalDaftar: todayStr,
          statusVerifikasi: "MENUNGGU",
          statusKelulusan: "PROSES",
        };
        setDaftarPPDB((prev) => [baru, ...prev]);
        return noReg;
      },
      updateStatusVerifikasiPPDB: (id: string, status: PendaftarPPDB["statusVerifikasi"], catatan?: string) => {
        setDaftarPPDB((prev) =>
          prev.map((p) => (p.id === id ? { ...p, statusVerifikasi: status, catatanVerifikasi: catatan || p.catatanVerifikasi } : p))
        );
      },
      updateStatusKelulusanPPDB: (id: string, status: PendaftarPPDB["statusKelulusan"]) => {
        setDaftarPPDB((prev) =>
          prev.map((p) => (p.id === id ? { ...p, statusKelulusan: status } : p))
        );
      },
      daftarAsetSarpras,
      tambahAsetSarpras: (entry: Omit<AsetSarpras, "id">) => {
        const baru: AsetSarpras = { ...entry, id: "ast-" + Date.now() };
        setDaftarAsetSarpras((prev) => [baru, ...prev]);
      },
      updateAsetSarpras: (id: string, data: Partial<AsetSarpras>) => {
        setDaftarAsetSarpras((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
      },
      hapusAsetSarpras: (id: string) => {
        setDaftarAsetSarpras((prev) => prev.filter((a) => a.id !== id));
      },
      daftarPeminjamanSarpras,
      tambahPeminjamanSarpras: (entry: Omit<PeminjamanSarpras, "id" | "kodePinjam" | "status">) => {
        const noPinjam = "PJM-2024-" + String(daftarPeminjamanSarpras.length + 1).padStart(3, "0");
        const baru: PeminjamanSarpras = {
          ...entry,
          id: "pjm-" + Date.now(),
          kodePinjam: noPinjam,
          status: "DIPINJAM",
        };
        setDaftarAsetSarpras((prev) =>
          prev.map((a) =>
            a.id === entry.asetId
              ? { ...a, jumlahTersedia: Math.max(0, a.jumlahTersedia - entry.jumlahUnit) }
              : a
          )
        );
        setDaftarPeminjamanSarpras((prev) => [baru, ...prev]);
        return noPinjam;
      },
      selesaikanPeminjamanSarpras: (id: string, kondisiKembali: "BAIK" | "RUSAK" | "HILANG", catatan?: string) => {
        const target = daftarPeminjamanSarpras.find((p) => p.id === id);
        const todayStr = new Date().toISOString().split("T")[0];
        if (target) {
          setDaftarAsetSarpras((prev) =>
            prev.map((a) => {
              if (a.id === target.asetId) {
                const tambahBalik = kondisiKembali === "HILANG" ? 0 : target.jumlahUnit;
                return {
                  ...a,
                  jumlahTersedia: Math.min(a.jumlahTotal, a.jumlahTersedia + tambahBalik),
                  kondisi: kondisiKembali === "RUSAK" ? "RUSAK_RINGAN" : a.kondisi,
                };
              }
              return a;
            })
          );
        }
        setDaftarPeminjamanSarpras((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: "KEMBALI",
                  tanggalKembali: todayStr,
                  kondisiKembali,
                  catatanPengembalian: catatan || p.catatanPengembalian,
                }
              : p
          )
        );
      },
      daftarBuku,
      tambahBuku: (entry: Omit<BukuPerpus, "id">) => {
        const baru: BukuPerpus = { ...entry, id: "bk-" + Date.now() };
        setDaftarBuku((prev) => [baru, ...prev]);
      },
      updateBuku: (id: string, data: Partial<BukuPerpus>) => {
        setDaftarBuku((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
      },
      hapusBuku: (id: string) => {
        setDaftarBuku((prev) => prev.filter((b) => b.id !== id));
      },
      daftarPeminjamanBuku,
      pinjamBuku: (entry: Omit<PeminjamanBuku, "id" | "kodePinjam" | "status" | "denda" | "statusDenda">) => {
        const noPinjam = "SIP-2024-" + String(daftarPeminjamanBuku.length + 1).padStart(3, "0");
        const baru: PeminjamanBuku = {
          ...entry,
          id: "pb-" + Date.now(),
          kodePinjam: noPinjam,
          status: "DIPINJAM",
          denda: 0,
          statusDenda: "TIDAK_ADA",
        };
        // Deduct available copies in book
        setDaftarBuku((prev) =>
          prev.map((b) =>
            b.id === entry.bukuId
              ? { ...b, eksemplarTersedia: Math.max(0, b.eksemplarTersedia - 1) }
              : b
          )
        );
        setDaftarPeminjamanBuku((prev) => [baru, ...prev]);
        return noPinjam;
      },
      kembalikanBuku: (id: string, denda: number = 0, catatan?: string) => {
        const target = daftarPeminjamanBuku.find((p) => p.id === id);
        const todayStr = new Date().toISOString().split("T")[0];
        if (target) {
          setDaftarBuku((prev) =>
            prev.map((b) =>
              b.id === target.bukuId
                ? { ...b, eksemplarTersedia: Math.min(b.jumlahEksemplar, b.eksemplarTersedia + 1) }
                : b
            )
          );
        }
        setDaftarPeminjamanBuku((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: "KEMBALI",
                  tanggalKembali: todayStr,
                  denda: denda,
                  statusDenda: denda > 0 ? "BELUM_LUNAS" : "TIDAK_ADA",
                  catatanPetugas: catatan || p.catatanPetugas,
                }
              : p
          )
        );
      },
      bayarDendaBuku: (id: string) => {
        setDaftarPeminjamanBuku((prev) =>
          prev.map((p) => (p.id === id ? { ...p, statusDenda: "LUNAS" } : p))
        );
      },
      daftarEkskul,
      tambahEkskul: (entry: Omit<Ekstrakurikuler, "id">) => {
        const baru: Ekstrakurikuler = { ...entry, id: "eks-" + Date.now() };
        setDaftarEkskul((prev) => [baru, ...prev]);
      },
      updateEkskul: (id: string, data: Partial<Ekstrakurikuler>) => {
        setDaftarEkskul((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
      },
      hapusEkskul: (id: string) => {
        setDaftarEkskul((prev) => prev.filter((e) => e.id !== id));
        setDaftarAnggotaEkskul((prev) => prev.filter((a) => a.ekskulId !== id));
      },
      daftarAnggotaEkskul,
      tambahAnggotaEkskul: (entry: Omit<AnggotaEkskul, "id">) => {
        const baru: AnggotaEkskul = { ...entry, id: "ang-" + Date.now() };
        setDaftarAnggotaEkskul((prev) => [baru, ...prev]);
      },
      hapusAnggotaEkskul: (id: string) => {
        setDaftarAnggotaEkskul((prev) => prev.filter((a) => a.id !== id));
      },
      updateNilaiEkskul: (id: string, predikatNilai: AnggotaEkskul["predikatNilai"], kehadiranPersen: number, catatanPembina?: string) => {
        setDaftarAnggotaEkskul((prev) =>
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  predikatNilai,
                  kehadiranPersen,
                  catatanPembina: catatanPembina || a.catatanPembina,
                }
              : a
          )
        );
      },
      daftarAlumni,
      tambahAlumni: (entry: Omit<AlumniRecord, "id">) => {
        const baru: AlumniRecord = { ...entry, id: "alm-" + Date.now() };
        setDaftarAlumni((prev) => [baru, ...prev]);
      },
      updateAlumni: (id: string, data: Partial<AlumniRecord>) => {
        setDaftarAlumni((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
      },
      hapusAlumni: (id: string) => {
        setDaftarAlumni((prev) => prev.filter((a) => a.id !== id));
      },
      daftarUjianCBT,
      tambahUjianCBT: (entry: Omit<UjianCBT, "id" | "tokenUjian">) => {
        const tokenBaru = Math.random().toString(36).substring(2, 8).toUpperCase();
        const baru: UjianCBT = {
          ...entry,
          id: "cbt-" + Date.now(),
          tokenUjian: tokenBaru,
        };
        setDaftarUjianCBT((prev) => [baru, ...prev]);
        return baru.id;
      },
      updateUjianCBT: (id: string, data: Partial<UjianCBT>) => {
        setDaftarUjianCBT((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
      },
      hapusUjianCBT: (id: string) => {
        setDaftarUjianCBT((prev) => prev.filter((u) => u.id !== id));
        setDaftarHasilCBT((prev) => prev.filter((h) => h.ujianId !== id));
      },
      regenerateTokenCBT: (id: string) => {
        const tokenBaru = Math.random().toString(36).substring(2, 8).toUpperCase();
        setDaftarUjianCBT((prev) =>
          prev.map((u) => (u.id === id ? { ...u, tokenUjian: tokenBaru } : u))
        );
        return tokenBaru;
      },
      daftarHasilCBT,
      resetSesiCBT: (hasilId: string) => {
        setDaftarHasilCBT((prev) =>
          prev.map((h) =>
            h.id === hasilId
              ? { ...h, statusPengerjaan: "SEDANG_MENGERJAKAN", waktuSelesai: "-" }
              : h
          )
        );
      },
      loginAs: (role: UserRole, email?: string) => {
        let user: CurrentUser;
        switch (role) {
          case "super_admin":
            user = { ...USER_SUPER_ADMIN_DEFAULT, email: email || USER_SUPER_ADMIN_DEFAULT.email };
            break;
          case "admin_sekolah":
          case "admin":
            user = { ...USER_ADMIN_SEKOLAH_DEFAULT, email: email || USER_ADMIN_SEKOLAH_DEFAULT.email };
            break;
          case "kepsek":
            user = { ...USER_KEPSEK_DEFAULT, email: email || USER_KEPSEK_DEFAULT.email };
            break;
          case "tu":
            user = { ...USER_TU_DEFAULT, email: email || USER_TU_DEFAULT.email };
            break;
          case "siswa":
            user = { ...USER_SISWA_DEFAULT, email: email || USER_SISWA_DEFAULT.email };
            break;
          case "orang_tua":
            user = { ...USER_ORTU_DEFAULT, email: email || USER_ORTU_DEFAULT.email };
            break;
          case "guru":
          default:
            user = { ...USER_GURU_DEFAULT, email: email || USER_GURU_DEFAULT.email };
            break;
        }
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
      isMobileMenuOpen,
      setMobileMenuOpen,
      toggleMobileMenu,
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
      daftarAsetSarpras,
      daftarPeminjamanSarpras,
      daftarBuku,
      daftarPeminjamanBuku,
      daftarEkskul,
      daftarAnggotaEkskul,
      daftarAlumni,
      daftarUjianCBT,
      daftarHasilCBT,
      isMobileMenuOpen,
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

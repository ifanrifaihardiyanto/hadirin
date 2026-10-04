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

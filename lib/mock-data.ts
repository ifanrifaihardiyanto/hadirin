export type StatusKey = "H" | "S" | "I" | "A";

export interface Siswa {
  id: string;
  nama: string;
  nis: string;
  status: StatusKey | null;
}

const namaSiswa = [
  "Ahmad Fadillah",
  "Bunga Citra",
  "Dedi Kurniawan",
  "Eka Putri",
  "Farhan Maulana",
  "Gita Ramadhani",
  "Hafiz Aditya",
  "Indah Permata",
  "Joko Prasetyo",
  "Kirana Salsabila",
  "Lutfi Hakim",
  "Mutiara Anjani",
  "Naufal Rizky",
  "Olivia Zahra",
  "Putra Wibowo",
  "Qonita Rahma",
  "Rangga Saputra",
  "Salsa Amelia",
  "Taufik Hidayat",
  "Umi Kalsum",
];

export function buatSiswa(): Siswa[] {
  return namaSiswa.map((nama, i) => ({
    id: `s${i + 1}`,
    nama,
    nis: `24${String(i + 1).padStart(3, "0")}`,
    status: "H",
  }));
}

export interface RekapSiswa {
  nama: string;
  nis: string;
  kelas: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  totalSesi: number;
}

export const rekapBulanIni: RekapSiswa[] = [
  { nama: "Ahmad Fadillah", nis: "24001", kelas: "X IPA 1", hadir: 18, sakit: 1, izin: 0, alpha: 1, totalSesi: 20 },
  { nama: "Bunga Citra", nis: "24002", kelas: "X IPA 1", hadir: 20, sakit: 0, izin: 0, alpha: 0, totalSesi: 20 },
  { nama: "Dedi Kurniawan", nis: "24003", kelas: "X IPA 1", hadir: 14, sakit: 2, izin: 1, alpha: 3, totalSesi: 20 },
  { nama: "Eka Putri", nis: "24004", kelas: "X IPA 2", hadir: 19, sakit: 1, izin: 0, alpha: 0, totalSesi: 20 },
  { nama: "Farhan Maulana", nis: "24005", kelas: "X IPA 2", hadir: 13, sakit: 0, izin: 2, alpha: 5, totalSesi: 20 },
  { nama: "Gita Ramadhani", nis: "24006", kelas: "XI IPA 1", hadir: 20, sakit: 0, izin: 0, alpha: 0, totalSesi: 20 },
  { nama: "Hafiz Aditya", nis: "24007", kelas: "XI IPA 1", hadir: 16, sakit: 1, izin: 1, alpha: 2, totalSesi: 20 },
];

export const profilGuru = {
  nama: "Sari Wulandari",
  email: "sari.wulandari@sman3contoh.sch.id",
  telepon: "0812-3456-7890",
  mapel: ["Matematika", "Bahasa Indonesia"],
  sekolah: "SMA Negeri 3 Contoh",
  npsn: "20123456",
};

export interface KelasSekolah {
  kelas: string;
  jumlahSiswa: number;
  rataKehadiran: number;
}

export const kelasSeluruhSekolah: KelasSekolah[] = [
  { kelas: "X IPA 1", jumlahSiswa: 20, rataKehadiran: 96 },
  { kelas: "X IPA 2", jumlahSiswa: 20, rataKehadiran: 91 },
  { kelas: "X IPS 1", jumlahSiswa: 22, rataKehadiran: 89 },
  { kelas: "X IPS 2", jumlahSiswa: 21, rataKehadiran: 92 },
  { kelas: "XI IPA 1", jumlahSiswa: 20, rataKehadiran: 88 },
  { kelas: "XI IPA 2", jumlahSiswa: 22, rataKehadiran: 94 },
  { kelas: "XI IPS 1", jumlahSiswa: 20, rataKehadiran: 90 },
  { kelas: "XII IPA 1", jumlahSiswa: 21, rataKehadiran: 97 },
  { kelas: "XII IPA 2", jumlahSiswa: 20, rataKehadiran: 95 },
  { kelas: "XII IPS 1", jumlahSiswa: 22, rataKehadiran: 93 },
];

export const profilSekolah = {
  nama: "SMA Negeri 3 Contoh",
  npsn: "20123456",
  jenjang: "SMA",
  totalSiswa: 625,
  totalGuru: 42,
};

export const profilKepsek = {
  nama: "Hendra Wijaya",
  jabatan: "Kepala Sekolah",
};

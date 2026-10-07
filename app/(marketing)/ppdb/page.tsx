"use client";

import { useState } from "react";
import Link from "next/link";
import {
  School,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  UserPlus,
  Search,
  Printer,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Phone,
  FileText,
  Building,
  Check,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, type PendaftarPPDB } from "@/lib/store";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

export default function PublicPPDBPage() {
  const { daftarPPDB, tambahPendaftarPPDB, tahunAjaranAktif } = useStore();

  const [activeTab, setActiveTab] = useState<"form" | "cek">("form");

  // Registration Form State
  const [nama, setNama] = useState("");
  const [nisn, setNisn] = useState("");
  const [nik, setNik] = useState("");
  const [asalSekolah, setAsalSekolah] = useState("");
  const [jalur, setJalur] = useState<PendaftarPPDB["jalur"]>("ZONASI");
  const [pilihanJurusan, setPilihanJurusan] = useState<PendaftarPPDB["pilihanJurusan"]>("MIPA");
  const [nilaiRataRapor, setNilaiRataRapor] = useState("88.5");
  const [namaWali, setNamaWali] = useState("");
  const [teleponWali, setTeleponWali] = useState("");
  const [berkasKK, setBerkasKK] = useState(true);
  const [berkasAkta, setBerkasAkta] = useState(true);
  const [berkasRapor, setBerkasRapor] = useState(true);

  // Success state after registration
  const [registrationSuccessNo, setRegistrationSuccessNo] = useState<string | null>(null);

  // Search status state
  const [searchQuery, setSearchQuery] = useState("");
  const [foundStudent, setFoundStudent] = useState<PendaftarPPDB | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !nisn || !asalSekolah) return;

    const payload = {
      nama: nama.trim(),
      nisn: nisn.trim(),
      nik: nik.trim() || "3201" + Math.floor(100000000000 + Math.random() * 900000000000),
      asal_sekolah: asalSekolah.trim(),
      jalur,
      pilihan_jurusan: pilihanJurusan,
      nilai_rata_rapor: Number(nilaiRataRapor) || 85,
      nama_wali: namaWali.trim() || "Orang Tua Calon Siswa",
      telepon_wali: teleponWali.trim() || "0812-" + Math.floor(1000 + Math.random() * 9000),
      berkas_kk: berkasKK,
      berkas_akta: berkasAkta,
      berkas_rapor: berkasRapor,
    };

    try {
      await api.daftarPPDBPublic(payload);
    } catch (err) {
      console.warn("Gagal menyimpan pendaftaran ke server database (fallback aktif):", err);
    }

    const noReg = tambahPendaftarPPDB({
      nama: payload.nama,
      nisn: payload.nisn,
      nik: payload.nik,
      asalSekolah: payload.asal_sekolah,
      jalur,
      pilihanJurusan,
      nilaiRataRapor: payload.nilai_rata_rapor,
      namaWali: payload.nama_wali,
      teleponWali: payload.telepon_wali,
      berkasKK,
      berkasAkta,
      berkasRapor,
    });

    setRegistrationSuccessNo(noReg);
  };

  const handleSearchStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const q = searchQuery.trim().toLowerCase();

    try {
      const res = await api.getPPDBList();
      const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const foundInApi = raw.find(
        (p: any) =>
          (p.no_pendaftaran && p.no_pendaftaran.toLowerCase() === q) ||
          (p.noPendaftaran && p.noPendaftaran.toLowerCase() === q) ||
          (p.nisn && p.nisn.toLowerCase() === q)
      );

      if (foundInApi) {
        setFoundStudent({
          id: String(foundInApi.id),
          noPendaftaran: foundInApi.no_pendaftaran || foundInApi.noPendaftaran || "PPDB-2026-000",
          nisn: foundInApi.nisn,
          nik: foundInApi.nik || "-",
          nama: foundInApi.nama,
          asalSekolah: foundInApi.asal_sekolah || foundInApi.asalSekolah || "-",
          jalur: foundInApi.jalur || "ZONASI",
          pilihanJurusan: foundInApi.pilihan_jurusan || foundInApi.pilihanJurusan || "MIPA",
          nilaiRataRapor: Number(foundInApi.nilai_rata_rapor || foundInApi.nilaiRataRapor) || 85,
          namaWali: foundInApi.nama_wali || foundInApi.namaWali || "-",
          teleponWali: foundInApi.telepon_wali || foundInApi.teleponWali || "-",
          statusVerifikasi: foundInApi.status_verifikasi || foundInApi.statusVerifikasi || "MENUNGGU_VERIFIKASI",
          statusKelulusan: (foundInApi.status_kelulusan || "PROSES") as PendaftarPPDB["statusKelulusan"],
          tanggalDaftar: foundInApi.created_at || "24 Juli 2026",
          berkasKK: true,
          berkasAkta: true,
          berkasRapor: true,
        });
        return;
      }
    } catch (err) {
      console.warn("Gagal cek status dari database (fallback aktif):", err);
    }

    const found = daftarPPDB.find(
      (p) => p.noPendaftaran.toLowerCase() === q || p.nisn.toLowerCase() === q
    );
    setFoundStudent(found || null);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Navigation */}
      <header className="border-b border-border bg-white sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
              <School size={20} />
            </div>
            <div>
              <span className="font-display text-base font-bold text-navy-950 block leading-tight">
                SMA Negeri 3 Contoh
              </span>
              <span className="text-[10px] text-muted-foreground block font-mono">
                Portal PPDB Online {tahunAjaranAktif}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-semibold text-navy-900 hover:text-navy-700 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
            >
              Login Staf &amp; Siswa
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white py-12 px-4 shadow-sm">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <Badge className="bg-white/10 text-white border-white/20 text-xs px-3 py-1">
            Penerimaan Peserta Didik Baru (PPDB) 2024/2025
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white">
            Bergabung Bersama SMAN 3 Contoh
          </h1>
          <p className="text-xs md:text-sm text-navy-200 max-w-2xl mx-auto leading-relaxed">
            Pendaftaran terintegrasi secara digital. Daftarkan diri Anda secara online, pilih jalur seleksi, dan pantau pengumuman kelulusan berkas secara langsung.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl text-xs">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Gelombang 1: Jalur Zonasi &amp; Prestasi</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl text-xs">
              <Sparkles size={14} className="text-amber-400" />
              <span>Kuota Terbuka: 240 Peserta Didik</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* Navigation Tabs */}
        <div className="flex rounded-2xl bg-white p-1.5 border border-slate-200 shadow-md mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("form");
              setRegistrationSuccessNo(null);
            }}
            className={cn(
              "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2",
              activeTab === "form"
                ? "bg-navy-900 text-white shadow-xs"
                : "text-slate-600 hover:text-navy-950"
            )}
          >
            <UserPlus size={15} />
            <span>Formulir Pendaftaran Siswa Baru</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cek")}
            className={cn(
              "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2",
              activeTab === "cek"
                ? "bg-navy-900 text-white shadow-xs"
                : "text-slate-600 hover:text-navy-950"
            )}
          >
            <Search size={15} />
            <span>Cek Status &amp; Cetak Bukti Pendaftaran</span>
          </button>
        </div>

        {/* TAB 1: FORMULIR PENDAFTARAN */}
        {activeTab === "form" && (
          <>
            {registrationSuccessNo ? (
              <Card className="border border-emerald-200 bg-white shadow-lg p-6 md:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-xs">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-1.5">
                  <h2 className="font-display text-2xl font-bold text-navy-950">
                    Pendaftaran Berhasil Dikirim!
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Selamat, berkas pendaftaran calon siswa telah masuk ke sistem panitia PPDB SMA Negeri 3 Contoh.
                  </p>
                </div>

                <div className="max-w-xs mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Nomor Registrasi Anda</span>
                  <span className="text-xl font-bold text-navy-950 block">{registrationSuccessNo}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block pt-1">Simpan nomor ini untuk cek kelulusan</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <Button
                    onClick={() => window.print()}
                    className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold gap-1.5"
                  >
                    <Printer size={14} />
                    <span>Cetak Tanda Bukti Pendaftaran</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRegistrationSuccessNo(null);
                      setNama("");
                      setNisn("");
                    }}
                    className="text-xs"
                  >
                    Daftarkan Siswa Lain
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="font-display text-lg font-bold text-navy-950">
                      Formulir Registrasi Calon Siswa Baru
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Lengkapi data identitas calon siswa dengan benar sesuai Kartu Keluarga dan Rapor SMP.
                    </p>
                  </div>

                  <form onSubmit={handleSubmitRegistration} className="space-y-5 text-xs">
                    {/* Bagian 1: Data Diri */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-navy-900 text-white text-[10px]">1</span>
                        Data Diri Calon Peserta Didik
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5 col-span-2">
                          <label className="font-bold text-slate-700">Nama Lengkap Siswa *</label>
                          <Input
                            required
                            placeholder="Masukkan nama lengkap sesuai Akta / Ijazah SMP"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">NISN (10 Digit) *</label>
                          <Input
                            required
                            maxLength={10}
                            placeholder="Contoh: 0081234567"
                            value={nisn}
                            onChange={(e) => setNisn(e.target.value)}
                            className="h-9 text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">NIK (KTP/KK) *</label>
                          <Input
                            required
                            maxLength={16}
                            placeholder="Contoh: 3201234567890001"
                            value={nik}
                            onChange={(e) => setNik(e.target.value)}
                            className="h-9 text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1.5 col-span-2">
                          <label className="font-bold text-slate-700">Asal Sekolah (SMP / MTs) *</label>
                          <Input
                            required
                            placeholder="Contoh: SMP Negeri 1 Jakarta / MTs Negeri 2"
                            value={asalSekolah}
                            onChange={(e) => setAsalSekolah(e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bagian 2: Jalur & Peminatan */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-navy-900 text-white text-[10px]">2</span>
                        Pilihan Jalur Seleksi &amp; Peminatan
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Jalur Pendaftaran *</label>
                          <select
                            value={jalur}
                            onChange={(e) => setJalur(e.target.value as any)}
                            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900 font-semibold"
                          >
                            <option value="ZONASI">Zonasi Domisili (50%)</option>
                            <option value="PRESTASI">Prestasi Akademik / Lomba (30%)</option>
                            <option value="AFIRMASI">Afirmasi / KIP (15%)</option>
                            <option value="MUTASI">Perpindahan Tugas Orang Tua (5%)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Peminatan / Jurusan *</label>
                          <select
                            value={pilihanJurusan}
                            onChange={(e) => setPilihanJurusan(e.target.value as any)}
                            className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900 font-semibold"
                          >
                            <option value="MIPA">MIPA (Matematika &amp; IPA)</option>
                            <option value="IPS">IPS (Ilmu Pengetahuan Sosial)</option>
                            <option value="BAHASA">Bahasa &amp; Budaya</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Nilai Rata-rata Rapor (Sem 1-5)</label>
                          <Input
                            type="number"
                            step="0.1"
                            min="60"
                            max="100"
                            value={nilaiRataRapor}
                            onChange={(e) => setNilaiRataRapor(e.target.value)}
                            className="h-9 text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bagian 3: Orang Tua & Dokumen */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <h3 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-navy-900 text-white text-[10px]">3</span>
                        Kontak Orang Tua &amp; Kelengkapan Berkas
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Nama Orang Tua / Wali *</label>
                          <Input
                            required
                            placeholder="Nama ayah / ibu / wali"
                            value={namaWali}
                            onChange={(e) => setNamaWali(e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Nomor WhatsApp Aktif *</label>
                          <Input
                            required
                            placeholder="Contoh: 0812-3456-7890 (Untuk notifikasi kelulusan)"
                            value={teleponWali}
                            onChange={(e) => setTeleponWali(e.target.value)}
                            className="h-9 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Checklist Dokumen */}
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2">
                        <span className="font-bold text-slate-700 block text-[11px]">
                          Pernyataan Kesiapan Dokumen Fisik / Digital:
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={berkasKK}
                              onChange={(e) => setBerkasKK(e.target.checked)}
                              className="rounded text-navy-900"
                            />
                            <span>Kartu Keluarga (KK)</span>
                          </label>
                          <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={berkasAkta}
                              onChange={(e) => setBerkasAkta(e.target.checked)}
                              className="rounded text-navy-900"
                            />
                            <span>Akta Kelahiran</span>
                          </label>
                          <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={berkasRapor}
                              onChange={(e) => setBerkasRapor(e.target.checked)}
                              className="rounded text-navy-900"
                            />
                            <span>Buku Rapor SMP (Legalisir)</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3">
                      <Button
                        type="submit"
                        className="w-full h-11 bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm rounded-xl gap-2 shadow-md cursor-pointer"
                      >
                        <span>Kirim Formulir Pendaftaran PPDB</span>
                        <ArrowRight size={16} />
                      </Button>
                      <p className="text-[11px] text-center text-slate-400 mt-2">
                        Dengan menekan tombol di atas, saya menyatakan bahwa data yang diisikan adalah benar dan dapat dipertanggungjawabkan.
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* TAB 2: CEK STATUS PENDAFTARAN */}
        {activeTab === "cek" && (
          <div className="space-y-4">
            <Card className="border border-slate-200 bg-white shadow-sm p-6">
              <form onSubmit={handleSearchStudent} className="space-y-3">
                <label className="font-bold text-navy-950 text-sm block">
                  Cari Data Pendaftar
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      required
                      placeholder="Masukkan Nomor Registrasi (misal: PPDB-2024-001) atau NISN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 text-xs font-mono bg-slate-50 border-slate-200"
                    />
                  </div>
                  <Button type="submit" className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold px-5 h-10">
                    Cek Status
                  </Button>
                </div>
              </form>
            </Card>

            {hasSearched && (
              <>
                {foundStudent ? (
                  <Card className="border border-border bg-white shadow-md overflow-hidden animate-in fade-in duration-200">
                    <div className="bg-navy-900 text-white p-5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-navy-200 font-mono">TANDA BUKTI PESERTA PPDB</span>
                        <h3 className="font-display text-xl font-bold">{foundStudent.nama}</h3>
                        <p className="text-xs text-navy-200">No. Registrasi: {foundStudent.noPendaftaran}</p>
                      </div>

                      <Badge className={cn(
                        "text-xs px-3 py-1 font-bold uppercase",
                        foundStudent.statusKelulusan === "LULUS"
                          ? "bg-emerald-500 text-white"
                          : foundStudent.statusKelulusan === "CADANGAN"
                          ? "bg-amber-500 text-white"
                          : "bg-white/20 text-white"
                      )}>
                        {foundStudent.statusKelulusan === "LULUS" ? "DITERIMA / LULUS" : foundStudent.statusKelulusan === "CADANGAN" ? "CADANGAN" : "PROSES SELEKSI"}
                      </Badge>
                    </div>

                    <CardContent className="p-6 space-y-4 text-xs">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-slate-400 text-[10px] block">NISN:</span>
                          <strong className="text-navy-950 font-mono">{foundStudent.nisn}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Asal Sekolah:</span>
                          <strong className="text-navy-950">{foundStudent.asalSekolah}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Jalur Seleksi:</span>
                          <strong className="text-navy-950">{foundStudent.jalur}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Pilihan Jurusan:</span>
                          <strong className="text-navy-950">{foundStudent.pilihanJurusan}</strong>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <span className="font-bold text-slate-800">Status Verifikasi Panitia:</span>
                          <Badge variant="outline" className="font-bold text-xs">
                            {foundStudent.statusVerifikasi}
                          </Badge>
                        </div>
                        {foundStudent.catatanVerifikasi && (
                          <p className="text-xs text-slate-600 pl-6">
                            Catatan: {foundStudent.catatanVerifikasi}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button
                          onClick={() => window.print()}
                          className="bg-navy-900 hover:bg-navy-800 text-white text-xs gap-1.5 font-bold"
                        >
                          <Printer size={14} />
                          <span>Cetak Kartu Tanda Peserta</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border border-rose-200 bg-rose-50/50 p-8 text-center text-xs text-rose-800">
                    <AlertCircle size={28} className="mx-auto text-rose-600 mb-2" />
                    <p className="font-bold text-sm">Data Pendaftar Tidak Ditemukan</p>
                    <p className="text-xs text-rose-600 mt-1">
                      Pastikan Nomor Registrasi atau NISN yang Anda masukkan sudah benar sesuai formulir.
                    </p>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

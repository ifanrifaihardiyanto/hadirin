"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Clock,
  LogOut,
  Palette,
  Users,
  Sparkles,
  CheckCircle2,
  X,
  Save,
  ShieldCheck,
  KeyRound,
  Check,
  School,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { profilSekolah as mockSekolah } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function AdminPengaturanPage() {
  const router = useRouter();
  const { logout, daftarGuru } = useStore();

  // Active Modals
  const [activeModal, setActiveModal] = useState<
    "profil" | "jam" | "akses" | "tema" | null
  >(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Profil Sekolah State
  const [sekolahData, setSekolahData] = useState({
    nama: mockSekolah.nama,
    npsn: mockSekolah.npsn,
    jenjang: mockSekolah.jenjang,
    akreditasi: "A (Unggul)",
    alamat: "Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan",
    telepon: "(021) 7890-1234",
    email: "info@sman3contoh.sch.id",
    kepsek: "Drs. Hendra Wijaya, M.Pd",
    nipKepsek: "19720315 199803 1 004",
  });

  // 2. Jam Pelajaran State
  const [jamConfig, setJamConfig] = useState({
    durasiJP: 45,
    jamMasuk: "07:00",
    toleransiTerlambat: 15,
    jamPulang: "15:30",
    istirahat1Mulai: "10:00",
    istirahat1Selesai: "10:15",
    istirahat2Mulai: "11:45",
    istirahat2Selesai: "12:30",
  });

  // 3. Hak Akses PTK State
  const [guruRoles, setGuruRoles] = useState<Record<string, string>>({
    g1: "Wali Kelas & Guru Pengajar",
    g2: "Guru Pengajar",
    g3: "Wakasek Kurikulum",
    g4: "Guru Pengajar & Piket",
  });

  // 4. Tema Antarmuka State
  const [selectedTheme, setSelectedTheme] = useState<string>("navy");

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="w-full space-y-6 max-w-5xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-navy-950 px-4 py-3 text-sm font-medium text-white shadow-2xl animate-in fade-in slide-in-from-top-4 border border-navy-800">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
          Pengaturan Sekolah &amp; Sistem
        </h1>
        <p className="text-xs text-muted-foreground">
          Konfigurasi profil institusi, jam pelajaran, hak akses pengguna, dan antarmuka sekolah
        </p>
      </div>

      {/* School Card */}
      <Card className="border-none bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white shadow-md">
        <CardContent className="flex items-center gap-5 p-6 md:p-7">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-white border border-white/20 shrink-0">
            <Building2 size={28} />
          </span>
          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="font-display text-xl font-bold text-white md:text-2xl">
                {sekolahData.nama}
              </p>
              <Badge variant="outline" className="border-white/20 bg-white/10 text-white text-[10px]">
                Akun Terverifikasi
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px]">
                Akreditasi {sekolahData.akreditasi}
              </Badge>
            </div>
            <p className="text-xs text-navy-200">
              NPSN: {sekolahData.npsn} · Jenjang: {sekolahData.jenjang} · Kepala Sekolah: {sekolahData.kepsek}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pengaturan Konfigurasi Akademik (Interaktif Sekarang!) */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-900/60">
            Konfigurasi Akademik
          </h2>
          <Card className="border-border bg-white shadow-xs">
            <CardContent className="divide-y divide-border p-0">
              {/* Item 1: Profil Sekolah */}
              <button
                type="button"
                onClick={() => setActiveModal("profil")}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-navy-50 text-navy-700 group-hover:bg-navy-900 group-hover:text-white transition-colors">
                    <Building2 size={17} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-navy-950 block">
                      Profil &amp; Identitas Sekolah
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Nama institusi, NPSN, akreditasi, kontak, dan alamat
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Item 2: Jam Pelajaran & Sesi */}
              <button
                type="button"
                onClick={() => setActiveModal("jam")}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700 group-hover:bg-sky-900 group-hover:text-white transition-colors">
                    <Clock size={17} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-navy-950 block">
                      Jam Pelajaran &amp; Durasi Sesi
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Durasi JP ({jamConfig.durasiJP} mnt), jam masuk ({jamConfig.jamMasuk}), dan batas toleransi
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Item 3: Kelola Hak Akses Guru & PTK */}
              <button
                type="button"
                onClick={() => setActiveModal("akses")}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-900 group-hover:text-white transition-colors">
                    <Users size={17} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-navy-950 block">
                      Kelola Hak Akses Guru &amp; Tenaga Kependidikan ({mockSekolah.totalGuru})
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Penugasan hak akses wali kelas, guru piket, dan kurikulum
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Item 4: Tema & Desain Antarmuka */}
              <button
                type="button"
                onClick={() => setActiveModal("tema")}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-900 group-hover:text-white transition-colors">
                    <Palette size={17} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-navy-950 block">
                      Tema &amp; Desain Antarmuka (Navy Classic)
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Kustomisasi warna primer dashboard dan tata letak
                    </span>
                  </div>
                </div>
                <Badge variant="navy" className="text-[10px]">
                  Aktif
                </Badge>
              </button>
            </CardContent>
          </Card>
        </section>

        {/* Status Langganan & Billing */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-900/60">
            Paket &amp; Langganan
          </h2>
          <Card className="border-border bg-white shadow-xs">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-navy-700" />
                  <span className="text-sm font-bold text-navy-950">Paket Sekolah Modern Pro</span>
                </div>
                <Badge variant="hadir">Aktif</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mencakup hingga {mockSekolah.totalSiswa} siswa dan {mockSekolah.totalGuru} dewan guru aktif. Seluruh fitur sinkronisasi, cetak laporan Excel &amp; PDF, serta notifikasi presensi aktif penuh.
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Masa Aktif: Hingga 31 Juli 2027</span>
                <Link
                  href="/harga"
                  className="text-xs font-semibold text-navy-900 hover:text-navy-700 flex items-center gap-1"
                >
                  <span>Kelola Paket SaaS</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer shadow-2xs"
        >
          <LogOut size={16} />
          Keluar dari Sesi Admin
        </Button>
      </div>

      {/* MODAL 1: Edit Profil & Identitas Sekolah */}
      {activeModal === "profil" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-navy-950">
                    Profil &amp; Identitas Sekolah
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Perbarui data identitas legal institusi sekolah.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Profil sekolah berhasil diperbarui!");
                setActiveModal(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Nama Resmi Sekolah *</label>
                <Input
                  required
                  value={sekolahData.nama}
                  onChange={(e) => setSekolahData({ ...sekolahData, nama: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">NPSN *</label>
                  <Input
                    required
                    value={sekolahData.npsn}
                    onChange={(e) => setSekolahData({ ...sekolahData, npsn: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Jenjang Sekolah *</label>
                  <select
                    value={sekolahData.jenjang}
                    onChange={(e) => setSekolahData({ ...sekolahData, jenjang: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="SD">SD / MI</option>
                    <option value="SMP">SMP / MTs</option>
                    <option value="SMA">SMA / MA</option>
                    <option value="SMK">SMK / Mak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Status Akreditasi</label>
                  <Input
                    value={sekolahData.akreditasi}
                    onChange={(e) => setSekolahData({ ...sekolahData, akreditasi: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Telepon Kantor</label>
                  <Input
                    value={sekolahData.telepon}
                    onChange={(e) => setSekolahData({ ...sekolahData, telepon: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Email Resmi Sekolah</label>
                <Input
                  type="email"
                  value={sekolahData.email}
                  onChange={(e) => setSekolahData({ ...sekolahData, email: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  value={sekolahData.alamat}
                  onChange={(e) => setSekolahData({ ...sekolahData, alamat: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:ring-2 focus:ring-navy-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Nama Kepala Sekolah</label>
                  <Input
                    value={sekolahData.kepsek}
                    onChange={(e) => setSekolahData({ ...sekolahData, kepsek: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">NIP Kepala Sekolah</label>
                  <Input
                    value={sekolahData.nipKepsek}
                    onChange={(e) => setSekolahData({ ...sekolahData, nipKepsek: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                  className="text-xs cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Jam Pelajaran & Durasi Sesi */}
      {activeModal === "jam" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-sky-900">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-navy-950">
                    Jam Pelajaran &amp; Durasi Sesi
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Konfigurasi jam masuk, durasi jam pelajaran, dan istirahat.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Konfigurasi jam pelajaran berhasil diperbarui!");
                setActiveModal(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Durasi 1 JP (Menit)</label>
                  <Input
                    type="number"
                    min="30"
                    max="60"
                    value={jamConfig.durasiJP}
                    onChange={(e) => setJamConfig({ ...jamConfig, durasiJP: Number(e.target.value) })}
                    className="h-9 text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Standar SMA/SMK: 45 menit/JP</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Toleransi Terlambat (Menit)</label>
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    value={jamConfig.toleransiTerlambat}
                    onChange={(e) => setJamConfig({ ...jamConfig, toleransiTerlambat: Number(e.target.value) })}
                    className="h-9 text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Presensi siswa &amp; guru</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Jam Bel Sekolah Berbunyi (Masuk)</label>
                  <Input
                    type="time"
                    value={jamConfig.jamMasuk}
                    onChange={(e) => setJamConfig({ ...jamConfig, jamMasuk: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Jam Bel Pulang KBM</label>
                  <Input
                    type="time"
                    value={jamConfig.jamPulang}
                    onChange={(e) => setJamConfig({ ...jamConfig, jamPulang: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2">
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wide">
                  Jadwal Waktu Istirahat Sekolah
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500">Istirahat 1 (Pagi)</span>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <Input
                        type="time"
                        value={jamConfig.istirahat1Mulai}
                        onChange={(e) => setJamConfig({ ...jamConfig, istirahat1Mulai: e.target.value })}
                        className="h-8 text-xs font-mono px-2"
                      />
                      <span>-</span>
                      <Input
                        type="time"
                        value={jamConfig.istirahat1Selesai}
                        onChange={(e) => setJamConfig({ ...jamConfig, istirahat1Selesai: e.target.value })}
                        className="h-8 text-xs font-mono px-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500">Istirahat 2 (Dzuhur/Makan)</span>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <Input
                        type="time"
                        value={jamConfig.istirahat2Mulai}
                        onChange={(e) => setJamConfig({ ...jamConfig, istirahat2Mulai: e.target.value })}
                        className="h-8 text-xs font-mono px-2"
                      />
                      <span>-</span>
                      <Input
                        type="time"
                        value={jamConfig.istirahat2Selesai}
                        onChange={(e) => setJamConfig({ ...jamConfig, istirahat2Selesai: e.target.value })}
                        className="h-8 text-xs font-mono px-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                  className="text-xs cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Simpan Jam Pelajaran
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Kelola Hak Akses Guru & PTK */}
      {activeModal === "akses" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-100 text-purple-900">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-navy-950">
                    Kelola Hak Akses Guru &amp; Tenaga Kependidikan
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Atur kewenangan peran dewan guru, wali kelas, kurikulum, dan staf TU.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Nama Guru &amp; Kontak</th>
                    <th className="py-2.5 px-3">Mapel Diampu</th>
                    <th className="py-2.5 px-3">Hak Akses / Peran</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {daftarGuru.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-navy-950">{g.nama}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{g.email}</p>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {g.mapel.join(", ")}
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={guruRoles[g.id] || "Guru Pengajar"}
                          onChange={(e) => {
                            setGuruRoles({ ...guruRoles, [g.id]: e.target.value });
                            showToast(`Hak akses ${g.nama} diubah ke ${e.target.value}.`);
                          }}
                          className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-medium text-navy-950 outline-none focus:ring-1 focus:ring-navy-900 cursor-pointer"
                        >
                          <option value="Guru Pengajar">Guru Pengajar</option>
                          <option value="Wali Kelas & Guru Pengajar">Wali Kelas</option>
                          <option value="Wakasek Kurikulum">Wakasek Kurikulum</option>
                          <option value="Guru Pengajar & Piket">Guru Piket</option>
                          <option value="Staf Tata Usaha">Staf Tata Usaha</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showToast(`Link reset password telah dikirim ke ${g.email}`)}
                          className="h-7 text-[11px] text-navy-800 hover:bg-slate-100 gap-1 px-2 cursor-pointer"
                        >
                          <KeyRound size={12} />
                          <span>Reset Sandi</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 shrink-0">
              <span className="text-xs text-slate-500">
                Total PTK: <strong className="text-navy-950 font-bold font-mono">{daftarGuru.length}</strong> akun aktif
              </span>
              <Button
                size="sm"
                onClick={() => setActiveModal(null)}
                className="bg-navy-900 hover:bg-navy-800 text-white text-xs cursor-pointer"
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Tema & Desain Antarmuka */}
      {activeModal === "tema" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-900">
                  <Palette size={18} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-navy-950">
                    Tema &amp; Desain Antarmuka
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Pilih skema warna utama tampilan sistem Hadirin.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { id: "navy", nama: "Navy Classic (Default)", desc: "Warna resmi standar Hadirin SaaS (Elegan & Resmi)", color: "bg-navy-900" },
                { id: "emerald", nama: "Emerald Green (Madrasah / Hijau)", desc: "Cocok untuk sekolah berbasis Islam / MTs / MA", color: "bg-emerald-700" },
                { id: "indigo", nama: "Royal Indigo Modern", desc: "Nuansa modern perguruan tinggi & sekolah internasional", color: "bg-indigo-700" },
                { id: "maroon", nama: "Crimson Executive", desc: "Nuansa prestisius merah tua berwibawa", color: "bg-rose-900" },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                    selectedTheme === t.id
                      ? "border-navy-900 bg-navy-50/40 ring-1 ring-navy-900"
                      : "border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn("h-7 w-7 rounded-lg shrink-0", t.color)} />
                    <div>
                      <p className="font-bold text-navy-950">{t.nama}</p>
                      <p className="text-[11px] text-slate-500">{t.desc}</p>
                    </div>
                  </div>
                  {selectedTheme === t.id && (
                    <Check size={18} className="text-navy-900 shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModal(null)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  showToast("Tema antarmuka berhasil diterapkan!");
                  setActiveModal(null);
                }}
                className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold cursor-pointer"
              >
                Terapkan Tema
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

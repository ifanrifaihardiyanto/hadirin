"use client";

import { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  Award
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface SekolahProfil {
  id?: number | string;
  nama: string;
  npsn: string;
  jenjang: string;
  akreditasi: string;
  alamat: string;
  kota?: string;
  telepon: string;
  email: string;
  kepsek: string;
  nipKepsek: string;
  paket_langganan?: string;
  status_langganan?: string;
  tanggal_kadaluarsa?: string;
  totalGuru?: number;
  totalSiswa?: number;
}

export default function AdminPengaturanPage() {
  const router = useRouter();
  const { logout } = useStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

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
  const [sekolahData, setSekolahData] = useState<SekolahProfil>({
    nama: "SMA Negeri 3 Unggulan",
    npsn: "20220412",
    jenjang: "SMA",
    akreditasi: "A (Unggul)",
    alamat: "Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan",
    telepon: "(021) 7890-1234",
    email: "info@sman3contoh.sch.id",
    kepsek: "Drs. Hendra Wijaya, M.Pd",
    nipKepsek: "19720315 199803 1 004",
    paket_langganan: "PRO_TAHUNAN",
    status_langganan: "AKTIF",
    tanggal_kadaluarsa: "24 Juli 2027",
    totalGuru: 42,
    totalSiswa: 720,
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

  // 3. Hak Akses PTK State & List
  const [guruList, setGuruList] = useState<any[]>([]);
  const [guruRoles, setGuruRoles] = useState<Record<string, string>>({
    g1: "Wali Kelas & Guru Pengajar",
    g2: "Guru Pengajar",
    g3: "Wakasek Kurikulum",
    g4: "Guru Pengajar & Piket",
  });

  // 4. Tema Antarmuka State
  const [selectedTheme, setSelectedTheme] = useState<string>("navy");

  // Load live data from Supabase / Laravel API
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [profilRes, guruRes] = await Promise.allSettled([
        api.getProfilSekolah(),
        api.getGuruList(),
      ]);

      if (profilRes.status === "fulfilled" && profilRes.value?.data) {
        const d = profilRes.value.data;
        setSekolahData((prev) => ({
          ...prev,
          ...d,
          akreditasi: d.akreditasi || "A (Unggul)",
          nipKepsek: d.nipKepsek || "19720315 199803 1 004",
        }));
        if (d.jamConfig) {
          setJamConfig((prev) => ({ ...prev, ...d.jamConfig }));
        }
      }

      if (guruRes.status === "fulfilled" && guruRes.value?.data) {
        const gList = Array.isArray(guruRes.value.data) ? guruRes.value.data : [];
        setGuruList(gList);
      }
    } catch (err) {
      console.error("Gagal memuat profil sekolah:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Simpan Profil ke Database
  const handleSaveProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateProfilSekolah({
        nama: sekolahData.nama,
        npsn: sekolahData.npsn,
        jenjang: sekolahData.jenjang,
        alamat: sekolahData.alamat,
        kota: sekolahData.kota || "",
        telepon: sekolahData.telepon,
        email: sekolahData.email,
        kepsek: sekolahData.kepsek,
      });

      if (res?.success) {
        showToast("Profil sekolah berhasil disimpan ke database!");
        setActiveModal(null);
        await loadData(true);
      } else {
        alert(res?.message || "Gagal menyimpan profil.");
      }
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message || "Terjadi kesalahan"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveJam = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Konfigurasi jam pelajaran berhasil diperbarui!");
    setActiveModal(null);
  };

  const handleSaveAkses = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Hak akses dewan guru berhasil diperbarui!");
    setActiveModal(null);
  };

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

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
            Pengaturan Sekolah &amp; Sistem
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Konfigurasi profil institusi, jam pelajaran, hak akses pengguna, dan antarmuka sekolah
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData(true)}
          disabled={refreshing || loading}
          className="text-xs h-9 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 w-fit"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin text-navy-600" : ""} />
          <span>Muat Ulang</span>
        </Button>
      </div>

      {/* School Card Utama */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse flex items-center gap-5">
          <div className="h-16 w-16 bg-slate-200 rounded-2xl shrink-0"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 w-64 bg-slate-200 rounded"></div>
            <div className="h-4 w-96 bg-slate-100 rounded"></div>
          </div>
        </div>
      ) : (
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
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pengaturan Konfigurasi Akademik */}
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
                      Kelola Hak Akses Guru &amp; Tenaga Kependidikan ({sekolahData.totalGuru ?? 42})
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
                      Tema &amp; Desain Antarmuka ({selectedTheme === "navy" ? "Navy Classic" : "Emerald Modern"})
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
                  <span className="text-sm font-bold text-navy-950">
                    Paket {sekolahData.paket_langganan?.replace("_", " ") || "PRO TAHUNAN"}
                  </span>
                </div>
                <Badge variant="hadir">
                  {sekolahData.status_langganan || "AKTIF"}
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Masa aktif hingga: <strong className="text-foreground">{sekolahData.tanggal_kadaluarsa || "24 Juli 2027"}</strong>
                </p>
                <p>
                  Kuota Siswa: <strong className="text-foreground">{(sekolahData.totalSiswa ?? 720).toLocaleString("id-ID")}</strong> / 1.000
                </p>
                <p>
                  Kuota Guru &amp; Staf: <strong className="text-foreground">{sekolahData.totalGuru ?? 42}</strong> / 80
                </p>
              </div>

              <div className="pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-medium border-navy-200 text-navy-900 hover:bg-navy-50"
                  onClick={() => alert("Menghubungi Tim Support Hadirin untuk Perpanjangan Lisensi SaaS")}
                >
                  Perpanjang / Upgrade Lisensi
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Logout Card */}
      <Card className="border-rose-100 bg-rose-50/50">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs font-semibold text-rose-950">Keluar dari Sesi</p>
            <p className="text-[11px] text-rose-700/80">
              Akhiri sesi administrasi pada perangkat ini
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="text-xs gap-1.5 bg-rose-600 hover:bg-rose-700"
          >
            <LogOut size={13} />
            Keluar
          </Button>
        </CardContent>
      </Card>

      {/* MODAL 1: PROFIL & IDENTITAS SEKOLAH */}
      {activeModal === "profil" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-navy-800" />
                <h3 className="font-semibold text-sm text-navy-950">
                  Ubah Profil &amp; Identitas Sekolah
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfil} className="p-4 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Nama Resmi Sekolah</label>
                <Input
                  required
                  value={sekolahData.nama}
                  onChange={(e) => setSekolahData({ ...sekolahData, nama: e.target.value })}
                  className="h-8.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">NPSN</label>
                  <Input
                    value={sekolahData.npsn}
                    onChange={(e) => setSekolahData({ ...sekolahData, npsn: e.target.value })}
                    className="h-8.5 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Jenjang</label>
                  <select
                    value={sekolahData.jenjang}
                    onChange={(e) => setSekolahData({ ...sekolahData, jenjang: e.target.value })}
                    className="w-full h-8.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-navy-600"
                  >
                    <option value="SD">SD / MI</option>
                    <option value="SMP">SMP / MTs</option>
                    <option value="SMA">SMA / MA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Alamat Lengkap</label>
                <Input
                  value={sekolahData.alamat}
                  onChange={(e) => setSekolahData({ ...sekolahData, alamat: e.target.value })}
                  className="h-8.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Nomor Telepon</label>
                  <Input
                    value={sekolahData.telepon}
                    onChange={(e) => setSekolahData({ ...sekolahData, telepon: e.target.value })}
                    className="h-8.5 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Email Resmi</label>
                  <Input
                    type="email"
                    value={sekolahData.email}
                    onChange={(e) => setSekolahData({ ...sekolahData, email: e.target.value })}
                    className="h-8.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Nama Kepala Sekolah</label>
                  <Input
                    value={sekolahData.kepsek}
                    onChange={(e) => setSekolahData({ ...sekolahData, kepsek: e.target.value })}
                    className="h-8.5 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">NIP Kepala Sekolah</label>
                  <Input
                    value={sekolahData.nipKepsek}
                    onChange={(e) => setSekolahData({ ...sekolahData, nipKepsek: e.target.value })}
                    className="h-8.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                  disabled={saving}
                  className="h-8 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="h-8 text-xs bg-navy-900 hover:bg-navy-800 text-white gap-1"
                >
                  <Save size={13} />
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: JAM PELAJARAN & SESI */}
      {activeModal === "jam" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-700" />
                <h3 className="font-semibold text-sm text-navy-950">
                  Konfigurasi Jam Pelajaran &amp; Sesi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveJam} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Durasi Per JP (Menit)</label>
                  <Input
                    type="number"
                    value={jamConfig.durasiJP}
                    onChange={(e) => setJamConfig({ ...jamConfig, durasiJP: parseInt(e.target.value) || 45 })}
                    className="h-8.5 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Toleransi Keterlambatan (Menit)</label>
                  <Input
                    type="number"
                    value={jamConfig.toleransiTerlambat}
                    onChange={(e) => setJamConfig({ ...jamConfig, toleransiTerlambat: parseInt(e.target.value) || 15 })}
                    className="h-8.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Jam Masuk Sekolah</label>
                  <Input
                    type="time"
                    value={jamConfig.jamMasuk}
                    onChange={(e) => setJamConfig({ ...jamConfig, jamMasuk: e.target.value })}
                    className="h-8.5 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Jam Pulang Sekolah</label>
                  <Input
                    type="time"
                    value={jamConfig.jamPulang}
                    onChange={(e) => setJamConfig({ ...jamConfig, jamPulang: e.target.value })}
                    className="h-8.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="font-semibold text-navy-950">Waktu Istirahat</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600">Istirahat 1 Mulai</label>
                    <Input
                      type="time"
                      value={jamConfig.istirahat1Mulai}
                      onChange={(e) => setJamConfig({ ...jamConfig, istirahat1Mulai: e.target.value })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600">Istirahat 1 Selesai</label>
                    <Input
                      type="time"
                      value={jamConfig.istirahat1Selesai}
                      onChange={(e) => setJamConfig({ ...jamConfig, istirahat1Selesai: e.target.value })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                  className="h-8 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 text-xs bg-navy-900 hover:bg-navy-800 text-white gap-1"
                >
                  <Save size={13} />
                  Simpan Konfigurasi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: KELOLA HAK AKSES DEWAN GURU */}
      {activeModal === "akses" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-700" />
                <h3 className="font-semibold text-sm text-navy-950">
                  Kelola Hak Akses &amp; Penugasan PTK
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAkses} className="p-4 space-y-3.5 text-xs">
              <p className="text-[11px] text-slate-500">
                Atur peran struktural dan akses guru untuk jadwal mengajar, supervisi absensi, dan jurnal kelas.
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100">
                {(guruList.length > 0 ? guruList.slice(0, 5) : [
                  { id: "g1", nama: "Budi Santoso, S.Pd", nuptk: "12345678" },
                  { id: "g2", nama: "Siti Rahma, M.Pd", nuptk: "23456789" },
                  { id: "g3", nama: "Ahmad Fauzi, S.Kom", nuptk: "34567890" },
                ]).map((g: any) => (
                  <div key={g.id} className="pt-2 pb-1 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-navy-950 text-xs">{g.nama}</p>
                      <p className="text-[10px] text-slate-500 font-mono">NUPTK: {g.nuptk || "-"}</p>
                    </div>
                    <select
                      value={guruRoles[g.id] || "Guru Pengajar"}
                      onChange={(e) => setGuruRoles({ ...guruRoles, [g.id]: e.target.value })}
                      className="h-7.5 rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-700"
                    >
                      <option value="Guru Pengajar">Guru Pengajar</option>
                      <option value="Wali Kelas & Guru Pengajar">Wali Kelas</option>
                      <option value="Guru Pengajar & Piket">Guru Piket</option>
                      <option value="Wakasek Kurikulum">Wakasek Kurikulum</option>
                      <option value="Bimbingan Konseling">Guru BK</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                  className="h-8 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 text-xs bg-navy-900 hover:bg-navy-800 text-white gap-1"
                >
                  <Save size={13} />
                  Simpan Hak Akses
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: TEMA ANTARMUKA */}
      {activeModal === "tema" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-700" />
                <h3 className="font-semibold text-sm text-navy-950">
                  Pilih Tema Antarmuka
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div
                onClick={() => setSelectedTheme("navy")}
                className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                  selectedTheme === "navy" ? "border-navy-900 bg-navy-50/60" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-navy-900"></div>
                  <div>
                    <p className="font-semibold text-navy-950">Navy Classic (Default)</p>
                    <p className="text-[11px] text-slate-500">Kombinasi navy premium &amp; aksen amber</p>
                  </div>
                </div>
                {selectedTheme === "navy" && <Check size={16} className="text-navy-900" />}
              </div>

              <div
                onClick={() => setSelectedTheme("emerald")}
                className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                  selectedTheme === "emerald" ? "border-emerald-700 bg-emerald-50/60" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-700"></div>
                  <div>
                    <p className="font-semibold text-slate-900">Emerald Fresh</p>
                    <p className="text-[11px] text-slate-500">Nuansa hijau segar &amp; edukatif</p>
                  </div>
                </div>
                {selectedTheme === "emerald" && <Check size={16} className="text-emerald-700" />}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  size="sm"
                  onClick={() => {
                    showToast("Tema antarmuka berhasil diubah!");
                    setActiveModal(null);
                  }}
                  className="h-8 text-xs bg-navy-900 hover:bg-navy-800 text-white"
                >
                  Terapkan Tema
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

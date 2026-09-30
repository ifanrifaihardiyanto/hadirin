"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  User,
  ShieldCheck,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Mail,
  Phone,
  School,
  Users,
  Award,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Profil Sekolah", desc: "Data institusi & domain" },
  { id: 2, title: "Akun Admin", desc: "Penanggung jawab utama" },
  { id: 3, title: "Kebutuhan & Paket", desc: "Modul & masa uji coba" },
  { id: 4, title: "Aktivasi", desc: "Workspace siap pakai" },
];

const jenjangOptions = [
  "SMA (Sekolah Menengah Atas)",
  "SMK (Sekolah Menengah Kejuruan)",
  "SMP (Sekolah Menengah Pertama)",
  "SD (Sekolah Dasar)",
  "Madrasah (MI / MTs / MA)",
  "Pondok Pesantren / PKBM",
];

const jabatanOptions = [
  "Kepala Sekolah",
  "Wakil Kepala Bid. Kurikulum",
  "Operator IT / Admin Dapodik",
  "Kepala Tata Usaha",
  "Pengurus Yayasan Pendidikan",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { loginAs } = useStore();
  const [step, setStep] = useState(0);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State: Profil Sekolah
  const [sekolah, setSekolah] = useState({
    nama: "SMA Negeri 3 Bandung",
    npsn: "20219842",
    jenjang: "SMA (Sekolah Menengah Atas)",
    status: "Negeri",
    kota: "Kota Bandung, Jawa Barat",
    subdomain: "sman3bandung",
    jumlahSiswa: "650",
    jumlahGuru: "48",
  });

  // Form State: Penanggung Jawab Admin
  const [admin, setAdmin] = useState({
    nama: "Drs. Hendra Wijaya, M.Pd.",
    jabatan: "Kepala Sekolah",
    email: "admin@sman3bandung.sch.id",
    whatsapp: "0812-3456-7890",
    password: "sekolah123",
  });

  // Form State: Modul & Paket
  const [modul, setModul] = useState({
    presensiGps: true,
    presensiSiswa: true,
    jurnalBk: true,
    tataUsahaBos: true,
    portalOrtu: true,
  });

  const [paket, setPaket] = useState<"trial" | "pro">("trial");

  // Autofill Demo Data
  function isiOtomatisDataDemo() {
    setSekolah({
      nama: "SMA Bintang Nusantara",
      npsn: "20108922",
      jenjang: "SMA (Sekolah Menengah Atas)",
      status: "Swasta",
      kota: "Jakarta Selatan, DKI Jakarta",
      subdomain: "bintangnusantara",
      jumlahSiswa: "480",
      jumlahGuru: "36",
    });
    setAdmin({
      nama: "Ahmad Ridwan, S.Kom.",
      jabatan: "Operator IT / Admin Dapodik",
      email: "admin@bintangnusantara.sch.id",
      whatsapp: "0813-8899-7766",
      password: "sekolah123",
    });
    setErrorMsg(null);
  }

  // Handle Subdomain auto slug from nama
  function handleNamaSekolahChange(val: string) {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20);
    setSekolah((prev) => ({
      ...prev,
      nama: val,
      subdomain: prev.subdomain ? prev.subdomain : slug,
    }));
  }

  function handleLanjut() {
    setErrorMsg(null);
    if (step === 0) {
      if (!sekolah.nama.trim()) {
        setErrorMsg("Nama sekolah / institusi wajib diisi.");
        return;
      }
      if (!sekolah.subdomain.trim()) {
        setErrorMsg("Subdomain workspace sekolah wajib diisi.");
        return;
      }
    }
    if (step === 1) {
      if (!admin.nama.trim() || !admin.email.trim()) {
        setErrorMsg("Nama dan email administrator wajib diisi.");
        return;
      }
      if (admin.password.length < 6) {
        setErrorMsg("Kata sandi minimal 6 karakter.");
        return;
      }
    }
    if (step === 2) {
      // Trigger provisioning animation
      setIsProvisioning(true);
      setTimeout(() => {
        setIsProvisioning(false);
        setStep(3);
      }, 1200);
      return;
    }

    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function handleKembali() {
    setErrorMsg(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSelesaiMasukDashboard() {
    loginAs("admin_sekolah", admin.email);
    router.push("/admin");
  }

  return (
    <div className="w-full max-w-6xl mx-auto my-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Social Proof, Value Proposition & Trust Badges (Standar SaaS) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-6 rounded-3xl bg-navy-950 p-8 text-white shadow-xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-navy-700/40 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-navy-800/40 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-navy-800/80 px-3.5 py-1 text-xs font-medium text-navy-200 border border-navy-700/60 shadow-xs">
              <Sparkles size={13} className="text-amber-400" />
              <span>Gratis Uji Coba 30 Hari &bull; Tanpa Kartu Kredit</span>
            </div>

            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white leading-snug">
                Transformasi Digital Absensi &amp; Administrasi Sekolah Anda
              </h1>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Satu platform terpadu untuk Guru, Siswa, Orang Tua, Tata Usaha, dan Kepala Sekolah. Dilengkapi validasi radius GPS anti-titip absen &amp; sinkronisasi laporan BOS.
              </p>
            </div>

            {/* Value Props Bullet Points */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                  <Check size={14} />
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-white">Presensi GPS &amp; Face Recognition</h4>
                  <p className="text-[11px] text-slate-400">Akurat dengan validasi radius lokasi sekolah &amp; deteksi liveness anti-fake GPS.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-navy-700 text-navy-200 mt-0.5">
                  <Check size={14} />
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-white">Otomasi Rekapitulasi BOS &amp; Honor Guru</h4>
                  <p className="text-[11px] text-slate-400">Tata Usaha dapat mencetak slip honor dan laporan presensi resmi dalam 1 klik.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-navy-700 text-navy-200 mt-0.5">
                  <Check size={14} />
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-white">Portal Multi-Peran Standar Kemdikbud</h4>
                  <p className="text-[11px] text-slate-400">Dashboard khusus untuk Kepala Sekolah, Guru, TU, Siswa, dan Wali Murid.</p>
                </div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-xs">
              <p className="text-xs italic text-slate-200 leading-relaxed">
                &ldquo;Hadirin memangkas waktu rekapitulasi presensi bulanan dari 3 hari menjadi 15 menit. Kepala sekolah dan pengawas bisa memantau jurnal mengajar secara real-time.&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-navy-700 font-bold text-xs text-white">
                  HW
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Drs. Hendra Wijaya, M.Pd.</div>
                  <div className="text-[10px] text-slate-400">Kepala SMA Negeri 3</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Footnote */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              Enkripsi Standar Perbankan
            </span>
            <span>&bull;</span>
            <span>Kepatuhan UU PDP No. 27/2022</span>
          </div>
        </div>

        {/* Right Column: Multi-Step Registration Form Card */}
        <div className="lg:col-span-7 w-full">
          <Card className="border-slate-200 bg-white shadow-xl rounded-3xl overflow-hidden">
            {/* Stepper Progress Bar */}
            <div className="border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 max-w-xl mx-auto">
                {steps.map((st, i) => (
                  <div key={st.id} className="flex flex-1 items-center gap-2">
                    <div className="flex flex-col items-center sm:items-start">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-all",
                            i < step
                              ? "bg-navy-900 text-white shadow-xs"
                              : i === step
                              ? "bg-navy-900 text-white ring-4 ring-navy-100"
                              : "bg-slate-200 text-slate-500"
                          )}
                        >
                          {i < step ? <Check size={13} strokeWidth={3} /> : st.id}
                        </div>
                        <span
                          className={cn(
                            "text-xs font-semibold hidden md:inline",
                            i === step ? "text-navy-950 font-bold" : "text-slate-500"
                          )}
                        >
                          {st.title}
                        </span>
                      </div>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={cn(
                          "h-0.5 flex-1 rounded-full transition-colors",
                          i < step ? "bg-navy-900" : "bg-slate-200"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <CardContent className="p-6 sm:p-8">
              {/* Quick Auto-Fill Banner for Demo / Instant Testing */}
              {step < 3 && (
                <div className="mb-5 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2 text-xs text-amber-900">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Zap size={14} className="text-amber-600" />
                    Sedang menguji alur?
                  </span>
                  <button
                    type="button"
                    onClick={isiOtomatisDataDemo}
                    className="font-bold text-navy-950 underline hover:text-navy-700 cursor-pointer"
                  >
                    Isi Cepat Data Demo (1-Klik)
                  </button>
                </div>
              )}

              {errorMsg && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* STEP 1: PROFIL IDENTITAS SEKOLAH & WORKSPACE SUBDOMAIN */}
              {step === 0 && (
                <div className="space-y-4 animate-fade-up">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="font-display text-lg font-bold text-navy-950 flex items-center gap-2">
                      <Building2 size={19} className="text-navy-900" />
                      Data Identitas Sekolah &amp; Workspace
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Masukkan nama resmi institusi untuk pembuatan subdomain database sekolah Anda
                    </p>
                  </div>

                  <div className="space-y-3.5 pt-1">
                    {/* Nama Sekolah */}
                    <div className="space-y-1.5">
                      <Label htmlFor="namaSekolah" className="text-xs font-semibold text-slate-700">
                        Nama Resmi Sekolah / Institusi <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="namaSekolah"
                        value={sekolah.nama}
                        onChange={(e) => handleNamaSekolahChange(e.target.value)}
                        placeholder="Contoh: SMA Negeri 3 Bandung"
                        className="h-10 text-sm rounded-xl"
                      />
                    </div>

                    {/* Subdomain SaaS (Multi-Tenant URL) */}
                    <div className="space-y-1.5 rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <Label htmlFor="subdomain" className="text-xs font-semibold text-navy-950 flex items-center gap-1.5">
                        <Globe size={14} className="text-navy-900" />
                        Alamat URL Portal Sekolah Anda (Subdomain Khusus)
                      </Label>
                      <div className="flex items-center rounded-lg border border-slate-300 bg-white overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-navy-900">
                        <span className="px-2.5 text-xs text-slate-400 select-none">https://</span>
                        <input
                          id="subdomain"
                          type="text"
                          value={sekolah.subdomain}
                          onChange={(e) =>
                            setSekolah({
                              ...sekolah,
                              subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                            })
                          }
                          placeholder="sman3bandung"
                          className="h-9 w-full bg-transparent text-xs font-mono font-semibold text-navy-950 outline-none"
                        />
                        <span className="px-2.5 text-xs font-semibold text-navy-900 bg-slate-100 py-2 border-l border-slate-200 select-none">
                          .hadirin.id
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Guru, siswa, dan orang tua akan mengakses portal sekolah melalui tautan ini.
                      </p>
                    </div>

                    {/* NPSN & Jenjang */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="npsn" className="text-xs font-semibold text-slate-700">
                          NPSN (Nomor Pokok Sekolah)
                        </Label>
                        <Input
                          id="npsn"
                          value={sekolah.npsn}
                          onChange={(e) => setSekolah({ ...sekolah, npsn: e.target.value })}
                          placeholder="8 digit resmi Dapodik"
                          maxLength={8}
                          className="h-10 text-sm rounded-xl font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="jenjang" className="text-xs font-semibold text-slate-700">
                          Jenjang Pendidikan
                        </Label>
                        <select
                          id="jenjang"
                          value={sekolah.jenjang}
                          onChange={(e) => setSekolah({ ...sekolah, jenjang: e.target.value })}
                          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground shadow-xs outline-none focus:border-navy-600"
                        >
                          {jenjangOptions.map((j) => (
                            <option key={j} value={j}>
                              {j}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Kota & Estimasi Pengguna */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5 sm:col-span-1">
                        <Label htmlFor="kota" className="text-xs font-semibold text-slate-700">
                          Kota / Kabupaten
                        </Label>
                        <Input
                          id="kota"
                          value={sekolah.kota}
                          onChange={(e) => setSekolah({ ...sekolah, kota: e.target.value })}
                          placeholder="Bandung"
                          className="h-10 text-xs rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="jumlahSiswa" className="text-xs font-semibold text-slate-700">
                          Estimasi Siswa
                        </Label>
                        <Input
                          id="jumlahSiswa"
                          value={sekolah.jumlahSiswa}
                          onChange={(e) => setSekolah({ ...sekolah, jumlahSiswa: e.target.value })}
                          placeholder="Contoh: 500"
                          inputMode="numeric"
                          className="h-10 text-xs rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="jumlahGuru" className="text-xs font-semibold text-slate-700">
                          Jumlah Guru &amp; Staf
                        </Label>
                        <Input
                          id="jumlahGuru"
                          value={sekolah.jumlahGuru}
                          onChange={(e) => setSekolah({ ...sekolah, jumlahGuru: e.target.value })}
                          placeholder="Contoh: 40"
                          inputMode="numeric"
                          className="h-10 text-xs rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: AKUN PENANGGUNG JAWAB & KREDENSIAL LOGIN */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-up">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="font-display text-lg font-bold text-navy-950 flex items-center gap-2">
                      <User size={19} className="text-navy-900" />
                      Akun Administrator Institusi
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Kredensial akun utama untuk mengelola master data guru, jadwal kelas, dan hak akses
                    </p>
                  </div>

                  <div className="space-y-3.5 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Nama Admin */}
                      <div className="space-y-1.5">
                        <Label htmlFor="namaAdmin" className="text-xs font-semibold text-slate-700">
                          Nama Lengkap &amp; Gelar <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="namaAdmin"
                          value={admin.nama}
                          onChange={(e) => setAdmin({ ...admin, nama: e.target.value })}
                          placeholder="Drs. Hendra Wijaya, M.Pd."
                          className="h-10 text-sm rounded-xl"
                        />
                      </div>

                      {/* Jabatan */}
                      <div className="space-y-1.5">
                        <Label htmlFor="jabatan" className="text-xs font-semibold text-slate-700">
                          Jabatan di Sekolah
                        </Label>
                        <select
                          id="jabatan"
                          value={admin.jabatan}
                          onChange={(e) => setAdmin({ ...admin, jabatan: e.target.value })}
                          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground shadow-xs outline-none focus:border-navy-600"
                        >
                          {jabatanOptions.map((jb) => (
                            <option key={jb} value={jb}>
                              {jb}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Email Dinas / Login */}
                    <div className="space-y-1.5">
                      <Label htmlFor="emailAdmin" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Mail size={13} />
                        Email Resmi Dinas / Akun Login <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="emailAdmin"
                        type="email"
                        value={admin.email}
                        onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                        placeholder="admin@sman3bandung.sch.id"
                        className="h-10 text-sm rounded-xl font-mono"
                      />
                      <p className="text-[11px] text-slate-400">
                        Email ini akan digunakan untuk login pertama ke dashboard administrator.
                      </p>
                    </div>

                    {/* Password & WhatsApp */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="passwordAdmin" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Lock size={13} />
                          Kata Sandi Baru <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="passwordAdmin"
                            type={showPassword ? "text" : "password"}
                            value={admin.password}
                            onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
                            placeholder="Minimal 6 karakter"
                            className="h-10 pr-9 text-sm rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="whatsappAdmin" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Phone size={13} />
                          No. WhatsApp Aktif
                        </Label>
                        <Input
                          id="whatsappAdmin"
                          value={admin.whatsapp}
                          onChange={(e) => setAdmin({ ...admin, whatsapp: e.target.value })}
                          placeholder="0812-xxxx-xxxx"
                          className="h-10 text-sm rounded-xl font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: KEBUTUHAN MODUL & PILIHAN PAKET */}
              {step === 2 && (
                <div className="space-y-5 animate-fade-up">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="font-display text-lg font-bold text-navy-950 flex items-center gap-2">
                      <Award size={19} className="text-navy-900" />
                      Pilih Modul &amp; Skema Layanan
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Konfigurasi modul sistem sesuai kebutuhan institusi sekolah Anda
                    </p>
                  </div>

                  {/* Checklist Modul Sekolah */}
                  <div className="space-y-2.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Modul Fitur yang Diaktifkan:
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={modul.presensiGps}
                          onChange={(e) => setModul({ ...modul, presensiGps: e.target.checked })}
                          className="h-4 w-4 rounded text-navy-900 focus:ring-navy-600"
                        />
                        <span className="text-xs text-slate-700 font-medium">
                          Presensi Guru GPS &amp; Swafoto
                        </span>
                      </label>

                      <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={modul.presensiSiswa}
                          onChange={(e) => setModul({ ...modul, presensiSiswa: e.target.checked })}
                          className="h-4 w-4 rounded text-navy-900 focus:ring-navy-600"
                        />
                        <span className="text-xs text-slate-700 font-medium">
                          Presensi Siswa Harian &amp; Jam Mapel
                        </span>
                      </label>

                      <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={modul.jurnalBk}
                          onChange={(e) => setModul({ ...modul, jurnalBk: e.target.checked })}
                          className="h-4 w-4 rounded text-navy-900 focus:ring-navy-600"
                        />
                        <span className="text-xs text-slate-700 font-medium">
                          Jurnal Mengajar &amp; Layanan BK
                        </span>
                      </label>

                      <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={modul.tataUsahaBos}
                          onChange={(e) => setModul({ ...modul, tataUsahaBos: e.target.checked })}
                          className="h-4 w-4 rounded text-navy-900 focus:ring-navy-600"
                        />
                        <span className="text-xs text-slate-700 font-medium">
                          Tata Usaha, Honor Guru &amp; Laporan BOS
                        </span>
                      </label>

                      <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 cursor-pointer sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={modul.portalOrtu}
                          onChange={(e) => setModul({ ...modul, portalOrtu: e.target.checked })}
                          className="h-4 w-4 rounded text-navy-900 focus:ring-navy-600"
                        />
                        <span className="text-xs text-slate-700 font-medium">
                          Portal Mandiri Siswa &amp; Pantauan Wali Murid
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Pilihan Paket Layanan */}
                  <div className="space-y-3 pt-2">
                    <Label className="text-xs font-semibold text-slate-700">
                      Pilihan Paket Layanan:
                    </Label>

                    {/* Opsi 1: Trial Gratis 30 Hari */}
                    <div
                      onClick={() => setPaket("trial")}
                      className={cn(
                        "cursor-pointer rounded-2xl border p-4 transition-all duration-150",
                        paket === "trial"
                          ? "border-navy-900 bg-navy-50/60 shadow-xs ring-2 ring-navy-900"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-navy-950">
                            Uji Coba Institusi (Free Trial 30 Hari)
                          </span>
                          <Badge variant="hadir" className="text-[10px]">Paling Populer</Badge>
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-600">
                          Rp 0 (Gratis)
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-600">
                        Akses penuh ke semua modul, 7 peran pengguna, dan kapasitas hingga 1.000 siswa tanpa perlu kartu kredit.
                      </p>
                    </div>

                    {/* Opsi 2: Paket Tahunan */}
                    <div
                      onClick={() => setPaket("pro")}
                      className={cn(
                        "cursor-pointer rounded-2xl border p-4 transition-all duration-150",
                        paket === "pro"
                          ? "border-navy-900 bg-navy-50/60 shadow-xs ring-2 ring-navy-900"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-navy-950">
                          Paket Berlangganan Tahunan Resmi
                        </span>
                        <span className="font-mono text-xs font-semibold text-navy-900">
                          Rp 12.000 / siswa / thn
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-600">
                        Termasuk pendampingan migrasi data Dapodik/Excel, custom kop surat dinas, dan SLA prioritas.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: SELESAI & PROVISIONING SUKSES */}
              {step === 3 && (
                <div className="flex flex-col items-center py-4 text-center animate-fade-up">
                  <span className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-emerald-100 text-emerald-700 shadow-md ring-8 ring-emerald-50">
                    <CheckCircle2 size={36} />
                  </span>

                  <h2 className="font-display text-2xl font-bold text-navy-950">
                    Workspace Sekolah Berhasil Dibuat!
                  </h2>

                  <p className="mt-2 max-w-md text-xs text-slate-600 leading-relaxed">
                    Selamat, sistem institusi <strong className="text-navy-950 font-bold">{sekolah.nama}</strong> telah berhasil dipersiapkan. Anda sekarang memegang akses sebagai Super Administrator Sekolah.
                  </p>

                  {/* Info Card Tenant Credential */}
                  <div className="mt-6 w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left space-y-2.5">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Alamat Portal Sekolah:</span>
                      <span className="font-mono font-bold text-navy-900">
                        https://{sekolah.subdomain}.hadirin.id
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Akun Administrator:</span>
                      <span className="font-mono font-semibold text-slate-800">{admin.email}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Peran Akses:</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                        Admin Sekolah (Akses Penuh)
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Masa Berlaku:</span>
                      <span className="font-medium text-slate-700">Free Trial Aktif 30 Hari</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 w-full max-w-md space-y-2.5">
                    <Button
                      onClick={handleSelesaiMasukDashboard}
                      className="w-full h-11 bg-navy-900 text-white hover:bg-navy-800 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Masuk ke Dashboard Admin Sekolah
                      <ArrowRight size={16} />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => router.push("/")}
                      className="w-full h-10 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs"
                    >
                      Buka Portal Guru &amp; Jadwal
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              {step < 3 && (
                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleKembali}
                    disabled={step === 0 || isProvisioning}
                    className="gap-1.5 rounded-xl border-slate-200 text-xs"
                  >
                    <ArrowLeft size={14} />
                    Kembali
                  </Button>

                  <Button
                    type="button"
                    onClick={handleLanjut}
                    disabled={isProvisioning}
                    className="gap-2 bg-navy-900 text-white hover:bg-navy-800 rounded-xl text-xs px-5 shadow-sm font-semibold cursor-pointer"
                  >
                    {isProvisioning ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Menyiapkan Database Sekolah...
                      </>
                    ) : step === 2 ? (
                      <>
                        Aktifkan Sekolah Saya
                        <ArrowRight size={14} />
                      </>
                    ) : (
                      <>
                        Lanjut ke Tahap Berikutnya
                        <ArrowRight size={14} />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

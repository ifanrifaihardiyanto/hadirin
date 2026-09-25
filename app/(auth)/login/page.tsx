"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  GraduationCap,
  ShieldCheck,
  CheckCheck,
  Lock,
  Briefcase,
  Users,
  Heart,
  Layers,
  Building,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore, type UserRole } from "@/lib/store";
import { cn } from "@/lib/utils";

interface RoleOption {
  role: UserRole;
  label: string;
  category: "INTI" | "ADMINISTRASI" | "OWNER";
  email: string;
  targetPath: string;
  deskripsi: string;
  nama: string;
  jabatan: string;
}

const roleOptions: RoleOption[] = [
  // ROLE INTI
  {
    role: "guru",
    label: "Guru / Pendidik",
    category: "INTI",
    email: "sari.wulandari@sman3contoh.sch.id",
    targetPath: "/",
    deskripsi: "Presensi kelas, jurnal mengajar kurikulum merdeka, & presensi mandiri.",
    nama: "Sari Wulandari, S.Pd",
    jabatan: "Guru Pengajar Matematika",
  },
  {
    role: "siswa",
    label: "Siswa",
    category: "INTI",
    email: "ahmad.fadillah@sman3contoh.sch.id",
    targetPath: "/siswa",
    deskripsi: "Lihat jadwal KBM hari ini, rekap absensi pribadi, & poin kedisiplinan.",
    nama: "Ahmad Fadillah",
    jabatan: "Siswa Kelas X IPA 1",
  },
  {
    role: "orang_tua",
    label: "Orang Tua / Wali",
    category: "INTI",
    email: "ortu.ahmad@gmail.com",
    targetPath: "/ortu",
    deskripsi: "Pantau kehadiran anak hari ini, verifikasi surat izin/sakit, & kontak wali kelas.",
    nama: "Bpk. Rahmat Fadillah",
    jabatan: "Wali Murid",
  },
  // ROLE ADMINISTRASI SEKOLAH
  {
    role: "admin_sekolah",
    label: "Admin Sekolah",
    category: "ADMINISTRASI",
    email: "admin@sman3contoh.sch.id",
    targetPath: "/admin",
    deskripsi: "Kelola data guru, siswa, kelas, jadwal KBM, dan konfigurasi institusi.",
    nama: "Ahmad Fauzi, S.Pd",
    jabatan: "Admin Institusi Sekolah",
  },
  {
    role: "tu",
    label: "Tata Usaha & Keuangan",
    category: "ADMINISTRASI",
    email: "tu@sman3contoh.sch.id",
    targetPath: "/admin",
    deskripsi: "Penggajian honor KBM guru, presensi PTK, data guru, & administrasi SPJ.",
    nama: "Dra. Hj. Sri Wahyuni, M.Ak",
    jabatan: "Kaur TU & Keuangan",
  },
  {
    role: "kepsek",
    label: "Kepala Sekolah",
    category: "ADMINISTRASI",
    email: "kepsek@sman3contoh.sch.id",
    targetPath: "/admin",
    deskripsi: "Supervisi jurnal KBM dewan guru, evaluasi kedisiplinan BK, & pengesahan laporan dinas.",
    nama: "Drs. Hendra Wijaya, M.Pd",
    jabatan: "Kepala Sekolah",
  },
  // ROLE SAAS OWNER
  {
    role: "super_admin",
    label: "Super Admin (Owner SaaS)",
    category: "OWNER",
    email: "owner@hadirin.id",
    targetPath: "/admin/saas",
    deskripsi: "Manajemen multi-tenant sekolah mitra, billing langganan, & audit platform cloud.",
    nama: "Rifqi Pratama, S.Kom",
    jabatan: "SaaS Platform Owner",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useStore();

  const [activeRole, setActiveRole] = useState<UserRole>("guru");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeOption = roleOptions.find((r) => r.role === activeRole) || roleOptions[0];

  const [email, setEmail] = useState(activeOption.email);
  const [password, setPassword] = useState("hadirin123");

  function handleRoleChange(selectedRole: UserRole) {
    setActiveRole(selectedRole);
    setError(null);
    const opt = roleOptions.find((r) => r.role === selectedRole);
    if (opt) {
      setEmail(opt.email);
      setPassword("hadirin123");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      loginAs(activeRole, email);
      router.push(activeOption.targetPath);
    }, 450);
  }

  return (
    <Card className="border-border bg-white shadow-lg max-w-lg mx-auto">
      <CardHeader className="space-y-2 pb-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-md">
          <CheckCheck size={26} />
        </div>
        <div>
          <CardTitle className="font-display text-2xl font-bold tracking-tight text-navy-950">
            Masuk ke Hadirin
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Pilih peran pengguna sesuai standar platform SaaS pendidikan
          </CardDescription>
        </div>

        {/* Category Tabs: Role Inti vs Manajemen Sekolah vs Owner */}
        <div className="space-y-2 pt-2 text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            1. Role Inti (KBM &amp; Peserta Didik)
          </p>
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-slate-100 p-1">
            {roleOptions.filter((r) => r.category === "INTI").map((opt) => (
              <button
                key={opt.role}
                type="button"
                onClick={() => handleRoleChange(opt.role)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-2 px-1 text-[11px] font-semibold transition-all cursor-pointer text-center",
                  activeRole === opt.role
                    ? "bg-white text-navy-950 shadow-xs border border-border font-bold"
                    : "text-slate-600 hover:text-navy-900 hover:bg-white/60"
                )}
              >
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pt-1">
            2. Manajemen Sekolah / Institusi
          </p>
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-slate-100 p-1">
            {roleOptions.filter((r) => r.category === "ADMINISTRASI").map((opt) => (
              <button
                key={opt.role}
                type="button"
                onClick={() => handleRoleChange(opt.role)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-2 px-1 text-[11px] font-semibold transition-all cursor-pointer text-center",
                  activeRole === opt.role
                    ? "bg-white text-navy-950 shadow-xs border border-border font-bold"
                    : "text-slate-600 hover:text-navy-900 hover:bg-white/60"
                )}
              >
                <span>{opt.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              3. Platform Owner
            </span>
            <button
              type="button"
              onClick={() => handleRoleChange("super_admin")}
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer border",
                activeRole === "super_admin"
                  ? "bg-purple-900 text-white border-purple-900 shadow-xs"
                  : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              )}
            >
              Super Admin SaaS
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info Banner on selected role */}
        <div className="flex items-center gap-2.5 rounded-lg border border-navy-100 bg-navy-50/70 p-3 text-xs text-navy-900">
          <Lock size={15} className="shrink-0 text-navy-700" />
          <span>
            Login <strong>{activeOption.label}</strong> ({activeOption.nama}): {activeOption.deskripsi}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
              Alamat Email / Akun
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@sekolah.sch.id"
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Kata Sandi
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-900 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-700">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-border text-navy-900 focus:ring-navy-900"
              />
              Ingat sesi ini
            </label>
            <button
              type="button"
              className="font-medium text-navy-700 hover:underline cursor-pointer"
            >
              Lupa sandi?
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-navy-900 text-white hover:bg-navy-800 font-semibold cursor-pointer shadow-xs"
          >
            {loading && <Loader2 size={16} className="animate-spin mr-2" />}
            {loading ? "Memverifikasi Akses..." : `Masuk ke Portal ${activeOption.label}`}
          </Button>
        </form>

        <div className="border-t border-border pt-3 text-center">
          <p className="text-xs text-muted-foreground">
            Sekolah belum terdaftar?{" "}
            <Link
              href="/onboarding"
              className="font-semibold text-navy-900 hover:underline"
            >
              Daftarkan Sekolah
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

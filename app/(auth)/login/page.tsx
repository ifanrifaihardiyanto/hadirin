"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCheck,
  Lock,
  Mail,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  User,
  Heart,
  Layers,
  Sparkles,
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

// Demo accounts for fast 1-click testing
const akunDemoList = [
  { label: "Guru Pengajar", email: "sari.wulandari@sman3contoh.sch.id", role: "guru" as UserRole, icon: GraduationCap },
  { label: "Tata Usaha & Keuangan", email: "tu@sman3contoh.sch.id", role: "tu" as UserRole, icon: Briefcase },
  { label: "Kepala Sekolah", email: "kepsek@sman3contoh.sch.id", role: "kepsek" as UserRole, icon: ShieldCheck },
  { label: "Admin Sekolah", email: "admin@sman3contoh.sch.id", role: "admin_sekolah" as UserRole, icon: ShieldCheck },
  { label: "Siswa (NIS 24001)", email: "ahmad.fadillah@sman3contoh.sch.id", role: "siswa" as UserRole, icon: User },
  { label: "Orang Tua / Wali", email: "ortu.ahmad@gmail.com", role: "orang_tua" as UserRole, icon: Heart },
  { label: "Super Admin SaaS", email: "owner@hadirin.id", role: "super_admin" as UserRole, icon: Layers },
];

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useStore();

  const [identifier, setIdentifier] = useState("sari.wulandari@sman3contoh.sch.id");
  const [password, setPassword] = useState("hadirin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoTools, setShowDemoTools] = useState(true);

  // Otomatis mendeteksi role dan tujuan rute berdasarkan email / NIP / NISN (Standar SaaS)
  function detectRoleAndPath(input: string): { role: UserRole; path: string } {
    const val = input.toLowerCase().trim();
    if (val.includes("owner") || val === "owner@hadirin.id") {
      return { role: "super_admin", path: "/admin/saas" };
    }
    if (val.includes("tu") || val.includes("tatausaha") || val.includes("bendahara")) {
      return { role: "tu", path: "/admin" };
    }
    if (val.includes("kepsek") || val.includes("kepala")) {
      return { role: "kepsek", path: "/admin" };
    }
    if (val.includes("admin")) {
      return { role: "admin_sekolah", path: "/admin" };
    }
    if (val.includes("siswa") || /^\d{5,}$/.test(val) || val.includes("24001")) {
      return { role: "siswa", path: "/siswa" };
    }
    if (val.includes("ortu") || val.includes("wali")) {
      return { role: "orang_tua", path: "/ortu" };
    }
    return { role: "guru", path: "/" };
  }

  function handleFillDemo(emailDemo: string) {
    setIdentifier(emailDemo);
    setPassword("hadirin123");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError("Silakan masukkan email, NIP, atau NISN Anda.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const { role, path } = detectRoleAndPath(identifier);
      loginAs(role, identifier);
      router.push(path);
    }, 450);
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Kartu Utama Login Universal (Satu Pintu Otomatis) */}
      <Card className="border-border bg-white shadow-xl rounded-2xl">
        <CardHeader className="space-y-2 pb-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-md">
            <CheckCheck size={26} />
          </div>
          <div>
            <CardTitle className="font-display text-2xl font-bold tracking-tight text-navy-950">
              Masuk ke Hadirin
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Portal presensi &amp; manajemen sekolah terpadu
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Identitas Tunggal (Email / NIP / NISN) */}
            <div className="space-y-1.5">
              <Label htmlFor="identifier" className="text-xs font-semibold text-slate-700">
                Email, NIP, atau NISN
              </Label>
              <div className="relative">
                <Input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Contoh: guru@sekolah.sch.id atau 24001"
                  className="h-10 text-sm pl-3.5 pr-9 bg-slate-50/50 border-slate-200 focus:bg-white"
                />
              </div>
            </div>

            {/* Input Kata Sandi */}
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
                  className="h-10 pr-10 text-sm bg-slate-50/50 border-slate-200 focus:bg-white"
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
                Ingat saya di perangkat ini
              </label>
              <button
                type="button"
                className="font-medium text-navy-700 hover:underline cursor-pointer"
              >
                Lupa sandi?
              </button>
            </div>

            {/* Tombol Masuk Utama */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10.5 bg-navy-900 text-white hover:bg-navy-800 font-bold text-sm rounded-xl cursor-pointer shadow-sm transition-all"
            >
              {loading && <Loader2 size={16} className="animate-spin mr-2" />}
              {loading ? "Memverifikasi Akun..." : "Masuk ke Akun"}
            </Button>

            {/* Divider SSO Standar Sekolah */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-white px-2 text-slate-400 font-medium">atau masuk dengan</span>
              </div>
            </div>

            {/* SSO Belajar.id / Google (Standar Kemdikbud) */}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleFillDemo("sari.wulandari@sman3contoh.sch.id")}
              className="w-full h-10 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs gap-2 rounded-xl cursor-pointer shadow-2xs"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Masuk dengan Akun Belajar.id / Google
            </Button>
          </form>

          <div className="border-t border-border pt-3 text-center">
            <p className="text-xs text-muted-foreground">
              Sekolah belum bermitra?{" "}
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

      {/* Panel Cepat Akun Demo (Untuk Kemudahan Testing / Presentasi) */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            Mode Uji Coba (Pilih Cepat Akun Demo):
          </span>
          <button
            type="button"
            onClick={() => setShowDemoTools(!showDemoTools)}
            className="text-[11px] text-slate-500 hover:text-navy-950 font-medium"
          >
            {showDemoTools ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>

        {showDemoTools && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
            {akunDemoList.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleFillDemo(item.email)}
                className={cn(
                  "p-2 rounded-lg border text-left text-[11px] transition-all cursor-pointer",
                  identifier === item.email
                    ? "bg-navy-900 text-white border-navy-900 shadow-xs font-semibold"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                )}
              >
                <div className="truncate font-medium">{item.label}</div>
                <div className={cn(
                  "text-[9px] truncate",
                  identifier === item.email ? "text-navy-200" : "text-slate-400"
                )}>
                  {item.email.split("@")[0]}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

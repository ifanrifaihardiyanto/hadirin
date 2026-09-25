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
  Briefcase,
  CheckCheck,
  Lock,
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

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useStore();

  const [activeRole, setActiveRole] = useState<UserRole>("guru");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default credentials according to role
  const [email, setEmail] = useState("sari.wulandari@sman3contoh.sch.id");
  const [password, setPassword] = useState("hadirin123");

  function handleRoleChange(role: UserRole) {
    setActiveRole(role);
    setError(null);
    if (role === "guru") {
      setEmail("sari.wulandari@sman3contoh.sch.id");
      setPassword("hadirin123");
    } else if (role === "tu") {
      setEmail("tu@sman3contoh.sch.id");
      setPassword("hadirin123");
    } else {
      setEmail("kepsek@sman3contoh.sch.id");
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
      if (activeRole === "guru") {
        router.push("/");
      } else {
        router.push("/admin");
      }
    }, 450);
  }

  return (
    <Card className="border-border bg-white shadow-lg">
      <CardHeader className="space-y-2 pb-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-md">
          <CheckCheck size={26} />
        </div>
        <div>
          <CardTitle className="font-display text-2xl font-bold tracking-tight text-navy-950">
            Masuk ke Hadirin
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Pilih peran akun Anda untuk mengakses sistem presensi sekolah
          </CardDescription>
        </div>

        {/* Role Selector Tabs (Standar SaaS Pendidikan) */}
        <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-slate-100 p-1 mt-2">
          <button
            type="button"
            onClick={() => handleRoleChange("guru")}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-lg py-2 px-1 text-[11px] font-semibold transition-all cursor-pointer text-center",
              activeRole === "guru"
                ? "bg-white text-navy-950 shadow-xs border border-border font-bold"
                : "text-slate-600 hover:text-navy-900 hover:bg-white/60"
            )}
          >
            <GraduationCap
              size={15}
              className={activeRole === "guru" ? "text-navy-900" : "text-slate-400"}
            />
            <span>Guru</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("tu")}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-lg py-2 px-1 text-[11px] font-semibold transition-all cursor-pointer text-center",
              activeRole === "tu"
                ? "bg-white text-navy-950 shadow-xs border border-border font-bold"
                : "text-slate-600 hover:text-navy-900 hover:bg-white/60"
            )}
          >
            <Briefcase
              size={15}
              className={activeRole === "tu" ? "text-navy-900" : "text-slate-400"}
            />
            <span>Tata Usaha</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("kepsek")}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-lg py-2 px-1 text-[11px] font-semibold transition-all cursor-pointer text-center",
              activeRole === "kepsek" || activeRole === "admin"
                ? "bg-white text-navy-950 shadow-xs border border-border font-bold"
                : "text-slate-600 hover:text-navy-900 hover:bg-white/60"
            )}
          >
            <ShieldCheck
              size={15}
              className={activeRole === "kepsek" || activeRole === "admin" ? "text-navy-900" : "text-slate-400"}
            />
            <span>Kepsek</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info Banner on selected role */}
        <div className="flex items-center gap-2.5 rounded-lg border border-navy-100 bg-navy-50/70 p-3 text-xs text-navy-900">
          <Lock size={15} className="shrink-0 text-navy-700" />
          <span>
            {activeRole === "guru" && (
              <>
                Login <strong>Guru Pengajar</strong>: Presensi kelas, jurnal mengajar kurikulum merdeka, &amp; presensi mandiri.
              </>
            )}
            {activeRole === "tu" && (
              <>
                Login <strong>Tata Usaha &amp; Keuangan</strong>: Penggajian honor guru, presensi PTK, data guru, &amp; administrasi SPJ.
              </>
            )}
            {(activeRole === "kepsek" || activeRole === "admin") && (
              <>
                Login <strong>Kepala Sekolah</strong>: Supervisi jurnal guru, evaluasi KBM, bimbingan konseling, &amp; laporan dinas.
              </>
            )}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-navy-950">
              {activeRole === "guru" ? "Email / NIP Guru" : "Email / ID Kepala Sekolah"}
            </Label>
            <Input
              id="email"
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                activeRole === "guru"
                  ? "sari.wulandari@sman3contoh.sch.id"
                  : "admin@sman3contoh.sch.id"
              }
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-navy-950">
              Kata Sandi
            </Label>
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
            {loading
              ? "Memverifikasi Akses..."
              : activeRole === "guru"
              ? "Masuk ke Portal Guru"
              : activeRole === "tu"
              ? "Masuk ke Portal Tata Usaha & Keuangan"
              : "Masuk ke Portal Kepala Sekolah"}
          </Button>
        </form>

        {/* Demo Fast Selector Badges */}
        <div className="border-t border-border pt-4">
          <p className="mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
            Pilih Cepat Akun Demo
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleRoleChange("guru")}
              className={cn(
                "flex flex-col items-start rounded-lg border p-2 text-left transition-all cursor-pointer",
                activeRole === "guru"
                  ? "border-navy-900 bg-navy-50/70 shadow-2xs ring-1 ring-navy-900/20"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold text-navy-950 truncate">Sari W.</span>
              </div>
              <span className="text-[9px] text-muted-foreground">Guru</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange("tu")}
              className={cn(
                "flex flex-col items-start rounded-lg border p-2 text-left transition-all cursor-pointer",
                activeRole === "tu"
                  ? "border-navy-900 bg-navy-50/70 shadow-2xs ring-1 ring-navy-900/20"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span className="text-[11px] font-bold text-navy-950 truncate">Sri Wahyuni</span>
              </div>
              <span className="text-[9px] text-muted-foreground">Tata Usaha</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange("kepsek")}
              className={cn(
                "flex flex-col items-start rounded-lg border p-2 text-left transition-all cursor-pointer",
                activeRole === "kepsek" || activeRole === "admin"
                  ? "border-navy-900 bg-navy-50/70 shadow-2xs ring-1 ring-navy-900/20"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-[11px] font-bold text-navy-950 truncate">Hendra W.</span>
              </div>
              <span className="text-[9px] text-muted-foreground">Kepsek</span>
            </button>
          </div>
        </div>

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

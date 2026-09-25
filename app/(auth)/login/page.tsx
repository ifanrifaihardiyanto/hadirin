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
    } else {
      setEmail("admin@sman3contoh.sch.id");
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
      if (activeRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
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

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-slate-100 p-1.5 pt-1.5 mt-2">
          <button
            type="button"
            onClick={() => handleRoleChange("guru")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs font-semibold transition-all cursor-pointer",
              activeRole === "guru"
                ? "bg-white text-navy-950 shadow-xs border border-border"
                : "text-slate-600 hover:text-navy-900 hover:bg-white/60"
            )}
          >
            <GraduationCap
              size={16}
              className={activeRole === "guru" ? "text-navy-900" : "text-slate-400"}
            />
            <span>Guru Pengajar</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("admin")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs font-semibold transition-all cursor-pointer",
              activeRole === "admin"
                ? "bg-white text-navy-950 shadow-xs border border-border"
                : "text-slate-600 hover:text-navy-900 hover:bg-white/60"
            )}
          >
            <ShieldCheck
              size={16}
              className={activeRole === "admin" ? "text-navy-900" : "text-slate-400"}
            />
            <span>Kepala Sekolah</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info Banner on selected role */}
        <div className="flex items-center gap-2.5 rounded-lg border border-navy-100 bg-navy-50/70 p-3 text-xs text-navy-900">
          <Lock size={15} className="shrink-0 text-navy-700" />
          <span>
            {activeRole === "guru" ? (
              <>
                Login ke <strong>Portal Guru</strong>: Presensi harian, kelas binaan &amp; rekap jadwal Anda.
              </>
            ) : (
              <>
                Login ke <strong>Portal Kepala Sekolah</strong>: Monitoring sekolah, kelola jadwal &amp; laporan pimpinan.
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
              : "Masuk ke Portal Kepala Sekolah"}
          </Button>
        </form>

        {/* Demo Fast Selector Badges */}
        <div className="border-t border-border pt-4">
          <p className="mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
            Pilih Cepat Akun Demo
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleRoleChange("guru")}
              className={cn(
                "flex flex-col items-start rounded-lg border p-2.5 text-left transition-all cursor-pointer",
                activeRole === "guru"
                  ? "border-navy-900 bg-navy-50/70 shadow-2xs ring-1 ring-navy-900/20"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-navy-950">Sari Wulandari</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Guru Pengajar</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange("admin")}
              className={cn(
                "flex flex-col items-start rounded-lg border p-2.5 text-left transition-all cursor-pointer",
                activeRole === "admin"
                  ? "border-navy-900 bg-navy-50/70 shadow-2xs ring-1 ring-navy-900/20"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-navy-950">Drs. Hendra Wijaya</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Kepala Sekolah</span>
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

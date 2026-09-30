"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  CalendarCheck,
  BookOpen,
  FileCheck,
  BarChart3,
  User,
  CheckCheck,
  LogOut,
  UserCheck,
  GraduationCap,
  Heart,
  Receipt,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// 1. Menu Guru
const guruMainNav = [
  { href: "/", label: "Beranda Guru", icon: Home },
  { href: "/presensi-guru", label: "Presensi Mandiri", icon: UserCheck },
  { href: "/kelas", label: "Daftar Kelas", icon: CalendarCheck },
  { href: "/jurnal", label: "Jurnal Mengajar", icon: BookOpen },
  { href: "/izin", label: "Izin & Sakit", icon: FileCheck },
  { href: "/rekap", label: "Rekapitulasi", icon: BarChart3 },
];

// 2. Menu Siswa
const siswaMainNav = [
  { href: "/siswa", label: "Portal Siswa", icon: Home },
  { href: "/izin", label: "Pengajuan Izin", icon: FileCheck },
  { href: "/profil", label: "Profil Siswa", icon: User },
];

// 3. Menu Orang Tua
const ortuMainNav = [
  { href: "/ortu", label: "Portal Orang Tua", icon: Home },
  { href: "/izin", label: "Surat Izin Anak", icon: FileCheck },
  { href: "/profil", label: "Profil Akun", icon: User },
];

const accountNav = [
  { href: "/profil", label: "Profil Akun", icon: User },
];

export default function NavShell() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useStore();

  const role = currentUser?.role;
  const isSiswa = role === "siswa";
  const isOrtu = role === "orang_tua";

  const currentNav = isSiswa
    ? siswaMainNav
    : isOrtu
    ? ortuMainNav
    : guruMainNav;

  const roleBadge = isSiswa
    ? "SISWA"
    : isOrtu
    ? "ORANG TUA"
    : "GURU";

  const roleBadgeColor = isSiswa
    ? "bg-sky-100 text-sky-900 border border-sky-200"
    : isOrtu
    ? "bg-rose-100 text-rose-900 border border-rose-200"
    : "bg-navy-100 text-navy-800";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <>
      {/* Desktop Sidebar (docked left, full height) */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-white md:sticky md:top-0 md:h-screen z-30">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
            <CheckCheck size={20} />
          </span>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-navy-950">
              Hadirin
            </span>
            <span className={cn("ml-1.5 rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold", roleBadgeColor)}>
              {roleBadge}
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6">
          <div>
            <p className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Menu Utama
            </p>
            <div className="flex flex-col gap-1">
              {currentNav.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-navy-900 text-white shadow-xs font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-navy-950"
                    )}
                  >
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.2 : 1.75}
                      className={active ? "text-white" : "text-slate-400"}
                    />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pengaturan Akun
            </p>
            <div className="flex flex-col gap-1">
              {accountNav.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-navy-900 text-white shadow-xs font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-navy-950"
                    )}
                  >
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.2 : 1.75}
                      className={active ? "text-white" : "text-slate-400"}
                    />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* User profile & Logout */}
        <div className="border-t border-border p-4 space-y-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-navy-200">
              <AvatarFallback className={cn("font-bold text-xs", isSiswa ? "bg-sky-100 text-sky-900" : isOrtu ? "bg-rose-100 text-rose-900" : "bg-navy-100 text-navy-900")}>
                {currentUser?.nama?.slice(0, 2).toUpperCase() || "SW"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-bold text-navy-950">
                {currentUser?.nama || "Sari Wulandari, S.Pd"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {currentUser?.jabatan || "Guru Pengajar Matematika"}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-center gap-2 border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 cursor-pointer shadow-2xs"
          >
            <LogOut size={14} />
            Keluar (Logout)
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-md md:hidden">
        <div className="flex items-stretch justify-around">
          {currentNav.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors"
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.2 : 1.75}
                  className={active ? "text-navy-900" : "text-slate-400"}
                />
                <span
                  className={
                    active
                      ? "font-bold text-navy-950"
                      : "text-muted-foreground"
                  }
                >
                  {label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

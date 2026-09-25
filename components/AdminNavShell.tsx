"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  BookOpen,
  FileCheck,
  HeartHandshake,
  BarChart3,
  Settings,
  CheckCheck,
  LogOut,
  UserCheck,
  Banknote,
  Receipt,
  Shield,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// 1. MENU TATA USAHA & KEUANGAN (Administrasi, Kepegawaian PTK, Payroll, Izin, Arsip)
const tuMainNav = [
  { href: "/admin", label: "Dashboard TU", icon: LayoutDashboard },
];

const tuAdminNav = [
  { href: "/admin/keuangan", label: "Honor & Keuangan PTK", icon: Banknote },
  { href: "/admin/presensi-guru", label: "Presensi Guru & PTK", icon: UserCheck },
  { href: "/admin/guru", label: "Data Induk Guru", icon: Users },
  { href: "/admin/jadwal", label: "Jadwal Pelajaran", icon: CalendarClock },
  { href: "/admin/izin", label: "Verifikasi Izin Siswa", icon: FileCheck },
  { href: "/admin/laporan", label: "Laporan & SPJ BOS", icon: BarChart3 },
];

const mobileTuNav = [
  { href: "/admin", label: "Beranda", icon: LayoutDashboard },
  { href: "/admin/keuangan", label: "Keuangan", icon: Banknote },
  { href: "/admin/presensi-guru", label: "Presensi PTK", icon: UserCheck },
  { href: "/admin/guru", label: "Data Guru", icon: Users },
  { href: "/admin/laporan", label: "Laporan", icon: BarChart3 },
];

// 2. MENU KEPALA SEKOLAH / PIMPINAN (Supervisi KBM, Disiplin BK, Kebijakan, Monitoring Keuangan)
const kepsekMainNav = [
  { href: "/admin", label: "Dashboard Eksekutif", icon: LayoutDashboard },
];

const kepsekAdminNav = [
  { href: "/admin/jurnal", label: "Supervisi Jurnal Mengajar", icon: BookOpen },
  { href: "/admin/bk", label: "Layanan BK & Kasus", icon: HeartHandshake },
  { href: "/admin/presensi-guru", label: "Monitoring Presensi PTK", icon: UserCheck },
  { href: "/admin/keuangan", label: "Monitoring Honor & Keuangan", icon: Banknote },
  { href: "/admin/laporan", label: "Laporan Presensi Sekolah", icon: BarChart3 },
  { href: "/admin/jadwal", label: "Jadwal Mengajar", icon: CalendarClock },
  { href: "/admin/guru", label: "Data Guru", icon: Users },
  { href: "/admin/izin", label: "Verifikasi Izin", icon: FileCheck },
];

const kepsekSettingNav = [
  { href: "/admin/pengaturan", label: "Pengaturan Sekolah", icon: Settings },
];

const mobileKepsekNav = [
  { href: "/admin", label: "Beranda", icon: LayoutDashboard },
  { href: "/admin/jurnal", label: "Supervisi", icon: BookOpen },
  { href: "/admin/presensi-guru", label: "Presensi PTK", icon: UserCheck },
  { href: "/admin/bk", label: "Layanan BK", icon: HeartHandshake },
  { href: "/admin/laporan", label: "Laporan", icon: BarChart3 },
];

export default function AdminNavShell() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useStore();

  const isTU = currentUser?.role === "tu";
  const currentMainNav = isTU ? tuMainNav : kepsekMainNav;
  const currentAcademicNav = isTU ? tuAdminNav : kepsekAdminNav;
  const currentMobileNav = isTU ? mobileTuNav : mobileKepsekNav;

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
            <span className={cn(
              "ml-1.5 rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold",
              isTU ? "bg-amber-100 text-amber-900 border border-amber-200" : "bg-navy-100 text-navy-800"
            )}>
              {isTU ? "TATA USAHA" : "KEPALA SEKOLAH"}
            </span>
          </div>
        </div>

        {/* Navigation Sections with Role Restrictions */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6">
          {/* Section 1: Ringkasan */}
          <div>
            <p className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Ringkasan
            </p>
            <div className="flex flex-col gap-1">
              {currentMainNav.map(({ href, label, icon: Icon }) => {
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

          {/* Section 2: Operational/Supervisory based on Role */}
          <div>
            <p className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isTU ? "Administrasi & Keuangan" : "Supervisi & Akademik"}
            </p>
            <div className="flex flex-col gap-1">
              {currentAcademicNav.map(({ href, label, icon: Icon }) => {
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

          {/* Section 3: Configuration (Only for Kepala Sekolah) */}
          {!isTU && (
            <div>
              <p className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Konfigurasi Kebijakan
              </p>
              <div className="flex flex-col gap-1">
                {kepsekSettingNav.map(({ href, label, icon: Icon }) => {
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
          )}
        </div>

        {/* Active Account & Logout Footer */}
        <div className="border-t border-border p-4 space-y-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-navy-200">
              <AvatarFallback className={cn(
                "font-bold text-xs",
                isTU ? "bg-amber-100 text-amber-900" : "bg-navy-100 text-navy-900"
              )}>
                {isTU ? "SW" : "HW"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-bold text-navy-950">
                {currentUser?.nama || (isTU ? "Dra. Hj. Sri Wahyuni, M.Ak" : "Drs. Hendra Wijaya, M.Pd")}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {currentUser?.jabatan || (isTU ? "Kaur Tata Usaha & Keuangan" : "Kepala Sekolah")}
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

      {/* Mobile Bottom Tab Bar with Role-Tailored Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-md md:hidden">
        <div className="flex items-stretch justify-around">
          {currentMobileNav.map(({ href, label, icon: Icon }) => {
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
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

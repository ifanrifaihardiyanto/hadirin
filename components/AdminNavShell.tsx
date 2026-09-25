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
  Layers,
  Building2,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// 1. MENU SUPER ADMIN (SaaS Platform Owner)
const saasMainNav = [
  { href: "/admin/saas", label: "Multi-Tenant SaaS", icon: Layers },
  { href: "/admin", label: "Dashboard Sekolah", icon: LayoutDashboard },
];

const saasAdminNav = [
  { href: "/admin/saas", label: "Mitra & Lisensi Sekolah", icon: Building2 },
  { href: "/harga", label: "Paket & Billing SaaS", icon: CreditCard },
  { href: "/admin/keuangan", label: "Audit Keuangan PTK", icon: Banknote },
  { href: "/admin/laporan", label: "Laporan Konsolidasi", icon: BarChart3 },
];

// 2. MENU TATA USAHA & KEUANGAN (Administrasi, Kepegawaian PTK, Payroll, Izin, Arsip)
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

// 3. MENU KEPALA SEKOLAH / PIMPINAN (Supervisi KBM, Disiplin BK, Kebijakan, Monitoring Keuangan)
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

// 4. MENU ADMIN SEKOLAH / INSTITUSI (Full Manajemen Sekolah)
const adminSekolahMainNav = [
  { href: "/admin", label: "Dashboard Utama", icon: LayoutDashboard },
];

const adminSekolahNav = [
  { href: "/admin/guru", label: "Data Guru & Siswa", icon: Users },
  { href: "/admin/jadwal", label: "Jadwal Mengajar", icon: CalendarClock },
  { href: "/admin/presensi-guru", label: "Presensi Guru & PTK", icon: UserCheck },
  { href: "/admin/keuangan", label: "Honor & Keuangan PTK", icon: Banknote },
  { href: "/admin/jurnal", label: "Supervisi Jurnal", icon: BookOpen },
  { href: "/admin/izin", label: "Verifikasi Izin", icon: FileCheck },
  { href: "/admin/bk", label: "Layanan BK & Kasus", icon: HeartHandshake },
  { href: "/admin/laporan", label: "Laporan Presensi", icon: BarChart3 },
];

const generalSettingNav = [
  { href: "/admin/pengaturan", label: "Pengaturan Sekolah", icon: Settings },
];

export default function AdminNavShell() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useStore();

  const role = currentUser?.role;
  const isSuperAdmin = role === "super_admin";
  const isTU = role === "tu";
  const isKepsek = role === "kepsek";

  const currentMainNav = isSuperAdmin
    ? saasMainNav
    : isTU
    ? tuMainNav
    : isKepsek
    ? kepsekMainNav
    : adminSekolahMainNav;

  const currentAcademicNav = isSuperAdmin
    ? saasAdminNav
    : isTU
    ? tuAdminNav
    : isKepsek
    ? kepsekAdminNav
    : adminSekolahNav;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const roleLabel = isSuperAdmin
    ? "SUPER ADMIN"
    : isTU
    ? "TATA USAHA"
    : isKepsek
    ? "KEPALA SEKOLAH"
    : "ADMIN SEKOLAH";

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
              "ml-1.5 rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide uppercase",
              isSuperAdmin
                ? "bg-purple-100 text-purple-900 border border-purple-200"
                : isTU
                ? "bg-amber-100 text-amber-900 border border-amber-200"
                : isKepsek
                ? "bg-navy-100 text-navy-900"
                : "bg-blue-100 text-blue-900"
            )}>
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Navigation Sections with Role Restrictions */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6">
          {/* Section 1: Ringkasan */}
          <div>
            <p className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isSuperAdmin ? "Platform SaaS" : "Ringkasan"}
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
              {isSuperAdmin
                ? "Multi-Tenant Control"
                : isTU
                ? "Administrasi & Keuangan"
                : isKepsek
                ? "Supervisi & Akademik"
                : "Manajemen Institusi"}
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

          {/* Section 3: Configuration (Only for Admin Sekolah & Kepala Sekolah) */}
          {!isTU && (
            <div>
              <p className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Konfigurasi
              </p>
              <div className="flex flex-col gap-1">
                {generalSettingNav.map(({ href, label, icon: Icon }) => {
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
                isSuperAdmin
                  ? "bg-purple-100 text-purple-900"
                  : isTU
                  ? "bg-amber-100 text-amber-900"
                  : "bg-navy-100 text-navy-900"
              )}>
                {currentUser?.nama?.slice(0, 2).toUpperCase() || "HW"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-bold text-navy-950">
                {currentUser?.nama || "Drs. Hendra Wijaya"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {currentUser?.jabatan || "Kepala Sekolah"}
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
          {currentAcademicNav.slice(0, 5).map(({ href, label, icon: Icon }) => {
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

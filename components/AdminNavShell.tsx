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
  Layers,
  Building2,
  CreditCard,
  GraduationCap,
  BookOpenCheck,
  FileText,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore, type UserRole } from "@/lib/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: any;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function getNavigationByRole(role?: UserRole): NavSection[] {
  // 1. SUPER ADMIN SAAS (Platform Owner)
  if (role === "super_admin") {
    return [
      {
        title: "Platform SaaS",
        items: [
          { href: "/admin/saas", label: "Multi-Tenant SaaS", icon: Layers },
          { href: "/admin", label: "Dashboard Sekolah", icon: LayoutDashboard },
        ],
      },
      {
        title: "Multi-Tenant Control",
        items: [
          { href: "/admin/saas", label: "Mitra & Lisensi Sekolah", icon: Building2 },
          { href: "/harga", label: "Paket & Billing SaaS", icon: CreditCard },
          { href: "/admin/keuangan", label: "Audit Keuangan PTK", icon: Banknote },
          { href: "/admin/laporan", label: "Laporan Konsolidasi", icon: BarChart3 },
        ],
      },
    ];
  }

  // 2. TATA USAHA & KEUANGAN
  if (role === "tu") {
    return [
      {
        title: "Ringkasan",
        items: [
          { href: "/admin", label: "Dashboard TU", icon: LayoutDashboard },
        ],
      },
      {
        title: "Keuangan & SPP",
        items: [
          { href: "/admin/spp", label: "Pembayaran SPP Siswa", icon: Receipt },
          { href: "/admin/keuangan", label: "Honor & Penggajian PTK", icon: Banknote },
          { href: "/admin/laporan", label: "Laporan & SPJ BOS", icon: BarChart3 },
        ],
      },
      {
        title: "Data Induk & Jadwal",
        items: [
          { href: "/admin/siswa", label: "Data Induk Siswa", icon: GraduationCap },
          { href: "/admin/guru", label: "Data Guru & Pegawai", icon: Users },
          { href: "/admin/mapel", label: "Mata Pelajaran", icon: BookOpenCheck },
          { href: "/admin/jadwal", label: "Jadwal Pelajaran", icon: CalendarClock },
        ],
      },
      {
        title: "Kepegawaian & Izin",
        items: [
          { href: "/admin/presensi-guru", label: "Presensi Guru & PTK", icon: UserCheck },
          { href: "/admin/izin", label: "Verifikasi Izin Siswa", icon: FileCheck },
          { href: "/admin/rapor", label: "Arsip E-Rapor", icon: Award },
        ],
      },
    ];
  }

  // 3. KEPALA SEKOLAH (Supervisi, Kebijakan, Eksekutif)
  if (role === "kepsek") {
    return [
      {
        title: "Ringkasan",
        items: [
          { href: "/admin", label: "Dashboard Eksekutif", icon: LayoutDashboard },
        ],
      },
      {
        title: "Akademik & Data Induk",
        items: [
          { href: "/admin/siswa", label: "Data Siswa Induk", icon: GraduationCap },
          { href: "/admin/guru", label: "Data Guru & PTK", icon: Users },
          { href: "/admin/mapel", label: "Mata Pelajaran", icon: BookOpenCheck },
          { href: "/admin/jadwal", label: "Jadwal Mengajar", icon: CalendarClock },
        ],
      },
      {
        title: "Kegiatan Belajar (KBM)",
        items: [
          { href: "/admin/jurnal", label: "Supervisi Jurnal Guru", icon: BookOpen },
          { href: "/admin/tugas", label: "Monitoring Tugas Siswa", icon: FileText },
          { href: "/admin/materi", label: "Materi & Modul Ajar", icon: BookOpen },
          { href: "/admin/presensi-guru", label: "Presensi Harian PTK", icon: UserCheck },
        ],
      },
      {
        title: "Penilaian & Siswa",
        items: [
          { href: "/admin/nilai", label: "Buku Nilai Siswa", icon: Award },
          { href: "/admin/rapor", label: "E-Rapor Kurikulum", icon: GraduationCap },
          { href: "/admin/bk", label: "Layanan BK & Kasus", icon: HeartHandshake },
          { href: "/admin/izin", label: "Verifikasi Izin Siswa", icon: FileCheck },
        ],
      },
      {
        title: "Keuangan & Laporan",
        items: [
          { href: "/admin/spp", label: "Monitoring SPP Siswa", icon: Receipt },
          { href: "/admin/keuangan", label: "Monitoring Kas & Honor", icon: Banknote },
          { href: "/admin/laporan", label: "Laporan Mutu Sekolah", icon: BarChart3 },
        ],
      },
      {
        title: "Konfigurasi",
        items: [
          { href: "/admin/pengaturan", label: "Pengaturan Kebijakan", icon: Settings },
        ],
      },
    ];
  }

  // 4. ADMIN SEKOLAH (Default / Full School Admin)
  return [
    {
      title: "Ringkasan",
      items: [
        { href: "/admin", label: "Dashboard Utama", icon: LayoutDashboard },
      ],
    },
    {
      title: "Akademik & Data Induk",
      items: [
        { href: "/admin/siswa", label: "Data Induk Siswa", icon: GraduationCap },
        { href: "/admin/guru", label: "Data Guru & PTK", icon: Users },
        { href: "/admin/mapel", label: "Mata Pelajaran", icon: BookOpenCheck },
        { href: "/admin/jadwal", label: "Jadwal Mengajar", icon: CalendarClock },
      ],
    },
    {
      title: "Kegiatan Belajar (KBM)",
      items: [
        { href: "/admin/jurnal", label: "Supervisi Jurnal Guru", icon: BookOpen },
        { href: "/admin/tugas", label: "Tugas Siswa", icon: FileText },
        { href: "/admin/materi", label: "Materi & Modul Ajar", icon: BookOpen },
        { href: "/admin/presensi-guru", label: "Presensi Guru & PTK", icon: UserCheck },
      ],
    },
    {
      title: "Penilaian & Siswa",
      items: [
        { href: "/admin/nilai", label: "Buku Nilai Siswa", icon: Award },
        { href: "/admin/rapor", label: "E-Rapor Siswa", icon: GraduationCap },
        { href: "/admin/bk", label: "Layanan BK & Kasus", icon: HeartHandshake },
        { href: "/admin/izin", label: "Verifikasi Izin", icon: FileCheck },
      ],
    },
    {
      title: "Keuangan & Laporan",
      items: [
        { href: "/admin/spp", label: "Pembayaran SPP Siswa", icon: Receipt },
        { href: "/admin/keuangan", label: "Honor & Keuangan PTK", icon: Banknote },
        { href: "/admin/laporan", label: "Laporan Presensi & BOS", icon: BarChart3 },
      ],
    },
    {
      title: "Konfigurasi",
      items: [
        { href: "/admin/pengaturan", label: "Pengaturan Sekolah", icon: Settings },
      ],
    },
  ];
}

export default function AdminNavShell() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useStore();

  const role = currentUser?.role;
  const isSuperAdmin = role === "super_admin";
  const isTU = role === "tu";
  const isKepsek = role === "kepsek";

  const navigationSections = getNavigationByRole(role);

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
        <div className="flex h-16 items-center gap-3 border-b border-border px-6 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
            <CheckCheck size={20} />
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-lg font-bold tracking-tight text-navy-950">
                Hadirin
              </span>
              <span className={cn(
                "rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide uppercase",
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
        </div>

        {/* Navigation Sections Categorized by Domain */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-3.5 py-5 scrollbar-thin">
          {navigationSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                {section.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href + label}
                      href={href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                        active
                          ? "bg-navy-900 text-white shadow-xs font-semibold"
                          : "text-slate-600 hover:bg-slate-100 hover:text-navy-950"
                      )}
                    >
                      <Icon
                        size={17}
                        strokeWidth={active ? 2.2 : 1.75}
                        className={active ? "text-white" : "text-slate-400"}
                      />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Active Account & Logout Footer */}
        <div className="border-t border-border p-3.5 space-y-2.5 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 border border-navy-200">
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
              <p className="truncate text-xs font-bold text-navy-950 leading-tight">
                {currentUser?.nama || "Drs. Hendra Wijaya"}
              </p>
              <p className="truncate text-[10px] text-muted-foreground leading-tight">
                {currentUser?.jabatan || "Kepala Sekolah"}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full h-8 justify-center gap-1.5 border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 cursor-pointer shadow-2xs"
          >
            <LogOut size={13} />
            Keluar (Logout)
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-md md:hidden">
        <div className="flex items-stretch justify-around">
          {[
            { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
            { href: "/admin/siswa", label: "Siswa", icon: GraduationCap },
            { href: "/admin/spp", label: "SPP", icon: Receipt },
            { href: "/admin/presensi-guru", label: "Presensi", icon: UserCheck },
            { href: "/admin/nilai", label: "Nilai", icon: Award },
          ].map(({ href, label, icon: Icon }) => {
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

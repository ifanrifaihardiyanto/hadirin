"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  CalendarClock,
  CalendarDays,
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
  School,
  Megaphone,
  UserPlus,
  Package,
  Library,
  Trophy,
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
          { href: "/admin/pengumuman", label: "Pengumuman & Broadcast", icon: Megaphone },
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
          { href: "/admin/kelas", label: "Rombel & Kelas", icon: School },
          { href: "/admin/kalender", label: "Kalender Akademik", icon: CalendarDays },
          { href: "/admin/ppdb", label: "Penerimaan Siswa (PPDB)", icon: UserPlus },
          { href: "/admin/sarpras", label: "Sarana & Inventaris", icon: Package },
          { href: "/admin/perpus", label: "Perpustakaan & Buku", icon: Library },
          { href: "/admin/ekskul", label: "Ekstrakurikuler", icon: Trophy },
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
          { href: "/admin/pengumuman", label: "Pengumuman & Broadcast", icon: Megaphone },
        ],
      },
      {
        title: "Akademik & Data Induk",
        items: [
          { href: "/admin/siswa", label: "Data Siswa Induk", icon: GraduationCap },
          { href: "/admin/kelas", label: "Rombel & Kelas", icon: School },
          { href: "/admin/kalender", label: "Kalender Akademik", icon: CalendarDays },
          { href: "/admin/ppdb", label: "Penerimaan Siswa (PPDB)", icon: UserPlus },
          { href: "/admin/sarpras", label: "Sarana & Inventaris", icon: Package },
          { href: "/admin/perpus", label: "Perpustakaan & Buku", icon: Library },
          { href: "/admin/ekskul", label: "Ekstrakurikuler", icon: Trophy },
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
        { href: "/admin/pengumuman", label: "Pengumuman & Broadcast", icon: Megaphone },
      ],
    },
    {
      title: "Akademik & Data Induk",
      items: [
        { href: "/admin/siswa", label: "Data Induk Siswa", icon: GraduationCap },
        { href: "/admin/kelas", label: "Rombel & Kelas", icon: School },
        { href: "/admin/kalender", label: "Kalender Akademik", icon: CalendarDays },
        { href: "/admin/ppdb", label: "Penerimaan Siswa (PPDB)", icon: UserPlus },
        { href: "/admin/sarpras", label: "Sarana & Inventaris", icon: Package },
          { href: "/admin/perpus", label: "Perpustakaan & Buku", icon: Library },
          { href: "/admin/ekskul", label: "Ekstrakurikuler", icon: Trophy },
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
  const { currentUser, logout, isMobileMenuOpen, setMobileMenuOpen, toggleMobileMenu } = useStore();

  const role = currentUser?.role;
  const isSuperAdmin = role === "super_admin";
  const isTU = role === "tu";
  const isKepsek = role === "kepsek";

  const navigationSections = getNavigationByRole(role);

  function handleLogout() {
    setMobileMenuOpen(false);
    logout();
    router.push("/login");
  }

  // Close drawer on path change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  // Close drawer on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setMobileMenuOpen]);

  const primaryMobileTabs = isSuperAdmin
    ? [
        { href: "/admin/saas", label: "SaaS", icon: Layers },
        { href: "/admin", label: "Sekolah", icon: LayoutDashboard },
        { href: "/harga", label: "Billing", icon: CreditCard },
        { href: "/admin/keuangan", label: "Audit", icon: Banknote },
      ]
    : isTU
    ? [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/spp", label: "SPP", icon: Receipt },
        { href: "/admin/siswa", label: "Siswa", icon: GraduationCap },
        { href: "/admin/presensi-guru", label: "Presensi", icon: UserCheck },
      ]
    : [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/siswa", label: "Siswa", icon: GraduationCap },
        { href: "/admin/jurnal", label: "Jurnal", icon: BookOpen },
        { href: "/admin/laporan", label: "Laporan", icon: BarChart3 },
      ];

  const roleLabel = isSuperAdmin
    ? "SUPER ADMIN"
    : isTU
    ? "TATA USAHA"
    : isKepsek
    ? "KEPALA SEKOLAH"
    : "ADMIN SEKOLAH";

  return (
    <>
      {/* Desktop Sidebar (docked left, visible on screens >= 1024px) */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-white lg:sticky lg:top-0 lg:h-screen z-30">
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

      {/* Mobile & Tablet Full Slide-Over Drawer (< 1024px) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex h-16 items-center justify-between border-b border-border px-5 shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
                  <CheckCheck size={18} />
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-base font-bold tracking-tight text-navy-950">
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
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="Tutup Menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Complete Menu List by Category */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-3.5 py-4 scrollbar-thin">
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
                          onClick={() => setMobileMenuOpen(false)}
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

            {/* Profile & Logout in Drawer */}
            <div className="border-t border-border p-3.5 space-y-2.5 bg-slate-50/80 shrink-0">
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
          </div>
        </div>
      )}

      {/* Mobile & Tablet Bottom Tab Bar (< 1024px) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-md lg:hidden">
        <div className="flex items-stretch justify-around px-1">
          {primaryMobileTabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href + label}
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

          {/* 5th Tab: "Semua Menu" Drawer Trigger */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors cursor-pointer",
              isMobileMenuOpen || !primaryMobileTabs.some((t) => t.href === pathname)
                ? "text-navy-950 font-bold"
                : "text-muted-foreground"
            )}
            aria-label="Buka Semua Menu"
          >
            <div className="relative">
              <Menu
                size={19}
                strokeWidth={isMobileMenuOpen || !primaryMobileTabs.some((t) => t.href === pathname) ? 2.2 : 1.75}
                className={isMobileMenuOpen || !primaryMobileTabs.some((t) => t.href === pathname) ? "text-navy-900" : "text-slate-400"}
              />
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-navy-600 ring-1 ring-white" />
            </div>
            <span>Semua Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  CalendarDays,
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
  School,
  Megaphone,
  UserPlus,
  Package,
  Library,
  Trophy,
  Briefcase,
  Laptop,
  HeartPulse,
  Users,
  Menu,
  X,
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

  // 2. TATA USAHA & KEUANGAN (TU)
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
        title: "Administrasi Kesiswaan",
        items: [
          { href: "/admin/siswa", label: "Data Induk Siswa", icon: GraduationCap },
          { href: "/admin/ppdb", label: "Penerimaan Siswa (PPDB)", icon: UserPlus },
          { href: "/admin/izin", label: "Verifikasi Izin Siswa", icon: FileCheck },
          { href: "/admin/uks", label: "Layanan UKS & Medis", icon: HeartPulse },
          { href: "/admin/ekskul", label: "Ekstrakurikuler", icon: Trophy },
          { href: "/admin/alumni", label: "Alumni & Tracer Study", icon: Briefcase },
        ],
      },
      {
        title: "Akademik & Sarpras",
        items: [
          { href: "/admin/kelas", label: "Rombel & Kelas", icon: School },
          { href: "/admin/kalender", label: "Kalender Akademik", icon: CalendarDays },
          { href: "/admin/mapel", label: "Mata Pelajaran", icon: BookOpenCheck },
          { href: "/admin/jadwal", label: "Jadwal Pelajaran", icon: CalendarClock },
          { href: "/admin/sarpras", label: "Sarana & Inventaris", icon: Package },
          { href: "/admin/perpus", label: "Perpustakaan & Buku", icon: Library },
        ],
      },
      {
        title: "Kepegawaian (PTK)",
        items: [
          { href: "/admin/guru", label: "Data Guru & Pegawai", icon: Users },
          { href: "/admin/presensi-guru", label: "Presensi Guru & PTK", icon: UserCheck },
        ],
      },
    ];
  }

  // 3. KEPALA SEKOLAH (Supervisi Eksekutif & Penilaian Mutu)
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
        title: "Akademik & Kurikulum",
        items: [
          { href: "/admin/kalender", label: "Kalender Akademik", icon: CalendarDays },
          { href: "/admin/kelas", label: "Rombel & Kelas", icon: School },
          { href: "/admin/mapel", label: "Mata Pelajaran", icon: BookOpenCheck },
          { href: "/admin/jadwal", label: "Jadwal Mengajar", icon: CalendarClock },
        ],
      },
      {
        title: "Supervisi KBM & Asesmen",
        items: [
          { href: "/admin/jurnal", label: "Supervisi Jurnal Guru", icon: BookOpen },
          { href: "/admin/tugas", label: "Monitoring Tugas Siswa", icon: FileText },
          { href: "/admin/materi", label: "Materi & Modul Ajar", icon: BookOpen },
          { href: "/admin/cbt", label: "CBT & Ujian Online", icon: Laptop },
          { href: "/admin/nilai", label: "Buku Nilai Siswa", icon: Award },
          { href: "/admin/rapor", label: "E-Rapor Kurikulum", icon: GraduationCap },
        ],
      },
      {
        title: "Kesiswaan & Pembinaan",
        items: [
          { href: "/admin/siswa", label: "Data Siswa Induk", icon: GraduationCap },
          { href: "/admin/ppdb", label: "Penerimaan Siswa (PPDB)", icon: UserPlus },
          { href: "/admin/bk", label: "Layanan BK & Kasus", icon: HeartHandshake },
          { href: "/admin/uks", label: "Layanan UKS & Medis", icon: HeartPulse },
          { href: "/admin/izin", label: "Verifikasi Izin Siswa", icon: FileCheck },
          { href: "/admin/ekskul", label: "Ekstrakurikuler", icon: Trophy },
          { href: "/admin/alumni", label: "Alumni & Tracer Study", icon: Briefcase },
        ],
      },
      {
        title: "Kepegawaian (PTK)",
        items: [
          { href: "/admin/guru", label: "Data Guru & PTK", icon: Users },
          { href: "/admin/presensi-guru", label: "Presensi Harian PTK", icon: UserCheck },
        ],
      },
      {
        title: "Sarpras & Pustaka",
        items: [
          { href: "/admin/sarpras", label: "Sarana & Inventaris", icon: Package },
          { href: "/admin/perpus", label: "Perpustakaan & Buku", icon: Library },
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
      title: "Akademik & Kurikulum",
      items: [
        { href: "/admin/kalender", label: "Kalender Akademik", icon: CalendarDays },
        { href: "/admin/kelas", label: "Rombel & Kelas", icon: School },
        { href: "/admin/mapel", label: "Mata Pelajaran", icon: BookOpenCheck },
        { href: "/admin/jadwal", label: "Jadwal Mengajar", icon: CalendarClock },
      ],
    },
    {
      title: "Pembelajaran & Asesmen (KBM)",
      items: [
        { href: "/admin/jurnal", label: "Supervisi Jurnal Guru", icon: BookOpen },
        { href: "/admin/materi", label: "Materi & Modul Ajar", icon: BookOpen },
        { href: "/admin/tugas", label: "Tugas Siswa", icon: FileText },
        { href: "/admin/cbt", label: "CBT & Ujian Online", icon: Laptop },
        { href: "/admin/nilai", label: "Buku Nilai Siswa", icon: Award },
        { href: "/admin/rapor", label: "E-Rapor Siswa", icon: GraduationCap },
      ],
    },
    {
      title: "Kesiswaan & Layanan Siswa",
      items: [
        { href: "/admin/ppdb", label: "Penerimaan Siswa (PPDB)", icon: UserPlus },
        { href: "/admin/siswa", label: "Data Induk Siswa", icon: GraduationCap },
        { href: "/admin/izin", label: "Verifikasi Izin Siswa", icon: FileCheck },
        { href: "/admin/bk", label: "Layanan BK & Kasus", icon: HeartHandshake },
        { href: "/admin/uks", label: "Layanan UKS & Medis", icon: HeartPulse },
        { href: "/admin/ekskul", label: "Ekstrakurikuler", icon: Trophy },
        { href: "/admin/alumni", label: "Alumni & Tracer Study", icon: Briefcase },
      ],
    },
    {
      title: "Pendidik & Pegawai (PTK)",
      items: [
        { href: "/admin/guru", label: "Data Guru & PTK", icon: Users },
        { href: "/admin/presensi-guru", label: "Presensi Guru & PTK", icon: UserCheck },
      ],
    },
    {
      title: "Sarana & Perpustakaan",
      items: [
        { href: "/admin/sarpras", label: "Sarana & Inventaris", icon: Package },
        { href: "/admin/perpus", label: "Perpustakaan & Buku", icon: Library },
      ],
    },
    {
      title: "Keuangan & BOS",
      items: [
        { href: "/admin/spp", label: "Pembayaran SPP Siswa", icon: Receipt },
        { href: "/admin/keuangan", label: "Honor & Keuangan PTK", icon: Banknote },
        { href: "/admin/laporan", label: "Laporan Presensi & BOS", icon: BarChart3 },
      ],
    },
    {
      title: "Konfigurasi Sistem",
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

  const roleBadge = isSuperAdmin
    ? "SUPER ADMIN"
    : isTU
    ? "TATA USAHA"
    : isKepsek
    ? "KEPALA SEKOLAH"
    : "ADMIN SEKOLAH";

  const roleBadgeColor = isSuperAdmin
    ? "bg-purple-100 text-purple-900 border border-purple-200"
    : isTU
    ? "bg-amber-100 text-amber-900 border border-amber-200"
    : isKepsek
    ? "bg-sky-100 text-sky-900 border border-sky-200"
    : "bg-navy-100 text-navy-800";

  function handleLogout() {
    setMobileMenuOpen(false);
    logout();
    router.push("/login");
  }

  // Close mobile drawer on route changes or escape
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setMobileMenuOpen]);

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
            <span className="font-display text-lg font-bold tracking-tight text-navy-950">
              Hadirin Admin
            </span>
            <span className="text-[10px] text-muted-foreground font-mono -mt-1">
              {currentUser?.sekolah || "SMA Negeri 3 Contoh"}
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navigationSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <span className="px-3 text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                {section.title}
              </span>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                        isActive
                          ? "bg-navy-900 text-white shadow-xs"
                          : "text-slate-700 hover:bg-slate-100 hover:text-navy-950"
                      )}
                    >
                      <Icon size={16} className={cn(isActive ? "text-white" : "text-slate-600")} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User Card & Logout (Footer) */}
        <div className="border-t border-border p-4 shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-navy-100 text-navy-900 text-xs font-bold font-mono">
                {currentUser?.nama?.slice(0, 2).toUpperCase() || "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-xs font-bold text-navy-950">
                {currentUser?.nama || "Admin Sekolah"}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn("text-[9px] font-bold px-1.5 py-0.2 rounded font-mono", roleBadgeColor)}>
                  {roleBadge}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-muted-foreground hover:text-rose-600 shrink-0"
              title="Keluar"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Drawer */}
            <div className="flex h-16 items-center justify-between border-b border-border px-5 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
                  <CheckCheck size={18} />
                </span>
                <span className="font-display text-base font-bold text-navy-950">
                  Hadirin Admin
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 text-muted-foreground"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Menu Sections Mobile */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {navigationSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                    {section.title}
                  </span>
                  <nav className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                            isActive
                              ? "bg-navy-900 text-white"
                              : "text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            {/* Footer Drawer */}
            <div className="border-t border-border p-4 shrink-0 bg-slate-50">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="bg-navy-100 text-navy-900 text-xs font-bold font-mono">
                    {currentUser?.nama?.slice(0, 2).toUpperCase() || "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-xs font-bold text-navy-950">
                    {currentUser?.nama || "Admin"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {roleBadge}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8 text-rose-600"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Menu,
  X,
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
  Receipt,
  Award,
  FileText,
  Clock,
  Heart,
  Laptop,
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

function getNavigation(role?: UserRole): NavSection[] {
  // 1. SISWA
  if (role === "siswa") {
    return [
      {
        title: "Ringkasan",
        items: [
          { href: "/siswa", label: "Portal Siswa", icon: Home },
        ],
      },
      {
        title: "Kegiatan Belajar (LMS)",
        items: [
          { href: "/siswa/tugas", label: "Tugas & PR Siswa", icon: FileText },
          { href: "/siswa/materi", label: "Materi & Modul Ajar", icon: BookOpen },
          { href: "/siswa/ujian", label: "CBT & Ujian Online", icon: Laptop },
          { href: "/izin", label: "Pengajuan Izin / Sakit", icon: FileCheck },
        ],
      },
      {
        title: "Akademik & Nilai",
        items: [
          { href: "/siswa/nilai", label: "Nilai & Rapor Hasil Belajar", icon: Award },
        ],
      },
      {
        title: "Keuangan & SPP",
        items: [
          { href: "/siswa/spp", label: "Kartu SPP & Kwitansi", icon: Receipt },
        ],
      },
      {
        title: "Pengaturan",
        items: [
          { href: "/profil", label: "Profil Akun Siswa", icon: User },
        ],
      },
    ];
  }

  // 2. ORANG TUA / WALI
  if (role === "orang_tua") {
    return [
      {
        title: "Ringkasan",
        items: [
          { href: "/ortu", label: "Pantauan Siswa (Anak)", icon: Home },
        ],
      },
      {
        title: "KBM & Kehadiran",
        items: [
          { href: "/siswa/tugas", label: "Tugas & PR Anak", icon: FileText },
          { href: "/izin", label: "Surat Izin / Sakit", icon: FileCheck },
        ],
      },
      {
        title: "Akademik",
        items: [
          { href: "/siswa/nilai", label: "Nilai & Rapor Anak", icon: Award },
        ],
      },
      {
        title: "Keuangan",
        items: [
          { href: "/siswa/spp", label: "Tagihan & Iuran SPP", icon: Receipt },
        ],
      },
      {
        title: "Pengaturan",
        items: [
          { href: "/profil", label: "Profil Akun Wali", icon: User },
        ],
      },
    ];
  }

  // 3. GURU (Default)
  return [
    {
      title: "Ringkasan",
      items: [
        { href: "/", label: "Beranda Guru", icon: Home },
        { href: "/presensi-guru", label: "Presensi Mandiri", icon: UserCheck },
      ],
    },
    {
      title: "Kegiatan Belajar (KBM)",
      items: [
        { href: "/kelas", label: "Daftar Kelas", icon: CalendarCheck },
        { href: "/jurnal", label: "Jurnal Mengajar", icon: BookOpen },
        { href: "/izin", label: "Izin & Sakit Siswa", icon: FileCheck },
        { href: "/rekap", label: "Rekapitulasi KBM", icon: BarChart3 },
      ],
    },
    {
      title: "Pengaturan",
      items: [
        { href: "/profil", label: "Profil Akun Guru", icon: User },
      ],
    },
  ];
}

export default function NavShell() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, isMobileMenuOpen, setMobileMenuOpen, toggleMobileMenu } = useStore();

  const role = currentUser?.role;
  const isSiswa = role === "siswa";
  const isOrtu = role === "orang_tua";

  const navigationSections = getNavigation(role);

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

  const primaryMobileTabs = isSiswa
    ? [
        { href: "/siswa", label: "Portal", icon: Home },
        { href: "/siswa/tugas", label: "Tugas", icon: FileText },
        { href: "/siswa/materi", label: "Materi", icon: BookOpen },
        { href: "/siswa/nilai", label: "Nilai", icon: Award },
      ]
    : isOrtu
    ? [
        { href: "/ortu", label: "Pantauan", icon: Home },
        { href: "/siswa/tugas", label: "Tugas", icon: FileText },
        { href: "/siswa/nilai", label: "Nilai", icon: Award },
        { href: "/siswa/spp", label: "SPP", icon: Receipt },
      ]
    : [
        { href: "/", label: "Beranda", icon: Home },
        { href: "/presensi-guru", label: "Presensi", icon: UserCheck },
        { href: "/kelas", label: "Kelas", icon: CalendarCheck },
        { href: "/jurnal", label: "Jurnal", icon: BookOpen },
      ];

  return (
    <>
      {/* Desktop Sidebar (docked left, visible on screens >= 1024px) */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-white lg:sticky lg:top-0 lg:h-screen z-30">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
            <CheckCheck size={20} />
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-lg font-bold tracking-tight text-navy-950">
              Hadirin
            </span>
            <span className={cn("rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide uppercase", roleBadgeColor)}>
              {roleBadge}
            </span>
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

        {/* User profile & Logout */}
        <div className="border-t border-border p-3.5 space-y-2.5 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 border border-navy-200">
              <AvatarFallback className={cn("font-bold text-xs", isSiswa ? "bg-sky-100 text-sky-900" : isOrtu ? "bg-rose-100 text-rose-900" : "bg-navy-100 text-navy-900")}>
                {currentUser?.nama?.slice(0, 2).toUpperCase() || "AH"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-bold text-navy-950 leading-tight">
                {currentUser?.nama || "Ahmad Fadillah"}
              </p>
              <p className="truncate text-[10px] text-muted-foreground leading-tight">
                {currentUser?.jabatan || "Siswa Kelas X IPA 1"}
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
                  <span className={cn("rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide uppercase", roleBadgeColor)}>
                    {roleBadge}
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
                  <AvatarFallback className={cn("font-bold text-xs", isSiswa ? "bg-sky-100 text-sky-900" : isOrtu ? "bg-rose-100 text-rose-900" : "bg-navy-100 text-navy-900")}>
                    {currentUser?.nama?.slice(0, 2).toUpperCase() || "AH"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-bold text-navy-950 leading-tight">
                    {currentUser?.nama || "Ahmad Fadillah"}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground leading-tight">
                    {currentUser?.jabatan || "Siswa Kelas X IPA 1"}
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

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
  Receipt,
  Award,
  FileText,
  Clock,
  Heart,
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
  const { currentUser, logout } = useStore();

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
    logout();
    router.push("/login");
  }

  return (
    <>
      {/* Desktop Sidebar (docked left, full height) */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-white md:sticky md:top-0 md:h-screen z-30">
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

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-md md:hidden">
        <div className="flex items-stretch justify-around">
          {navigationSections.flatMap((s) => s.items).slice(0, 5).map(({ href, label, icon: Icon }) => {
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

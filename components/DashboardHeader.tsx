"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Calendar,
  Search,
  User,
  ShieldCheck,
  ChevronDown,
  CalendarDays,
  Check,
  School,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HARI_INI, useStore } from "@/lib/store";
import { profilGuru, profilKepsek } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  role?: "guru" | "admin" | "tu" | "kepsek";
}

const daftarPilihanTahun = [
  { tahun: "2024/2025", semester: "Ganjil" as const, status: "AKTIF" },
  { tahun: "2024/2025", semester: "Genap" as const, status: "MENDATANG" },
  { tahun: "2023/2024", semester: "Genap" as const, status: "ARSIP" },
  { tahun: "2023/2024", semester: "Ganjil" as const, status: "ARSIP" },
];

export default function DashboardHeader({ role = "guru" }: DashboardHeaderProps) {
  const { currentUser, tahunAjaranAktif, semesterAktif, setTahunAjaran } = useStore();
  const [openTahunDropdown, setOpenTahunDropdown] = useState(false);

  const isGuru = role === "guru" || currentUser?.role === "guru";
  const nama = currentUser?.nama || (isGuru ? profilGuru.nama : profilKepsek.nama);
  const inisial = nama
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-white/95 px-6 backdrop-blur-md md:px-8">
      {/* Left: Search Bar */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-border bg-slate-50/80 px-3 py-1.5 text-xs text-muted-foreground w-64 md:w-80 shadow-2xs focus-within:ring-2 focus-within:ring-navy-900 focus-within:bg-white transition-all">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari siswa, NISN, guru, mapel, atau kelas..."
            className="w-full bg-transparent outline-none placeholder:text-slate-400 text-xs"
          />
        </div>
      </div>

      {/* Right: Academic Year Switcher, Date, Notifications, User profile */}
      <div className="flex items-center gap-3 md:gap-3.5">
        {/* Academic Year Switcher (Standar SaaS Pendidikan) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenTahunDropdown(!openTahunDropdown)}
            className="flex items-center gap-2 rounded-xl border border-navy-200 bg-navy-50/70 hover:bg-navy-100/80 px-3 py-1.5 text-xs font-semibold text-navy-950 transition-colors shadow-2xs cursor-pointer"
          >
            <CalendarDays size={14} className="text-navy-700" />
            <span>
              {tahunAjaranAktif}{" "}
              <span className="text-navy-600 font-normal">({semesterAktif})</span>
            </span>
            <ChevronDown size={13} className={cn("text-navy-600 transition-transform", openTahunDropdown && "rotate-180")} />
          </button>

          {openTahunDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-fade-up">
              <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pilih Tahun Ajaran &amp; Semester
              </div>
              <div className="space-y-1 py-1">
                {daftarPilihanTahun.map((item, idx) => {
                  const isCurrent =
                    item.tahun === tahunAjaranAktif && item.semester === semesterAktif;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTahunAjaran(item.tahun, item.semester);
                        setOpenTahunDropdown(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer",
                        isCurrent
                          ? "bg-navy-900 text-white font-semibold"
                          : "text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {isCurrent && <Check size={13} className="shrink-0" />}
                        <span>
                          {item.tahun} &bull; {item.semester}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase",
                          isCurrent
                            ? "bg-navy-800 text-navy-200"
                            : item.status === "AKTIF"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "MENDATANG"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {item.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Date Today */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs">
          <Calendar size={13} className="text-slate-500" />
          <span>Hari {HARI_INI}, 23 Juli 2026</span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-white text-navy-900 shadow-2xs transition-colors hover:bg-slate-50 hover:text-navy-950 cursor-pointer"
        >
          <Bell size={16} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-border hidden sm:block" />

        {/* Profile Link */}
        <Link
          href={isGuru ? "/profil" : "/admin/pengaturan"}
          className="flex items-center gap-2.5 rounded-xl p-1 transition-colors hover:bg-slate-50"
        >
          <Avatar className="h-9 w-9 border border-navy-200">
            <AvatarFallback className="bg-navy-100 font-bold text-navy-900 text-xs">
              {inisial}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left xl:block">
            <p className="text-xs font-bold text-navy-950 leading-tight">
              {nama}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {currentUser?.jabatan || (isGuru ? "Guru Pengajar" : "Kepala Sekolah")}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}

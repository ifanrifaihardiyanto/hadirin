"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  Search,
  ExternalLink,
  Layers,
  Database,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TenantItem {
  id: string;
  namaSekolah: string;
  npsn: string;
  kota: string;
  paket: "PRO_TAHUNAN" | "STANDARD_SEMESTER" | "BASIC_BULANAN" | "TRIAL";
  totalSiswa: number;
  totalGuru: number;
  status: "AKTIF" | "TRIAL" | "MENUNGGU_PEMBAYARAN";
  kadaluarsa: string;
  kontakAdmin: string;
}

const daftarTenantAwal: TenantItem[] = [
  {
    id: "t1",
    namaSekolah: "SMA Negeri 3 Contoh",
    npsn: "20220412",
    kota: "Kota Bogor",
    paket: "PRO_TAHUNAN",
    totalSiswa: 720,
    totalGuru: 42,
    status: "AKTIF",
    kadaluarsa: "24 Juli 2027",
    kontakAdmin: "admin@sman3contoh.sch.id",
  },
  {
    id: "t2",
    namaSekolah: "SMA Budi Luhur",
    npsn: "20231908",
    kota: "Jakarta Selatan",
    paket: "STANDARD_SEMESTER",
    totalSiswa: 540,
    totalGuru: 35,
    status: "AKTIF",
    kadaluarsa: "15 Januari 2027",
    kontakAdmin: "info@budiluhur.sch.id",
  },
  {
    id: "t3",
    namaSekolah: "SMK Bina Insan Mandiri",
    npsn: "20245012",
    kota: "Kota Bandung",
    paket: "BASIC_BULANAN",
    totalSiswa: 890,
    totalGuru: 56,
    status: "AKTIF",
    kadaluarsa: "30 Agustus 2026",
    kontakAdmin: "it@smkbinainsan.sch.id",
  },
  {
    id: "t4",
    namaSekolah: "SMP Harapan Bangsa",
    npsn: "20251102",
    kota: "Kota Depok",
    paket: "TRIAL",
    totalSiswa: 380,
    totalGuru: 24,
    status: "TRIAL",
    kadaluarsa: "8 Agustus 2026",
    kontakAdmin: "admin@harapanbangsa.sch.id",
  },
];

export default function SuperAdminSaasPage() {
  const { currentUser } = useStore();
  const [tenants, setTenants] = useState<TenantItem[]>(daftarTenantAwal);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTenants = tenants.filter((t) =>
    t.namaSekolah.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.kota.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.npsn.includes(searchQuery)
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              Super Admin SaaS &amp; Multi-Tenant Control
            </h1>
            <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-xs font-semibold">
              Owner Platform
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pusat kendali langganan lisensi sekolah, multi-tenant cloud, dan analitik pendapatan platform Hadirin
          </p>
        </div>

        <Button
          size="sm"
          className="bg-navy-900 hover:bg-navy-800 text-white gap-1.5 text-xs font-medium cursor-pointer shadow-xs"
          onClick={() => alert("Membuka wizard registrasi tenant sekolah baru.")}
        >
          <Plus size={15} />
          Tambah Sekolah Mitra
        </Button>
      </div>

      {/* KPI Cards Multi-Tenant */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none bg-gradient-to-br from-navy-950 to-navy-900 text-white shadow-xs">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-200">
              Total Sekolah Mitra (Tenant)
            </p>
            <p className="font-mono text-3xl font-bold text-white mt-2">
              {tenants.length} <span className="text-sm font-normal text-navy-300">Institusi</span>
            </p>
            <p className="mt-2 text-[11px] text-emerald-400 font-semibold">
              100% Aktif &amp; Terhubung
            </p>
          </div>
        </Card>

        <Card className="border border-border bg-white shadow-xs">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Siswa Terlayani
            </p>
            <p className="font-mono text-3xl font-bold text-navy-950 mt-2">
              2.530 <span className="text-sm font-normal text-slate-500">Siswa</span>
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Lintas 4 kampus sekolah
            </p>
          </div>
        </Card>

        <Card className="border border-border bg-white shadow-xs">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Dewan Guru (PTK)
            </p>
            <p className="font-mono text-3xl font-bold text-navy-950 mt-2">
              157 <span className="text-sm font-normal text-slate-500">Guru</span>
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Pengguna aktif harian
            </p>
          </div>
        </Card>

        <Card className="border border-emerald-200 bg-emerald-50/50 shadow-xs">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Monthly Recurring (MRR)
            </p>
            <p className="font-mono text-2xl md:text-3xl font-bold text-emerald-950 mt-2">
              Rp 18.500.000
            </p>
            <p className="mt-2 text-[11px] text-emerald-700 font-semibold">
              +14.2% dari bulan lalu
            </p>
          </div>
        </Card>
      </div>

      {/* Tabel Sekolah Mitra */}
      <Card className="border border-border bg-white shadow-xs overflow-hidden">
        <div className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama sekolah, kota, atau NPSN..."
              className="h-9.5 pl-10 text-xs bg-slate-50/70 border-border"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <strong className="text-navy-950">{filteredTenants.length}</strong> sekolah mitra
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 text-navy-950 border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Nama Sekolah &amp; NPSN</th>
                <th className="py-3 px-4 font-semibold">Kota / Wilayah</th>
                <th className="py-3 px-4 font-semibold text-center">Siswa</th>
                <th className="py-3 px-4 font-semibold text-center">Guru</th>
                <th className="py-3 px-4 font-semibold">Paket Langganan</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold">Masa Berlaku</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTenants.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-xs text-navy-950">{item.namaSekolah}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">NPSN. {item.npsn}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{item.kota}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-navy-950">{item.totalSiswa}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-navy-950">{item.totalGuru}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {item.paket.replace("_" , " ")}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge className={item.status === "AKTIF" ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold" : "bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold"}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 font-medium">
                    {item.kadaluarsa}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] border-slate-200 text-navy-950 hover:bg-slate-100"
                      onClick={() => alert(`Mengelola lisensi & konfigurasi database ${item.namaSekolah}`)}
                    >
                      Kelola
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

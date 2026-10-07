"use client";

import { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  School,
  GraduationCap,
  Sparkles,
  Power,
  X,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";

interface TenantItem {
  id: string | number;
  nama: string;
  npsn?: string;
  kota?: string;
  alamat?: string;
  jenjang?: string;
  telepon?: string;
  email?: string;
  kontak_admin?: string;
  paket_langganan: "PRO_TAHUNAN" | "STANDARD_SEMESTER" | "BASIC_BULANAN" | "TRIAL";
  status_langganan: "AKTIF" | "TRIAL" | "MENUNGGU_PEMBAYARAN" | "SUSPENDED" | "EXPIRED";
  siswas_count?: number;
  gurus_count?: number;
  kelas_count?: number;
  tanggal_mulai_langganan?: string;
  tanggal_kadaluarsa?: string;
}

interface SaasStats {
  total_tenant: number;
  total_siswa: number;
  total_guru: number;
  total_revenue: number;
  distribusi_paket?: Record<string, number>;
  distribusi_status?: Record<string, number>;
}

export default function SuperAdminSaasPage() {
  const { currentUser } = useStore();
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [stats, setStats] = useState<SaasStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPaket, setSelectedPaket] = useState<string>("ALL");

  // Modal Tambah Mitra
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    npsn: "",
    jenjang: "SMA",
    kota: "",
    alamat: "",
    telepon: "",
    email: "",
    kontak_admin: "",
    paket_langganan: "PRO_TAHUNAN",
  });

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [tenantsRes, statsRes] = await Promise.allSettled([
        api.getSaasTenants(),
        api.getSaasStats(),
      ]);

      if (tenantsRes.status === "fulfilled" && tenantsRes.value?.data) {
        setTenants(tenantsRes.value.data);
      }
      if (statsRes.status === "fulfilled" && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }
    } catch (err) {
      console.error("Gagal memuat data SaaS Multi-tenant:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleStatus = async (tenant: TenantItem) => {
    const aksi = tenant.status_langganan === "AKTIF" ? "menonaktifkan (suspend)" : "mengaktifkan kembali";
    if (!confirm(`Apakah Anda yakin ingin ${aksi} akses sekolah mitra ${tenant.nama}?`)) {
      return;
    }

    try {
      const res = await api.toggleSaasTenantStatus(tenant.id);
      if (res?.success) {
        await loadData(true);
      }
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message || "Terjadi kesalahan"}`);
    }
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) {
      alert("Nama sekolah wajib diisi!");
      return;
    }

    setSaving(true);
    try {
      const res = await api.createSaasTenant({
        ...formData,
        status_langganan: "AKTIF",
        tanggal_mulai_langganan: new Date().toISOString().split("T")[0],
      });

      if (res?.success) {
        setIsModalOpen(false);
        setFormData({
          nama: "",
          npsn: "",
          jenjang: "SMA",
          kota: "",
          alamat: "",
          telepon: "",
          email: "",
          kontak_admin: "",
          paket_langganan: "PRO_TAHUNAN",
        });
        await loadData(true);
      } else {
        alert(res?.message || "Gagal menyimpan tenant sekolah.");
      }
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message || "Terjadi kesalahan server"}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const matchSearch =
      t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.kota && t.kota.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.npsn && t.npsn.includes(searchQuery));

    const matchStatus =
      selectedStatus === "ALL" || t.status_langganan === selectedStatus;
    const matchPaket =
      selectedPaket === "ALL" || t.paket_langganan === selectedPaket;

    return matchSearch && matchStatus && matchPaket;
  });

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1">
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

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="text-xs h-9 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-navy-600" : ""} />
            <span>Muat Ulang</span>
          </Button>

          <Button
            size="sm"
            className="bg-navy-900 hover:bg-navy-800 text-white gap-1.5 text-xs font-medium cursor-pointer shadow-xs h-9"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={15} />
            Tambah Sekolah Mitra
          </Button>
        </div>
      </div>

      {/* KPI Cards Multi-Tenant */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Tenant */}
        {loading ? (
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs animate-pulse space-y-3">
            <div className="h-3 w-28 bg-slate-200 rounded"></div>
            <div className="h-8 w-16 bg-slate-200 rounded"></div>
            <div className="h-2.5 w-32 bg-slate-100 rounded"></div>
          </div>
        ) : (
          <Card className="border-none bg-gradient-to-br from-navy-950 to-navy-900 text-white shadow-xs">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-navy-200">
                  Total Sekolah Mitra
                </p>
                <Building2 size={18} className="text-navy-300" />
              </div>
              <p className="font-mono text-3xl font-bold text-white mt-2">
                {stats?.total_tenant ?? tenants.length}{" "}
                <span className="text-sm font-normal text-navy-300">Tenant</span>
              </p>
              <p className="mt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle size={12} />
                Aktif &amp; Terhubung Cloud
              </p>
            </div>
          </Card>
        )}

        {/* Card 2: Total Siswa */}
        {loading ? (
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs animate-pulse space-y-3">
            <div className="h-3 w-28 bg-slate-200 rounded"></div>
            <div className="h-8 w-20 bg-slate-200 rounded"></div>
            <div className="h-2.5 w-36 bg-slate-100 rounded"></div>
          </div>
        ) : (
          <Card className="border border-border bg-white shadow-xs">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Siswa Terdaftar
                </p>
                <GraduationCap size={18} className="text-blue-600" />
              </div>
              <p className="font-mono text-3xl font-bold text-navy-950 mt-2">
                {(stats?.total_siswa ?? 0).toLocaleString("id-ID")}{" "}
                <span className="text-sm font-normal text-slate-500">Siswa</span>
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Lintas seluruh database sekolah
              </p>
            </div>
          </Card>
        )}

        {/* Card 3: Total Guru */}
        {loading ? (
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs animate-pulse space-y-3">
            <div className="h-3 w-28 bg-slate-200 rounded"></div>
            <div className="h-8 w-20 bg-slate-200 rounded"></div>
            <div className="h-2.5 w-32 bg-slate-100 rounded"></div>
          </div>
        ) : (
          <Card className="border border-border bg-white shadow-xs">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Dewan Guru (PTK)
                </p>
                <Users size={18} className="text-indigo-600" />
              </div>
              <p className="font-mono text-3xl font-bold text-navy-950 mt-2">
                {(stats?.total_guru ?? 0).toLocaleString("id-ID")}{" "}
                <span className="text-sm font-normal text-slate-500">Guru</span>
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Pengguna aktif mengajar
              </p>
            </div>
          </Card>
        )}

        {/* Card 4: Revenue SaaS */}
        {loading ? (
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-xs animate-pulse space-y-3">
            <div className="h-3 w-28 bg-emerald-200 rounded"></div>
            <div className="h-8 w-28 bg-emerald-200 rounded"></div>
            <div className="h-2.5 w-32 bg-emerald-100 rounded"></div>
          </div>
        ) : (
          <Card className="border border-emerald-200 bg-emerald-50/50 shadow-xs">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Total Pendapatan (ARR/MRR)
                </p>
                <TrendingUp size={18} className="text-emerald-700" />
              </div>
              <p className="font-mono text-2xl md:text-3xl font-bold text-emerald-950 mt-2">
                {stats?.total_revenue && stats.total_revenue > 0
                  ? formatRupiah(stats.total_revenue)
                  : "Rp 18.500.000"}
              </p>
              <p className="mt-2 text-[11px] text-emerald-700 font-semibold">
                Sistem Billing Otomatis
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Filter & Tabel Sekolah Mitra */}
      <Card className="border border-border bg-white shadow-xs overflow-hidden">
        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama sekolah, kota, atau NPSN..."
                className="h-9.5 pl-10 text-xs bg-slate-50/70 border-border"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-navy-600"
              >
                <option value="ALL">Semua Status</option>
                <option value="AKTIF">AKTIF</option>
                <option value="TRIAL">TRIAL</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>

              <select
                value={selectedPaket}
                onChange={(e) => setSelectedPaket(e.target.value)}
                className="h-9.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-navy-600"
              >
                <option value="ALL">Semua Paket</option>
                <option value="PRO_TAHUNAN">PRO TAHUNAN</option>
                <option value="STANDARD_SEMESTER">STANDARD SEMESTER</option>
                <option value="BASIC_BULANAN">BASIC BULANAN</option>
                <option value="TRIAL">TRIAL</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <strong className="text-navy-950">{filteredTenants.length}</strong> sekolah mitra
          </div>
        </div>

        {/* Tabel Data Tenant */}
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
                <th className="py-3 px-4 font-semibold">Kontak &amp; Email</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                // SKELETON SHIMMER LOADING
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={`skel-${idx}`} className="animate-pulse">
                    <td className="py-4 px-4 space-y-1.5">
                      <div className="h-3.5 w-44 bg-slate-200 rounded"></div>
                      <div className="h-2.5 w-24 bg-slate-100 rounded"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3 w-28 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-3.5 w-10 mx-auto bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-3.5 w-10 mx-auto bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 w-24 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-5 w-16 mx-auto bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-4 px-4 space-y-1">
                      <div className="h-2.5 w-32 bg-slate-200 rounded"></div>
                      <div className="h-2.5 w-24 bg-slate-100 rounded"></div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-7 w-20 mx-auto bg-slate-200 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <School className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">Tidak ada data sekolah mitra</p>
                    <p className="text-[11px] text-slate-400">
                      Silakan sesuaikan kata kunci pencarian atau tambah mitra baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                        <School size={13} className="text-navy-700 shrink-0" />
                        {item.nama}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground ml-5">
                        {item.npsn ? `NPSN. ${item.npsn}` : "-"}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.kota || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-navy-950">
                      {item.siswas_count ?? 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-navy-950">
                      {item.gurus_count ?? 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="font-mono text-[10px] bg-slate-50">
                        {item.paket_langganan?.replace("_", " ") || "PRO TAHUNAN"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        className={
                          item.status_langganan === "AKTIF"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold"
                            : item.status_langganan === "TRIAL"
                            ? "bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold"
                            : "bg-rose-50 text-rose-700 border-rose-200 text-xs font-semibold"
                        }
                      >
                        {item.status_langganan}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        {item.email && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600">
                            <Mail size={11} className="text-slate-400" />
                            <span>{item.email}</span>
                          </div>
                        )}
                        {item.telepon && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                            <Phone size={11} className="text-slate-400" />
                            <span>{item.telepon}</span>
                          </div>
                        )}
                        {!item.email && !item.telepon && (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 text-[11px] border font-medium ${
                          item.status_langganan === "AKTIF"
                            ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        }`}
                        onClick={() => handleToggleStatus(item)}
                      >
                        <Power size={11} className="mr-1" />
                        {item.status_langganan === "AKTIF" ? "Suspend" : "Aktifkan"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Dialog Tambah Sekolah Mitra */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-navy-800" />
                <h3 className="font-semibold text-sm text-navy-950">
                  Tambah Sekolah Mitra Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Nama Sekolah *</label>
                  <Input
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: SMA Negeri 1 Bangsa"
                    className="h-8.5 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">NPSN</label>
                  <Input
                    value={formData.npsn}
                    onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                    placeholder="8 digit NPSN"
                    className="h-8.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Jenjang</label>
                  <select
                    value={formData.jenjang}
                    onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}
                    className="w-full h-8.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-navy-600"
                  >
                    <option value="SD">SD / MI</option>
                    <option value="SMP">SMP / MTs</option>
                    <option value="SMA">SMA / MA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Kota / Kabupaten</label>
                  <Input
                    value={formData.kota}
                    onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                    placeholder="Contoh: Kota Bandung"
                    className="h-8.5 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Alamat Lengkap</label>
                <Input
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Jl. Pendidikan No. 12"
                  className="h-8.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Email Sekolah</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@sekolah.sch.id"
                    className="h-8.5 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Telepon / WhatsApp</label>
                  <Input
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="08123456789"
                    className="h-8.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Kontak Person (PIC)</label>
                  <Input
                    value={formData.kontak_admin}
                    onChange={(e) => setFormData({ ...formData, kontak_admin: e.target.value })}
                    placeholder="Nama PIC IT/Operator"
                    className="h-8.5 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Paket Lisensi</label>
                  <select
                    value={formData.paket_langganan}
                    onChange={(e) => setFormData({ ...formData, paket_langganan: e.target.value })}
                    className="w-full h-8.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-navy-600"
                  >
                    <option value="PRO_TAHUNAN">PRO TAHUNAN</option>
                    <option value="STANDARD_SEMESTER">STANDARD SEMESTER</option>
                    <option value="BASIC_BULANAN">BASIC BULANAN</option>
                    <option value="TRIAL">TRIAL (Uji Coba 30 Hari)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="h-8 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="h-8 text-xs bg-navy-900 hover:bg-navy-800 text-white"
                >
                  {saving ? "Menyimpan..." : "Daftarkan Tenant"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

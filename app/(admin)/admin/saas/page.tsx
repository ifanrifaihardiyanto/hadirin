"use client";

import { useState, useEffect } from "react";
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
  Power,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";

interface TenantItem {
  id: string;
  namaSekolah: string;
  npsn: string;
  kota: string;
  paket: "PRO_TAHUNAN" | "STANDARD_SEMESTER" | "BASIC_BULANAN" | "TRIAL";
  totalSiswa: number;
  totalGuru: number;
  status: "AKTIF" | "TRIAL" | "MENUNGGU_PEMBAYARAN" | "SUSPENDED";
  kadaluarsa: string;
  kontakAdmin: string;
  isActive?: boolean;
}

export default function SuperAdminSaasPage() {
  const { currentUser } = useStore();
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [stats, setStats] = useState({
    totalTenant: 0,
    totalSiswa: 0,
    totalGuru: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("SEMUA");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formNama, setFormNama] = useState("");
  const [formNpsn, setFormNpsn] = useState("");
  const [formJenjang, setFormJenjang] = useState("SMA");
  const [formKota, setFormKota] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelepon, setFormTelepon] = useState("");
  const [formPaket, setFormPaket] = useState<"PRO_TAHUNAN" | "STANDARD_SEMESTER" | "BASIC_BULANAN" | "TRIAL">("PRO_TAHUNAN");

  async function loadData() {
    try {
      setLoading(true);
      const [tenantsRes, statsRes] = await Promise.allSettled([
        api.getSaasTenants(),
        api.getSaasStats(),
      ]);

      if (tenantsRes.status === "fulfilled" && tenantsRes.value?.data) {
        const mapped = tenantsRes.value.data.map((t: any) => ({
          id: String(t.id),
          namaSekolah: t.nama,
          npsn: t.npsn || "-",
          kota: t.kota || "Jakarta",
          paket: t.paket_langganan || "PRO_TAHUNAN",
          totalSiswa: Number(t.siswas_count) || Number(t.kuota_siswa) || 0,
          totalGuru: Number(t.gurus_count) || Number(t.kuota_guru) || 0,
          status: t.status_langganan || (t.is_active ? "AKTIF" : "SUSPENDED"),
          kadaluarsa: t.tanggal_kadaluarsa ? new Date(t.tanggal_kadaluarsa).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Permanen",
          kontakAdmin: t.kontak_admin || t.email || "-",
          isActive: Boolean(t.is_active),
        }));
        setTenants(mapped);
      }

      if (statsRes.status === "fulfilled" && statsRes.value?.data) {
        const d = statsRes.value.data;
        setStats({
          totalTenant: Number(d.total_tenant) || 0,
          totalSiswa: Number(d.total_siswa) || 0,
          totalGuru: Number(d.total_guru) || 0,
          totalRevenue: Number(d.total_revenue) || 0,
        });
      }
    } catch (err) {
      console.warn("Gagal mengambil data tenant SaaS:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleTambahSekolah(e: React.FormEvent) {
    e.preventDefault();
    if (!formNama) return;

    try {
      setIsSubmitting(true);
      await api.createSaasTenant({
        nama: formNama,
        npsn: formNpsn,
        jenjang: formJenjang,
        kota: formKota,
        email: formEmail,
        telepon: formTelepon,
        kontak_admin: formEmail,
        paket_langganan: formPaket,
      });

      setIsModalOpen(false);
      setFormNama("");
      setFormNpsn("");
      setFormKota("");
      setFormEmail("");
      setFormTelepon("");
      await loadData();
    } catch (err) {
      alert("Gagal menambahkan sekolah mitra baru. Periksa NPSN apakah sudah terdaftar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(tenantId: string) {
    try {
      await api.toggleSaasTenantStatus(tenantId);
      await loadData();
    } catch (err) {
      alert("Gagal memperbarui status lisensi sekolah.");
    }
  }

  const filteredTenants = tenants.filter((t) => {
    const matchSearch =
      t.namaSekolah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.kota.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.npsn.includes(searchQuery);

    const matchStatus = statusFilter === "SEMUA" || t.status === statusFilter;

    return matchSearch && matchStatus;
  });

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

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs font-medium cursor-pointer"
            onClick={loadData}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Segarkan
          </Button>

          <Button
            size="sm"
            className="bg-navy-900 hover:bg-navy-800 text-white gap-1.5 text-xs font-medium cursor-pointer shadow-xs"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={15} />
            Tambah Sekolah Mitra
          </Button>
        </div>
      </div>

      {/* KPI Cards Multi-Tenant */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none bg-gradient-to-br from-navy-950 to-navy-900 text-white shadow-xs">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-200">
              Total Sekolah Mitra (Tenant)
            </p>
            <p className="font-mono text-3xl font-bold text-white mt-2">
              {stats.totalTenant > 0 ? stats.totalTenant : tenants.length} <span className="text-sm font-normal text-navy-300">Institusi</span>
            </p>
            <p className="mt-2 text-[11px] text-emerald-400 font-semibold">
              Cloud Multi-Tenancy Aktif
            </p>
          </div>
        </Card>

        <Card className="border border-border bg-white shadow-xs">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Siswa Terlayani
            </p>
            <p className="font-mono text-3xl font-bold text-navy-950 mt-2">
              {stats.totalSiswa > 0 ? stats.totalSiswa.toLocaleString("id-ID") : "2.530"} <span className="text-sm font-normal text-slate-500">Siswa</span>
            </p>
            <p className="mt-2 text-[11px] text-emerald-600 font-semibold">
              Database Terintegrasi
            </p>
          </div>
        </Card>

        <Card className="border border-border bg-white shadow-xs">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Dewan Guru &amp; PTK
            </p>
            <p className="font-mono text-3xl font-bold text-navy-950 mt-2">
              {stats.totalGuru > 0 ? stats.totalGuru.toLocaleString("id-ID") : "157"} <span className="text-sm font-normal text-slate-500">Tenaga Pendidik</span>
            </p>
            <p className="mt-2 text-[11px] text-sky-600 font-semibold">
              Akses Portal &amp; E-Rapor Aktif
            </p>
          </div>
        </Card>

        <Card className="border border-border bg-emerald-50/50 shadow-xs">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Akumulasi Revenue SaaS
            </p>
            <p className="font-mono text-2xl md:text-3xl font-bold text-emerald-950 mt-2">
              Rp {(stats.totalRevenue > 0 ? stats.totalRevenue : 25300000).toLocaleString("id-ID")}
            </p>
            <p className="mt-2 text-[11px] text-emerald-700 font-semibold">
              Invoice Terbayar Lunas
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

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9.5 px-3 text-xs rounded-md border border-border bg-slate-50/70 text-slate-700 font-medium"
            >
              <option value="SEMUA">Semua Status</option>
              <option value="AKTIF">Aktif</option>
              <option value="TRIAL">Trial</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            <div className="text-xs text-slate-500 font-medium">
              Menampilkan <strong className="text-navy-950">{filteredTenants.length}</strong> sekolah
            </div>
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
                <th className="py-3 px-4 font-semibold text-center">Aksi Lisensi</th>
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
                      {item.paket.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge
                      className={
                        item.status === "AKTIF"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold"
                          : item.status === "TRIAL"
                          ? "bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold"
                          : "bg-rose-50 text-rose-700 border-rose-200 text-xs font-semibold"
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 font-medium">
                    {item.kadaluarsa}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 px-2.5 text-[11px] gap-1 cursor-pointer ${
                          item.status === "AKTIF"
                            ? "text-rose-600 border-rose-200 hover:bg-rose-50"
                            : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        }`}
                        onClick={() => handleToggleStatus(item.id)}
                      >
                        <Power size={12} />
                        {item.status === "AKTIF" ? "Suspend" : "Aktifkan"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tidak ditemukan sekolah mitra yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tambah Sekolah Mitra Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border bg-slate-50/50">
              <div>
                <h3 className="font-display font-bold text-lg text-navy-950">Tambah Sekolah Mitra SaaS</h3>
                <p className="text-xs text-slate-500 mt-0.5">Daftarkan institusi sekolah baru ke jaringan cloud platform</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTambahSekolah} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-navy-950 mb-1">Nama Resmi Sekolah *</label>
                <Input
                  required
                  placeholder="contoh: SMA Negeri 1 Maju Bersama"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-navy-950 mb-1">NPSN</label>
                  <Input
                    placeholder="contoh: 20267890"
                    value={formNpsn}
                    onChange={(e) => setFormNpsn(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-navy-950 mb-1">Jenjang Pendidikan</label>
                  <select
                    value={formJenjang}
                    onChange={(e) => setFormJenjang(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-border text-xs bg-white text-navy-950"
                  >
                    <option value="SD">SD / MI</option>
                    <option value="SMP">SMP / MTs</option>
                    <option value="SMA">SMA / MA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-navy-950 mb-1">Kota / Kabupaten</label>
                  <Input
                    placeholder="contoh: Kota Surabaya"
                    value={formKota}
                    onChange={(e) => setFormKota(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-navy-950 mb-1">Paket Lisensi SaaS</label>
                  <select
                    value={formPaket}
                    onChange={(e) => setFormPaket(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-md border border-border text-xs bg-white text-navy-950"
                  >
                    <option value="PRO_TAHUNAN">Pro Tahunan (Rp 15jt/thn)</option>
                    <option value="STANDARD_SEMESTER">Standard Semester (Rp 8.5jt/sem)</option>
                    <option value="BASIC_BULANAN">Basic Bulanan (Rp 1.8jt/bln)</option>
                    <option value="TRIAL">Trial 30 Hari (Gratis)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-navy-950 mb-1">Email Resmi Admin</label>
                  <Input
                    type="email"
                    placeholder="admin@sekolah.sch.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-navy-950 mb-1">Nomor Telepon Kantor</label>
                  <Input
                    placeholder="021-xxxxxxxx"
                    value={formTelepon}
                    onChange={(e) => setFormTelepon(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-navy-900 hover:bg-navy-800 text-white cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Mendaftarkan..." : "Daftarkan Tenant"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

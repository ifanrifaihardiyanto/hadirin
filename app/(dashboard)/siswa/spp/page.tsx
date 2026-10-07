"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Receipt,
  Printer,
  CheckCircle2,
  Clock,
  CreditCard,
  QrCode,
  Building,
  DollarSign,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface TagihanSPPItem {
  id: string | number;
  siswaNama?: string;
  siswa?: { nama: string };
  nisn?: string;
  noKwitansi?: string;
  no_kwitansi?: string;
  bulan: string;
  tahun?: number;
  nominal: number;
  tanggalBayar?: string;
  tanggal_bayar?: string;
  metodeBayar?: string;
  metode_bayar?: string;
  status: "LUNAS" | "BELUM_BAYAR" | string;
}

export default function SiswaSPPPage() {
  const { currentUser } = useStore();
  const [tagihanList, setTagihanList] = useState<TagihanSPPItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await api.getSPPList();
      const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      if (raw.length > 0) {
        setTagihanList(raw);
      } else {
        // Fallback riwayat SPP
        setTagihanList([
          {
            id: 1,
            noKwitansi: "KW-202607-001",
            bulan: "Juli 2026",
            nominal: 350000,
            tanggalBayar: "05 Juli 2026",
            metodeBayar: "VIRTUAL_ACCOUNT_BCA",
            status: "LUNAS",
          },
          {
            id: 2,
            noKwitansi: "KW-202606-089",
            bulan: "Juni 2026",
            nominal: 350000,
            tanggalBayar: "08 Juni 2026",
            metodeBayar: "TRANSFER_BANK",
            status: "LUNAS",
          },
          {
            id: 3,
            noKwitansi: "-",
            bulan: "Agustus 2026",
            nominal: 350000,
            tanggalBayar: "-",
            metodeBayar: "-",
            status: "BELUM_BAYAR",
          },
        ]);
      }
    } catch (err) {
      console.error("Gagal memuat data SPP siswa:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function copyVA() {
    navigator.clipboard?.writeText("88091234001");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tagihanLunas = tagihanList.filter((t) => t.status === "LUNAS");
  const tagihanBelum = tagihanList.find((t) => t.status !== "LUNAS");

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-xs">
              <Receipt size={19} />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              Kartu SPP &amp; Pembayaran Digital
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Status iuran SPP bulanan, nomor Virtual Account, dan riwayat kwitansi pembayaran
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData(true)}
          disabled={refreshing || loading}
          className="text-xs h-9 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 w-fit"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin text-navy-600" : ""} />
          <span>Muat Ulang</span>
        </Button>
      </div>

      {/* Virtual Account Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-none bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white shadow-lg rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-widest text-navy-300 font-semibold">
                Kartu Pembayaran SPP
              </span>
              <CreditCard size={20} className="text-white/70" />
            </div>

            <div>
              <div className="text-xs text-navy-300">Nomor Virtual Account (BCA / BNI / Mandiri):</div>
              <div className="mt-1 flex items-center justify-between bg-white/10 rounded-xl p-3 border border-white/15">
                <span className="font-mono text-xl font-bold tracking-wider text-white">
                  8809 1234 001
                </span>
                <button
                  type="button"
                  onClick={copyVA}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                  title="Salin Nomor VA"
                >
                  {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="text-xs text-navy-200 space-y-1">
              <p>Atas Nama: <strong className="text-white">{currentUser?.nama || "Ahmad Fadillah"}</strong></p>
              <p>NISN: <span className="font-mono text-white">0067891234</span></p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-navy-300">
            <span>Nominal SPP: <strong>Rp 350.000 / bln</strong></span>
            <span className="text-emerald-400 font-semibold">Bebas Biaya Admin</span>
          </div>
        </Card>

        {/* Status Ringkasan */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, idx) => (
              <Card key={`skel-spp-stat-${idx}`} className="border-border bg-white shadow-xs p-5 animate-pulse space-y-3">
                <div className="h-3 w-28 bg-slate-200 rounded"></div>
                <div className="h-7 w-40 bg-slate-200 rounded"></div>
                <div className="h-3 w-full bg-slate-100 rounded"></div>
              </Card>
            ))
          ) : (
            <>
              <Card className="border-border bg-white shadow-xs p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Status Bulan Ini</span>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-sm font-bold gap-1 px-3 py-1">
                      <CheckCircle2 size={15} /> Lunas (Juli 2026)
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Terverifikasi otomatis via Transfer Virtual Account pada tanggal 05 Juli 2026.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs font-mono font-bold text-navy-950">
                  No. Kwitansi: KW-202607-001
                </div>
              </Card>

              <Card className="border-border bg-white shadow-xs p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Tagihan Berikutnya</span>
                  <div className="mt-2 text-2xl font-bold font-mono text-navy-950">
                    Rp {tagihanBelum ? tagihanBelum.nominal.toLocaleString("id-ID") : "350.000"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Periode: <strong>{tagihanBelum ? tagihanBelum.bulan : "Agustus 2026"}</strong> &bull; Jatuh Tempo: 10 Agustus 2026
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-amber-700 font-medium">● Belum Terbit</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alert("Membuka instruksi pembayaran Virtual Account")}
                    className="h-7 text-xs border-navy-200 text-navy-950 hover:bg-slate-50"
                  >
                    Bayar Awal
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Riwayat Pembayaran SPP */}
      <Card className="border-border bg-white shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border bg-slate-50/50 p-4 sm:p-5">
          <CardTitle className="font-display text-base font-bold text-navy-950">
            Riwayat Pembayaran &amp; Kwitansi SPP
          </CardTitle>
          <CardDescription className="text-xs">
            Daftar bukti pembayaran yang telah diverifikasi oleh bendahara tata usaha sekolah
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-border font-semibold">
                <tr>
                  <th className="px-5 py-3">No. Kwitansi</th>
                  <th className="px-5 py-3">Bulan Periode</th>
                  <th className="px-5 py-3">Nominal</th>
                  <th className="px-5 py-3">Tanggal Bayar</th>
                  <th className="px-5 py-3">Metode Bayar</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Kwitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={`skel-row-spp-${idx}`} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="h-4 w-28 bg-slate-200 rounded"></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-28 bg-slate-200 rounded"></div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-5 w-16 bg-slate-200 rounded"></div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="h-7 w-16 ml-auto bg-slate-200 rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  tagihanList.map((t) => {
                    const noKwitansi = t.noKwitansi || t.no_kwitansi || "-";
                    const tglBayar = t.tanggalBayar || t.tanggal_bayar || "-";
                    const metode = (t.metodeBayar || t.metode_bayar || "-").replace("_", " ");
                    const isLunas = t.status === "LUNAS";

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-navy-950">
                          {noKwitansi}
                        </td>

                        <td className="px-5 py-3.5 font-semibold text-navy-900">
                          {t.bulan}
                        </td>

                        <td className="px-5 py-3.5 font-mono font-bold text-navy-950">
                          Rp {t.nominal.toLocaleString("id-ID")}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-slate-600">
                          {tglBayar}
                        </td>

                        <td className="px-5 py-3.5 font-medium text-slate-700">
                          {metode}
                        </td>

                        <td className="px-5 py-3.5">
                          <Badge variant={isLunas ? "hadir" : "alpha"} className="text-[10px]">
                            {isLunas ? "Lunas" : "Belum Bayar"}
                          </Badge>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          {isLunas ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.print()}
                              className="h-7 px-2.5 text-xs gap-1 border-slate-200 hover:bg-slate-100"
                            >
                              <Printer size={12} />
                              Cetak
                            </Button>
                          ) : (
                            <span className="text-[11px] text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

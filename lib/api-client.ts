const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}

async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetchApi<{
      success: boolean;
      message: string;
      data: {
        token: string;
        user: any;
      };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.data?.token) {
      setToken(res.data.token);
      localStorage.setItem("auth_user", JSON.stringify(res.data.user));
    }

    return res;
  },

  async getMe() {
    return fetchApi("/auth/me");
  },

  async logout() {
    try {
      await fetchApi("/auth/logout", { method: "POST" });
    } finally {
      clearToken();
    }
  },

  // Master Data
  async getGuruList() {
    return fetchApi("/guru");
  },

  async createGuru(payload: any) {
    return fetchApi("/guru", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getKelasList() {
    return fetchApi("/kelas");
  },

  async createKelas(payload: any) {
    return fetchApi("/kelas", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getSiswaList(params?: { kelas_id?: string | number; status?: string }) {
    const query = new URLSearchParams();
    if (params?.kelas_id) query.append("kelas_id", String(params.kelas_id));
    if (params?.status) query.append("status", params.status);
    const qs = query.toString();
    return fetchApi(`/siswa${qs ? `?${qs}` : ""}`);
  },

  async createSiswa(payload: any) {
    return fetchApi("/siswa", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMapelList() {
    return fetchApi("/mapel");
  },

  async createMapel(payload: any) {
    return fetchApi("/mapel", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Jadwal & Absensi (Fase 2)
  async getJadwalHariIni() {
    return fetchApi<{
      success: boolean;
      hari: string;
      tanggal: string;
      data: Array<{
        id: number;
        kelas_id: number;
        kelas: string;
        mapel_id: number;
        mapel: string;
        kode_mapel: string;
        ruangan: string;
        jam_mulai: string;
        jam_selesai: string;
        jam: string;
        sudah_diambil: boolean;
        sesi_id: number | null;
      }>;
    }>("/jadwal/hari-ini");
  },

  async getAbsensiDetail(jadwalId: string | number, tanggal?: string) {
    const qs = tanggal ? `?tanggal=${tanggal}` : "";
    return fetchApi<{
      success: boolean;
      data: {
        jadwal: {
          id: number;
          kelas: string;
          mapel: string;
          guru: string;
          jam: string;
        };
        tanggal: string;
        sudah_diambil: boolean;
        sesi_id: number | null;
        catatan_sesi?: string;
        siswas: Array<{
          id: number;
          nama: string;
          nis: string;
          nisn?: string;
          gender: string;
          status: "H" | "S" | "I" | "A";
          catatan?: string;
        }>;
      };
    }>(`/absensi/${jadwalId}${qs}`);
  },

  async saveAbsensi(
    jadwalId: string | number,
    payload: {
      tanggal?: string;
      catatan?: string;
      absensi: Array<{
        siswa_id: number;
        status: "H" | "S" | "I" | "A";
        catatan?: string;
      }>;
    }
  ) {
    return fetchApi(`/absensi/${jadwalId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getRekapAbsensi(kelasId: string | number) {
    return fetchApi(`/absensi/rekap/${kelasId}`);
  },

  // Presensi Guru
  async getPresensiGuruToday() {
    return fetchApi("/presensi-guru/today");
  },

  async clockInGuru(payload?: { lokasi?: string; keterangan?: string }) {
    return fetchApi("/presensi-guru/clock-in", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
  },

  async clockOutGuru() {
    return fetchApi("/presensi-guru/clock-out", {
      method: "POST",
    });
  },

  // Izin
  async getIzinList(params?: { status?: string; tipe?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.tipe) query.append("tipe", params.tipe);
    const qs = query.toString();
    return fetchApi(`/izin${qs ? `?${qs}` : ""}`);
  },

  async createIzin(payload: any) {
    return fetchApi("/izin", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateIzinStatus(id: string | number, status: string) {
    return fetchApi(`/izin/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // Jurnal Mengajar (Fase 3)
  async getJurnalList(params?: { guru_id?: string | number; kelas_id?: string | number }) {
    const query = new URLSearchParams();
    if (params?.guru_id) query.append("guru_id", String(params.guru_id));
    if (params?.kelas_id) query.append("kelas_id", String(params.kelas_id));
    const qs = query.toString();
    return fetchApi(`/jurnal${qs ? `?${qs}` : ""}`);
  },

  async saveJurnal(payload: any) {
    return fetchApi("/jurnal", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Materi Ajar (Fase 3)
  async getMateriList(params?: { mapel_id?: string | number; kelas_id?: string | number }) {
    const query = new URLSearchParams();
    if (params?.mapel_id) query.append("mapel_id", String(params.mapel_id));
    if (params?.kelas_id) query.append("kelas_id", String(params.kelas_id));
    const qs = query.toString();
    return fetchApi(`/materi${qs ? `?${qs}` : ""}`);
  },

  async uploadMateri(payload: any) {
    return fetchApi("/materi", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Tugas (Fase 3)
  async getTugasList(params?: { kelas_id?: string | number; mapel_id?: string | number }) {
    const query = new URLSearchParams();
    if (params?.kelas_id) query.append("kelas_id", String(params.kelas_id));
    if (params?.mapel_id) query.append("mapel_id", String(params.mapel_id));
    const qs = query.toString();
    return fetchApi(`/tugas${qs ? `?${qs}` : ""}`);
  },

  async createTugas(payload: any) {
    return fetchApi("/tugas", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async submitTugas(tugasId: string | number, payload: { file_url?: string; catatan_siswa?: string; siswa_id?: number }) {
    return fetchApi(`/tugas/${tugasId}/submit`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async nilaiTugas(tugasId: string | number, siswaId: string | number, payload: { nilai: number; catatan_guru?: string }) {
    return fetchApi(`/tugas/${tugasId}/nilai/${siswaId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Nilai Siswa (Fase 3)
  async getNilaiList(params?: { kelas_id?: string | number; mapel_id?: string | number }) {
    const query = new URLSearchParams();
    if (params?.kelas_id) query.append("kelas_id", String(params.kelas_id));
    if (params?.mapel_id) query.append("mapel_id", String(params.mapel_id));
    const qs = query.toString();
    return fetchApi(`/nilai${qs ? `?${qs}` : ""}`);
  },

  async saveNilai(payload: any) {
    return fetchApi("/nilai", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Bimbingan Konseling / BK (Fase 3)
  async getKasusBKList(params?: { status?: string; kategori?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.kategori) query.append("kategori", params.kategori);
    const qs = query.toString();
    return fetchApi(`/bk${qs ? `?${qs}` : ""}`);
  },

  async createKasusBK(payload: any) {
    return fetchApi("/bk", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateKasusBKStatus(id: string | number, payload: { status: string; tindakan?: string }) {
    return fetchApi(`/bk/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // Keuangan & SPP (Fase 4)
  async getSPPList(params?: { siswa_id?: string | number; status?: string; bulan?: string }) {
    const query = new URLSearchParams();
    if (params?.siswa_id) query.append("siswa_id", String(params.siswa_id));
    if (params?.status) query.append("status", params.status);
    if (params?.bulan) query.append("bulan", params.bulan);
    const qs = query.toString();
    return fetchApi(`/spp${qs ? `?${qs}` : ""}`);
  },

  async createSPPTagihan(payload: any) {
    return fetchApi("/spp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async bayarSPP(id: string | number, payload?: { metode_bayar?: string; catatan?: string }) {
    return fetchApi(`/spp/${id}/bayar`, {
      method: "PATCH",
      body: JSON.stringify(payload || {}),
    });
  },

  // Sarana & Prasarana / Sarpras (Fase 4)
  async getSarprasAsetList(params?: { kategori?: string; kondisi?: string }) {
    const query = new URLSearchParams();
    if (params?.kategori) query.append("kategori", params.kategori);
    if (params?.kondisi) query.append("kondisi", params.kondisi);
    const qs = query.toString();
    return fetchApi(`/sarpras/aset${qs ? `?${qs}` : ""}`);
  },

  async createSarprasAset(payload: any) {
    return fetchApi("/sarpras/aset", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getSarprasPeminjamanList(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    const qs = query.toString();
    return fetchApi(`/sarpras/pinjam${qs ? `?${qs}` : ""}`);
  },

  async pinjamSarpras(payload: any) {
    return fetchApi("/sarpras/pinjam", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Perpustakaan (Fase 4)
  async getPerpusBukuList(params?: { kategori?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.kategori) query.append("kategori", params.kategori);
    if (params?.search) query.append("search", params.search);
    const qs = query.toString();
    return fetchApi(`/perpus/buku${qs ? `?${qs}` : ""}`);
  },

  async createPerpusBuku(payload: any) {
    return fetchApi("/perpus/buku", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getPerpusPeminjamanList(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    const qs = query.toString();
    return fetchApi(`/perpus/pinjam${qs ? `?${qs}` : ""}`);
  },

  async pinjamPerpusBuku(payload: any) {
    return fetchApi("/perpus/pinjam", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // UKS (Fase 4)
  async getUKSList(params?: { tanggal?: string; kategori?: string }) {
    const query = new URLSearchParams();
    if (params?.tanggal) query.append("tanggal", params.tanggal);
    if (params?.kategori) query.append("kategori", params.kategori);
    const qs = query.toString();
    return fetchApi(`/uks${qs ? `?${qs}` : ""}`);
  },

  async recordKunjunganUKS(payload: any) {
    return fetchApi("/uks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // PPDB (Fase 4)
  async daftarPPDBPublic(payload: any) {
    return fetchApi("/ppdb/daftar", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getPPDBList(params?: { status_verifikasi?: string; jalur?: string }) {
    const query = new URLSearchParams();
    if (params?.status_verifikasi) query.append("status_verifikasi", params.status_verifikasi);
    if (params?.jalur) query.append("jalur", params.jalur);
    const qs = query.toString();
    return fetchApi(`/ppdb${qs ? `?${qs}` : ""}`);
  },

  async verifikasiPPDB(
    id: string | number,
    payload: { status_verifikasi: string; status_kelulusan?: string; catatan?: string }
  ) {
    return fetchApi(`/ppdb/${id}/verifikasi`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // Pengumuman (Fase 4)
  async getPengumumanList(params?: { kategori?: string; sasaran?: string }) {
    const query = new URLSearchParams();
    if (params?.kategori) query.append("kategori", params.kategori);
    if (params?.sasaran) query.append("sasaran", params.sasaran);
    const qs = query.toString();
    return fetchApi(`/pengumuman${qs ? `?${qs}` : ""}`);
  },

  async createPengumuman(payload: any) {
    return fetchApi("/pengumuman", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};


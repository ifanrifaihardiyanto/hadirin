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

  async getKelasList() {
    return fetchApi("/kelas");
  },

  async getSiswaList(params?: { kelas_id?: string | number; status?: string }) {
    const query = new URLSearchParams();
    if (params?.kelas_id) query.append("kelas_id", String(params.kelas_id));
    if (params?.status) query.append("status", params.status);
    const qs = query.toString();
    return fetchApi(`/siswa${qs ? `?${qs}` : ""}`);
  },

  async getMapelList() {
    return fetchApi("/mapel");
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
};

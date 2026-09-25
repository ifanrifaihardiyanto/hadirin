# Hadirin — starter absensi sekolah (Next.js + Tailwind + PWA)

Starter frontend untuk aplikasi absensi sekolah, dibuat cepat dipakai guru dari HP.

## Konsep desain

- **Nama & identitas**: "Hadirin" — dari kata "hadir", terasa akrab untuk konteks sekolah Indonesia.
- **Warna**: hijau papan tulis (`jade` #2F6F62) sebagai warna utama, krem kertas (`chalk` #F7F5EF) sebagai latar, emas (`gold` #D9A441) untuk aksen progres. Empat warna status (Hadir/Sakit/Izin/Alpha) punya warna berbeda karena itu memang kategori data yang berbeda — bukan dekorasi.
- **Tipografi**: Fraunces (serif berkarakter) untuk judul, Plus Jakarta Sans untuk teks & UI, IBM Plex Mono untuk angka/statistik.
- **Elemen ciri khas**: interaksi "stempel" saat guru menandai status siswa — animasi kecil yang mengingatkan ke tradisi cap/tanda tangan di buku absensi fisik, direinterpretasi secara digital.

## Menjalankan secara lokal

### 1. Database

Butuh Postgres (lokal, Docker, atau layanan seperti Supabase/Neon/Railway).

```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql   # data contoh untuk uji coba
```

### 2. Environment variables

```bash
cp .env.example .env.local
# lalu isi DATABASE_URL dan JWT_SECRET di .env.local
```

`JWT_SECRET` bisa digenerate dengan `openssl rand -base64 48`.

### 3. Jalankan aplikasi

```bash
npm install
npm run dev
```

Buka `http://localhost:3000/login` — login dengan akun demo dari `db/seed.sql`:
- Email: `sari.wulandari@sman3contoh.sch.id`
- Password: `hadirin123`

## Struktur halaman

- `/` — Beranda: progres absensi hari ini + daftar kelas
- `/absensi/[id]` — Ambil absensi: tap status per siswa dengan animasi stempel
- `/kelas`, `/rekap`, `/profil` — placeholder, siap dikembangkan

Semua data di `lib/mock-data.ts` masih dummy — belum tersambung ke backend/database.

## Supaya PWA benar-benar bisa di-install

1. `public/icon.svg` sudah dipasang sebagai ikon sementara. Untuk kompatibilitas maksimal di semua HP, tambahkan juga versi PNG 192x192 dan 512x512, lalu daftarkan di `public/manifest.json`.
2. Jalankan `npm run build && npm run start` (bukan `npm run dev`) untuk menguji perilaku PWA secara penuh — service worker sengaja dimatikan saat development.
3. Deploy ke Vercel (atau hosting lain yang HTTPS) — PWA install prompt hanya muncul di koneksi HTTPS.

## Status backend

**Sudah tersambung ke database sungguhan (Postgres + RLS):**
- Login (`/login` → `/api/auth/login`)
- Beranda guru & pengambilan absensi (`/`, `/absensi/[id]` → `/api/jadwal/hari-ini`, `/api/absensi/[id]`)
- Admin: kelola guru & jadwal (`/admin/guru`, `/admin/jadwal` → `/api/admin/guru`, `/api/admin/kelas`, `/api/admin/jadwal`)

**Masih data mock di frontend (`lib/store.tsx`), belum tersambung backend:**
- Dashboard Kepala Sekolah beranda (`/admin`) — ringkasan kehadiran & status guru
- Laporan & Pengaturan admin (`/admin/laporan`, `/admin/pengaturan`)
- Kelas, Rekap, Profil di sisi guru
- Onboarding sekolah baru

## Langkah lanjutan yang disarankan

- Sambungkan `/admin` (beranda), `/admin/laporan`, `/admin/pengaturan` ke database — sekarang datanya sudah nyata di `/admin/guru` & `/admin/jadwal`, tinggal disamakan
- Sambungkan `/onboarding` ke `fn_daftar_sekolah_baru` (pola SECURITY DEFINER yang sama seperti login, karena saat itu sekolah_id juga belum ada)
- Tambah mode offline-first: simpan perubahan absensi ke IndexedDB dulu, sync saat online
- Sambungkan notifikasi WhatsApp setelah absensi disimpan
- Fitur ganti sandi untuk guru yang akunnya baru dibuat admin (sandi sementara saat ini cuma ditampilkan sekali)

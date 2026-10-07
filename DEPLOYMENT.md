# Panduan Deployment Production Hadirin SaaS

Dokumen ini memuat langkah-langkah lengkap deployment arsitektur **Hadirin School & SaaS Platform** (Next.js 14 Frontend + Laravel 11 Backend + Supabase PostgreSQL Database).

---

## 1. Arsitektur Sistem

- **Frontend:** Next.js 14 (App Router, Tailwind CSS, TypeScript, PWA)
  - Hosting Rekomendasi: **Vercel** / **Cloudflare Pages**
- **Backend:** Laravel 11 (PHP 8.2+, Laravel Sanctum REST API)
  - Hosting Rekomendasi: **Railway** / **Fly.io** / **VPS Docker (Ubuntu 24.04)**
- **Database:** **Supabase PostgreSQL** (Managed Cloud Database)
- **Object Storage (Opsional):** Supabase Storage / Cloudflare R2 / AWS S3

---

## 2. Deployment Backend (Laravel API di Railway / VPS)

### A. Opsi 1: Railway (Platform-as-a-Service)
1. Buat proyek baru di [Railway.app](https://railway.app).
2. Hubungkan repository GitHub: `hadirin_be_laravel`.
3. Set environment variables pada dashboard Railway:
   ```env
   APP_NAME="Hadirin API"
   APP_ENV=production
   APP_KEY=base64:... (generate via php artisan key:generate)
   APP_DEBUG=false
   APP_URL=https://api-hadirin.up.railway.app
   FRONTEND_URL=https://hadirin.sch.id,https://hadirin.vercel.app

   DB_CONNECTION=pgsql
   DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
   DB_PORT=6543
   DB_DATABASE=postgres
   DB_USERNAME=postgres.YOUR_PROJECT_REF
   DB_PASSWORD=YOUR_SUPABASE_PASSWORD

   SESSION_DRIVER=database
   QUEUE_CONNECTION=sync
   SANCTUM_STATEFUL_DOMAINS=hadirin.vercel.app,hadirin.sch.id
   ```
4. Tambahkan Build & Start Command di Railway:
   - **Build Command:** `composer install --optimize-autoloader --no-dev`
   - **Pre-run / Release:** `php artisan migrate --force && php artisan config:cache && php artisan route:cache`
   - **Start Command:** `php artisan serve --host=0.0.0.0 --port=$PORT`

### B. Opsi 2: VPS Docker (Nginx + PHP-FPM)
Gunakan konfigurasi Nginx reverse proxy dengan SSL Let's Encrypt:
```bash
# Di server Ubuntu VPS:
git clone https://github.com/ifanrifaihardiyanto/hadirin_be_laravel.git backend
cd backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
# Edit .env dengan kredensial Supabase & APP_KEY
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

---

## 3. Deployment Frontend (Next.js di Vercel)

1. Buka [Vercel](https://vercel.com) dan buat proyek baru.
2. Impor repositori GitHub: `hadirin`.
3. Konfigurasi direktori & framework:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `./`
4. Masukkan Environment Variables di Vercel Dashboard:
   ```env
   NEXT_PUBLIC_API_URL=https://api-hadirin.up.railway.app/api/v1
   NEXT_PUBLIC_APP_NAME="Hadirin Education"
   NEXT_PUBLIC_APP_URL=https://hadirin.vercel.app
   ```
5. Tekan tombol **Deploy**. Vercel akan otomatis menjalankan `npm run build` dan memublikasikan 50 route statis & dinamis ke jaringan CDN global.

---

## 4. Konfigurasi Domain Kustom & CORS

1. **CORS Backend Laravel:**
   Pastikan di `backend/config/cors.php` domain Vercel Anda sudah diizinkan:
   ```php
   'allowed_origins' => [
       'https://hadirin.vercel.app',
       'https://hadirin.sch.id',
       'http://localhost:3000',
   ],
   'supports_credentials' => true,
   ```
2. **Kustom Domain (Contoh: `hadirin.id`):**
   - Frontend: Arahkan CNAME `app.hadirin.id` ke `cname.vercel-dns.com`.
   - Backend: Arahkan CNAME `api.hadirin.id` ke domain Railway / IP VPS Anda.

---

## 5. Akun Demo Default untuk Pengujian

Setelah database seeder dijalankan (`php artisan db:seed`):

| Role Pengguna | Email | Password | Akses URL |
| :--- | :--- | :--- | :--- |
| **Admin Sekolah** | `admin@sman3contoh.sch.id` | `hadirin123` | `/admin` |
| **Dewan Guru** | `sari.wulandari@sman3contoh.sch.id` | `hadirin123` | `/` & `/kelas` |
| **Peserta Didik** | `ahmad.fadillah@hadirin.sch.id` | `hadirin123` | `/siswa` |
| **Orang Tua Murid** | `ortu.ahmad@hadirin.sch.id` | `hadirin123` | `/ortu` |

---

## 6. Verifikasi Pasca-Deployment

- [x] Endpoint Health Check: `GET /api/v1/health` mengembalikan status `healthy`.
- [x] Login Form di `/login` berhasil menerbitkan Bearer Token.
- [x] Navigasi 31 modul Admin menampilkan Skeleton Loading dan live data.
- [x] Portal Siswa `/siswa` menampilkan jadwal, tugas LMS, materi, dan nilai.
- [x] CBT Online `/siswa/ujian` dapat mengerjakan ujian dan submit nilai ke database.

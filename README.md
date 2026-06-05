# Klinik Makmur Jaya

Sistem E-Commerce & Manajemen Apotek berbasis Web.

## Architecture Overview

Aplikasi ini dibangun dengan menggunakan arsitektur monolith dengan teknologi utama:
- **Backend:** Laravel
- **Frontend:** React
- **Bridge:** Inertia.js
- **Styling:** Tailwind CSS (v4)
- **Database:** MySQL
- **Background Jobs:** Laravel Database Queue (digunakan untuk report export, import CSV, dan proses notifikasi Midtrans)
- **Payment Gateway:** Integrasi Midtrans Webhook untuk pesanan online
- **File Storage:** Laravel Local Storage (untuk upload resep & gambar obat)
- **Hak Akses:** RBAC (Role-Based Access Control) dengan peran Admin, Apoteker (Pharmacist), Kasir (Cashier), dan Pasien.

*Untuk melihat pedoman dan arsitektur lengkap sistem, silakan baca [Architecture.md](Architecture.md).*

## Prasyarat

Pastikan spesifikasi minimum berikut sudah terpasang di sistem Anda sebelum memulai:
- PHP >= 8.2
- Composer
- Node.js (>= v20) & npm
- MySQL Server

## Panduan Instalasi (Development Script)

Ikuti instruksi di bawah ini secara berurutan untuk menjalankan aplikasi di *local environment*:

1. **Clone & Masuk ke Direktori Proyek**
   ```bash
   git clone <repo-url>
   cd klinik-makmur-jaya
   ```

2. **Instal Dependensi Backend (Laravel)**
   ```bash
   composer install
   ```

3. **Instal Dependensi Frontend (React)**
   ```bash
   npm install
   ```

4. **Konfigurasi Environment**
   Salin contoh konfigurasi ke file `.env`.
   ```bash
   cp .env.example .env
   ```
   Atur kredensial database MySQL Anda di `.env` (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) dan kunci Midtrans jika diperlukan.

5. **Generate Application Key**
   ```bash
   php artisan key:generate
   ```

6. **Migrasi dan Seed Database**
   Langkah ini akan membuat tabel di database dan mengisi data awal (dummy data) beserta peran (roles) pengguna.
   ```bash
   php artisan migrate --seed
   ```

7. **Storage Link**
   Agar file unggahan seperti resep pasien atau bukti laporan PDF dapat diakses secara publik.
   ```bash
   php artisan storage:link
   ```

## Menjalankan Aplikasi

Anda akan memerlukan setidaknya **dua terminal** untuk menjalankan aplikasi sepenuhnya. Terminal ketiga sangat disarankan untuk menjalankan proses *background/queue*.

**Terminal 1: Menjalankan Backend Laravel**
```bash
php artisan serve
```
*(Server PHP secara default akan berjalan di `http://localhost:8000`)*

**Terminal 2: Menjalankan Frontend Vite Server**
```bash
npm run dev
```
*(Ini akan me-render perubahan komponen React & Tailwind secara realtime di browser)*

**Terminal 3: Menjalankan Queue Worker (Untuk Background Jobs)**
```bash
php artisan queue:work
```
*(Penting agar ekspor laporan PDF/Excel, impor CSV, dan pemrosesan dari webhook Midtrans berjalan)*

Aplikasi siap diakses di [http://localhost:8000](http://localhost:8000).

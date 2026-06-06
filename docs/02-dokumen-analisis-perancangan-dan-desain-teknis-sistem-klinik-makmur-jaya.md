# DOKUMENTASI PROYEK KLINIK MAKMUR JAYA
## Sistem E-Commerce Penjualan Obat Berbasis Web
### Skema Sertifikasi: Web Developer

---

| Data | Detail |
|:---|:---|
| **Nama Proyek** | Sistem E-Commerce Penjualan Obat Berbasis Web Klinik Makmur Jaya |
| **Stack Aktual** | Laravel, React, Inertia.js, Tailwind CSS, MySQL |
| **Role Sistem** | Admin, Apoteker, Kasir, Pasien/Pelanggan |
| **Repository GitHub** | `https://github.com/Calvinismee/klinik-makmur-jaya` |
| **Jenis Dokumen** | Dokumen Analisis, Perancangan, dan Desain Teknis Sistem |

---

# Bab 1 - Pendahuluan

## 1.1 Tujuan Dokumen

Dokumen ini menjelaskan analisis sistem, kebutuhan pengguna, perancangan arsitektur, analisis hardware, pemilihan tools, desain database, algoritma, monitoring, queue, notifikasi, dan struktur implementasi Sistem E-Commerce Penjualan Obat Klinik Makmur Jaya.

## 1.2 Ringkasan Implementasi Aktual

| Area | Implementasi |
|---|---|
| Backend | Laravel |
| Frontend | React + Inertia.js |
| Database | MySQL |
| Queue | Laravel Database Queue |
| Realtime | Broadcasting/Reverb + fallback polling |
| Auth | Laravel session authentication + email verification |
| Authorization | Role middleware / Spatie Laravel Permission |
| Report | PDF/Excel export dan background job |
| Multimedia | Upload gambar obat dan resep |

---

# Bab 2 - Analisis Sistem

## 2.1 Kondisi Sistem Berjalan

Proses lama masih mengandalkan pencatatan manual atau spreadsheet. Transaksi, stok, laporan, dan verifikasi resep belum berada dalam satu sistem terpadu. Akibatnya, stok tidak selalu akurat, laporan lambat, dan status pesanan sulit dipantau.

## 2.2 Permasalahan Utama

| No | Masalah | Dampak |
|---|---|---|
| 1 | Transaksi belum terpusat | Data penjualan rawan selisih |
| 2 | Belum ada pembelian online | Pasien tidak bisa membeli dari luar klinik |
| 3 | Stok belum real-time | Restock terlambat atau stok berlebih |
| 4 | Laporan belum terintegrasi | Manajemen sulit mengambil keputusan |
| 5 | Verifikasi resep manual | Proses lambat dan sulit ditelusuri |
| 6 | Belum ada alert otomatis | Stok kritis dan error terlambat diketahui |

## 2.3 Sasaran Perbaikan

| Sasaran | Hasil yang Diharapkan |
|---|---|
| Digitalisasi transaksi | Online dan offline dicatat terpusat |
| Stok real-time | Stok berkurang otomatis setelah transaksi |
| Layanan pasien | Pasien dapat katalog, cart, checkout, upload resep |
| Kontrol resep | Obat resep hanya diproses setelah disetujui Apoteker |
| Pelaporan | Dashboard dan laporan tersedia |
| Audit dan keamanan | Aktivitas penting tercatat dan akses dibatasi role |

---

# Bab 3 - Analisis Kebutuhan

## 3.1 Role Pengguna

| Role | Hak Akses Utama |
|---|---|
| Admin | User, role, obat, kategori, supplier, pelanggan, laporan, audit log, error log, konfigurasi |
| Apoteker | Stok, batch obat, verifikasi resep, proses pesanan, stok kritis, obat kadaluarsa |
| Kasir | Transaksi POS, cek stok, ringkasan transaksi, pembayaran offline |
| Pasien/Pelanggan | Register, login, katalog, cart, checkout, upload resep, status pesanan |

## 3.2 Kebutuhan Fungsional

| Modul | Kebutuhan |
|---|---|
| Auth | Login multi-role, register pasien, verifikasi email, logout |
| Admin | CRUD user, kategori, supplier, obat, laporan, audit log, error log |
| Apoteker | Batch stok, verifikasi resep, proses order, stock movement |
| Kasir | POS, cart POS, checkout kasir, daftar pembayaran |
| Pasien | Katalog, autocomplete, detail obat, cart, checkout, order, pembayaran |
| Laporan | Export order, PDF, Excel background, download report |
| Notifikasi | Mark all read, broadcast auth, webhook pembayaran |

## 3.3 Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
|---|---|
| Keamanan | Role access, CSRF, validasi input, hashing, audit log |
| Kinerja | Pagination, indexing, eager loading, queue untuk proses berat |
| Reliabilitas | Transaksi database pada checkout, POS, dan pengurangan stok |
| Usability | UI responsif, pesan validasi jelas, dashboard per role |
| Maintainability | Controller, request, service/action, job, model, dan React component terstruktur |
| Portabilitas | Dapat berjalan di local/server uji dengan PHP, Node, dan MySQL |

## 3.4 Use Case Ringkas

| Aktor | Use Case Utama |
|---|---|
| Admin | Mengelola user, master data, laporan, audit log, error log |
| Apoteker | Mengelola batch, stok, resep, dan pesanan online |
| Kasir | Memproses POS dan pembayaran offline |
| Pasien/Pelanggan | Katalog, cart, checkout, pembayaran, upload resep, status pesanan |

---

# Bab 4 - Arsitektur Sistem dan Hardware

## 4.1 Arsitektur Logis

```text
Browser User
  │
  ▼
React Pages + Inertia.js
  │
  ▼
Laravel Web Routes
  │
  ├── Controller + Form Request
  ├── Middleware / Role Access
  ├── Service / Action
  ├── Eloquent Model
  ├── Queue Job
  ├── Notification / Broadcasting
  └── Storage
  │
  ▼
MySQL Database
```

Laravel menjadi pusat validasi, otorisasi, business logic, database transaction, queue, storage, audit log, dan error handling. React digunakan untuk tampilan, form, dashboard, chart, tabel, modal, dan interaksi pengguna.

## 4.2 Topologi Server

```text
Internet / LAN Klinik
  │
  ▼
Nginx / Apache Web Server
  │
  ├── Laravel Application + PHP-FPM
  ├── React Build Assets
  ├── Queue Worker
  ├── Scheduler
  └── Reverb/Broadcasting Service
  │
  ▼
MySQL Database + File Storage + Backup
```

## 4.3 Analisis Hardware

| Komponen | Minimum Demo | Rekomendasi Produksi Awal | Justifikasi |
|---|---|---|---|
| Web/App CPU | 2 vCPU | 4 vCPU | Laravel request, React asset, export ringan |
| Web/App RAM | 4 GB | 8 GB | App, queue worker, scheduler, cache |
| Web/App Storage | 40 GB SSD | 80-120 GB SSD | Source code, log, upload, PDF |
| Database CPU | MySQL satu server | 2-4 vCPU terpisah | Query transaksi, laporan, stok |
| Database RAM | Mengikuti app server | 4-8 GB | Buffer pool dan index |
| Database Storage | 40 GB SSD | 100 GB SSD+ | Data obat, transaksi, audit, error log |
| Bandwidth | LAN/internet stabil | 20-50 Mbps | Akses pasien dan internal klinik |
| Backup | Manual | Backup harian DB dan file | Perlindungan data |

## 4.4 Komponen Infrastruktur

| Komponen | Fungsi |
|---|---|
| Client Device | Browser pengguna: admin, apoteker, kasir, pasien |
| Application Server | Menjalankan Laravel, React asset, queue, scheduler |
| Database Server | Menyimpan user, obat, stok, transaksi, resep, log |
| File Storage | Menyimpan gambar obat, resep, dan laporan |
| Queue Worker | Import data, export laporan, notifikasi, pengecekan stok |
| Realtime Service | Pesanan baru, stok kritis, notifikasi dashboard |
| Backup Storage | Cadangan database dan file upload |

## 4.5 Analisis Beban

| Aktivitas | Beban | Strategi |
|---|---|---|
| Login multi-role | Query user dan session | Index email, middleware role |
| Katalog obat | Query dan filter obat | Index nama, kode, kategori, status |
| Checkout | Validasi cart, order, stok | Database transaction dan lock stok |
| POS kasir | Search obat dan update stok | Query terindeks dan FIFO |
| Upload resep/gambar | Storage dan validasi file | Batas ukuran/mime, storage terstruktur |
| Export laporan | CPU/memory | Background job |
| Import Excel/CSV | Parsing dan insert | Queue job dan validasi batch |
| Realtime notification | Broadcast/polling | Reverb atau fallback polling |

## 4.6 Skalabilitas Infrastruktur

| Tahap | Kondisi | Strategi |
|---|---|---|
| Demo lokal | Presentasi dan uji | Semua komponen di satu laptop/server |
| Produksi awal | Pengguna terbatas | Pisahkan database dari app server |
| Trafik naik | Banyak transaksi/laporan | Tambah queue worker dan index |
| Realtime naik | Banyak notifikasi | Jalankan Reverb terpisah |
| File upload naik | Banyak gambar/resep | Pindah ke object storage |

---

# Bab 5 - Tools, Framework, dan Library

## 5.1 Stack Tetap

| Komponen | Pilihan | Fungsi |
|---|---|---|
| Backend | Laravel | Routing, controller, ORM, validation, queue, storage |
| Frontend | React | UI dashboard, katalog, form, tabel, cart |
| Bridge | Inertia.js | Menghubungkan route Laravel dengan React page |
| Styling | Tailwind CSS | UI responsif dan konsisten |
| Database | MySQL | Data relasional sistem |
| Queue | Laravel Database Queue | Job background tanpa Redis |
| Realtime | Laravel Broadcasting/Reverb | Event notifikasi dan dashboard |
| Payment | Midtrans sandbox/simulasi | Simulasi pembayaran online |
| Version Control | Git | Riwayat perubahan kode |

## 5.2 Library Backend

| Library | Fungsi |
|---|---|
| `laravel/framework` | Framework utama aplikasi |
| `spatie/laravel-permission` | Role dan permission |
| `barryvdh/laravel-dompdf` | Export PDF |
| `maatwebsite/excel` | Import/export Excel/CSV |
| `laravel/reverb` | Broadcasting realtime |

## 5.3 Library Frontend

| Library | Fungsi |
|---|---|
| `@inertiajs/react` | Adapter React untuk Inertia |
| `react`, `react-dom` | Komponen antarmuka |
| `vite` | Build asset |
| `tailwindcss` | Styling UI |
| `laravel-echo` | Koneksi notifikasi waktu nyata dari frontend |
| `pusher-js` | Client websocket untuk Laravel Echo/Reverb |

---

# Bab 6 - Database, SQL, dan Algoritma

## 6.1 Entitas Utama

| Entitas | Fungsi |
|---|---|
| `users` | Akun seluruh role |
| `customers` | Profil pelanggan |
| `categories` | Kategori obat |
| `suppliers` | Data pemasok |
| `medicines` | Master obat |
| `medicine_batches` | Batch stok dan kadaluarsa |
| `orders` | Pesanan online |
| `order_items` | Detail pesanan online |
| `payments` | Data pembayaran |
| `offline_sales` | Transaksi kasir/POS |
| `stock_movements` | Riwayat pergerakan stok |
| `notifications` | Notifikasi pengguna |
| `audit_logs` / `activity_log` | Audit aktivitas |
| `error_logs` | Catatan error aplikasi |
| `jobs`, `failed_jobs` | Queue dan job gagal |

## 6.2 ERD Ringkas

```text
users ──< customers
users ──< orders ──< order_items >── medicines >── categories
orders ──< payments
orders ──< prescriptions
medicines ──< medicine_batches ──< stock_movements
medicines ──< offline_sale_items >── offline_sales
suppliers ──< medicines
users ──< notifications
```

## 6.3 Query Laporan Utama

```sql
-- Laporan penjualan harian
SELECT DATE(created_at) AS tanggal,
       COUNT(*) AS jumlah_transaksi,
       SUM(total_amount) AS total_pendapatan
FROM orders
WHERE payment_status = 'paid'
GROUP BY DATE(created_at)
ORDER BY tanggal DESC;

-- Obat terlaris
SELECT m.name AS nama_obat,
       SUM(oi.quantity) AS total_terjual,
       SUM(oi.subtotal) AS total_pendapatan
FROM order_items oi
JOIN medicines m ON m.id = oi.medicine_id
JOIN orders o ON o.id = oi.order_id
WHERE o.payment_status = 'paid'
GROUP BY m.id, m.name
ORDER BY total_terjual DESC
LIMIT 10;
```

## 6.4 Algoritma FIFO Stok

```text
Input: medicine_id, requested_quantity
1. Ambil batch dengan remaining_quantity > 0.
2. Urutkan berdasarkan expired_at paling dekat.
3. Kurangi stok dari batch pertama sampai jumlah terpenuhi.
4. Catat setiap pengurangan ke stock_movements.
5. Jika stok tidak cukup, rollback transaksi.
6. Simpan semua perubahan dalam database transaction.
```

## 6.5 Algoritma Checkout

```text
1. Validasi user login dan cart tidak kosong.
2. Validasi stok setiap item.
3. Jika ada obat wajib resep, validasi file resep.
4. Buat order dan order_items.
5. Buat data pembayaran simulasi/Midtrans sandbox.
6. Jika resep diperlukan, tunggu verifikasi Apoteker.
7. Jika transaksi valid, kurangi stok dengan FIFO.
8. Kosongkan cart dan kirim notifikasi.
```

---

# Bab 7 - Implementasi Modul dan Struktur Kode

## 7.1 Modul Utama

| Modul | Backend | Frontend | Output |
|---|---|---|---|
| Auth | Auth Controller, middleware | Login/Register pages | Login dan session |
| Admin | User, Medicine, Category, Supplier, Report controllers | Admin pages | Master data dan laporan |
| Apoteker | Batch, Stock, Prescription, Order controllers | Pharmacist pages | Stok, resep, pesanan |
| Kasir | POS dan Payment controllers | Cashier pages | Transaksi offline |
| Customer | Catalog, Cart, Checkout, Order controllers | Customer pages | Katalog dan checkout |
| Monitoring | Error log, audit log, notification | Log/notification pages | Monitoring sistem |

## 7.2 Struktur Folder Ringkas

```text
app/
├── Http/Controllers/Admin
├── Http/Controllers/Apoteker
├── Http/Controllers/Cashier
├── Http/Controllers/Customer
├── Http/Requests
├── Models
├── Jobs
├── Notifications
├── Services
└── Policies

resources/js/
├── Components
├── Pages/Admin
├── Pages/Pharmacist
├── Pages/Cashier
├── Pages/Customer
└── Pages/Auth
```

## 7.3 Bukti Demonstrasi

| Kebutuhan | Bukti Implementasi |
|---|---|
| Login dan role | Dashboard per role dan middleware |
| CRUD | Admin obat, kategori, supplier, user |
| SQL dan laporan | Query laporan, export PDF/Excel |
| Multimedia | Upload gambar obat dan resep |
| Paralel | Import/export via queue |
| Realtime | Broadcasting atau polling notification |
| Monitoring | Audit log, error log, failed job |
| Algoritma | FIFO stok, search, checkout, alert |

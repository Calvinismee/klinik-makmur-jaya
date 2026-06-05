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
| **Jenis Dokumen** | Dokumen Perencanaan Proyek |

---

# Bab 1 - Pendahuluan

## 1.1 Latar Belakang

Klinik Makmur Jaya masih menjalankan sebagian proses penjualan obat, pencatatan stok, pelaporan, dan verifikasi resep secara manual. Kondisi ini menyebabkan data transaksi sulit dipantau, stok tidak selalu real-time, proses restock lambat, dan pasien belum dapat melakukan pembelian obat secara daring.

Sistem E-Commerce Penjualan Obat Berbasis Web dibangun untuk memusatkan proses penjualan obat online dan offline, pengelolaan stok, verifikasi resep, laporan, notifikasi, serta monitoring operasional klinik.

## 1.2 Tujuan Proyek

| No | Tujuan |
|---|---|
| 1 | Membangun purwarupa aplikasi web penjualan obat berbasis Laravel dan React |
| 2 | Menyediakan autentikasi dan otorisasi untuk Admin, Apoteker, Kasir, dan Pasien/Pelanggan |
| 3 | Menyediakan pengelolaan obat, kategori, supplier, stok, resep, transaksi, dan laporan |
| 4 | Menyediakan alur katalog, cart, checkout, upload resep, dan status pesanan |
| 5 | Menyediakan fitur dashboard, notifikasi, audit log, error log, import data, dan export laporan |
| 6 | Menyediakan dokumentasi pendukung untuk perencanaan, desain, migrasi, pengujian, dan panduan pengguna |

## 1.3 Ringkasan Sistem

| Komponen | Implementasi |
|---|---|
| Backend | Laravel |
| Frontend | React melalui Inertia.js |
| Styling | Tailwind CSS |
| Database | MySQL |
| Queue | Laravel Database Queue |
| Realtime | Laravel Broadcasting/Reverb dan fallback polling |
| Laporan | Export PDF dan Excel/laporan background |
| Pengguna | Admin, Apoteker, Kasir, Pasien/Pelanggan |

---

# Bab 2 - Project Charter

## 2.1 Identitas Proyek

| Atribut | Keterangan |
|---|---|
| Nama Proyek | Pembangunan Sistem E-Commerce Penjualan Obat Berbasis Web Klinik Makmur Jaya |
| Pemilik Proyek | Manajemen Klinik Makmur Jaya |
| Pelaksana | Tim Pengembang / Asesi Web Developer |
| Jenis Proyek | Purwarupa aplikasi web |
| Metode | Iteratif sederhana: analisis, desain, implementasi, pengujian, presentasi |
| Durasi Efektif | 3 hari kerja efektif atau 18 jam |

## 2.2 Stakeholder

| Stakeholder | Kepentingan |
|---|---|
| Manajemen Klinik | Memantau laporan penjualan dan mengambil keputusan pengadaan obat |
| Admin | Mengelola user, master data, laporan, audit log, error log, dan konfigurasi |
| Apoteker | Mengelola stok, batch obat, resep, pesanan, stok kritis, dan obat kadaluarsa |
| Kasir | Memproses transaksi penjualan langsung dan status pembayaran offline |
| Pasien/Pelanggan | Melihat katalog, cart, checkout, upload resep, dan status pesanan |
| Asesor | Menilai aplikasi, dokumentasi, demo, dan pemecahan masalah |

## 2.3 Deliverable

| No | Deliverable | Keterangan |
|---|---|---|
| 1 | Purwarupa aplikasi Laravel + React | Aplikasi dapat didemonstrasikan sesuai studi kasus |
| 2 | Dokumen Perencanaan Proyek | Charter, scope, WBS, jadwal, dan kualitas |
| 3 | Dokumen Analisis, Perancangan, dan Desain Teknis | Kebutuhan, arsitektur, hardware, tools, database, algoritma |
| 4 | Dokumen Migrasi, Cutover, dan Perubahan | Migrasi data, rollback, cutover, change log, impact analysis |
| 5 | Dokumen Pengujian Sistem | Test case, debugging, UAT, checklist demonstrasi |
| 6 | Dokumen Panduan Pengguna | User guide, FAQ, troubleshooting, endpoint aktual |

---

# Bab 3 - Ruang Lingkup Proyek

## 3.1 Dalam Ruang Lingkup

| Area | Cakupan |
|---|---|
| Autentikasi | Login, register, verifikasi email, logout, session |
| Role Access | Admin, Apoteker, Kasir, Pasien/Pelanggan |
| Master Data | User, obat, kategori, supplier, pelanggan |
| Stok | Batch obat, stok FIFO, stok kritis, obat kadaluarsa |
| E-Commerce | Katalog, detail obat, cart, checkout, pembayaran simulasi/Midtrans sandbox |
| Resep | Upload resep dan verifikasi oleh Apoteker |
| Kasir | POS/transaksi langsung dan pembayaran offline |
| Laporan | Dashboard, laporan transaksi, export PDF/Excel |
| Notifikasi | Status pesanan, stok kritis, obat kadaluarsa, error |
| Monitoring | Audit log, error log, queue, resource monitoring sederhana |
| Dokumentasi | Perencanaan, desain, migrasi, pengujian, panduan pengguna |

## 3.2 Di Luar Ruang Lingkup

| Item | Keterangan |
|---|---|
| Rekam medis eksternal | Tidak ada integrasi penuh dengan sistem rekam medis |
| Payment gateway produksi | Pembayaran memakai simulasi atau Midtrans sandbox |
| Pengiriman kurir nyata | Pengiriman fisik tidak diintegrasikan dengan kurir pihak ketiga |
| Mobile native | Tidak dibuat aplikasi Android/iOS native |
| OCR resep | Verifikasi resep dilakukan manual oleh Apoteker |
| Audit keamanan pihak ketiga | Tidak dilakukan penetration test profesional |

## 3.3 Batasan Teknis

- Aplikasi berupa purwarupa berbasis Laravel + React + Inertia.js.
- Database menggunakan MySQL.
- Data uji memakai dummy data atau hasil seed/import.
- Queue menggunakan database queue agar mudah dijalankan pada lingkungan demo.
- Notifikasi real-time dapat memakai broadcasting atau polling fallback.
- Pembayaran online menggunakan simulasi atau sandbox.

---

# Bab 4 - WBS, Jadwal, dan Kualitas

## 4.1 Work Breakdown Structure

| WBS | Pekerjaan | Output |
|---|---|---|
| 1.0 | Inisiasi dan perencanaan | Charter, scope, WBS, jadwal, checklist |
| 2.0 | Analisis dan desain | Kebutuhan, role, arsitektur, hardware, database |
| 3.0 | Pengembangan core | Auth, CRUD, katalog, cart, checkout, stok |
| 4.0 | Pengembangan pendukung | Dashboard, laporan, notifikasi, queue, monitoring |
| 5.0 | Migrasi dan cutover | Import data, validasi, cutover, rollback |
| 6.0 | Pengujian dan dokumentasi | Test case, debugging, UAT, user guide |
| 7.0 | Demo dan presentasi | Aplikasi dan dokumen siap dinilai |

## 4.2 Jadwal 3 Hari Efektif

| Hari | Fokus | Aktivitas | Output |
|---|---|---|---|
| Hari 1 | Analisis dan perencanaan | Scope, risiko, kebutuhan, arsitektur, database | Dokumen dan rancangan awal |
| Hari 2 | Implementasi | Auth, CRUD, stok, transaksi, laporan, queue, notifikasi | Purwarupa fitur inti |
| Hari 3 | Pengujian dan presentasi | Debugging, UAT, finalisasi dokumen, simulasi demo | Dokumen final dan demo siap |

## 4.3 Quality Checklist

- [ ] Login, register, logout, dan verifikasi email berjalan.
- [ ] Setiap role diarahkan ke dashboard yang sesuai.
- [ ] CRUD obat, kategori, supplier, user, dan stok berjalan.
- [ ] Cart, checkout, upload resep, dan status pesanan berjalan.
- [ ] Transaksi kasir mengurangi stok dengan benar.
- [ ] Laporan dan export dapat ditunjukkan.
- [ ] Import data dan queue dapat disimulasikan.
- [ ] Notifikasi, audit log, error log, dan monitoring tersedia.
- [ ] Test case, UAT, migrasi, cutover, rollback, dan user guide tersedia.

## 4.4 Kriteria Penerimaan

Proyek diterima jika aplikasi dapat dijalankan, empat role dapat login, fitur utama dapat didemonstrasikan, data stok tidak negatif, laporan tersedia, dan seluruh dokumen pendukung dapat menjawab kebutuhan studi kasus serta asesmen.

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
| **Jenis Dokumen** | Dokumen Pengujian Sistem |

---

# Bab 1 - Pendahuluan

## 1.1 Tujuan Dokumen

Dokumen ini menjelaskan strategi pengujian, test case, debugging report, UAT, dan checklist demonstrasi untuk Sistem E-Commerce Penjualan Obat Klinik Makmur Jaya.

## 1.2 Lingkup Pengujian

| Area | Cakupan |
|---|---|
| Auth | Login, register, verifikasi email, role access, logout |
| Admin | CRUD user, kategori, supplier, obat, laporan, log |
| Apoteker | Batch stok, stock movement, resep, pesanan |
| Kasir | POS, cart kasir, checkout, pembayaran offline |
| Pasien | Katalog, cart, checkout, order, pembayaran, resep |
| Pendukung | Queue, import, export, notifikasi, error log, audit log |

---

# Bab 2 - Strategi Pengujian

## 2.1 Pendekatan Pengujian

Pengujian dilakukan secara manual berbasis skenario. Setiap fitur diuji dari sisi input, proses, output, hak akses, dan dampak terhadap data. Fitur transaksi diuji dengan fokus pada konsistensi stok dan pencegahan stok negatif.

| Jenis Pengujian | Tujuan | Contoh Objek |
|---|---|---|
| Functional Test | Memastikan fitur berjalan | Login, CRUD, checkout, POS |
| Role Access Test | Memastikan akses sesuai role | Admin, Apoteker, Kasir, Pasien |
| Validation Test | Menolak input invalid | Email, password, harga, stok, file |
| Integration Test | Memastikan modul terhubung | Checkout dengan stok, resep dengan order |
| Regression Check | Memastikan perbaikan tidak merusak fitur lain | Login, stok, laporan, notifikasi |
| UAT | Memastikan sistem diterima pengguna | Skenario utama tiap role |

## 2.2 Lingkungan Pengujian

| Komponen | Konfigurasi |
|---|---|
| Backend | Laravel, PHP, middleware, queue, storage, logging |
| Frontend | React, Inertia.js, Tailwind CSS |
| Database | MySQL lokal/server uji |
| Queue | `php artisan queue:work` |
| Email | Mailpit/Mailtrap atau SMTP testing |
| Pembayaran | Midtrans sandbox/simulasi |
| Browser | Chrome, Edge, Firefox, Chromium |
| Storage | Laravel Storage untuk gambar, resep, laporan |

## 2.3 Akun Uji

| Role | Akun Uji | Tujuan |
|---|---|---|
| Admin | `admin@klinik.test` | Master data, laporan, audit log, error log |
| Apoteker | `apoteker@klinik.test` | Stok, resep, pesanan, alert |
| Kasir | `kasir@klinik.test` | POS dan pembayaran offline |
| Pasien | `pasien@klinik.test` | Katalog, cart, checkout, order |

## 2.4 Kriteria Lulus

- Fitur utama berjalan tanpa error kritis.
- Input invalid ditolak oleh validasi.
- Hak akses setiap role sesuai.
- Checkout, POS, dan verifikasi resep tidak menyebabkan stok negatif.
- Laporan, notifikasi, audit log, dan error log dapat ditunjukkan.

---

# Bab 3 - Test Case Sistem

## 3.1 Autentikasi dan Hak Akses

| ID | Skenario | Langkah | Expected Result | Status |
|---|---|---|---|---|
| TC-AUTH-01 | Registrasi pelanggan | Isi form valid | Akun dibuat dan email verifikasi dikirim | Simulasi Lulus |
| TC-AUTH-02 | Verifikasi email | Buka link valid | Email terverifikasi | Simulasi Lulus |
| TC-AUTH-03 | Login multi-role | Login 4 akun role | Masuk dashboard sesuai role | Simulasi Lulus |
| TC-AUTH-04 | Akses admin oleh non-admin | Buka `/admin` | Ditolak/dialihkan | Simulasi Lulus |
| TC-AUTH-05 | Logout | Klik logout | Session berakhir | Simulasi Lulus |
| TC-AUTH-06 | Password salah | Login password invalid | Login ditolak | Simulasi Lulus |

## 3.2 Master Data dan Stok

| ID | Skenario | Langkah | Expected Result | Status |
|---|---|---|---|---|
| TC-MST-01 | Tambah kategori | Admin tambah kategori | Kategori tersimpan | Simulasi Lulus |
| TC-MST-02 | Tambah supplier | Admin tambah supplier | Supplier dapat dipilih | Simulasi Lulus |
| TC-MST-03 | Tambah obat | Admin isi data obat | Obat tampil di daftar/katalog | Simulasi Lulus |
| TC-MST-04 | Upload gambar obat | Upload jpg/png/webp | Gambar tersimpan dan preview tampil | Simulasi Lulus |
| TC-STK-01 | Tambah batch stok | Apoteker tambah batch | Total stok bertambah | Simulasi Lulus |
| TC-STK-02 | FIFO stok | Transaksi pada multi-batch | Batch expired terdekat berkurang dulu | Simulasi Lulus |
| TC-STK-03 | Stok tidak cukup | Checkout > stok | Transaksi ditolak | Simulasi Lulus |

## 3.3 Katalog, Cart, Checkout, Resep

| ID | Skenario | Langkah | Expected Result | Status |
|---|---|---|---|---|
| TC-CAT-01 | Lihat katalog | Buka `/customer/catalog` | Obat aktif tampil | Simulasi Lulus |
| TC-CAT-02 | Search/autocomplete | Cari obat | Hasil sesuai keyword | Simulasi Lulus |
| TC-CART-01 | Tambah cart | Tambah obat | Item masuk cart | Simulasi Lulus |
| TC-CART-02 | Update cart | Ubah jumlah | Total berubah | Simulasi Lulus |
| TC-CHK-01 | Checkout obat bebas | Checkout tanpa resep | Order dibuat | Simulasi Lulus |
| TC-CHK-02 | Checkout obat resep tanpa file | Checkout tanpa upload resep | Sistem menolak | Simulasi Lulus |
| TC-PRS-01 | Verifikasi resep | Apoteker approve/reject | Status resep berubah | Simulasi Lulus |

## 3.4 Kasir, Laporan, Notifikasi, Monitoring

| ID | Skenario | Langkah | Expected Result | Status |
|---|---|---|---|---|
| TC-POS-01 | POS kasir | Tambah item dan checkout | Transaksi tersimpan dan stok berkurang | Simulasi Lulus |
| TC-RPT-01 | Dashboard admin | Buka dashboard | Ringkasan dan grafik tampil | Simulasi Lulus |
| TC-RPT-02 | Export PDF | Klik export PDF | File laporan dibuat | Simulasi Lulus |
| TC-IMP-01 | Import obat | Upload CSV/Excel | Data diproses | Simulasi Lulus |
| TC-NTF-01 | Stok kritis | Stok <= minimum | Notifikasi dibuat | Simulasi Lulus |
| TC-LOG-01 | Audit log | Ubah data obat | Aktivitas tercatat | Simulasi Lulus |
| TC-ERR-01 | Error log | Simulasi exception | Error tercatat | Simulasi Lulus |
| TC-Q-01 | Queue worker | Jalankan job report/import | Job selesai tanpa freeze UI | Simulasi Lulus |

---

# Bab 4 - Debugging Report

## 4.1 Tujuan Debugging

Debugging dilakukan untuk menelusuri error dari browser, Laravel log, error log, response aplikasi, dan failed jobs. Tujuannya memastikan error ditemukan, diperbaiki, dan tidak mengganggu alur utama.

## 4.2 Temuan Debugging

| No | Temuan | Penyebab | Perbaikan | Status |
|---|---|---|---|---|
| 1 | Link verifikasi expired menampilkan error bawaan | Signed URL tidak valid | Handler redirect ke notice | Selesai |
| 2 | Checkout gagal saat stok kurang | Pesan validasi kurang jelas | Validasi backend dan pesan stok | Selesai |
| 3 | Batch stok salah saat transaksi | FIFO belum terpusat | StockService + transaction | Selesai |
| 4 | Upload menerima file invalid | Validasi mime/size belum lengkap | Form Request file validation | Selesai |
| 5 | Report besar lambat | Generate langsung pada request | Background job | Selesai |
| 6 | Notifikasi hilang setelah refresh | Event realtime tidak selalu aktif | Simpan ke database + fallback polling | Selesai |

## 4.3 Proses Debugging

```text
Reproduksi error
  ▼
Baca Laravel log / error_logs / failed_jobs
  ▼
Identifikasi controller, service, request, job, atau React page
  ▼
Perbaiki kode dan validasi
  ▼
Uji ulang skenario
  ▼
Catat hasil perbaikan
```

---

# Bab 5 - User Acceptance Testing

## 5.1 Peserta UAT

| Peserta | Role | Fokus UAT |
|---|---|---|
| Admin Sistem | Admin | User, master data, laporan, audit/error log |
| Apoteker | Apoteker | Stok, resep, pesanan, kadaluarsa |
| Kasir | Kasir | POS, pembayaran langsung, stok |
| Pasien/Pelanggan | Pasien | Register, katalog, cart, checkout, status order |

## 5.2 Skenario UAT

| ID | Role | Skenario | Expected Result | Status |
|---|---|---|---|---|
| UAT-01 | Admin | Login dan kelola obat | Data obat dapat dibuat/diubah | Diterima |
| UAT-02 | Admin | Lihat dashboard dan export laporan | Ringkasan dan PDF tampil | Diterima |
| UAT-03 | Apoteker | Tambah batch dan pantau stok | Stok bertambah dan alert terlihat | Diterima |
| UAT-04 | Apoteker | Verifikasi resep | Resep approve/reject | Diterima |
| UAT-05 | Kasir | Proses transaksi langsung | Transaksi tersimpan, stok berkurang | Diterima |
| UAT-06 | Pasien | Registrasi dan verifikasi email | Akun dapat digunakan | Diterima |
| UAT-07 | Pasien | Checkout obat bebas | Order dibuat | Diterima |
| UAT-08 | Pasien | Checkout obat resep | Menunggu verifikasi Apoteker | Diterima |
| UAT-09 | Semua | Stok tidak cukup | Transaksi ditolak | Diterima |
| UAT-10 | Admin | Audit/error log | Aktivitas dan error tercatat | Diterima |

## 5.3 Kesimpulan UAT

Fitur utama aplikasi dapat diterima untuk kebutuhan purwarupa dan demonstrasi. Alur autentikasi, katalog, cart, checkout, resep, POS, stok, laporan, notifikasi, audit log, dan error log dapat ditunjukkan kepada asesor.

---

# Bab 6 - Checklist Demonstrasi

- [ ] Login semua role.
- [ ] Registrasi dan verifikasi email pasien.
- [ ] CRUD obat, kategori, supplier, dan batch stok.
- [ ] Katalog, pencarian, detail obat, cart.
- [ ] Checkout, pembayaran simulasi/Midtrans sandbox, status pesanan.
- [ ] Upload dan verifikasi resep.
- [ ] Transaksi kasir/POS dan FIFO stok.
- [ ] Dashboard, grafik, laporan, export PDF/Excel.
- [ ] Import CSV/Excel dan queue job.
- [ ] Notifikasi stok, kadaluarsa, pesanan, dan error.
- [ ] Audit log, error log, dan monitoring.
- [ ] Debugging report dan UAT siap dijelaskan.

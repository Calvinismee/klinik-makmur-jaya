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
| Auth | Login, registrasi, verifikasi email, hak akses role, logout |
| Admin | CRUD user, kategori, supplier, obat, laporan, log |
| Apoteker | Batch stok, stock movement, resep, pesanan |
| Kasir | POS, keranjang kasir, checkout, pembayaran offline |
| Pasien | Katalog, keranjang, checkout, pesanan, pembayaran, resep |
| Pendukung | Antrean job, impor, ekspor, notifikasi, error log, audit log |

---

# Bab 2 - Strategi Pengujian

## 2.1 Pendekatan Pengujian

Pengujian dilakukan dengan kombinasi test otomatis dan pengujian manual berbasis skenario. Test otomatis menggunakan Pest/Laravel untuk memverifikasi alur utama, validasi berisiko, integrasi stok, pembayaran, otorisasi, dan notifikasi waktu nyata. Pengujian manual tetap digunakan untuk area visual, dashboard, laporan, impor/ekspor, dan demonstrasi UAT.

Setiap fitur diuji dari sisi input, proses, output, hak akses, dan dampak terhadap data. Fitur transaksi diuji dengan fokus pada konsistensi stok dan pencegahan stok negatif.

| Jenis Pengujian | Tujuan | Contoh Objek |
|---|---|---|
| Functional Test | Memastikan fitur berjalan | Login, CRUD, checkout, POS |
| Role Access Test | Memastikan akses sesuai role | Admin, Apoteker, Kasir, Pasien |
| Validation Test | Menolak input invalid | Email, password, harga, stok, file |
| Integration Test | Memastikan modul terhubung | Checkout dengan stok, resep dengan order |
| Automated Regression Test | Memastikan alur kritis tetap stabil | `composer test`, Pest feature test |
| Regression Check | Memastikan perbaikan tidak merusak fitur lain | Login, stok, laporan, notifikasi |
| UAT | Memastikan sistem diterima pengguna | Skenario utama tiap role |

## 2.2 Lingkungan Pengujian

| Komponen | Konfigurasi |
|---|---|
| Backend | Laravel, PHP, middleware, antrean job, storage, logging |
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
| Apoteker | `apoteker@klinik.test` | Stok, resep, pesanan, peringatan |
| Kasir | `kasir@klinik.test` | POS dan pembayaran offline |
| Pasien | `pasien@klinik.test` | Katalog, keranjang, checkout, pesanan |

## 2.4 Kriteria Lulus

- Fitur utama berjalan tanpa error kritis.
- Input invalid ditolak oleh validasi.
- Hak akses setiap role sesuai.
- Checkout, POS, dan verifikasi resep tidak menyebabkan stok negatif.
- Laporan, notifikasi, audit log, dan error log dapat ditunjukkan.
- Test otomatis `composer test` lulus tanpa kegagalan.

---

# Bab 3 - Test Case Sistem

## 3.1 Autentikasi dan Hak Akses

| ID | Skenario | Langkah | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-AUTH-01 | Registrasi pelanggan | Isi form valid | Akun pasien dibuat dan diarahkan ke notice verifikasi email | Otomatis Lulus |
| TC-AUTH-02 | Verifikasi email | Buka link valid | Email terverifikasi | Manual/Belum Otomatis |
| TC-AUTH-03 | Login banyak role | Login akun sesuai role | Masuk dashboard sesuai role | Otomatis Parsial |
| TC-AUTH-04 | Akses admin oleh non-admin | Buka halaman admin memakai role pasien/kasir | Akses ditolak | Otomatis Lulus |
| TC-AUTH-05 | Logout | Klik logout | Session berakhir | Manual/Belum Otomatis |
| TC-AUTH-06 | Password salah | Login dengan password salah | Login ditolak | Manual/Belum Otomatis |

## 3.2 Master Data dan Stok

| ID | Skenario | Langkah | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-MST-01 | Tambah kategori | Admin tambah kategori | Kategori tersimpan | Manual/Belum Otomatis |
| TC-MST-02 | Tambah supplier | Admin tambah supplier | Supplier dapat dipilih | Manual/Belum Otomatis |
| TC-MST-03 | Tambah obat | Admin isi data obat valid | Obat tersimpan sebagai master data | Otomatis Lulus |
| TC-MST-04 | Unggah gambar obat | Unggah jpg/png/webp | Gambar tersimpan dan preview tampil | Manual/Belum Otomatis |
| TC-STK-01 | Tambah batch stok | Apoteker tambah batch | Total stok bertambah | Manual/Belum Otomatis |
| TC-STK-02 | FIFO stok | Transaksi pada multi-batch | Batch kedaluwarsa terdekat berkurang dulu | Otomatis Lulus |
| TC-STK-03 | Stok tidak cukup | Checkout atau pengurangan stok melebihi stok tersedia | Transaksi ditolak dan stok tidak berubah | Otomatis Lulus |

## 3.3 Katalog, Cart, Checkout, Resep

| ID | Skenario | Langkah | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-CAT-01 | Lihat katalog | Buka `/customer/catalog` | Obat aktif tampil | Manual/Belum Otomatis |
| TC-CAT-02 | Pencarian/autocomplete | Cari obat aktif dan nonaktif | Hasil hanya menampilkan obat aktif yang sesuai kata kunci | Otomatis Lulus |
| TC-CART-01 | Tambah keranjang | Tambah obat dengan stok cukup | Item masuk keranjang | Otomatis Lulus |
| TC-CART-02 | Update keranjang | Ubah jumlah item | Total berubah | Manual/Belum Otomatis |
| TC-CHK-01 | Checkout obat bebas | Checkout tanpa resep | Order dibuat dan transaksi Midtrans disiapkan | Otomatis Lulus |
| TC-CHK-02 | Checkout obat resep tanpa file | Checkout tanpa unggah resep | Sistem menolak dan pesanan tidak dibuat | Otomatis Lulus |
| TC-CHK-03 | Checkout obat resep dengan file tidak valid | Unggah file selain gambar | Sistem menolak dan pesanan tidak dibuat | Otomatis Lulus |
| TC-PRS-01 | Verifikasi resep | Apoteker menyetujui/menolak resep | Status resep dan pesanan berubah sesuai keputusan | Otomatis Lulus |

## 3.4 Kasir, Laporan, Notifikasi, Monitoring

| ID | Skenario | Langkah | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-POS-01 | POS kasir | Tambah item dan checkout | Transaksi tersimpan, status selesai, dan stok berkurang | Otomatis Lulus |
| TC-RPT-01 | Dashboard admin | Buka dashboard | Ringkasan dan grafik tampil | Manual/Belum Otomatis |
| TC-RPT-02 | Ekspor PDF | Klik ekspor PDF | File laporan dibuat | Manual/Belum Otomatis |
| TC-IMP-01 | Impor obat | Unggah CSV/Excel | Data diproses | Manual/Belum Otomatis |
| TC-NTF-01 | Stok kritis | Stok <= minimum | Notifikasi dibuat | Manual/Belum Otomatis |
| TC-NTF-02 | Notifikasi resep | Checkout obat resep | Notifikasi dibuat untuk apoteker | Otomatis Lulus |
| TC-LOG-01 | Audit log | Ubah data obat | Aktivitas tercatat | Manual/Belum Otomatis |
| TC-ERR-01 | Error log | Simulasi exception | Error tercatat | Manual/Belum Otomatis |
| TC-Q-01 | Worker antrean | Jalankan job laporan/impor | Job selesai tanpa membuat UI menunggu lama | Manual/Belum Otomatis |

## 3.5 Pembayaran, Otorisasi, dan Waktu Nyata

| ID | Skenario | Langkah | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-PAY-01 | Webhook Midtrans valid | Kirim webhook dengan signature valid | Pesanan ditandai lunas, status diproses, dan stok berkurang | Otomatis Lulus |
| TC-PAY-02 | Signature Midtrans invalid | Kirim webhook dengan signature salah | Request ditolak dan pesanan tidak berubah | Otomatis Lulus |
| TC-PAY-03 | Webhook lunas duplikat | Kirim webhook lunas dua kali | Stok hanya berkurang satu kali | Otomatis Lulus |
| TC-PAY-04 | Nominal Midtrans tidak sesuai | Kirim gross amount berbeda dari total order | Webhook ditolak dan stok tidak berkurang | Otomatis Lulus |
| TC-PAY-05 | Pembatalan Midtrans | Kirim status expire/cancel | Pesanan belum bayar ditandai gagal tanpa mengurangi stok | Otomatis Lulus |
| TC-SEC-01 | Akses lintas role | Admin/apoteker/kasir/pasien membuka route role lain | Akses ditolak | Otomatis Lulus |
| TC-SEC-02 | Akses order pelanggan lain | Pasien membuka order milik pasien lain | Akses ditolak | Otomatis Lulus |
| TC-RT-01 | Konfigurasi Reverb | Cek koneksi broadcast dan private channel | Reverb aktif dan private channel hanya bisa diakses pemilik user | Otomatis Lulus |
| TC-RT-02 | Wiring Echo frontend | Cek impor Echo, konfigurasi Reverb, dan listener notifikasi | Browser siap subscribe ke channel notifikasi waktu nyata | Otomatis Lulus |

## 3.6 Ringkasan Kesesuaian Test Case

Test case sudah sesuai untuk alur kritis aplikasi karena mencakup autentikasi, hak akses role, master data obat, katalog, keranjang, checkout, validasi resep, FIFO stok, POS kasir, pembayaran Midtrans, otorisasi data pelanggan, dan notifikasi waktu nyata.

Area yang masih perlu pengujian manual atau test otomatis tambahan adalah verifikasi email end-to-end, logout, password salah, CRUD kategori/supplier secara route, unggah gambar obat, tambah batch dari halaman apoteker, update keranjang, dashboard/grafik, ekspor PDF/Excel, impor CSV/Excel, audit log, error log, dan worker antrean laporan/impor.

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

| ID | Role | Skenario | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| UAT-01 | Admin | Login dan kelola obat | Data obat dapat dibuat/diubah | Diterima |
| UAT-02 | Admin | Lihat dashboard dan ekspor laporan | Ringkasan dan PDF tampil | Diterima |
| UAT-03 | Apoteker | Tambah batch dan pantau stok | Stok bertambah dan alert terlihat | Diterima |
| UAT-04 | Apoteker | Verifikasi resep | Resep dapat disetujui/ditolak | Diterima |
| UAT-05 | Kasir | Proses transaksi langsung | Transaksi tersimpan, stok berkurang | Diterima |
| UAT-06 | Pasien | Registrasi dan verifikasi email | Akun dapat digunakan | Diterima |
| UAT-07 | Pasien | Checkout obat bebas | Order dibuat | Diterima |
| UAT-08 | Pasien | Checkout obat resep | Menunggu verifikasi Apoteker | Diterima |
| UAT-09 | Semua | Stok tidak cukup | Transaksi ditolak | Diterima |
| UAT-10 | Admin | Audit/error log | Aktivitas dan error tercatat | Diterima |

## 5.3 Kesimpulan UAT

Fitur utama aplikasi dapat diterima untuk kebutuhan purwarupa dan demonstrasi. Alur autentikasi, katalog, keranjang, checkout, resep, POS, stok, laporan, notifikasi, audit log, dan error log dapat ditunjukkan kepada asesor.

---

# Bab 6 - Checklist Demonstrasi

- [ ] Login semua role.
- [ ] Registrasi dan verifikasi email pasien.
- [ ] CRUD obat, kategori, supplier, dan batch stok.
- [ ] Katalog, pencarian, detail obat, keranjang.
- [ ] Checkout, pembayaran simulasi/Midtrans sandbox, status pesanan.
- [ ] Upload dan verifikasi resep.
- [ ] Transaksi kasir/POS dan FIFO stok.
- [ ] Dashboard, grafik, laporan, ekspor PDF/Excel.
- [ ] Impor CSV/Excel dan job antrean.
- [ ] Notifikasi stok, kadaluarsa, pesanan, dan error.
- [ ] Audit log, error log, dan monitoring.
- [ ] Debugging report dan UAT siap dijelaskan.

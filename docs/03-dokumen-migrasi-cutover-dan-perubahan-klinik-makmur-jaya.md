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
| **Jenis Dokumen** | Dokumen Migrasi, Cutover, dan Perubahan |

---

# Bab 1 - Pendahuluan

## 1.1 Tujuan Dokumen

Dokumen ini menjelaskan strategi migrasi data dari pencatatan manual/spreadsheet ke sistem Laravel + React, rencana cutover, rollback plan, pembaharuan perangkat lunak, change log, dan impact analysis.

## 1.2 Konteks Migrasi

Sebelum sistem baru digunakan, data obat, supplier, pelanggan, stok, dan sebagian transaksi masih berada pada spreadsheet atau catatan manual. Migrasi dilakukan agar data awal dapat digunakan dalam database MySQL aplikasi.

## 1.3 Ruang Lingkup

| Area | Cakupan |
|---|---|
| Data lama | Obat, supplier, pelanggan, stok awal, transaksi awal |
| Transformasi | Normalisasi kode, kategori, harga, stok, tanggal kadaluarsa |
| Load | Import CSV/Excel atau seeder Laravel |
| Validasi | Jumlah data, format field, relasi, stok, duplikasi |
| Cutover | Transisi dari proses manual ke aplikasi uji |
| Rollback | Pemulihan ke backup jika cutover gagal |
| Update | Git workflow, change log, impact analysis |

---

# Bab 2 - Strategi Migrasi Data

## 2.1 Sumber Data Lama

| Sumber | Format | Isi | Keterangan |
|---|---|---|---|
| Daftar obat | Spreadsheet/CSV | Nama, kategori, harga, stok, kadaluarsa | Data master awal |
| Supplier | Spreadsheet/CSV | Nama, kontak, alamat | Relasi pemasok |
| Pelanggan | Manual/spreadsheet | Nama, kontak, alamat, email | Data awal jika tersedia |
| Transaksi | Manual/spreadsheet | Tanggal, item, jumlah, total | Data laporan awal jika diperlukan |
| Resep | Fisik/digital | File resep dan identitas pasien | Tidak wajib seluruhnya dimigrasikan |

## 2.2 Tahapan Migrasi

| Tahap | Aktivitas | Output |
|---|---|---|
| 1 | Inventarisasi file sumber | Daftar file dan struktur kolom |
| 2 | Pembersihan data | Data kosong, duplikat, dan salah format ditandai |
| 3 | Mapping field | Kolom lama dipetakan ke tabel baru |
| 4 | Import uji | Data masuk ke database lokal/staging |
| 5 | Validasi | Jumlah data, relasi, dan stok sesuai |
| 6 | Perbaikan | Data bermasalah diperbaiki/dikecualikan |
| 7 | Import final | Data siap dipakai untuk demo/cutover |

## 2.3 Alur Migrasi Ringkas

```text
Spreadsheet/manual
  ▼
Pembersihan dan normalisasi data
  ▼
Mapping field ke tabel MySQL
  ▼
Import CSV/Excel atau seeder
  ▼
Validasi teknis dan bisnis
  ▼
Data siap digunakan aplikasi
```

---

# Bab 3 - Mapping Field Migrasi

## 3.1 Mapping Data Obat

| Kolom Lama | Tabel Baru | Field Baru | Transformasi |
|---|---|---|---|
| Kode Obat | medicines | code | Jika kosong, generate otomatis |
| Nama Obat | medicines | name | Wajib, trim, title case |
| Kategori | categories | name | Lookup/create |
| Supplier | suppliers | name | Lookup/create |
| Harga | medicines | price | Konversi angka desimal |
| Stok | medicine_batches | quantity | Integer >= 0 |
| Tanggal Kadaluarsa | medicine_batches | expired_at | Format `YYYY-MM-DD` |
| Deskripsi | medicines | description | Opsional |

## 3.2 Mapping Data Pelanggan

| Kolom Lama | Tabel Baru | Field Baru | Transformasi |
|---|---|---|---|
| Nama Pelanggan | users | name | Wajib |
| Email | users | email | Unik dan valid |
| Nomor HP | customers | phone | Simpan sebagai string |
| Alamat | customers | address | Opsional |
| Status | users | status | Default active |
| Password | users | password | Default sementara, wajib diganti |

## 3.3 Mapping Data Transaksi

| Kolom Lama | Tabel Baru | Field Baru | Transformasi |
|---|---|---|---|
| No Transaksi | orders | order_number | Generate jika kosong |
| Tanggal | orders | created_at | Format timestamp |
| Pelanggan | orders | user_id | Cocokkan email/nama |
| Nama Obat | order_items | medicine_id | Cocokkan kode/nama obat |
| Jumlah | order_items | quantity | Integer > 0 |
| Harga Satuan | order_items | price | Harga saat transaksi |
| Total | orders | total_amount | Hitung ulang dari item |

---

# Bab 4 - Validasi Pasca-Migrasi

## 4.1 Validasi Teknis

| Aspek | Cara Pemeriksaan | Kriteria Lulus |
|---|---|---|
| Jumlah data | Bandingkan baris sumber dan record database | Sesuai setelah data invalid dikecualikan |
| Format tanggal | Cek expired_at dan created_at | Tidak ada tanggal invalid |
| Harga/stok | Cek tipe numerik | Tidak ada angka negatif |
| Relasi kategori | Cek kategori setiap obat | Tidak ada obat tanpa kategori |
| Relasi supplier | Cek supplier obat | Supplier valid/default |
| Duplikasi | Cek kode obat dan email | Duplikat ditandai/gabung |

## 4.2 Validasi Bisnis

- Obat resep wajib diberi `requires_prescription`.
- Obat kadaluarsa tidak masuk stok aktif.
- Total transaksi historis dihitung ulang dari item.
- Pelanggan tanpa email dapat dicatat sebagai pelanggan offline atau tidak dimigrasikan.
- Stok awal harus sama dengan total batch aktif.

## 4.3 Template Hasil Validasi

| No | Objek Validasi | Hasil | Catatan |
|---|---|---|---|
| 1 | Jumlah data obat | Sesuai / Tidak sesuai | Diisi saat pelaksanaan |
| 2 | Jumlah supplier | Sesuai / Tidak sesuai | Diisi saat pelaksanaan |
| 3 | Format harga | Valid / Tidak valid | Diisi saat pelaksanaan |
| 4 | Format tanggal kadaluarsa | Valid / Tidak valid | Diisi saat pelaksanaan |
| 5 | Relasi kategori dan supplier | Valid / Tidak valid | Diisi saat pelaksanaan |

---

# Bab 5 - Cutover dan Rollback

## 5.1 Checklist Pra-Cutover

- [ ] Database dan migration berhasil dijalankan.
- [ ] Data awal obat, kategori, supplier, dan user tersedia.
- [ ] Akun Admin, Apoteker, Kasir, dan Pasien dapat login.
- [ ] CRUD, cart, checkout, stok, dan transaksi diuji.
- [ ] Queue worker dapat berjalan.
- [ ] Export laporan dan upload file diuji.
- [ ] Backup database dibuat sebelum cutover.

## 5.2 Langkah Cutover

| Urutan | Langkah | PIC |
|---|---|---|
| 1 | Freeze perubahan data manual sementara | Admin Klinik |
| 2 | Backup data lama dan database aplikasi | Tim Pengembang |
| 3 | Import data final | Tim Pengembang |
| 4 | Validasi data obat, stok, user, transaksi | Admin dan Apoteker |
| 5 | Aktifkan akses aplikasi | Admin Sistem |
| 6 | Simulasi transaksi online dan POS | Kasir dan Pasien Uji |
| 7 | Pantau log, stok, queue, notifikasi | Tim Pengembang |
| 8 | Nyatakan cutover berhasil/gagal | Admin Klinik + Tim Pengembang |

## 5.3 Timeline Cutover

| Waktu | Aktivitas | Output |
|---|---|---|
| H-1 | Finalisasi data sumber dan backup | Data siap migrasi |
| Hari H - Jam 1 | Import data dan konfigurasi | Database terisi |
| Hari H - Jam 2 | Validasi data dan role | Data/akun valid |
| Hari H - Jam 3 | Simulasi transaksi dan notifikasi | Fitur berjalan |
| Hari H - Jam 4 | Monitoring dan go/no-go | Status cutover ditetapkan |

## 5.4 Rollback Plan

| Pemicu Rollback | Dampak |
|---|---|
| Data obat/stok tidak sesuai | Transaksi tidak akurat |
| User tidak bisa login | Operasional terganggu |
| Checkout gagal konsisten | Pesanan tidak dapat dibuat |
| Stok menjadi negatif | Data stok tidak valid |
| Laporan salah | Keputusan manajemen keliru |
| Error kritis | Aplikasi tidak layak digunakan |

| Urutan | Langkah Rollback | Output |
|---|---|---|
| 1 | Hentikan akses aplikasi uji | Tidak ada transaksi baru |
| 2 | Simpan log error dan catatan kegagalan | Bukti analisis tersedia |
| 3 | Restore database dari backup | Data kembali ke kondisi awal |
| 4 | Aktifkan pencatatan manual/spreadsheet sementara | Operasional tetap berjalan |
| 5 | Perbaiki penyebab kegagalan | Patch/koreksi tersedia |
| 6 | Jadwalkan ulang cutover | Cutover ulang siap |

---

# Bab 6 - Pembaharuan dan Impact Analysis

## 6.1 Git Workflow

| Branch | Fungsi |
|---|---|
| `main` | Branch stabil untuk demo/presentasi |
| `feature/*` | Pengembangan fitur baru |
| `fix/*` | Perbaikan bug |
| `release/*` | Persiapan rilis/cutover |

```bash
git checkout -b feature/order-notification
git add .
git commit -m "Add order notification feature"
git checkout main
git merge feature/order-notification
```

## 6.2 Change Log

| Versi | Waktu | Perubahan | Dampak |
|---|---|---|---|
| v0.1 | Hari 1 | Inisialisasi Laravel, React, database, auth | Fondasi tersedia |
| v0.2 | Hari 2 | CRUD obat, kategori, supplier, stok | Master data siap |
| v0.3 | Hari 2 | Katalog, cart, checkout, resep | Alur e-commerce dapat diuji |
| v0.4 | Hari 3 | Dashboard, laporan, notifikasi, queue, import | Fitur demo lengkap |
| v1.0 | Hari 3 | Stabilitas, debugging, UAT, dokumentasi | Siap presentasi |

## 6.3 Impact Analysis

| Perubahan | Modul Terdampak | Risiko | Mitigasi |
|---|---|---|---|
| Struktur tabel medicines | Katalog, cart, laporan, import | Query/form gagal | Update migration, model, request, test |
| Alur checkout | Cart, order, stok, pembayaran | Order gagal/stok salah | Database transaction dan E2E test |
| Role permission | Login, dashboard, CRUD | Akses tidak sesuai | Uji middleware dan role matrix |
| Format import CSV | Migrasi dan master obat | Field tertukar/import gagal | Update template dan validasi |
| Status pesanan | Dashboard, laporan, notifikasi | Status tidak konsisten | Update enum, UI, query, guide |
| Library PDF | Laporan dan deployment | Dependency error | Lock version dan uji export |

## 6.4 Kriteria Perubahan Diterima

- Fitur baru berjalan sesuai kebutuhan.
- Tidak ada regresi pada login, CRUD, checkout, stok, dan laporan.
- Migration dapat dijalankan dan di-rollback.
- Dokumentasi terdampak diperbarui.
- Tidak ada error kritis pada hasil debugging.

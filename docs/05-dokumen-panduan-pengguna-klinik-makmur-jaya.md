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
| **Jenis Dokumen** | Dokumen Panduan Pengguna, FAQ, Troubleshooting, dan Endpoint |

---

# Bab 1 - Pendahuluan

## 1.1 Tujuan Dokumen

Dokumen ini menjadi panduan penggunaan Sistem E-Commerce Penjualan Obat Klinik Makmur Jaya untuk Admin, Apoteker, Kasir, dan Pasien/Pelanggan. Dokumen juga mencakup FAQ, troubleshooting, dan dokumentasi endpoint aktual berdasarkan hasil `php artisan route:list`.

## 1.2 Ringkasan Pengguna

| Role | Fungsi Utama |
|---|---|
| Admin | User, master data, laporan, audit log, error log |
| Apoteker | Batch stok, resep, pesanan, stock movement |
| Kasir | POS dan pembayaran offline |
| Pasien/Pelanggan | Katalog, cart, checkout, pembayaran, status pesanan |

---

# Bab 2 - Panduan Pengguna

## 2.1 Panduan Umum

1. Buka aplikasi melalui browser.
2. Login menggunakan akun sesuai role.
3. Gunakan menu dashboard sesuai hak akses.
4. Perhatikan pesan validasi, status pesanan, dan notifikasi.
5. Logout setelah selesai menggunakan aplikasi.

## 2.2 Panduan Admin

| Fitur | Cara Penggunaan | Output |
|---|---|---|
| Login Admin | Buka `/login`, masukkan akun admin | Dashboard admin terbuka |
| Kelola User | Buka `/admin/users` | User dapat ditambah/diubah/dihapus |
| Kelola Kategori | Buka `/admin/categories` | Kategori obat tersimpan |
| Kelola Supplier | Buka `/admin/suppliers` | Supplier tersedia untuk obat |
| Kelola Obat | Buka `/admin/medicines` | Data obat tersedia di sistem |
| Import Obat | Upload file melalui `/admin/medicines/import` | Data obat diproses |
| Lihat Order | Buka `/admin/orders` | Pesanan tampil |
| Export Laporan | Gunakan endpoint export order/PDF | File laporan dibuat |
| Audit Log | Buka `/admin/audit-logs` | Aktivitas penting terlihat |
| Error Log | Buka `/admin/error-logs` | Error aplikasi terlihat |

## 2.3 Panduan Apoteker

| Fitur | Cara Penggunaan | Output |
|---|---|---|
| Dashboard | Buka `/pharmacist/dashboard` | Ringkasan stok dan tugas tampil |
| Batch Stok | Buka `/pharmacist/batches` | Batch obat dapat ditambah |
| Stock Movement | Buka `/pharmacist/movements` | Riwayat stok tampil |
| Pesanan | Buka `/pharmacist/orders` | Pesanan siap diproses tampil |
| Tandai Ready | POST ke route ready/bulk-ready melalui UI | Status pesanan berubah |
| Verifikasi Resep | Buka `/pharmacist/prescriptions` | Resep dapat approve/reject |
| Riwayat Resep | Buka `/pharmacist/prescription-history` | Riwayat verifikasi tampil |

## 2.4 Panduan Kasir

| Fitur | Cara Penggunaan | Output |
|---|---|---|
| Dashboard | Buka `/cashier/dashboard` | Dashboard kasir tampil |
| POS | Buka `/cashier/pos` | Halaman transaksi langsung tampil |
| Tambah Item | Pilih obat dan submit add | Item masuk cart POS |
| Update Item | Ubah jumlah item | Total transaksi berubah |
| Clear Cart | Klik clear | Cart POS kosong |
| Checkout POS | Klik checkout | Transaksi tersimpan dan stok berkurang |
| Pembayaran | Buka `/cashier/payments` | Data pembayaran tampil |

## 2.5 Panduan Pasien/Pelanggan

| Fitur | Cara Penggunaan | Output |
|---|---|---|
| Registrasi | Buka `/register` | Akun pelanggan dibuat |
| Verifikasi Email | Buka link `/email/verify/{id}/{hash}` | Email terverifikasi |
| Dashboard | Buka `/customer/dashboard` | Ringkasan pelanggan tampil |
| Katalog | Buka `/customer/catalog` | Daftar obat tampil |
| Autocomplete | Gunakan pencarian katalog | Saran pencarian tampil |
| Detail Obat | Buka `/customer/catalog/{medicine}` | Detail obat tampil |
| Cart | Buka `/customer/cart` | Cart tampil |
| Tambah/Ubah/Hapus Cart | Gunakan tombol pada UI cart | Cart diperbarui |
| Checkout | Buka `/customer/checkout` lalu submit | Pesanan dibuat |
| Order | Buka `/customer/orders` | Riwayat pesanan tampil |
| Detail Order | Buka `/customer/orders/{order_number}` | Detail pesanan tampil |
| Bayar | Gunakan tombol bayar pada order | Status pembayaran diproses |

---

# Bab 3 - FAQ

## 3.1 Pertanyaan Umum

| No | Pertanyaan | Jawaban |
|---|---|---|
| 1 | Apakah pasien harus punya akun? | Ya, akun diperlukan untuk cart, checkout, resep, dan riwayat pesanan. |
| 2 | Mengapa email perlu diverifikasi? | Untuk memastikan email valid dan mengurangi penyalahgunaan akun. |
| 3 | Apakah semua obat bisa dibeli langsung? | Tidak. Obat wajib resep harus diverifikasi Apoteker. |
| 4 | Format resep apa yang diterima? | PDF, JPG, JPEG, atau PNG sesuai batas ukuran sistem. |
| 5 | Bagaimana stok diperbarui? | Stok berkurang otomatis saat order/POS diproses dengan FIFO. |
| 6 | Apa yang terjadi jika stok kurang? | Checkout atau transaksi POS ditolak. |
| 7 | Apakah pembayaran produksi? | Untuk purwarupa memakai simulasi atau Midtrans sandbox. |
| 8 | Siapa yang melihat laporan? | Admin memiliki akses laporan penuh. |
| 9 | Bagaimana admin mengetahui error? | Error dicatat di error log dan dapat dikategorikan severity. |
| 10 | Apakah laporan bisa diekspor? | Ya, order/laporan dapat diekspor PDF/Excel. |
| 11 | Apakah data demo sama dengan data klinik asli? | Tidak, purwarupa memakai dummy data/data uji. |
| 12 | Apakah ada REST API penuh? | Tidak. Sistem berbasis route web Laravel + Inertia, hanya beberapa endpoint utilitas/integrasi. |

---

# Bab 4 - Troubleshooting

| Masalah | Penyebab | Solusi |
|---|---|---|
| Tidak bisa login | Email/password salah, akun belum aktif, role belum sesuai | Periksa kredensial dan role user |
| Email verifikasi tidak masuk | SMTP testing belum aktif atau email salah | Cek Mailpit/Mailtrap dan konfigurasi mail |
| Link verifikasi expired | Signed URL kedaluwarsa | Minta ulang email verifikasi |
| Checkout gagal | Cart kosong, stok kurang, resep belum diunggah | Periksa cart, stok, dan file resep |
| Upload resep/gambar gagal | Format/ukuran tidak valid | Gunakan format dan ukuran sesuai aturan |
| Stok tidak berubah | Order belum valid atau proses stok gagal | Cek status order, log, dan queue |
| Notifikasi tidak realtime | Broadcasting/Reverb tidak aktif | Gunakan refresh/polling fallback |
| Export laporan gagal | Storage/queue/dependency bermasalah | Cek permission storage, queue worker, error log |
| Import gagal | Format kolom tidak sesuai | Sesuaikan template dan validasi data |
| Admin 403 | User bukan admin | Login dengan akun admin atau periksa role |
| Pesanan resep tidak diproses | Resep belum approved | Apoteker perlu verifikasi resep |
| Queue tertahan | Worker belum berjalan atau job gagal | Jalankan `php artisan queue:work` dan cek `failed_jobs` |

## 4.1 Perintah Debugging

```bash
php artisan about
php artisan route:list
php artisan migrate:status
php artisan queue:failed
php artisan queue:retry all
php artisan optimize:clear
php artisan test
```

---

# Bab 5 - Dokumentasi Endpoint dan Integrasi

Endpoint berikut disusun berdasarkan hasil `php artisan route:list` pada repository aplikasi Klinik Makmur Jaya. Karena aplikasi memakai Laravel + React + Inertia.js, sebagian besar endpoint merupakan route web, bukan REST API penuh.

## 5.1 Auth dan Umum

| Method | Endpoint | Pengguna | Fungsi |
|---|---|---|---|
| GET | `/` | Publik | Halaman awal aplikasi |
| GET | `/login` | Semua role | Menampilkan halaman login |
| POST | `/login` | Semua role | Memproses login |
| POST | `/logout` | User login | Logout pengguna |
| GET | `/register` | Pasien | Menampilkan registrasi |
| POST | `/register` | Pasien | Registrasi pelanggan |
| GET | `/email/verify` | Pasien | Notice verifikasi email |
| GET | `/email/verify/{id}/{hash}` | Pasien | Verifikasi email signed URL |
| POST | `/email/verification-notification` | Pasien | Kirim ulang email verifikasi |
| POST | `/session/keep-alive` | User login | Menjaga session aktif |

## 5.2 Admin

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/admin/dashboard` | Dashboard admin |
| GET/POST | `/admin/users` | List dan tambah user |
| PUT/PATCH/DELETE | `/admin/users/{user}` | Update/hapus user |
| GET/POST | `/admin/categories` | List dan tambah kategori |
| PUT/PATCH/DELETE | `/admin/categories/{category}` | Update/hapus kategori |
| GET/POST | `/admin/suppliers` | List dan tambah supplier |
| PUT/PATCH/DELETE | `/admin/suppliers/{supplier}` | Update/hapus supplier |
| GET/POST | `/admin/medicines` | List dan tambah obat |
| POST | `/admin/medicines/import` | Import obat |
| PUT/PATCH/DELETE | `/admin/medicines/{medicine}` | Update/hapus obat |
| GET | `/admin/orders` | Daftar order |
| GET | `/admin/orders/export` | Export order |
| GET | `/admin/orders/export/pdf` | Export order PDF |
| POST | `/admin/orders/export/pdf/background` | Generate PDF via background job |
| POST | `/admin/orders/export/excel/background` | Generate Excel via background job |
| GET | `/admin/reports/download/{filename}` | Download laporan |
| GET | `/admin/reports/{reportJob}/status` | Cek status job laporan |
| GET | `/admin/audit-logs` | Audit log |
| GET | `/admin/error-logs` | Error log |

## 5.3 Apoteker

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/pharmacist/dashboard` | Dashboard apoteker |
| GET/POST | `/pharmacist/batches` | List dan tambah batch obat |
| GET | `/pharmacist/movements` | Riwayat movement stok |
| GET | `/pharmacist/orders` | Daftar order untuk diproses |
| POST | `/pharmacist/orders/bulk-ready` | Tandai beberapa order siap |
| POST | `/pharmacist/orders/{order}/ready` | Tandai order siap |
| GET | `/pharmacist/prescriptions` | Daftar resep |
| POST | `/pharmacist/prescriptions/{order}/verify` | Verifikasi resep |
| GET | `/pharmacist/prescription-history` | Riwayat resep |

## 5.4 Kasir

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/cashier/dashboard` | Dashboard kasir |
| GET | `/cashier/pos` | Halaman POS |
| POST | `/cashier/pos/add` | Tambah item POS |
| POST | `/cashier/pos/update` | Update item POS |
| POST | `/cashier/pos/clear` | Kosongkan POS cart |
| POST | `/cashier/pos/checkout` | Checkout transaksi POS |
| GET | `/cashier/payments` | Daftar pembayaran |

## 5.5 Pasien/Pelanggan

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/customer/dashboard` | Dashboard pelanggan |
| GET | `/customer/catalog` | Katalog obat |
| GET | `/customer/catalog/autocomplete` | Autocomplete pencarian obat |
| GET | `/customer/catalog/{medicine}` | Detail obat |
| GET | `/customer/cart` | Halaman cart |
| POST | `/customer/cart/add` | Tambah item cart |
| POST | `/customer/cart/update` | Update cart |
| POST | `/customer/cart/remove` | Hapus item cart |
| GET | `/customer/checkout` | Halaman checkout |
| POST | `/customer/checkout` | Buat pesanan |
| GET | `/customer/orders` | Daftar pesanan |
| GET | `/customer/orders/{order:order_number}` | Detail pesanan |
| POST | `/customer/orders/{order:order_number}/pay` | Bayar pesanan |

## 5.6 Integrasi dan Notifikasi

| Method | Endpoint | Pengguna | Fungsi |
|---|---|---|---|
| POST | `/notifications/read-all` | User login | Tandai semua notifikasi terbaca |
| POST | `/payments/midtrans/notification` | Midtrans | Webhook pembayaran sandbox/simulasi |
| GET/POST | `/broadcasting/auth` | User login | Auth channel broadcasting Laravel |
| GET/PUT | `/storage/{path}` | Sistem | Akses/upload file storage lokal |

## 5.7 Catatan Endpoint

Endpoint lama seperti `/catalog`, `/cart`, `/checkout`, `/api/notifications`, dan `/api/stock-status` tidak digunakan pada route aktual. Endpoint aktual memakai prefix `/customer/*` untuk fitur pelanggan dan `/notifications/read-all` untuk aksi notifikasi yang tersedia saat ini.

---

# Bab 6 - Jawaban Singkat untuk Asesor

| Pertanyaan | Jawaban Ringkas |
|---|---|
| Mengapa Laravel + React? | Laravel menangani backend, validasi, auth, queue, dan database; React menangani UI interaktif melalui Inertia.js. |
| Mengapa MySQL? | Struktur data obat, stok, transaksi, resep, dan laporan bersifat relasional. |
| Bagaimana stok tidak negatif? | Semua checkout/POS divalidasi backend dan pengurangan stok memakai transaction + FIFO. |
| Apakah API penuh? | Tidak. Sistem menggunakan route web Inertia. Endpoint utilitas hanya untuk integrasi tertentu. |
| Bagaimana jika Reverb mati? | Notifikasi tetap tersimpan di database dan dapat dibaca melalui refresh/polling. |
| Bagaimana rollback? | Hentikan akses, simpan log, restore backup, aktifkan pencatatan manual sementara, jadwalkan cutover ulang. |

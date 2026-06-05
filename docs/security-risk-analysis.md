# Analisis Risiko Keamanan Informasi

Sistem: Klinik Makmur Jaya - E-Commerce dan Manajemen Apotek

## Ruang Lingkup

Dokumen ini mencakup risiko keamanan untuk autentikasi, otorisasi multi-role, data pasien, transaksi online/offline, stok obat, resep, notifikasi, upload file, integrasi Midtrans, audit log, dan error log.

## Ringkasan Kontrol yang Diterapkan

- Autentikasi berbasis session Laravel.
- Role-based access control untuk Admin, Apoteker, Kasir, dan Pasien.
- Verifikasi email untuk pelanggan.
- Password hashing menggunakan `Hash::make` dan validasi password kuat.
- CSRF protection aktif untuk route web, dengan pengecualian khusus webhook Midtrans.
- Validasi input pada controller dan penggunaan Eloquent/query builder untuk menekan risiko SQL Injection.
- Output React melakukan escaping teks secara default untuk menekan risiko XSS.
- Security headers dan Content Security Policy diterapkan melalui middleware.
- Session terenkripsi secara default dan secure cookie aktif otomatis pada environment production.
- Audit log untuk aktivitas mutasi pengguna.
- Error log dengan severity dan notifikasi admin.
- Stock deduction memakai transaksi database dan row lock untuk mencegah race condition.
- Webhook Midtrans divalidasi signature dan diproses melalui queue job.

## Matriks Risiko

| Risiko | Dampak | Kemungkinan | Level | Mitigasi |
| --- | --- | --- | --- | --- |
| Credential stuffing atau password lemah | Akun diambil alih | Sedang | Tinggi | Password kuat, hashing, validasi login, session regeneration |
| Akses role tidak sah | Data/fitur dibuka oleh role salah | Sedang | Tinggi | Middleware `auth`, `verified`, dan `role` per modul |
| SQL Injection | Kebocoran/manipulasi data | Rendah | Tinggi | Eloquent/query builder, validasi request, hindari raw SQL tidak tervalidasi |
| XSS dari input pengguna | Session hijack/tampilan berbahaya | Sedang | Tinggi | React escaping, validasi input, CSP, pembatasan upload |
| CSRF transaksi | Aksi dilakukan tanpa izin user | Rendah | Tinggi | CSRF Laravel aktif, webhook Midtrans hanya lewat signature |
| Upload file berbahaya | Eksekusi/penyimpanan file tidak aman | Sedang | Tinggi | Validasi `image`, `mimes`, batas ukuran, penyimpanan ke disk terkontrol |
| Manipulasi callback pembayaran | Pesanan dianggap dibayar palsu | Sedang | Kritis | Validasi signature, order id, status code, gross amount, dan status transaksi |
| Race condition stok | Stok minus/double deduction | Sedang | Tinggi | DB transaction dan `lockForUpdate` pada batch stok |
| Session tidak habis otomatis | Akun tetap terbuka di perangkat umum | Sedang | Sedang | `SESSION_LIFETIME`, session encrypted, auto logout warning di UI |
| Error aplikasi tidak terpantau | Gangguan tidak diketahui admin | Sedang | Sedang | Error log, severity, notifikasi admin |
| Aktivitas user tidak terlacak | Sulit investigasi insiden | Sedang | Sedang | Audit middleware untuk POST/PUT/PATCH/DELETE dan login/logout |
| Import/report besar mengganggu UI | UI lambat atau timeout | Sedang | Sedang | Queue job untuk import obat dan generate PDF besar |

## Catatan Operasional Production

- Jalankan queue worker: `php artisan queue:listen --tries=1 --timeout=0` atau supervisor setara.
- Set `APP_ENV=production`, `APP_DEBUG=false`, `SESSION_SECURE_COOKIE=true`, dan `SESSION_ENCRYPT=true`.
- Gunakan HTTPS agar HSTS dan secure cookie efektif.
- Konfigurasikan mail driver agar notifikasi email terkirim.
- Konfigurasikan broadcast driver bila ingin WebSocket real-time penuh; sistem sudah menyediakan event backend dan fallback polling.
- Rotasi key Midtrans dan pastikan `MIDTRANS_SERVER_KEY` tidak berisi client key.
- Review audit log dan error log secara berkala.

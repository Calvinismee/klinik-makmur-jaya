# Fitur yang Telah Diimplementasikan
Sistem E-Commerce & Manajemen Apotek "Klinik Makmur Jaya"

## 1. Manajemen Hak Akses (Role-Based Access Control)
Sistem memiliki 4 peran (role) pengguna utama:
- **Admin**: Mengelola seluruh master data, memantau semua pesanan, dan melihat log sistem.
- **Apoteker**: Mengelola inventori (stok, batch, riwayat) dan memverifikasi resep dokter dari pesanan online.
- **Kasir**: Melayani transaksi Point of Sale (POS) offline dan memproses pesanan serta pembayaran online.
- **Pasien (Pelanggan)**: Menjelajahi katalog obat, memasukkan pesanan ke keranjang, mengunggah resep, dan melacak riwayat pesanan.

## 2. Modul Pasien (Pelanggan)
- **Katalog Obat**: 
  - Menampilkan daftar obat beserta sisa stok secara *real-time*.
  - Detail obat menunjukkan informasi penting seperti kebutuhan resep dokter.
- **Keranjang Belanja (Cart)**:
  - Pelanggan dapat menambahkan obat ke keranjang.
  - Sistem memberi tanda khusus jika ada obat di dalam keranjang yang membutuhkan resep.
- **Checkout & Pembayaran**:
  - Pelanggan dapat mengunggah (upload) gambar resep dokter apabila ada obat yang memerlukannya.
  - Antarmuka (UI) dalam bahasa Indonesia yang bersih dan rapi.
- **Riwayat Pesanan**:
  - Melacak status pesanan secara mandiri (Menunggu Pembayaran, Diproses, Selesai, Dibatalkan).

## 3. Modul Apoteker
- **Manajemen Inventori**:
  - **Stok & Batch**: Mengontrol masuk dan keluarnya obat per batch (tanggal kedaluwarsa).
  - **Riwayat Stok (Stock Movements)**: Melacak semua pergerakan (penambahan/pengurangan) stok secara mendetail.
- **Verifikasi Resep**:
  - Menampilkan daftar antrean pesanan yang harus diverifikasi resepnya.
  - Apoteker dapat melihat gambar resep yang diunggah pelanggan, lalu **Menyetujui** atau **Menolak** (dengan alasan).
- **Riwayat Verifikasi**:
  - Halaman khusus untuk melihat kembali riwayat resep yang sudah disetujui ataupun ditolak.

## 4. Modul Kasir
- **Pembayaran Offline (POS)**:
  - Sistem Point of Sale khusus untuk pembelian langsung di klinik/apotek.
- **Pembayaran Online & Pemrosesan Pesanan**:
  - Mengelola semua pesanan online yang masuk dari Pelanggan.
  - **Ubah Status**: Menandai pesanan menjadi "Sudah Dibayar".
  - **Proses Pesanan**: Mengurangi stok secara otomatis saat Kasir mulai menyiapkan (packing) barang.
  - **Selesaikan Pesanan**: Menandai pesanan telah selesai dikemas/diambil.
  - **Batal**: Membatalkan pesanan jika transaksi tidak valid/gagal.
  - Tampilan ringkas dengan penggabungan status pesanan (Belum Dibayar, Sudah Dibayar, Diproses, Selesai).

## 5. Modul Admin (Master Data & Sistem)
- **Dashboard**: Menampilkan metrik dan ringkasan stok.
- **Master Data**:
  - Kategori Obat
  - Supplier Obat
  - Data Obat (termasuk *flag* penanda "Butuh Resep")
  - Pengguna Aplikasi (Karyawan & Pelanggan)
- **Transaksi**:
  - Memantau "Semua Pesanan" (transparansi data pesanan).
- **Log Sistem**:
  - **Audit Logs**: Melacak perubahan data krusial di dalam sistem.
  - **Error Logs**: Memantau jika terjadi masalah/kendala pada sistem.

## 6. Integrasi & UI/UX
- Teknologi *Fullstack*: **Laravel** (Backend) + **React / Inertia.js** (Frontend).
- Tampilan desain responsif dan menggunakan *Tailwind CSS*.
- Navigasi Sidebar (AppLayout) yang membedakan menu secara dinamis sesuai Role yang sedang *login*.
- Translasi UI lengkap ke Bahasa Indonesia demi kemudahan pemakaian staf Klinik.

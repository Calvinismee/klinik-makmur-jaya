const fs = require('fs');
const path = require('path');

const translations = {
    "Dashboard Summary": "Ringkasan Dashboard",
    "Today's Sales": "Penjualan Hari Ini",
    "This Month's Sales": "Penjualan Bulan Ini",
    "Pending Orders": "Pesanan Tertunda",
    "Completed Orders": "Pesanan Selesai",
    "Top Selling Medicines": "Obat Paling Laris",
    "Medicine Name": "Nama Obat",
    "Total Sold": "Total Terjual",
    "Low Stock Alerts": "Peringatan Stok Menipis",
    "Remaining Stock": "Sisa Stok",
    "All stocks are sufficient.": "Semua stok mencukupi.",
    "Batches Expiring Soon (Next 30 Days)": "Batch Segera Kedaluwarsa (30 Hari Ke Depan)",
    "Batch Number": "Nomor Batch",
    "Remaining Qty": "Sisa Kuantitas",
    "Expired At": "Kedaluwarsa Pada",
    "(EXPIRED)": "(KEDALUWARSA)",
    "No batches are expiring soon.": "Tidak ada batch yang segera kedaluwarsa.",
    "Sales Chart (Last 7 Days)": "Grafik Penjualan (7 Hari Terakhir)",
    "Manage Online Orders": "Kelola Pesanan Online",
    "Process Order": "Proses Pesanan",
    "Complete Order": "Selesaikan Pesanan",
    "Process this order? Stock will be deducted automatically.": "Proses pesanan ini? Stok akan otomatis dipotong.",
    "Mark this order as completed?": "Tandai pesanan ini sebagai selesai?",
    "Cancel this order?": "Batalkan pesanan ini?",
    "No orders found.": "Pesanan tidak ditemukan.",
    "Customer": "Pelanggan",
    "Total": "Total",
    "Status": "Status",
    "Actions": "Aksi",
    "Category": "Kategori",
    "Price": "Harga",
    "Requires Prescription": "Butuh Resep",
    "Stock": "Stok",
    "Active": "Aktif",
    "Search...": "Cari...",
    "Add Medicine": "Tambah Obat",
    "Code": "Kode",
    "Description": "Deskripsi",
    "Add to Cart": "Tambah ke Keranjang",
    "Manage Users": "Kelola Pengguna",
    "Add User": "Tambah Pengguna",
    "Name": "Nama",
    "Email": "Email",
    "Role": "Peran",
    "Manage Medicines": "Kelola Obat",
    "Manage Categories": "Kelola Kategori",
    "Add Category": "Tambah Kategori",
    "Manage Suppliers": "Kelola Supplier",
    "Add Supplier": "Tambah Supplier",
    "Phone": "Telepon",
    "Address": "Alamat",
    "Contact Person": "Kontak Person",
    "Yes": "Ya",
    "No": "Tidak",
    "Cancel": "Batal",
    "Save": "Simpan",
    "Edit": "Edit",
    "Delete": "Hapus",
    "Delete?": "Hapus?",
    "Are you sure you want to delete this item?": "Apakah Anda yakin ingin menghapus item ini?",
    "Order": "Pesanan",
    "Date": "Tanggal",
    "Notes": "Catatan",
    "Subtotal": "Subtotal",
    "Checkout": "Checkout",
    "Shopping Cart": "Keranjang Belanja",
    "Your cart is empty.": "Keranjang Anda kosong.",
    "Continue Shopping": "Lanjut Belanja",
    "Medicine": "Obat",
    "Qty": "Kuantitas",
    "Remove": "Hapus",
    "Prescription verification required for some items.": "Verifikasi resep diperlukan untuk beberapa item.",
    "Upload Prescription": "Unggah Resep",
    "Submit Order": "Buat Pesanan",
    "Order Details": "Detail Pesanan",
    "Back to Orders": "Kembali ke Pesanan",
    "Order #": "Pesanan #",
    "Placed on": "Dipesan pada",
    "Payment Status": "Status Pembayaran",
    "Prescription Status": "Status Resep",
    "Items": "Item",
    "Waiting for prescription verification": "Menunggu verifikasi resep",
    "Waiting for payment": "Menunggu pembayaran",
    "Processing": "Sedang Diproses",
    "Completed": "Selesai",
    "Cancelled": "Dibatalkan",
    "Paid": "Sudah Dibayar",
    "Unpaid": "Belum Dibayar",
    "Pending": "Tertunda",
    "Approved": "Disetujui",
    "Rejected": "Ditolak",
    "Medicine Catalog": "Katalog Obat",
    "View Details": "Lihat Detail",
    "Point of Sale": "Point of Sale",
    "Cart": "Keranjang",
    "Payment": "Pembayaran",
    "Pay": "Bayar",
    "Amount Received": "Jumlah Diterima",
    "Change": "Kembalian",
    "Complete Transaction": "Selesaikan Transaksi",
    "No products added.": "Belum ada produk yang ditambahkan.",
    "Manage Payments": "Kelola Pembayaran",
    "Process Payment": "Proses Pembayaran",
    "No pending payments.": "Tidak ada pembayaran tertunda.",
    "Prescription Verification": "Verifikasi Resep",
    "Verify Prescription": "Verifikasi Resep",
    "Approve": "Setujui",
    "Reject": "Tolak",
    "Reason for rejection": "Alasan penolakan",
    "Verify": "Verifikasi",
    "Stok & Batch": "Stok & Batch",
    "Riwayat Stok": "Riwayat Stok",
    "Stock Movements": "Riwayat Pergerakan Stok",
    "Movement Type": "Tipe Pergerakan",
    "Reference": "Referensi",
    "User": "Pengguna",
    "In": "Masuk",
    "Out": "Keluar"
};

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('resources/js/pages', (filePath) => {
    if (filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        for (const [eng, ind] of Object.entries(translations)) {
            const regex = new RegExp(`(?<![a-zA-Z0-9_])${eng}(?![a-zA-Z0-9_])`, 'g');
            if (content.match(regex)) {
                content = content.replace(regex, ind);
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Translated strings in: ${filePath}`);
        }
    }
});

<?php

function getDirContents($dir, &$results = array()) {
    $files = scandir($dir);
    foreach ($files as $key => $value) {
        $path = realpath($dir . DIRECTORY_SEPARATOR . $value);
        if (!is_dir($path)) {
            if (pathinfo($path, PATHINFO_EXTENSION) === 'tsx') {
                $results[] = $path;
            }
        } else if ($value != "." && $value != "..") {
            getDirContents($path, $results);
        }
    }
    return $results;
}

$files = getDirContents(__DIR__ . '/resources/js/pages');

$translations = [
    "Tidak Image" => "Tidak Ada Gambar",
    "Tidak medicines found." => "Tidak ada obat yang ditemukan.",
    "Keranjang is empty" => "Keranjang kosong",
    "Stok limited!" => "Stok terbatas!",
    "Process Pembayaran" => "Proses Pembayaran",
    "Keluar of Stok" => "Stok Habis",
    "Current Pesanan" => "Pesanan Saat Ini",
    "All Categories" => "Semua Kategori",
    "Search medicine by name or code..." => "Cari obat berdasarkan nama atau kode...",
    "Search medicines..." => "Cari obat...",
    "units" => "unit",
    "Welcome to the cashier panel. You can process offline sales and view transactions here." => "Selamat datang di panel kasir. Anda dapat memproses penjualan offline dan melihat transaksi di sini.",
    "Orders to Process" => "Pesanan untuk Diproses",
    "Process this transaction?" => "Proses transaksi ini?",
    "Pesanan notes (optional)" => "Catatan pesanan (opsional)",
    "Image" => "Gambar",
    "No orders found" => "Tidak ada pesanan ditemukan",
    "Belum ada Pesanan" => "Belum ada pesanan",
    "Tidak ada Pesanan" => "Tidak ada pesanan",
    "Search by name or email..." => "Cari berdasarkan nama atau email...",
    "Search by name..." => "Cari berdasarkan nama...",
    "Select Role" => "Pilih Peran",
    "Select Category" => "Pilih Kategori",
    "Select Supplier" => "Pilih Supplier",
    "Verify this prescription?" => "Verifikasi resep ini?",
    "All stocks are sufficient." => "Semua stok mencukupi.",
    "Batches Expiring Soon" => "Batch Segera Kedaluwarsa",
    "Tidak ada pesanan." => "Tidak ada pesanan yang ditemukan."
];

foreach ($files as $file) {
    $content = file_get_contents($file);
    $modified = false;
    
    foreach ($translations as $eng => $ind) {
        if (strpos($content, $eng) !== false) {
            $content = str_replace($eng, $ind, $content);
            $modified = true;
        }
    }
    
    if ($modified) {
        file_put_contents($file, $content);
        echo "Translated in: " . basename($file) . "\n";
    }
}

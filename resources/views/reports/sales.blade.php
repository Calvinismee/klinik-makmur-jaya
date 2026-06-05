<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Penjualan Klinik Makmur Jaya</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; color: #111827; font-size: 12px; margin: 0; }
        .header { background: #0f172a; color: white; padding: 22px 26px; }
        .logo { float: left; width: 42px; height: 42px; border-radius: 8px; background: #06b6d4; color: white; font-size: 24px; font-weight: 700; text-align: center; line-height: 42px; margin-right: 12px; }
        .brand { font-size: 22px; font-weight: 700; padding-top: 2px; }
        .subtitle { color: #cbd5e1; margin-top: 4px; }
        .section { padding: 20px 26px 0; }
        .summary { width: 100%; border-collapse: collapse; margin-top: 12px; }
        .summary td { width: 25%; padding: 14px; border: 1px solid #dbe4f0; }
        .label { color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 700; }
        .value { margin-top: 6px; font-size: 18px; font-weight: 700; }
        .chart { margin-top: 14px; padding: 14px; border: 1px solid #dbe4f0; }
        .bar-row { margin-bottom: 8px; clear: both; height: 20px; }
        .bar-label { float: left; width: 84px; color: #475569; font-size: 10px; line-height: 18px; }
        .bar-track { float: left; width: 520px; height: 18px; background: #eff6ff; border: 1px solid #bfdbfe; }
        .bar-fill { height: 18px; background: #2563eb; }
        .bar-value { float: left; margin-left: 8px; font-size: 10px; line-height: 18px; color: #334155; }
        table.orders { width: 100%; border-collapse: collapse; margin-top: 12px; }
        table.orders th { background: #e0f2fe; color: #0f172a; text-align: left; padding: 9px; font-size: 10px; text-transform: uppercase; }
        table.orders td { border-bottom: 1px solid #e5e7eb; padding: 8px 9px; }
        .badge { display: inline-block; padding: 3px 7px; border-radius: 10px; font-size: 10px; font-weight: 700; }
        .online { background: #dbeafe; color: #1d4ed8; }
        .offline { background: #dcfce7; color: #047857; }
        .paid { color: #047857; font-weight: 700; }
        .footer { padding: 12px 26px; color: #64748b; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">K</div>
        <div class="brand">Klinik Makmur Jaya</div>
        <div class="subtitle">Laporan Penjualan - dibuat pada {{ $generatedAt->format('d M Y H:i') }}</div>
        <div style="clear: both;"></div>
    </div>

    <div class="section">
        <table class="summary">
            <tr>
                <td>
                    <div class="label">Total Pendapatan</div>
                    <div class="value">Rp {{ number_format($summary['total_sales'], 0, ',', '.') }}</div>
                </td>
                <td>
                    <div class="label">Total Transaksi</div>
                    <div class="value">{{ number_format($summary['total_orders'], 0, ',', '.') }}</div>
                </td>
                <td>
                    <div class="label">Online</div>
                    <div class="value">{{ number_format($summary['online_orders'], 0, ',', '.') }}</div>
                </td>
                <td>
                    <div class="label">Offline</div>
                    <div class="value">{{ number_format($summary['offline_orders'], 0, ',', '.') }}</div>
                </td>
            </tr>
        </table>

        <div class="chart">
            <strong>Grafik Pendapatan Harian</strong>
            @forelse ($dailySales as $day)
                <div class="bar-row">
                    <div class="bar-label">{{ \Carbon\Carbon::parse($day['date'])->format('d M') }}</div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: {{ max(4, ($day['total'] / $maxDailySales) * 100) }}%;"></div>
                    </div>
                    <div class="bar-value">Rp {{ number_format($day['total'], 0, ',', '.') }} / {{ $day['transactions'] }} trx</div>
                </div>
            @empty
                <p>Belum ada transaksi berbayar.</p>
            @endforelse
        </div>

        <table class="orders">
            <thead>
                <tr>
                    <th>No Pesanan</th>
                    <th>Tanggal</th>
                    <th>Jenis</th>
                    <th>Pelanggan</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Pembayaran</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($orders as $order)
                    @php($isOffline = str_starts_with($order->order_number, 'POS-'))
                    <tr>
                        <td>#{{ $order->order_number }}</td>
                        <td>{{ $order->created_at->format('d M Y') }}</td>
                        <td><span class="badge {{ $isOffline ? 'offline' : 'online' }}">{{ $isOffline ? 'Offline' : 'Online' }}</span></td>
                        <td>{{ $isOffline ? 'Pelanggan Offline' : ($order->user?->name ?? '-') }}</td>
                        <td>Rp {{ number_format($order->total_amount, 0, ',', '.') }}</td>
                        <td>{{ str_replace('_', ' ', $order->order_status) }}</td>
                        <td class="paid">{{ strtoupper($order->payment_status) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7">Tidak ada data transaksi.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="footer">
        Dokumen ini dibuat otomatis oleh Sistem E-Commerce Obat Klinik Makmur Jaya.
    </div>
</body>
</html>

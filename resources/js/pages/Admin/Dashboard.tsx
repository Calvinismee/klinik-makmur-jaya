import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';

type ChartPeriod = 'daily' | 'weekly' | 'monthly';

type SalesChartDatum = {
    date: string;
    label: string;
    total: number;
    transactions: number;
    offlineTotal: number;
    offlineTransactions: number;
    onlineTotal: number;
    onlineTransactions: number;
};

type StockChartDatum = {
    id: number;
    label: string;
    code: string;
    stock: number;
    minimumStock: number;
};

export default function AdminDashboard({
    stats,
    topMedicines,
    expiringBatches,
    allMedicinesStock,
    chart,
}: any) {
    const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('daily');
    const formatCurrency = (value: number) =>
        `Rp ${Number(value).toLocaleString('id-ID')}`;
    const formatShortCurrency = (value: number) => {
        if (value >= 1000000) {
            return `Rp ${(value / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
        }

        if (value >= 1000) {
            return `Rp ${(value / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} rb`;
        }

        return formatCurrency(value);
    };

    const normalizeSalesData = (
        items: any[] = [],
        labels: string[] = [],
    ): SalesChartDatum[] =>
        items.map((item: any, idx: number) => {
            if (typeof item === 'number') {
                return {
                    date: labels?.[idx] || '',
                    label: labels?.[idx] || '',
                    total: Number(item),
                    transactions: Number(item) > 0 ? 1 : 0,
                    offlineTotal: 0,
                    offlineTransactions: 0,
                    onlineTotal: Number(item),
                    onlineTransactions: Number(item) > 0 ? 1 : 0,
                };
            }

            return {
                date: item.date,
                label: item.label,
                total: Number(item.total || 0),
                transactions: Number(item.transactions || 0),
                offlineTotal: Number(item.offlineTotal || 0),
                offlineTransactions: Number(item.offlineTransactions || 0),
                onlineTotal: Number(item.onlineTotal || 0),
                onlineTransactions: Number(item.onlineTransactions || 0),
            };
        });

    const periodOptions: {
        key: ChartPeriod;
        label: string;
        description: string;
    }[] = [
        {
            key: 'daily',
            label: 'Harian',
            description: 'Ringkasan penjualan per hari',
        },
        {
            key: 'weekly',
            label: 'Mingguan',
            description: 'Ringkasan penjualan per minggu',
        },
        {
            key: 'monthly',
            label: 'Bulanan',
            description: 'Ringkasan penjualan per bulan',
        },
    ];
    const selectedPeriodMeta =
        periodOptions.find((period) => period.key === selectedPeriod) ||
        periodOptions[0];
    const periodData =
        chart?.periods?.[selectedPeriod] ||
        (selectedPeriod === 'daily' ? chart?.data : []);
    const salesChartData = normalizeSalesData(
        periodData || [],
        chart?.labels || [],
    );
    const stockChartData: StockChartDatum[] = chart?.stock?.items || [];
    const stockSummary = chart?.stock?.summary || {};
    const maxSales = Math.max(...salesChartData.map((item) => item.total), 0);
    const totalPeriodSales = salesChartData.reduce(
        (sum, item) => sum + item.total,
        0,
    );
    const totalPeriodTransactions = salesChartData.reduce(
        (sum, item) => sum + item.transactions,
        0,
    );
    const averageTransaction =
        totalPeriodTransactions > 0
            ? totalPeriodSales / totalPeriodTransactions
            : 0;
    const currentPeriodData = salesChartData[salesChartData.length - 1];
    const bestSalesPeriod = salesChartData.reduce<SalesChartDatum | null>(
        (best, item) => {
            if (!best || item.total > best.total) {
                return item;
            }

            return best;
        },
        null,
    );
    const chartHeight = 168;
    const getSegmentHeight = (value: number) => {
        if (!value || maxSales <= 0) {
            return 0;
        }

        return Math.max(6, (value / maxSales) * chartHeight);
    };
    const maxStock = Math.max(
        ...stockChartData.map((item) =>
            Math.max(item.stock, item.minimumStock),
        ),
        1,
    );
    const dashboardCharts = (
        <div className="mb-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h2 className="text-lg font-bold">
                            Grafik Penjualan & Pendapatan
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {selectedPeriodMeta.description}. Arahkan kursor ke
                            bar untuk detail.
                        </p>
                    </div>
                    <div className="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-1 text-sm font-semibold lg:w-auto">
                        {periodOptions.map((period) => (
                            <button
                                key={period.key}
                                type="button"
                                onClick={() => setSelectedPeriod(period.key)}
                                className={`flex-1 rounded-md px-3 py-1.5 transition active:scale-[0.98] lg:flex-none ${
                                    selectedPeriod === period.key
                                        ? 'bg-white text-cyan-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 border-y border-gray-200 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-gray-200">
                    <div className="py-4 lg:pr-5">
                        <div className="text-xs font-semibold text-gray-500 uppercase">
                            Pendapatan {selectedPeriodMeta.label}
                        </div>
                        <div className="mt-1 text-xl font-bold text-gray-900">
                            {formatCurrency(totalPeriodSales)}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                            {totalPeriodTransactions} transaksi
                        </div>
                    </div>
                    <div className="border-t border-gray-200 py-4 sm:border-t-0 sm:pl-5 lg:px-5">
                        <div className="text-xs font-semibold text-gray-500 uppercase">
                            Periode Terbaik
                        </div>
                        <div className="mt-1 text-xl font-bold text-gray-900">
                            {bestSalesPeriod && bestSalesPeriod.total > 0
                                ? bestSalesPeriod.label
                                : '-'}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                            {bestSalesPeriod && bestSalesPeriod.total > 0
                                ? formatCurrency(bestSalesPeriod.total)
                                : 'Belum ada penjualan'}
                        </div>
                    </div>
                    <div className="border-t border-gray-200 py-4 sm:pr-5 lg:border-t-0 lg:px-5">
                        <div className="text-xs font-semibold text-gray-500 uppercase">
                            Periode Terakhir
                        </div>
                        <div className="mt-1 text-xl font-bold text-gray-900">
                            {formatCurrency(currentPeriodData?.total || 0)}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                            {currentPeriodData?.transactions || 0} transaksi
                        </div>
                    </div>
                    <div className="border-t border-gray-200 py-4 sm:border-t-0 sm:pl-5 lg:pl-5">
                        <div className="text-xs font-semibold text-gray-500 uppercase">
                            Rata-rata Transaksi
                        </div>
                        <div className="mt-1 text-xl font-bold text-gray-900">
                            {formatCurrency(averageTransaction)}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                            Nilai rata-rata order
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-gray-600">
                    <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm bg-emerald-500"></span>
                        Offline
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm bg-cyan-500"></span>
                        Online
                    </span>
                </div>

                <div className="mt-5 overflow-x-auto">
                    <div className="min-w-[760px]">
                        <div className="relative h-80 border-b border-l border-gray-200 pl-20">
                            <div className="absolute inset-y-0 right-0 left-0 flex flex-col justify-between pt-8 pb-14">
                                {[maxSales, maxSales / 2, 0].map(
                                    (value, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3"
                                        >
                                            <span className="w-16 shrink-0 text-right text-[11px] font-medium whitespace-nowrap text-gray-500">
                                                {maxSales > 0
                                                    ? formatShortCurrency(value)
                                                    : 'Rp 0'}
                                            </span>
                                            <span className="h-px flex-1 bg-gray-100"></span>
                                        </div>
                                    ),
                                )}
                            </div>

                            <div className="relative z-10 flex h-full items-end gap-4 px-4 pt-8 pb-14">
                                {salesChartData.map((day, idx) => {
                                    const onlineHeight = getSegmentHeight(
                                        day.onlineTotal,
                                    );
                                    const offlineHeight = getSegmentHeight(
                                        day.offlineTotal,
                                    );

                                    return (
                                        <div
                                            key={`${day.date}-${idx}`}
                                            className="group relative flex min-w-[78px] flex-1 flex-col items-center justify-end"
                                        >
                                            <div className="pointer-events-none absolute top-4 left-1/2 z-20 hidden w-64 -translate-x-1/2 rounded-md bg-gray-900 p-3 text-xs text-white shadow-lg group-hover:block">
                                                <div className="flex items-center justify-between gap-4 font-semibold">
                                                    <span>{day.label}</span>
                                                    <span>
                                                        {day.transactions}{' '}
                                                        transaksi
                                                    </span>
                                                </div>
                                                <div className="mt-2 space-y-1 text-gray-200">
                                                    <div className="flex justify-between gap-4">
                                                        <span>Total</span>
                                                        <span className="font-semibold text-white">
                                                            {formatCurrency(
                                                                day.total,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span>
                                                            Offline (
                                                            {
                                                                day.offlineTransactions
                                                            }
                                                            )
                                                        </span>
                                                        <span>
                                                            {formatCurrency(
                                                                day.offlineTotal,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span>
                                                            Online (
                                                            {
                                                                day.onlineTransactions
                                                            }
                                                            )
                                                        </span>
                                                        <span>
                                                            {formatCurrency(
                                                                day.onlineTotal,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex h-[168px] w-12 flex-col justify-end overflow-hidden rounded-t-md bg-gray-100 ring-1 ring-gray-200 transition group-hover:ring-cyan-300">
                                                {day.total === 0 && (
                                                    <div className="h-px bg-gray-300"></div>
                                                )}
                                                {day.offlineTotal > 0 && (
                                                    <div
                                                        className="bg-emerald-500 transition-colors group-hover:bg-emerald-600"
                                                        style={{
                                                            height: `${offlineHeight}px`,
                                                        }}
                                                    ></div>
                                                )}
                                                {day.onlineTotal > 0 && (
                                                    <div
                                                        className="bg-cyan-500 transition-colors group-hover:bg-cyan-600"
                                                        style={{
                                                            height: `${onlineHeight}px`,
                                                        }}
                                                    ></div>
                                                )}
                                            </div>
                                            <div className="mt-2 max-w-[92px] text-center text-xs font-medium text-gray-600">
                                                {day.label}
                                            </div>
                                            <div className="text-center text-[11px] text-gray-400">
                                                {day.transactions} trx
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {maxSales === 0 && (
                            <div className="mt-4 rounded-md border border-dashed border-gray-300 py-4 text-center text-sm text-gray-500">
                                Belum ada penjualan berbayar pada periode ini.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold">Chart Stok Obat</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Obat dengan stok terendah dibanding threshold.
                        </p>
                    </div>
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                        {stockSummary.critical || 0} kritis
                    </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 border-y border-gray-200 py-4 text-center">
                    <div>
                        <div className="text-lg font-bold text-gray-900">
                            {stockSummary.totalMedicines || 0}
                        </div>
                        <div className="mt-1 text-[11px] font-semibold text-gray-500 uppercase">
                            Jenis Obat
                        </div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-gray-900">
                            {stockSummary.totalUnits || 0}
                        </div>
                        <div className="mt-1 text-[11px] font-semibold text-gray-500 uppercase">
                            Total Unit
                        </div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-gray-900">
                            {stockSummary.empty || 0}
                        </div>
                        <div className="mt-1 text-[11px] font-semibold text-gray-500 uppercase">
                            Stok 0
                        </div>
                    </div>
                </div>

                <div className="mt-5 space-y-4">
                    {stockChartData.map((item) => {
                        const stockPercent = Math.max(
                            2,
                            Math.min(100, (item.stock / maxStock) * 100),
                        );
                        const thresholdPercent = Math.min(
                            100,
                            (item.minimumStock / maxStock) * 100,
                        );
                        const isCritical = item.stock < item.minimumStock;

                        return (
                            <div key={item.id} className="group">
                                <div className="mb-1 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-gray-900">
                                            {item.label}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {item.code}
                                        </div>
                                    </div>
                                    <div
                                        className={`text-sm font-bold ${isCritical ? 'text-red-600' : 'text-emerald-600'}`}
                                    >
                                        {item.stock}
                                    </div>
                                </div>
                                <div className="relative h-3 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className={`h-full rounded-full transition-all ${isCritical ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${stockPercent}%` }}
                                    ></div>
                                    <div
                                        className="absolute top-0 h-full w-0.5 bg-gray-700/60"
                                        style={{ left: `${thresholdPercent}%` }}
                                        title={`Minimum ${item.minimumStock}`}
                                    ></div>
                                </div>
                                <div className="mt-1 flex justify-between text-[11px] text-gray-400">
                                    <span>Minimum {item.minimumStock}</span>
                                    <span>
                                        {isCritical
                                            ? 'Di bawah minimum'
                                            : 'Aman'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {stockChartData.length === 0 && (
                        <div className="rounded-md border border-dashed border-gray-300 py-8 text-center text-sm text-gray-500">
                            Belum ada data stok obat.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout title="Admin Dashboard">
            <h1 className="mb-6 text-2xl font-bold">Dashboard Admin</h1>

            {dashboardCharts}

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border-l-4 border-blue-500 bg-white p-6 shadow-sm">
                    <div className="mb-1 text-sm font-semibold text-gray-500 uppercase">
                        Penjualan Hari Ini
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                        Rp {Number(stats.todaySales).toLocaleString('id-ID')}
                    </div>
                </div>
                <div className="rounded-lg border-l-4 border-green-500 bg-white p-6 shadow-sm">
                    <div className="mb-1 text-sm font-semibold text-gray-500 uppercase">
                        Penjualan Bulan Ini
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                        Rp {Number(stats.monthSales).toLocaleString('id-ID')}
                    </div>
                </div>
                <div className="rounded-lg border-l-4 border-yellow-500 bg-white p-6 shadow-sm">
                    <div className="mb-1 text-sm font-semibold text-gray-500 uppercase">
                        Pesanan Tertunda
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                        {stats.pendingOrders}
                    </div>
                </div>
                <div className="rounded-lg border-l-4 border-purple-500 bg-white p-6 shadow-sm">
                    <div className="mb-1 text-sm font-semibold text-gray-500 uppercase">
                        Pesanan Selesai
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                        {stats.completedOrders}
                    </div>
                </div>
            </div>

            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold">Obat Paling Laris</h2>
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="pb-2 text-sm font-semibold text-gray-600">
                                Nama Obat
                            </th>
                            <th className="pb-2 text-right text-sm font-semibold text-gray-600">
                                Total Terjual
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {topMedicines.map((item: any, i: number) => (
                            <tr key={i} className="border-b last:border-0">
                                <td className="py-3 text-sm">{item.name}</td>
                                <td className="py-3 text-right text-sm font-bold">
                                    {item.total_sold} unit
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-yellow-600">
                    Batch Segera Kedaluwarsa (30 Hari Ke Depan)
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-3 text-sm font-semibold text-gray-600">
                                    Obat
                                </th>
                                <th className="p-3 text-sm font-semibold text-gray-600">
                                    Nomor Batch
                                </th>
                                <th className="p-3 text-sm font-semibold text-gray-600">
                                    Sisa Kuantitas
                                </th>
                                <th className="p-3 text-sm font-semibold text-gray-600">
                                    Kedaluwarsa Pada
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {expiringBatches.map((batch: any) => {
                                const isExpired =
                                    new Date(batch.expired_at) < new Date();
                                return (
                                    <tr
                                        key={batch.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="p-3 text-sm font-medium">
                                            {batch.medicine?.name}
                                        </td>
                                        <td className="p-3 text-sm">
                                            {batch.batch_number}
                                        </td>
                                        <td className="p-3 text-sm font-bold">
                                            {batch.remaining_quantity}
                                        </td>
                                        <td className="p-3 text-sm">
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-bold ${isExpired ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                                            >
                                                {new Date(
                                                    batch.expired_at,
                                                ).toLocaleDateString()}{' '}
                                                {isExpired
                                                    ? '(KEDALUWARSA)'
                                                    : ''}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {expiringBatches.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-4 text-center text-sm text-gray-500"
                                    >
                                        Tidak ada batch yang segera kedaluwarsa.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold">Stok Obat Terkini</h2>
                <div className="max-h-96 overflow-x-auto">
                    <table className="min-w-full border-collapse text-left">
                        <thead className="sticky top-0 bg-gray-50">
                            <tr>
                                <th className="border-b p-3 text-sm font-semibold text-gray-600">
                                    Kode Obat
                                </th>
                                <th className="border-b p-3 text-sm font-semibold text-gray-600">
                                    Nama Obat
                                </th>
                                <th className="border-b p-3 text-right text-sm font-semibold text-gray-600">
                                    Total Stok
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {allMedicinesStock?.map((item: any) => (
                                <tr
                                    key={item.id}
                                    className="border-b last:border-0 hover:bg-gray-50"
                                >
                                    <td className="p-3 text-sm font-medium text-gray-900">
                                        {item.code}
                                    </td>
                                    <td className="p-3 text-sm">{item.name}</td>
                                    <td className="p-3 text-right text-sm font-bold text-gray-700">
                                        {item.total_stock}
                                    </td>
                                </tr>
                            ))}
                            {(!allMedicinesStock ||
                                allMedicinesStock.length === 0) && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="py-4 text-center text-sm text-gray-500"
                                    >
                                        Tidak ada data obat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

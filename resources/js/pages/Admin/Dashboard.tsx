import AppLayout from '../../Layouts/AppLayout';

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

export default function AdminDashboard({ stats, topMedicines, lowStockMedicines, expiringBatches, allMedicinesStock, chart }: any) {
    const formatCurrency = (value: number) => `Rp ${Number(value).toLocaleString('id-ID')}`;
    const formatShortCurrency = (value: number) => {
        if (value >= 1000000) {
            return `Rp ${(value / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
        }

        if (value >= 1000) {
            return `Rp ${(value / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} rb`;
        }

        return formatCurrency(value);
    };

    const salesChartData: SalesChartDatum[] = (chart?.data || []).map((item: any, idx: number) => {
        if (typeof item === 'number') {
            return {
                date: chart?.labels?.[idx] || '',
                label: chart?.labels?.[idx] || '',
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

    const maxSales = Math.max(...salesChartData.map((item) => item.total), 0);
    const sevenDaySales = salesChartData.reduce((sum, item) => sum + item.total, 0);
    const sevenDayTransactions = salesChartData.reduce((sum, item) => sum + item.transactions, 0);
    const todayChartData = salesChartData[salesChartData.length - 1];
    const bestSalesDay = salesChartData.reduce<SalesChartDatum | null>((best, item) => {
        if (!best || item.total > best.total) {
            return item;
        }

        return best;
    }, null);
    const chartHeight = 176;
    const getSegmentHeight = (value: number) => {
        if (!value || maxSales <= 0) {
            return 0;
        }

        return Math.max(6, (value / maxSales) * chartHeight);
    };

    return (
        <AppLayout title="Admin Dashboard">
            <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                    <div className="text-gray-500 text-sm font-semibold uppercase mb-1">Penjualan Hari Ini</div>
                    <div className="text-2xl font-bold text-gray-800">Rp {Number(stats.todaySales).toLocaleString('id-ID')}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                    <div className="text-gray-500 text-sm font-semibold uppercase mb-1">Penjualan Bulan Ini</div>
                    <div className="text-2xl font-bold text-gray-800">Rp {Number(stats.monthSales).toLocaleString('id-ID')}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
                    <div className="text-gray-500 text-sm font-semibold uppercase mb-1">Pesanan Tertunda</div>
                    <div className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
                    <div className="text-gray-500 text-sm font-semibold uppercase mb-1">Pesanan Selesai</div>
                    <div className="text-2xl font-bold text-gray-800">{stats.completedOrders}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-4">Obat Paling Laris</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="pb-2 text-gray-600 font-semibold text-sm">Nama Obat</th>
                                <th className="pb-2 text-gray-600 font-semibold text-sm text-right">Total Terjual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topMedicines.map((item: any, i: number) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="py-3 text-sm">{item.name}</td>
                                    <td className="py-3 text-sm text-right font-bold">{item.total_sold} unit</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-4 text-red-600">Peringatan Stok Menipis</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="pb-2 text-gray-600 font-semibold text-sm">Nama Obat</th>
                                <th className="pb-2 text-gray-600 font-semibold text-sm text-right">Sisa Stok</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStockMedicines.map((item: any, i: number) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="py-3 text-sm">{item.name}</td>
                                    <td className="py-3 text-sm text-right font-bold text-red-600">{item.total_stock}</td>
                                </tr>
                            ))}
                            {lowStockMedicines.length === 0 && (
                                <tr>
                                    <td colSpan={2} className="py-4 text-center text-sm text-gray-500">Semua stok mencukupi.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-lg font-bold mb-4 text-yellow-600">Batch Segera Kedaluwarsa (30 Hari Ke Depan)</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-3 text-gray-600 font-semibold text-sm">Obat</th>
                                <th className="p-3 text-gray-600 font-semibold text-sm">Nomor Batch</th>
                                <th className="p-3 text-gray-600 font-semibold text-sm">Sisa Kuantitas</th>
                                <th className="p-3 text-gray-600 font-semibold text-sm">Kedaluwarsa Pada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expiringBatches.map((batch: any) => {
                                const isExpired = new Date(batch.expired_at) < new Date();
                                return (
                                    <tr key={batch.id} className="border-b last:border-0">
                                        <td className="p-3 text-sm font-medium">{batch.medicine?.name}</td>
                                        <td className="p-3 text-sm">{batch.batch_number}</td>
                                        <td className="p-3 text-sm font-bold">{batch.remaining_quantity}</td>
                                        <td className="p-3 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${isExpired ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {new Date(batch.expired_at).toLocaleDateString()} {isExpired ? '(KEDALUWARSA)' : ''}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {expiringBatches.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center text-sm text-gray-500">Tidak ada batch yang segera kedaluwarsa.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-lg font-bold mb-4">Stok Obat Terkini</h2>
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-50">
                            <tr>
                                <th className="p-3 text-gray-600 font-semibold text-sm border-b">Kode Obat</th>
                                <th className="p-3 text-gray-600 font-semibold text-sm border-b">Nama Obat</th>
                                <th className="p-3 text-gray-600 font-semibold text-sm text-right border-b">Total Stok</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allMedicinesStock?.map((item: any) => (
                                <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-3 text-sm font-medium text-gray-900">{item.code}</td>
                                    <td className="p-3 text-sm">{item.name}</td>
                                    <td className="p-3 text-sm text-right font-bold text-gray-700">{item.total_stock}</td>
                                </tr>
                            ))}
                            {(!allMedicinesStock || allMedicinesStock.length === 0) && (
                                <tr>
                                    <td colSpan={3} className="py-4 text-center text-sm text-gray-500">Tidak ada data obat.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h2 className="text-lg font-bold">Grafik Penjualan (7 Hari Terakhir)</h2>
                        <p className="mt-1 text-sm text-gray-500">Total penjualan, jumlah transaksi, dan jenis pembelian per hari.</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-600">
                        <span className="inline-flex items-center gap-2">
                            <span className="h-3 w-3 rounded-sm bg-emerald-500"></span>
                            Offline
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <span className="h-3 w-3 rounded-sm bg-blue-500"></span>
                            Online
                        </span>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 border-y border-gray-200 md:grid-cols-3 md:divide-x md:divide-gray-200">
                    <div className="py-4 md:pr-5">
                        <div className="text-xs font-semibold uppercase text-gray-500">Total 7 Hari</div>
                        <div className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(sevenDaySales)}</div>
                        <div className="mt-1 text-sm text-gray-500">{sevenDayTransactions} transaksi</div>
                    </div>
                    <div className="border-t border-gray-200 py-4 md:border-t-0 md:px-5">
                        <div className="text-xs font-semibold uppercase text-gray-500">Hari Terbaik</div>
                        <div className="mt-1 text-xl font-bold text-gray-900">
                            {bestSalesDay && bestSalesDay.total > 0 ? bestSalesDay.label : '-'}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                            {bestSalesDay && bestSalesDay.total > 0 ? formatCurrency(bestSalesDay.total) : 'Belum ada penjualan'}
                        </div>
                    </div>
                    <div className="border-t border-gray-200 py-4 md:border-t-0 md:pl-5">
                        <div className="text-xs font-semibold uppercase text-gray-500">Hari Ini</div>
                        <div className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(todayChartData?.total || 0)}</div>
                        <div className="mt-1 text-sm text-gray-500">{todayChartData?.transactions || 0} transaksi</div>
                    </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <div className="min-w-[720px]">
                        <div className="relative h-72 border-b border-l border-gray-200 pl-12">
                            <div className="absolute inset-x-0 top-3 bottom-12 left-0 flex flex-col justify-between">
                                {[maxSales, maxSales / 2, 0].map((value, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <span className="w-10 text-right text-[11px] font-medium text-gray-500">
                                            {maxSales > 0 ? formatShortCurrency(value) : 'Rp 0'}
                                        </span>
                                        <span className="h-px flex-1 bg-gray-100"></span>
                                    </div>
                                ))}
                            </div>

                            <div className="relative z-10 flex h-full items-end gap-4 px-4 pb-12 pt-6">
                                {salesChartData.map((day, idx) => {
                                    const onlineHeight = getSegmentHeight(day.onlineTotal);
                                    const offlineHeight = getSegmentHeight(day.offlineTotal);

                                    return (
                                        <div key={`${day.date}-${idx}`} className="group relative flex min-w-[72px] flex-1 flex-col items-center justify-end">
                                            <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 hidden w-60 -translate-x-1/2 rounded-md bg-gray-900 p-3 text-xs text-white shadow-lg group-hover:block">
                                                <div className="flex items-center justify-between font-semibold">
                                                    <span>{day.label}</span>
                                                    <span>{day.transactions} transaksi</span>
                                                </div>
                                                <div className="mt-2 space-y-1 text-gray-200">
                                                    <div className="flex justify-between gap-4">
                                                        <span>Total</span>
                                                        <span className="font-semibold text-white">{formatCurrency(day.total)}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span>Offline ({day.offlineTransactions})</span>
                                                        <span>{formatCurrency(day.offlineTotal)}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span>Online ({day.onlineTransactions})</span>
                                                        <span>{formatCurrency(day.onlineTotal)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-2 min-h-5 text-center text-xs font-semibold text-gray-700">
                                                {day.total > 0 ? formatShortCurrency(day.total) : '-'}
                                            </div>
                                            <div className="flex h-44 w-10 flex-col justify-end overflow-hidden rounded-t bg-gray-100 ring-1 ring-gray-200">
                                                {day.total === 0 && <div className="h-px bg-gray-300"></div>}
                                                {day.onlineTotal > 0 && (
                                                    <div
                                                        className="bg-blue-500 transition-colors group-hover:bg-blue-600"
                                                        style={{ height: `${onlineHeight}px` }}
                                                    ></div>
                                                )}
                                                {day.offlineTotal > 0 && (
                                                    <div
                                                        className="bg-emerald-500 transition-colors group-hover:bg-emerald-600"
                                                        style={{ height: `${offlineHeight}px` }}
                                                    ></div>
                                                )}
                                            </div>
                                            <div className="mt-2 text-center text-xs font-medium text-gray-600">{day.label}</div>
                                            <div className="text-center text-[11px] text-gray-400">{day.transactions} trx</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {maxSales === 0 && (
                            <div className="mt-4 rounded-md border border-dashed border-gray-300 py-4 text-center text-sm text-gray-500">
                                Belum ada penjualan berbayar dalam 7 hari terakhir.
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </AppLayout>
    );
}

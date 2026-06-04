import AppLayout from '../../Layouts/AppLayout';

export default function AdminDashboard({ stats, topMedicines, lowStockMedicines, expiringBatches, allMedicinesStock, chart }: any) {
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
                <h2 className="text-lg font-bold mb-4">Grafik Penjualan (7 Hari Terakhir)</h2>
                {/* Chart integration can be placed here using Chart.js */}
                <div className="h-64 flex items-end gap-2 pt-4">
                    {chart.data.map((value: number, idx: number) => {
                        const maxVal = Math.max(...chart.data) || 1;
                        const height = (value / maxVal) * 100;
                        return (
                            <div key={idx} className="flex-1 flex flex-col justify-end items-center group relative">
                                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded">
                                    Rp {Number(value).toLocaleString('id-ID')}
                                </div>
                                <div className="w-full bg-blue-500 hover:bg-blue-600 rounded-t" style={{ height: `${height}%`, minHeight: value > 0 ? '10px' : '0' }}></div>
                                <div className="text-xs text-gray-500 mt-2 truncate w-full text-center">{chart.labels[idx]}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

        </AppLayout>
    );
}

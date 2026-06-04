import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

export default function PharmacistDashboard({ stats, lowStockMedicines, expiringBatches }: any) {
    return (
        <AppLayout title="Pharmacist Dashboard">
            <h1 className="text-2xl font-bold mb-6">Pharmacist Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
                    <div className="text-gray-500 text-sm font-semibold uppercase mb-1">Tertunda Prescriptions</div>
                    <div className="text-2xl font-bold text-gray-800 mb-2">{stats.pendingPrescriptions}</div>
                    <Link href="/pharmacist/prescriptions" className="text-blue-600 hover:underline text-sm font-medium">Review Prescriptions &rarr;</Link>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                    <div className="text-gray-500 text-sm font-semibold uppercase mb-1">Pesanan untuk Diproses</div>
                    <div className="text-2xl font-bold text-gray-800 mb-2">{stats.ordersToProcess}</div>
                    <Link href="/pharmacist/orders" className="text-blue-600 hover:underline text-sm font-medium">Manage Orders &rarr;</Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-4 text-red-600">Critical Stok Alerts</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="pb-2 text-gray-600 font-semibold text-sm">Obat Kode</th>
                                <th className="pb-2 text-gray-600 font-semibold text-sm">Nama Obat</th>
                                <th className="pb-2 text-gray-600 font-semibold text-sm text-right">Sisa Stok</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStockMedicines.map((item: any, i: number) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="py-3 text-sm text-gray-500">{item.code}</td>
                                    <td className="py-3 text-sm font-medium">{item.name}</td>
                                    <td className="py-3 text-sm text-right font-bold text-red-600">{item.total_stock}</td>
                                </tr>
                            ))}
                            {lowStockMedicines.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-4 text-center text-sm text-gray-500">Semua stok mencukupi.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-4 text-yellow-600">Expiring Batches (Next 30 Days)</h2>
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
            </div>

        </AppLayout>
    );
}

import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

export default function PharmacistDashboard({
    stats,
    lowStockMedicines,
    expiringBatches,
}: any) {
    return (
        <AppLayout title="Pharmacist Dashboard">
            <h1 className="mb-6 text-2xl font-bold">Pharmacist Dashboard</h1>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg border-l-4 border-yellow-500 bg-white p-6 shadow-sm">
                    <div className="mb-1 text-sm font-semibold text-gray-500 uppercase">
                        Tertunda Prescriptions
                    </div>
                    <div className="mb-2 text-2xl font-bold text-gray-800">
                        {stats.pendingPrescriptions}
                    </div>
                    <Link
                        href="/pharmacist/prescriptions"
                        className="text-sm font-medium text-cyan-600 hover:underline"
                    >
                        Review Prescriptions &rarr;
                    </Link>
                </div>
                <div className="rounded-lg border-l-4 border-blue-500 bg-white p-6 shadow-sm">
                    <div className="mb-1 text-sm font-semibold text-gray-500 uppercase">
                        Pesanan untuk Diproses
                    </div>
                    <div className="mb-2 text-2xl font-bold text-gray-800">
                        {stats.ordersToProcess}
                    </div>
                    <Link
                        href="/pharmacist/orders"
                        className="text-sm font-medium text-cyan-600 hover:underline"
                    >
                        Siapkan Pesanan &rarr;
                    </Link>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-red-600">
                        Critical Stok Alerts
                    </h2>
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="pb-2 text-sm font-semibold text-gray-600">
                                    Obat Kode
                                </th>
                                <th className="pb-2 text-sm font-semibold text-gray-600">
                                    Nama Obat
                                </th>
                                <th className="pb-2 text-right text-sm font-semibold text-gray-600">
                                    Sisa Stok
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStockMedicines.map((item: any, i: number) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="py-3 text-sm text-gray-500">
                                        {item.code}
                                    </td>
                                    <td className="py-3 text-sm font-medium">
                                        {item.name}
                                    </td>
                                    <td className="py-3 text-right text-sm font-bold text-red-600">
                                        {item.total_stock}
                                    </td>
                                </tr>
                            ))}
                            {lowStockMedicines.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="py-4 text-center text-sm text-gray-500"
                                    >
                                        Semua stok mencukupi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-yellow-600">
                        Expiring Batches (Next 30 Days)
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
                                            Tidak ada batch yang segera
                                            kedaluwarsa.
                                        </td>
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

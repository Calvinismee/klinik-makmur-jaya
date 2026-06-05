import { Link } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function OrdersIndex({ orders }: { orders: any[] }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'prescription_rejected':
                return 'bg-red-100 text-red-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'ready_to_pickup':
                return 'bg-emerald-100 text-emerald-800';
            case 'waiting_prescription_verification':
                return 'bg-yellow-100 text-yellow-800';
            case 'waiting_payment':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatus = (status: string) => {
        const map: Record<string, string> = {
            waiting_payment: 'Menunggu Pembayaran',
            waiting_prescription_verification: 'Verifikasi Resep',
            prescription_rejected: 'Prescription ditolak',
            paid: 'Sudah Dibayar',
            processing: 'Sedang Diproses',
            ready_to_pickup: 'Siap Diambil/Dikirim',
            completed: 'Completed',
            cancelled: 'Dibatalkan',
        };

        return map[status] || status.replace(/_/g, ' ').toUpperCase();
    };

    return (
        <AppLayout title="Pesanan Saya">
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                <h1 className="mb-6 border-b pb-4 text-2xl font-bold">
                    Pesanan Saya
                </h1>

                {orders.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                        Belum ada pesanan
                        <br />
                        <Link
                            href="/customer/catalog"
                            className="mt-2 inline-block text-cyan-600 hover:underline"
                        >
                            Lihat Katalog
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Pesanan Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Total Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 font-medium whitespace-nowrap text-cyan-600">
                                            <Link
                                                href={`/customer/orders/${order.order_number}`}
                                            >
                                                #{order.order_number}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold whitespace-nowrap">
                                            Rp{' '}
                                            {Number(
                                                order.total_amount,
                                            ).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getStatusColor(order.order_status)}`}
                                            >
                                                {formatStatus(
                                                    order.order_status,
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                            <Link
                                                href={`/customer/orders/${order.order_number}`}
                                                className="text-cyan-600 hover:text-cyan-800"
                                            >
                                                Lihat Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

import { router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function PaymentsIndex({ orders }: { orders: any[] }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting_payment': return 'bg-red-100 text-red-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'ready_to_pickup': return 'bg-emerald-100 text-emerald-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatus = (status: string) => {
        const map: Record<string, string> = {
            waiting_payment: 'BELUM DIBAYAR',
            processing: 'DIPROSES',
            ready_to_pickup: 'SIAP DIAMBIL/DIKIRIM',
            completed: 'SELESAI',
            cancelled: 'DIBATALKAN',
        };

        return map[status] || status.replace(/_/g, ' ').toUpperCase();
    };

    const handleProcessPayment = (orderId: number) => {
        if (confirm('Confirm payment received for this order?')) {
            router.post(`/cashier/payments/${orderId}`);
        }
    };

    const handleReady = (orderId: number) => {
        if (confirm('Tandai pesanan ini siap diambil/dikirim?')) {
            router.post(`/cashier/payments/${orderId}/ready`);
        }
    };

    const handleComplete = (orderId: number) => {
        if (confirm('Selesaikan pesanan ini?')) {
            router.post(`/cashier/payments/${orderId}/complete`);
        }
    };

    const handleCancel = (orderId: number) => {
        if (confirm('Batalkan pesanan ini?')) {
            router.post(`/cashier/payments/${orderId}/cancel`);
        }
    };

    return (
        <AppLayout title="Kelola Pembayaran Online">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold mb-6 border-b pb-4">Kelola Pembayaran Online</h1>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pesanan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-blue-600">#{order.order_number}</div>
                                        <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.user?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">
                                        Rp {Number(order.total_amount).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                                            {formatStatus(order.order_status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                        {order.payment_status !== 'paid' && (
                                            <>
                                                <button 
                                                    onClick={() => handleProcessPayment(order.id)}
                                                    className="text-white bg-green-600 hover:bg-green-900 px-4 py-2 rounded font-bold"
                                                >
                                                    Tandai Sudah Dibayar
                                                </button>
                                                <button 
                                                    onClick={() => handleCancel(order.id)}
                                                    className="text-white bg-red-600 hover:bg-red-900 px-4 py-2 rounded font-bold"
                                                >
                                                    Batal
                                                </button>
                                            </>
                                        )}
                                        {order.payment_status === 'paid' && order.order_status === 'processing' && (
                                            <button
                                                onClick={() => handleReady(order.id)}
                                                className="text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded font-bold"
                                            >
                                                Tandai Siap Diambil/Dikirim
                                            </button>
                                        )}
                                        {order.payment_status === 'paid' && order.order_status === 'ready_to_pickup' && (
                                            <button
                                                onClick={() => handleComplete(order.id)}
                                                className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold"
                                            >
                                                Selesaikan Pesanan
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="text-center py-6 text-gray-500">Tidak ada pesanan online.</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

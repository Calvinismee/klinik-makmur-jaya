import AppLayout from '../../../Layouts/AppLayout';

export default function AdminOrdersIndex({ orders }: { orders: any[] }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'prescription_rejected': return 'bg-red-100 text-red-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'ready_to_pickup': return 'bg-emerald-100 text-emerald-800';
            case 'waiting_prescription_verification': return 'bg-yellow-100 text-yellow-800';
            case 'waiting_payment': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatus = (status: string) => {
        const map: Record<string, string> = {
            waiting_payment: 'Menunggu Pembayaran',
            paid: 'Sudah Dibayar',
            processing: 'Sedang Diproses',
            ready_to_pickup: 'Siap Diambil/Dikirim',
            waiting_prescription_verification: 'Verifikasi Resep',
            prescription_rejected: 'Prescription ditolak',
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
        };

        return map[status] || status.replace(/_/g, ' ').toUpperCase();
    };

    return (
        <AppLayout title="All Orders">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold">All Orders (Admin View)</h1>
                    <a href="/admin/orders/export" target="_blank" rel="noreferrer" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition">
                        Export to Excel
                    </a>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pesanan Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Pembayaran</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        #{order.order_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.user?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold">
                                        Rp {Number(order.total_amount).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                                            {formatStatus(order.order_status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                                        {order.payment_status.toUpperCase()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="text-center py-6 text-gray-500">Pesanan tidak ditemukan.</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

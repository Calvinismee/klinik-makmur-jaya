import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

export default function Dashboard({ stats, recentTransactions }: { stats: any; recentTransactions: any[] }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'ready_to_pickup': return 'bg-emerald-100 text-emerald-800';
            case 'waiting_prescription_verification': return 'bg-yellow-100 text-yellow-800';
            case 'waiting_payment': return 'bg-orange-100 text-orange-800';
            case 'paid': return 'bg-purple-100 text-purple-800';
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
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
        };
        return map[status] || status;
    };

    return (
        <AppLayout title="Dashboard Kasir">
            <h1 className="text-2xl font-bold mb-6">Ringkasan Kasir</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-blue-500">
                    <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Transaksi Offline Hari Ini</div>
                    <div className="text-3xl font-bold text-gray-800">{stats.transaksi_hari_ini}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-green-500">
                    <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Total Penerimaan Hari Ini</div>
                    <div className="text-2xl font-bold text-gray-800">Rp {Number(stats.penerimaan_hari_ini).toLocaleString('id-ID')}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-purple-500">
                    <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Total Transaksi Selesai</div>
                    <div className="text-3xl font-bold text-gray-800">{stats.total_transaksi_selesai}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-orange-500">
                    <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Online Menunggu</div>
                    <div className="text-3xl font-bold text-gray-800">{stats.pembayaran_online_menunggu}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-cyan-500">
                    <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Online Paid Hari Ini</div>
                    <div className="text-3xl font-bold text-gray-800">{stats.pembayaran_online_hari_ini}</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Link href="/cashier/pos" className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 p-5 text-center text-white shadow-sm transition hover:from-cyan-600 hover:to-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="font-bold text-lg">Pembayaran Offline</div>
                    <div className="mt-1 text-sm text-cyan-50">Lakukan transaksi penjualan langsung (offline)</div>
                </Link>
                <Link href="/cashier/payments" className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 p-5 text-center text-white shadow-sm transition hover:from-cyan-600 hover:to-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <div className="font-bold text-lg">Pantau Pembayaran Online</div>
                    <div className="mt-1 text-sm text-cyan-50">Lihat history dan status pembayaran pelanggan</div>
                </Link>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Transaksi Terbaru</h2>
                </div>

                {recentTransactions.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="font-medium">Belum ada transaksi</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Pesanan</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Pesanan</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Bayar</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentTransactions.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                                            #{order.order_number}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-700">
                                            Rp {Number(order.total_amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                                                {formatStatus(order.order_status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                                {order.payment_status === 'paid' ? 'Sudah Dibayar' : 'Belum Dibayar'}
                                            </span>
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

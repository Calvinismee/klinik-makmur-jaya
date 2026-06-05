import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

export default function Dashboard({ stats, recentOrders }: { stats: any; recentOrders: any[] }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'prescription_rejected': return 'bg-red-100 text-red-800';
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
            prescription_rejected: 'Prescription ditolak',
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
        };
        return map[status] || status;
    };

    return (
        <AppLayout title="Dashboard Pelanggan">
            <h1 className="text-2xl font-bold mb-6">Dashboard Pelanggan</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-blue-500">
                    <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Total Pesanan</div>
                    <div className="text-3xl font-bold text-gray-800">{stats.totalOrders}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-yellow-500">
                    <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Pesanan Aktif</div>
                    <div className="text-3xl font-bold text-gray-800">{stats.activeOrders}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-green-500">
                    <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Pesanan Selesai</div>
                    <div className="text-3xl font-bold text-gray-800">{stats.completedOrders}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-purple-500">
                    <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Total Belanja</div>
                    <div className="text-2xl font-bold text-gray-800">Rp {Number(stats.totalSpent).toLocaleString('id-ID')}</div>
                </div>
            </div>

            {/* Quick Aksi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <Link href="/customer/catalog" className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 p-5 text-center text-white shadow-sm transition hover:from-cyan-600 hover:to-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <div className="font-bold text-lg">Katalog Obat</div>
                    <div className="mt-1 text-sm text-cyan-50">Cari & beli obat yang Anda butuhkan</div>
                </Link>
                <Link href="/customer/cart" className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 p-5 text-center text-white shadow-sm transition hover:from-cyan-600 hover:to-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div className="font-bold text-lg">Keranjang</div>
                    <div className="mt-1 text-sm text-cyan-50">Lihat isi keranjang belanja Anda</div>
                </Link>
                <Link href="/customer/orders" className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 p-5 text-center text-white shadow-sm transition hover:from-cyan-600 hover:to-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <div className="font-bold text-lg">Riwayat Pesanan</div>
                    <div className="mt-1 text-sm text-cyan-50">Lacak semua pesanan Anda</div>
                </Link>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Pesanan Terbaru</h2>
                    <Link href="/customer/orders" className="text-cyan-600 hover:underline text-sm font-medium">
                        Lihat Semua &rarr;
                    </Link>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="font-medium">Belum ada pesanan</p>
                        <p className="text-sm mt-1">Mulai belanja dari <Link href="/customer/catalog" className="text-cyan-600 hover:underline">Katalog Obat</Link></p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tidak. Pesanan</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <Link href={`/customer/orders/${order.order_number}`} className="text-cyan-600 hover:underline font-medium">
                                                #{order.order_number}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-700">
                                            Rp {Number(order.total_amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                                                {formatStatus(order.order_status)}
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

import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

export default function Dashboard({
    stats,
    recentOrders,
}: {
    stats: any;
    recentOrders: any[];
}) {
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
            case 'paid':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
            <h1 className="mb-6 text-2xl font-bold">Dashboard Pelanggan</h1>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border-l-4 border-blue-500 bg-white p-5 shadow-sm">
                    <div className="mb-1 text-xs font-semibold text-gray-500 uppercase">
                        Total Pesanan
                    </div>
                    <div className="text-3xl font-bold text-gray-800">
                        {stats.totalOrders}
                    </div>
                </div>
                <div className="rounded-lg border-l-4 border-yellow-500 bg-white p-5 shadow-sm">
                    <div className="mb-1 text-xs font-semibold text-gray-500 uppercase">
                        Pesanan Aktif
                    </div>
                    <div className="text-3xl font-bold text-gray-800">
                        {stats.activeOrders}
                    </div>
                </div>
                <div className="rounded-lg border-l-4 border-green-500 bg-white p-5 shadow-sm">
                    <div className="mb-1 text-xs font-semibold text-gray-500 uppercase">
                        Pesanan Selesai
                    </div>
                    <div className="text-3xl font-bold text-gray-800">
                        {stats.completedOrders}
                    </div>
                </div>
                <div className="rounded-lg border-l-4 border-purple-500 bg-white p-5 shadow-sm">
                    <div className="mb-1 text-xs font-semibold text-gray-500 uppercase">
                        Total Belanja
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                        Rp {Number(stats.totalSpent).toLocaleString('id-ID')}
                    </div>
                </div>
            </div>

            {/* Quick Aksi */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link
                    href="/customer/catalog"
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 p-5 text-center text-white shadow-sm transition hover:from-cyan-600 hover:to-blue-700"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mx-auto mb-2 h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                    </svg>
                    <div className="text-lg font-bold">Katalog Obat</div>
                    <div className="mt-1 text-sm text-cyan-50">
                        Cari & beli obat yang Anda butuhkan
                    </div>
                </Link>
                <Link
                    href="/customer/cart"
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 p-5 text-center text-white shadow-sm transition hover:from-cyan-600 hover:to-blue-700"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mx-auto mb-2 h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <div className="text-lg font-bold">Keranjang</div>
                    <div className="mt-1 text-sm text-cyan-50">
                        Lihat isi keranjang belanja Anda
                    </div>
                </Link>
                <Link
                    href="/customer/orders"
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 p-5 text-center text-white shadow-sm transition hover:from-cyan-600 hover:to-blue-700"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mx-auto mb-2 h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                    <div className="text-lg font-bold">Riwayat Pesanan</div>
                    <div className="mt-1 text-sm text-cyan-50">
                        Lacak semua pesanan Anda
                    </div>
                </Link>
            </div>

            {/* Recent Orders */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800">
                        Pesanan Terbaru
                    </h2>
                    <Link
                        href="/customer/orders"
                        className="text-sm font-medium text-cyan-600 hover:underline"
                    >
                        Lihat Semua &rarr;
                    </Link>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="py-10 text-center text-gray-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mx-auto mb-3 h-12 w-12 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                        </svg>
                        <p className="font-medium">Belum ada pesanan</p>
                        <p className="mt-1 text-sm">
                            Mulai belanja dari{' '}
                            <Link
                                href="/customer/catalog"
                                className="text-cyan-600 hover:underline"
                            >
                                Katalog Obat
                            </Link>
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tidak. Pesanan
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tanggal
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Total
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {recentOrders.map((order: any) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <Link
                                                href={`/customer/orders/${order.order_number}`}
                                                className="font-medium text-cyan-600 hover:underline"
                                            >
                                                #{order.order_number}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-500">
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold whitespace-nowrap text-gray-700">
                                            Rp{' '}
                                            {Number(
                                                order.total_amount,
                                            ).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs leading-5 font-semibold ${getStatusColor(order.order_status)}`}
                                            >
                                                {formatStatus(
                                                    order.order_status,
                                                )}
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

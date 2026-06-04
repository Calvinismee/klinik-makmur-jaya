import { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

declare global {
    interface Window {
        snap?: {
            pay: (token: string, callbacks?: Record<string, () => void>) => void;
        };
    }
}

export default function OrderShow({ order }: { order: any }) {
    const { url } = usePage();
    const [paymentOpened, setPaymentOpened] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'prescription_rejected': return 'bg-red-100 text-red-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'ready_to_pickup': return 'bg-emerald-100 text-emerald-800';
            case 'waiting_prescription_verification': return 'bg-yellow-100 text-yellow-800';
            case 'waiting_payment': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatus = (status: string) => {
        const map: Record<string, string> = {
            waiting_payment: 'Dikonfirmasi',
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

    const formatPaymentStatus = (status: string) => {
        const map: Record<string, string> = {
            unpaid: 'Belum Dibayar',
            pending: 'Menunggu Pembayaran',
            paid: 'Sudah Dibayar',
            failed: 'Gagal',
            refunded: 'Refunded',
        };

        return map[status] || status.toUpperCase();
    };

    const canPay = order.order_status === 'waiting_payment' && order.payment_status !== 'paid';
    const hasSnapToken = Boolean(order.midtrans_snap_token);
    const isWaitingPayment = order.order_status === 'waiting_payment' && order.payment_status !== 'paid';
    const syncPaymentStatus = () => router.visit(`/customer/orders/${order.id}?sync_payment=1`);

    const openPayment = () => {
        if (!hasSnapToken) {
            router.post(`/customer/orders/${order.id}/pay`, {}, { preserveScroll: true });
            return;
        }

        if (!window.snap) {
            if (order.midtrans_redirect_url) {
                window.location.href = order.midtrans_redirect_url;
            }

            return;
        }

        window.snap.pay(order.midtrans_snap_token, {
            onSuccess: syncPaymentStatus,
            onPending: syncPaymentStatus,
            onError: syncPaymentStatus,
            onClose: syncPaymentStatus,
        });
    };

    useEffect(() => {
        if (!canPay || !hasSnapToken || paymentOpened || (!url.includes('pay=1') && !url.includes('sync_payment=1'))) {
            return;
        }

        setPaymentOpened(true);
        window.history.replaceState({}, '', window.location.pathname);

        if (url.includes('pay=1')) {
            openPayment();
            return;
        }

        syncPaymentStatus();
    }, [canPay, hasSnapToken, paymentOpened, url]);

    return (
        <AppLayout title={`Pesanan #${order.order_number}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-start mb-6 border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold">Pesanan #{order.order_number}</h1>
                        <p className="text-gray-500 text-sm mt-1">Dipesan pada {new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <Link href="/customer/orders" className="text-blue-600 hover:underline">Kembali ke Pesanan</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h2 className="text-lg font-bold mb-4">Pesanan Status</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status</span>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                                    {formatStatus(order.order_status)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status Pembayaran</span>
                                <span className="font-bold">{formatPaymentStatus(order.payment_status)}</span>
                            </div>
                            {order.payment_provider && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Metode Pembayaran</span>
                                    <span className="font-bold uppercase">{order.payment_method || order.payment_provider}</span>
                                </div>
                            )}
                            {order.prescription_status && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status Resep</span>
                                    <span className="font-bold">{order.prescription_status.toUpperCase()}</span>
                                </div>
                            )}
                            {isWaitingPayment && (
                                <div className="rounded border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                                    Pesanan belum diproses sebelum pembayaran berhasil diverifikasi Midtrans.
                                </div>
                            )}
                            {canPay && (
                                <button
                                    type="button"
                                    onClick={openPayment}
                                    className="mt-3 w-full rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                                >
                                    Bayar Sekarang
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold mb-4">Pesanan Catatan</h2>
                        <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 min-h-[100px]">
                            {order.notes || 'Tidak notes provided.'}
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold mb-4">Pesanan Item</h2>
                <div className="overflow-x-auto mb-6">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kuantitas</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {order.items.map((item: any) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{item.medicine?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">Rp {Number(item.price).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold">Rp {Number(item.subtotal).toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-700">Total Amount</td>
                                <td className="px-6 py-4 text-right font-bold text-xl text-blue-600">Rp {Number(order.total_amount).toLocaleString('id-ID')}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

            </div>
        </AppLayout>
    );
}

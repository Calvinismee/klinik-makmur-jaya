import { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

declare global {
    interface Window {
        snap?: {
            pay: (
                token: string,
                callbacks?: Record<
                    string,
                    (result?: Record<string, unknown>) => void
                >,
            ) => void;
        };
    }
}

export default function OrderShow({ order }: { order: any }) {
    const { url } = usePage();
    const [paymentOpened, setPaymentOpened] = useState(false);
    const [paymentChecking, setPaymentChecking] = useState(false);
    const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);

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

    const canPay =
        order.order_status === 'waiting_payment' &&
        order.payment_status !== 'paid';
    const hasSnapToken = Boolean(order.midtrans_snap_token);
    const isMidtransPending =
        order.payment_provider === 'midtrans' &&
        order.payment_status === 'pending';
    const syncPaymentStatus = (
        message = 'Sedang memverifikasi pembayaran. Mohon tunggu sebentar.',
    ) => {
        setPaymentError(null);
        setPaymentNotice(message);
        setPaymentChecking(true);

        router.visit(`/customer/orders/${order.order_number}?sync_payment=1`, {
            preserveScroll: true,
            onFinish: () => setPaymentChecking(false),
        });
    };

    const openPayment = () => {
        setPaymentError(null);
        setPaymentNotice(null);

        if (!hasSnapToken) {
            setPaymentChecking(true);
            router.post(
                `/customer/orders/${order.order_number}/pay`,
                {},
                {
                    preserveScroll: true,
                    onFinish: () => setPaymentChecking(false),
                },
            );
            return;
        }

        if (!window.snap) {
            if (order.midtrans_redirect_url) {
                window.location.href = order.midtrans_redirect_url;
            }

            return;
        }

        window.snap.pay(order.midtrans_snap_token, {
            onSuccess: () =>
                syncPaymentStatus('Pembayaran dikirim. Sedang diverifikasi.'),
            onPending: () => syncPaymentStatus('Pembayaran sedang diproses.'),
            onError: () => {
                setPaymentNotice(null);
                setPaymentChecking(false);
                setPaymentError(
                    'Pembayaran gagal diproses. Status pesanan tidak diubah.',
                );
            },
            onClose: () => {
                setPaymentNotice(
                    'Pembayaran dibatalkan. Pesanan tetap menunggu pembayaran.',
                );
                setPaymentChecking(false);
            },
        });
    };

    useEffect(() => {
        if (
            !canPay ||
            !hasSnapToken ||
            paymentOpened ||
            (!url.includes('pay=1') && !url.includes('sync_payment=1'))
        ) {
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
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-start justify-between border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Pesanan #{order.order_number}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Dipesan pada{' '}
                            {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                    <Link
                        href="/customer/orders"
                        className="text-cyan-600 hover:underline"
                    >
                        Kembali ke Pesanan
                    </Link>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div>
                        <h2 className="mb-4 text-lg font-bold">
                            Pesanan Status
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status</span>
                                <span
                                    className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getStatusColor(order.order_status)}`}
                                >
                                    {formatStatus(order.order_status)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Status Pembayaran
                                </span>
                                <span className="font-bold">
                                    {formatPaymentStatus(order.payment_status)}
                                </span>
                            </div>
                            {order.payment_provider && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Metode Pembayaran
                                    </span>
                                    <span className="font-bold">
                                        {order.payment_method
                                            ? order.payment_method.toUpperCase()
                                            : 'Online'}
                                    </span>
                                </div>
                            )}
                            {order.prescription_status && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Status Resep
                                    </span>
                                    <span className="font-bold">
                                        {order.prescription_status.toUpperCase()}
                                    </span>
                                </div>
                            )}
                            {(isMidtransPending || paymentNotice) && (
                                <div className="rounded border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-800">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-2">
                                            {paymentChecking && (
                                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-300 border-t-cyan-700" />
                                            )}
                                            <span>
                                                {paymentNotice ||
                                                    'Pembayaran sedang diproses.'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {paymentError && (
                                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                                    {paymentError}
                                </div>
                            )}
                            {canPay && (
                                <button
                                    type="button"
                                    onClick={openPayment}
                                    disabled={paymentChecking}
                                    className="btn-primary mt-3 w-full text-sm"
                                >
                                    {paymentChecking
                                        ? 'Mengecek pembayaran...'
                                        : isMidtransPending
                                          ? 'Cek / Lanjutkan Pembayaran'
                                          : 'Bayar Sekarang'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-4 text-lg font-bold">
                            Pesanan Catatan
                        </h2>
                        <div className="min-h-[100px] rounded bg-gray-50 p-4 text-sm text-gray-700">
                            {order.notes || 'Tidak notes provided.'}
                        </div>
                    </div>
                </div>

                <h2 className="mb-4 text-xl font-bold">Pesanan Item</h2>
                <div className="mb-6 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Item
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Harga
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Kuantitas
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Subtotal
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {order.items.map((item: any) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                                        {item.medicine?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        Rp{' '}
                                        {Number(item.price).toLocaleString(
                                            'id-ID',
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.quantity}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold whitespace-nowrap">
                                        Rp{' '}
                                        {Number(item.subtotal).toLocaleString(
                                            'id-ID',
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-6 py-4 text-right font-bold text-gray-700"
                                >
                                    Total Amount
                                </td>
                                <td className="px-6 py-4 text-right text-xl font-bold text-cyan-600">
                                    Rp{' '}
                                    {Number(order.total_amount).toLocaleString(
                                        'id-ID',
                                    )}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

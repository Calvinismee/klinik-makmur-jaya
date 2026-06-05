import { useState } from 'react';
import AppLayout from '../../../Layouts/AppLayout';

type Payment = {
    id: number;
    order_number: string;
    total_amount: number | string;
    order_status: string;
    payment_status: string;
    payment_method?: string | null;
    payment_provider?: string | null;
    midtrans_transaction_status?: string | null;
    midtrans_transaction_id?: string | null;
    paid_at?: string | null;
    created_at: string;
    user?: {
        name?: string | null;
        email?: string | null;
    } | null;
};

type Summary = {
    total: number;
    paid: number;
    pending: number;
    failed: number;
    revenue: number | string;
};

export default function CashierOnlinePaymentsIndex({ payments, summary }: { payments: Payment[]; summary: Summary }) {
    const [expandedReferenceId, setExpandedReferenceId] = useState<number | null>(null);
    const formatCurrency = (value: number | string) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
    const formatDate = (value?: string | null) => value
        ? new Date(value).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : '-';

    const formatPaymentStatus = (status: string) => {
        const map: Record<string, string> = {
            unpaid: 'Belum Dibayar',
            pending: 'Menunggu Pembayaran',
            paid: 'Sudah Dibayar',
            failed: 'Gagal',
            refunded: 'Refunded',
        };

        return map[status] || status.replace(/_/g, ' ').toUpperCase();
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-emerald-100 text-emerald-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'pending':
            case 'unpaid':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    const formatGatewayStatus = (status?: string | null) => {
        const map: Record<string, string> = {
            settlement: 'Terverifikasi',
            capture: 'Terverifikasi',
            pending: 'Diproses',
            deny: 'Ditolak',
            cancel: 'Dibatalkan',
            expire: 'Kedaluwarsa',
            failure: 'Gagal',
        };

        return status ? map[status] || status.replace(/_/g, ' ').toUpperCase() : '-';
    };

    const getGatewayStatusColor = (status?: string | null) => {
        switch (status) {
            case 'settlement':
            case 'capture':
                return 'bg-emerald-100 text-emerald-800';
            case 'pending':
                return 'bg-orange-100 text-orange-800';
            case 'deny':
            case 'cancel':
            case 'expire':
            case 'failure':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    const shortReference = (value?: string | null) => value ? `${value.slice(0, 8)}...` : '-';

    const formatOrderStatus = (status: string) => {
        const map: Record<string, string> = {
            waiting_payment: 'Menunggu Pembayaran',
            waiting_prescription_verification: 'Verifikasi Resep',
            prescription_rejected: 'Prescription ditolak',
            processing: 'Sedang Diproses',
            ready_to_pickup: 'Siap Diambil/Dikirim',
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
        };

        return map[status] || status.replace(/_/g, ' ').toUpperCase();
    };

    const getOrderStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
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
                return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <AppLayout title="Pembayaran Online">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Pembayaran Online</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Monitoring pembayaran online pelanggan. Verifikasi siap diambil/dikirim tetap dilakukan oleh apoteker.
                        </p>
                    </div>
                    <a href="/cashier/payments" className="btn-secondary text-sm">
                        Refresh
                    </a>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-lg border-l-4 border-cyan-500 bg-slate-50 p-4">
                        <div className="text-xs font-semibold uppercase text-slate-500">Total Online</div>
                        <div className="mt-1 text-2xl font-bold text-slate-900">{summary.total}</div>
                    </div>
                    <div className="rounded-lg border-l-4 border-emerald-500 bg-slate-50 p-4">
                        <div className="text-xs font-semibold uppercase text-slate-500">Sudah Dibayar</div>
                        <div className="mt-1 text-2xl font-bold text-slate-900">{summary.paid}</div>
                    </div>
                    <div className="rounded-lg border-l-4 border-orange-500 bg-slate-50 p-4">
                        <div className="text-xs font-semibold uppercase text-slate-500">Menunggu</div>
                        <div className="mt-1 text-2xl font-bold text-slate-900">{summary.pending}</div>
                    </div>
                    <div className="rounded-lg border-l-4 border-red-500 bg-slate-50 p-4">
                        <div className="text-xs font-semibold uppercase text-slate-500">Gagal</div>
                        <div className="mt-1 text-2xl font-bold text-slate-900">{summary.failed}</div>
                    </div>
                    <div className="rounded-lg border-l-4 border-blue-500 bg-slate-50 p-4">
                        <div className="text-xs font-semibold uppercase text-slate-500">Penerimaan Online</div>
                        <div className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(summary.revenue)}</div>
                    </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Pesanan</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Pelanggan</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Total</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status Bayar</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status Pesanan</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Metode</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status Gateway</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Dibayar Pada</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="font-semibold text-cyan-700">#{payment.order_number}</div>
                                        <div className="text-xs text-slate-400">{formatDate(payment.created_at)}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="font-medium text-slate-900">{payment.user?.name || '-'}</div>
                                        <div className="text-xs text-slate-400">{payment.user?.email || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                                        {formatCurrency(payment.total_amount)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPaymentStatusColor(payment.payment_status)}`}>
                                            {formatPaymentStatus(payment.payment_status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getOrderStatusColor(payment.order_status)}`}>
                                            {formatOrderStatus(payment.order_status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                                        {payment.payment_method ? payment.payment_method.toUpperCase() : 'Online'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getGatewayStatusColor(payment.midtrans_transaction_status)}`}>
                                            {formatGatewayStatus(payment.midtrans_transaction_status)}
                                        </span>
                                        {payment.midtrans_transaction_id ? (
                                            <div className="mt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedReferenceId(expandedReferenceId === payment.id ? null : payment.id)}
                                                    className="text-xs font-medium text-cyan-700 hover:text-cyan-900"
                                                >
                                                    Ref: {shortReference(payment.midtrans_transaction_id)}
                                                </button>
                                                {expandedReferenceId === payment.id && (
                                                    <div className="mt-2 max-w-[260px] whitespace-normal break-all rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
                                                        {payment.midtrans_transaction_id}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-1 text-xs text-slate-400">Ref: -</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                                        {formatDate(payment.paid_at)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {payments.length === 0 && (
                        <div className="py-10 text-center text-sm text-slate-500">
                            Belum ada pembayaran online.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

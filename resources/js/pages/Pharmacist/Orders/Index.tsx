import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

type ApprovalDialog = {
    type: 'single' | 'bulk';
    orderId?: number;
    orderIds?: number[];
    title: string;
    message: string;
    confirmLabel: string;
};

export default function PharmacistOrdersIndex({ orders }: { orders: any[] }) {
    const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
    const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [dialog, setDialog] = useState<ApprovalDialog | null>(null);
    const [dialogLoading, setDialogLoading] = useState(false);
    const processableOrders = orders.filter((order) => order.order_status === 'processing');
    const allProcessableSelected = processableOrders.length > 0 && processableOrders.every((order) => selectedOrderIds.includes(order.id));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'ready_to_pickup': return 'bg-emerald-100 text-emerald-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatus = (status: string) => {
        const map: Record<string, string> = {
            processing: 'DIPROSES',
            ready_to_pickup: 'SIAP DIAMBIL/DIKIRIM',
        };

        return map[status] || status.replace(/_/g, ' ').toUpperCase();
    };

    const toggleOrder = (orderId: number) => {
        setSelectedOrderIds((current) => (
            current.includes(orderId)
                ? current.filter((id) => id !== orderId)
                : [...current, orderId]
        ));
    };

    const toggleAllProcessable = () => {
        setSelectedOrderIds(allProcessableSelected ? [] : processableOrders.map((order) => order.id));
    };

    const markReady = (orderId: number) => {
        const order = orders.find((item) => item.id === orderId);

        setDialog({
            type: 'single',
            orderId,
            title: 'Tandai Pesanan Siap',
            message: `Pesanan #${order?.order_number || orderId} akan ditandai siap diambil/dikirim.`,
            confirmLabel: 'Tandai Siap',
        });
    };

    const bulkMarkReady = () => {
        if (selectedOrderIds.length === 0) {
            return;
        }

        setDialog({
            type: 'bulk',
            orderIds: selectedOrderIds,
            title: 'Tandai Banyak Pesanan',
            message: `${selectedOrderIds.length} pesanan akan ditandai siap diambil/dikirim.`,
            confirmLabel: `Tandai ${selectedOrderIds.length} Pesanan`,
        });
    };

    const closeDialog = () => {
        if (!dialogLoading) {
            setDialog(null);
        }
    };

    const approveDialogAction = () => {
        if (!dialog || dialogLoading) {
            return;
        }

        setDialogLoading(true);

        if (dialog.type === 'bulk') {
            setBulkLoading(true);
            router.post('/pharmacist/orders/bulk-ready', {
                order_ids: dialog.orderIds || [],
            }, {
                preserveScroll: true,
                onSuccess: () => setSelectedOrderIds([]),
                onFinish: () => {
                    setBulkLoading(false);
                    setDialogLoading(false);
                    setDialog(null);
                },
            });

            return;
        }

        if (dialog.orderId) {
            setLoadingOrderId(dialog.orderId);
            router.post(`/pharmacist/orders/${dialog.orderId}/ready`, {}, {
                preserveScroll: true,
                onFinish: () => {
                    setLoadingOrderId(null);
                    setDialogLoading(false);
                    setDialog(null);
                },
            });
        }
    };

    return (
        <AppLayout title="Siapkan Pesanan">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="mb-6 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold">Siapkan Pesanan</h1>
                    <button
                        type="button"
                        onClick={bulkMarkReady}
                        disabled={selectedOrderIds.length === 0 || bulkLoading}
                        className="rounded bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {bulkLoading ? 'Memproses...' : `Tandai Siap (${selectedOrderIds.length})`}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-emerald-600"
                                        checked={allProcessableSelected}
                                        onChange={toggleAllProcessable}
                                        disabled={processableOrders.length === 0 || bulkLoading}
                                        aria-label="Pilih semua pesanan yang bisa diproses"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pesanan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-emerald-600"
                                            checked={selectedOrderIds.includes(order.id)}
                                            onChange={() => toggleOrder(order.id)}
                                            disabled={order.order_status !== 'processing' || bulkLoading || loadingOrderId === order.id}
                                            aria-label={`Pilih pesanan ${order.order_number}`}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-blue-600">#{order.order_number}</div>
                                        <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('id-ID')}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.user?.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {order.items?.map((item: any) => (
                                                <div key={item.id} className="flex justify-between gap-4 text-sm">
                                                    <span>{item.medicine?.name || 'Obat'}</span>
                                                    <span className="font-bold text-gray-700">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                                            {formatStatus(order.order_status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {order.order_status === 'processing' ? (
                                            <button
                                                onClick={() => markReady(order.id)}
                                                disabled={bulkLoading || loadingOrderId === order.id}
                                                className="text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded font-bold disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {loadingOrderId === order.id ? 'Memproses...' : 'Tandai Siap Diambil/Dikirim'}
                                            </button>
                                        ) : (
                                            <span className="text-gray-400">Tidak ada aksi</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="text-center py-6 text-gray-500">Tidak ada pesanan yang perlu disiapkan.</div>
                    )}
                </div>
            </div>

            {dialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl ring-1 ring-black/5">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-slate-900">{dialog.title}</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{dialog.message}</p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeDialog}
                                disabled={dialogLoading}
                                className="rounded border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={approveDialogAction}
                                disabled={dialogLoading}
                                className="inline-flex items-center gap-2 rounded bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {dialogLoading && <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-200 border-t-white" />}
                                {dialogLoading ? 'Memproses...' : dialog.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

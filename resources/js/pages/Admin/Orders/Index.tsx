import AppLayout from '../../../Layouts/AppLayout';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function AdminOrdersIndex({ orders, reportJobs = [] }: { orders: any[], reportJobs?: any[] }) {
    const [jobs, setJobs] = useState<any[]>(reportJobs);
    const [showReportProgress, setShowReportProgress] = useState(() => {
        if (typeof window === 'undefined') {
            return true;
        }

        return window.localStorage.getItem('admin-report-progress-hidden') !== '1';
    });

    useEffect(() => {
        setJobs(reportJobs);
    }, [reportJobs]);

    useEffect(() => {
        const activeJobs = jobs.filter((job) => ['queued', 'processing'].includes(job.status));

        if (activeJobs.length === 0) {
            return;
        }

        const timer = window.setInterval(() => {
            activeJobs.forEach((job) => {
                fetch(`/admin/reports/${job.id}/status`, {
                    headers: {
                        Accept: 'application/json',
                    },
                })
                    .then((response) => response.json())
                    .then((updatedJob) => {
                        setJobs((currentJobs) => currentJobs.map((currentJob) => (
                            currentJob.id === updatedJob.id ? updatedJob : currentJob
                        )));
                    })
                    .catch(() => {
                        setJobs((currentJobs) => currentJobs.map((currentJob) => (
                            currentJob.id === job.id
                                ? { ...currentJob, message: 'Gagal membaca progress terbaru.' }
                                : currentJob
                        )));
                    });
            });
        }, 2000);

        return () => window.clearInterval(timer);
    }, [jobs]);

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

    const isOfflineOrder = (order: any) => String(order.order_number || '').startsWith('POS-');
    const formatPurchaseType = (order: any) => isOfflineOrder(order) ? 'Offline' : 'Online';
    const getPurchaseTypeColor = (order: any) => isOfflineOrder(order)
        ? 'bg-slate-100 text-slate-800'
        : 'bg-cyan-100 text-cyan-800';
    const formatCustomerName = (order: any) => isOfflineOrder(order) ? 'Pelanggan Offline' : (order.user?.name || '-');
    const getJobStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            queued: 'Menunggu',
            processing: 'Diproses',
            completed: 'Selesai',
            failed: 'Gagal',
        };

        return map[status] || status;
    };
    const getJobStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };
    const getJobTypeLabel = (type: string) => type === 'sales_excel' ? 'Laporan Penjualan Excel' : 'Laporan Penjualan PDF';
    const setReportProgressVisibility = (visible: boolean) => {
        setShowReportProgress(visible);

        if (typeof window !== 'undefined') {
            window.localStorage.setItem('admin-report-progress-hidden', visible ? '0' : '1');
        }
    };

    return (
        <AppLayout title="Semua Pesanan">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold">Semua Pesanan</h1>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => router.post('/admin/orders/export/excel/background', {}, { preserveScroll: true })}
                            className="btn-primary"
                        >
                            Generate Excel
                        </button>
                        <button
                            type="button"
                            onClick={() => router.post('/admin/orders/export/pdf/background', {}, { preserveScroll: true })}
                            className="btn-primary"
                        >
                            Generate PDF
                        </button>
                        {!showReportProgress && jobs.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setReportProgressVisibility(true)}
                                className="btn-secondary"
                            >
                                Tampilkan Progress
                            </button>
                        )}
                    </div>
                </div>

                {showReportProgress && jobs.length > 0 && (
                    <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">Progress Laporan Background</h2>
                                <p className="mt-0.5 text-xs text-slate-500">Progress diperbarui otomatis selama queue worker berjalan.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => router.reload({ only: ['reportJobs'], preserveScroll: true })}
                                    className="btn-secondary px-3 py-1 text-xs"
                                >
                                    Refresh
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReportProgressVisibility(false)}
                                    className="btn-secondary px-3 py-1 text-xs"
                                >
                                    Sembunyikan
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 space-y-3">
                            {jobs.map((job) => (
                                <div key={job.id} className="rounded border border-white bg-white p-3 shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">{getJobTypeLabel(job.type)} #{job.id}</div>
                                            <div className="mt-0.5 text-xs text-slate-500">{job.message || 'Menunggu progress...'}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`rounded-full px-2 py-1 text-xs font-bold ${getJobStatusColor(job.status)}`}>
                                                {getJobStatusLabel(job.status)}
                                            </span>
                                            {job.download_url && (
                                                <a href={job.download_url} target="_blank" rel="noreferrer" className="btn-primary px-3 py-1 text-xs">
                                                    Download
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${job.status === 'failed' ? 'bg-red-500' : 'bg-cyan-500'}`}
                                                style={{ width: `${Math.max(0, Math.min(Number(job.progress || 0), 100))}%` }}
                                            ></div>
                                        </div>
                                        <span className="w-10 text-right text-xs font-bold text-slate-700">{Number(job.progress || 0)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pesanan Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Pembelian</th>
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
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPurchaseTypeColor(order)}`}>
                                            {formatPurchaseType(order)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatCustomerName(order)}
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

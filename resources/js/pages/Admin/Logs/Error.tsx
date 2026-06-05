import AppLayout from '../../../Layouts/AppLayout';
import { Link } from '@inertiajs/react';

export default function ErrorLogsIndex({
    logs,
    summary,
    filters,
}: {
    logs: any;
    summary: any;
    filters: any;
}) {
    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical':
                return 'bg-red-100 text-red-800';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800';
            case 'info':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const severities = [
        {
            key: '',
            label: 'Semua',
            count: logs.total,
            color: 'border-slate-400',
        },
        {
            key: 'critical',
            label: 'Critical',
            count: summary.critical,
            color: 'border-red-500',
        },
        {
            key: 'warning',
            label: 'Warning',
            count: summary.warning,
            color: 'border-yellow-500',
        },
        {
            key: 'info',
            label: 'Info',
            count: summary.info,
            color: 'border-blue-500',
        },
    ];

    return (
        <AppLayout title="Error Logs">
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                <h1 className="mb-6 border-b pb-4 text-2xl font-bold">
                    Error Logs
                </h1>

                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
                    {severities.map((severity) => {
                        const active =
                            (filters.severity || '') === severity.key;

                        return (
                            <Link
                                key={severity.key || 'all'}
                                href={
                                    severity.key
                                        ? `/admin/error-logs?severity=${severity.key}`
                                        : '/admin/error-logs'
                                }
                                className={`rounded border-l-4 bg-slate-50 p-4 transition hover:bg-white hover:shadow-sm ${severity.color} ${active ? 'ring-2 ring-cyan-100' : ''}`}
                            >
                                <div className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                                    {severity.label}
                                </div>
                                <div className="mt-2 text-2xl font-bold text-slate-800">
                                    {severity.count}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Tanggal
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Severity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Message
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    File & Line
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    URL
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {logs.data.map((log: any) => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                        {new Date(
                                            log.created_at,
                                        ).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getSeverityColor(log.severity)}`}
                                        >
                                            {log.severity.toUpperCase()}
                                        </span>
                                    </td>
                                    <td
                                        className="max-w-md truncate px-6 py-4 text-sm text-gray-900"
                                        title={log.message}
                                    >
                                        {log.message}
                                    </td>
                                    <td
                                        className="max-w-xs truncate px-6 py-4 text-xs whitespace-nowrap text-gray-500"
                                        title={log.file}
                                    >
                                        {log.file
                                            ? `${log.file}:${log.line}`
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-xs whitespace-nowrap text-gray-500">
                                        {log.method} {log.url}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {logs.data.length === 0 && (
                        <div className="py-6 text-center text-gray-500">
                            Tidak error logs found.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

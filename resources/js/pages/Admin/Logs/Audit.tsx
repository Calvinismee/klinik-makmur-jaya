import AppLayout from '../../../Layouts/AppLayout';

export default function AuditLogsIndex({ logs }: { logs: any }) {
    return (
        <AppLayout title="Audit Logs">
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                <h1 className="mb-6 border-b pb-4 text-2xl font-bold">
                    Audit Logs
                </h1>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Tanggal
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Pengguna
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Action
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Module
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Deskripsi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    IP Alamat
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
                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                        {log.user ? log.user.name : 'System'}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap">
                                        {log.action}
                                    </td>
                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                        {log.module}
                                    </td>
                                    <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-500">
                                        {log.description}
                                    </td>
                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                        {log.ip_address}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {logs.data.length === 0 && (
                        <div className="py-6 text-center text-gray-500">
                            Tidak audit logs found.
                        </div>
                    )}
                </div>

                {/* Basic Pagination component can be added here if needed */}
            </div>
        </AppLayout>
    );
}

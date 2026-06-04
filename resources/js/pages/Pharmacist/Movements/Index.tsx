import AppLayout from '../../../Layouts/AppLayout';

export default function MovementsIndex({ movements }: { movements: any }) {
    return (
        <AppLayout title="Stok Movement History">
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto p-6">
                <h2 className="text-lg font-bold mb-4">Stok Movement History</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Obat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kuantitas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referensi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengguna</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {movements.data.map((movement: any) => (
                            <tr key={movement.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(movement.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{movement.medicine?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.batch?.batch_number || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${movement.movement_type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {movement.movement_type.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-bold">
                                    {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {movement.reference_type} {movement.reference_id ? `#${movement.reference_id}` : ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.user?.name || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{movement.notes}</td>
                            </tr>
                        ))}
                        {movements.data.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">Tidak stock movements found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}

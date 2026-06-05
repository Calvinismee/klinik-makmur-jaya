import AppLayout from '../../../Layouts/AppLayout';

export default function MovementsIndex({ movements }: { movements: any }) {
    return (
        <AppLayout title="Stok Movement History">
            <div className="overflow-x-auto rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold">
                    Stok Movement History
                </h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Tanggal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Obat
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Batch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Kuantitas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Referensi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Pengguna
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Catatan
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {movements.data.map((movement: any) => (
                            <tr key={movement.id}>
                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                    {new Date(
                                        movement.created_at,
                                    ).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 font-medium whitespace-nowrap">
                                    {movement.medicine?.name}
                                </td>
                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                    {movement.batch?.batch_number || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${movement.movement_type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                    >
                                        {movement.movement_type.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold whitespace-nowrap">
                                    {movement.movement_type === 'in'
                                        ? '+'
                                        : '-'}
                                    {movement.quantity}
                                </td>
                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                    {movement.reference_type}{' '}
                                    {movement.reference_id
                                        ? `#${movement.reference_id}`
                                        : ''}
                                </td>
                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                    {movement.user?.name || '-'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {movement.notes}
                                </td>
                            </tr>
                        ))}
                        {movements.data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-6 py-4 text-center text-gray-500"
                                >
                                    Tidak stock movements found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}

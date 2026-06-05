import { useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import {
    decimalOnly,
    digitsOnly,
    preventNonNumericKey,
} from '../../../utils/numericInput';

export default function BatchesIndex({
    batches,
    medicines,
}: {
    batches: any[];
    medicines: any[];
}) {
    const { data, setData, post, processing, reset, errors } = useForm({
        medicine_id: '',
        batch_number: '',
        quantity: '',
        expired_at: '',
        purchase_price: '',
        received_at: new Date().toISOString().split('T')[0],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/pharmacist/batches', {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout title="Manage Obat Batches">
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold">Add New Batch</h2>
                <form
                    onSubmit={submit}
                    className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Obat
                        </label>
                        <select
                            className="mt-1 block w-full rounded-md border p-2"
                            value={data.medicine_id}
                            onChange={(e) =>
                                setData('medicine_id', e.target.value)
                            }
                            required
                        >
                            <option value="">Select Obat</option>
                            {medicines.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} ({m.code})
                                </option>
                            ))}
                        </select>
                        {errors.medicine_id && (
                            <div className="text-sm text-red-500">
                                {errors.medicine_id}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Nomor Batch
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border p-2"
                            value={data.batch_number}
                            onChange={(e) =>
                                setData('batch_number', e.target.value)
                            }
                            required
                        />
                        {errors.batch_number && (
                            <div className="text-sm text-red-500">
                                {errors.batch_number}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Quantity
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            className="mt-1 block w-full rounded-md border p-2"
                            value={data.quantity}
                            onKeyDown={preventNonNumericKey}
                            onChange={(e) =>
                                setData('quantity', digitsOnly(e.target.value))
                            }
                            required
                        />
                        {errors.quantity && (
                            <div className="text-sm text-red-500">
                                {errors.quantity}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Kedaluwarsa Pada
                        </label>
                        <input
                            type="date"
                            className="mt-1 block w-full rounded-md border p-2"
                            value={data.expired_at}
                            onChange={(e) =>
                                setData('expired_at', e.target.value)
                            }
                            required
                        />
                        {errors.expired_at && (
                            <div className="text-sm text-red-500">
                                {errors.expired_at}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Purchase Harga (optional)
                        </label>
                        <input
                            type="text"
                            inputMode="decimal"
                            className="mt-1 block w-full rounded-md border p-2"
                            value={data.purchase_price}
                            onKeyDown={(e) => preventNonNumericKey(e, true)}
                            onChange={(e) =>
                                setData(
                                    'purchase_price',
                                    decimalOnly(e.target.value),
                                )
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Received At
                        </label>
                        <input
                            type="date"
                            className="mt-1 block w-full rounded-md border p-2"
                            value={data.received_at}
                            onChange={(e) =>
                                setData('received_at', e.target.value)
                            }
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary"
                        >
                            Add Batch
                        </button>
                    </div>
                </form>
            </div>

            <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Obat
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Nomor Batch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Initial Kuantitas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Sisa Kuantitas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Kedaluwarsa Pada
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Received At
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {batches.map((batch) => {
                            const isExpired =
                                new Date(batch.expired_at) < new Date();
                            const isNearExpired =
                                !isExpired &&
                                new Date(batch.expired_at) <
                                    new Date(
                                        Date.now() + 30 * 24 * 60 * 60 * 1000,
                                    ); // 30 days

                            return (
                                <tr
                                    key={batch.id}
                                    className={
                                        isExpired
                                            ? 'bg-red-50'
                                            : isNearExpired
                                              ? 'bg-yellow-50'
                                              : ''
                                    }
                                >
                                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                                        {batch.medicine?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {batch.batch_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {batch.quantity}
                                    </td>
                                    <td className="px-6 py-4 font-bold whitespace-nowrap">
                                        {batch.remaining_quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={
                                                isExpired
                                                    ? 'font-bold text-red-600'
                                                    : isNearExpired
                                                      ? 'font-bold text-yellow-600'
                                                      : ''
                                            }
                                        >
                                            {new Date(
                                                batch.expired_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                        {new Date(
                                            batch.received_at,
                                        ).toLocaleDateString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}

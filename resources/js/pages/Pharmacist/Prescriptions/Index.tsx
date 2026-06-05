import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function PrescriptionsIndex({ orders }: { orders: any[] }) {
    const [verifyingId, setVerifyingId] = useState<number | null>(null);
    const [reason, setReason] = useState('');
    const [reasonError, setReasonError] = useState('');

    const handleVerify = (orderId: number, status: 'approved' | 'rejected') => {
        if (status === 'rejected' && !reason.trim()) {
            setReasonError('Alasan penolakan wajib diisi.');
            return;
        }

        setReasonError('');
        router.post(
            `/pharmacist/prescriptions/${orderId}/verify`,
            {
                status,
                reason: status === 'rejected' ? reason : null,
            },
            {
                onSuccess: () => {
                    setVerifyingId(null);
                    setReason('');
                    setReasonError('');
                },
            },
        );
    };

    return (
        <AppLayout title="Verifikasi Resep">
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                <h1 className="mb-6 border-b pb-4 text-2xl font-bold">
                    Resep Tertunda
                </h1>

                {orders.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                        Tidak ada resep yang perlu diverifikasi.
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="rounded-lg border bg-gray-50 p-6"
                            >
                                <div className="flex flex-col gap-6 md:flex-row">
                                    <div className="md:w-1/3">
                                        <h3 className="mb-2 text-lg font-bold">
                                            Pesanan #{order.order_number}
                                        </h3>
                                        <p className="mb-1 text-sm text-gray-600">
                                            Pelanggan: {order.user?.name}
                                        </p>
                                        <p className="mb-4 text-sm text-gray-600">
                                            Tanggal:{' '}
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleString()}
                                        </p>

                                        <div className="rounded border bg-white p-3">
                                            <h4 className="mb-2 text-sm font-bold">
                                                Item yang membutuhkan resep:
                                            </h4>
                                            <ul className="space-y-1 text-sm">
                                                {order.items
                                                    .filter(
                                                        (i: any) =>
                                                            i.medicine
                                                                ?.requires_prescription,
                                                    )
                                                    .map((item: any) => (
                                                        <li
                                                            key={item.id}
                                                            className="flex justify-between text-red-600"
                                                        >
                                                            <span>
                                                                {
                                                                    item
                                                                        .medicine
                                                                        ?.name
                                                                }
                                                            </span>
                                                            <span>
                                                                x{item.quantity}
                                                            </span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="md:w-1/3">
                                        <h3 className="mb-2 text-lg font-bold">
                                            Gambar Resep
                                        </h3>
                                        {order.prescription_image ? (
                                            <a
                                                href={`/storage/${order.prescription_image}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block overflow-hidden rounded border"
                                            >
                                                <img
                                                    src={`/storage/${order.prescription_image}`}
                                                    alt="Prescription"
                                                    className="max-h-[300px] w-full object-cover"
                                                />
                                            </a>
                                        ) : (
                                            <div className="text-red-500">
                                                Tidak ada gambar resep!
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center md:w-1/3">
                                        <div className="rounded border bg-white p-4 shadow-sm">
                                            <h3 className="mb-4 text-center font-bold">
                                                Aksi
                                            </h3>

                                            {verifyingId === order.id ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        className="w-full rounded border-gray-300 text-sm"
                                                        rows={3}
                                                        placeholder="Alasan penolakan (wajib)"
                                                        value={reason}
                                                        onChange={(e) => {
                                                            setReason(
                                                                e.target.value,
                                                            );
                                                            if (reasonError) {
                                                                setReasonError(
                                                                    '',
                                                                );
                                                            }
                                                        }}
                                                    ></textarea>
                                                    {reasonError && (
                                                        <div className="toast-enter rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                                            {reasonError}
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleVerify(
                                                                    order.id,
                                                                    'rejected',
                                                                )
                                                            }
                                                            className="btn-danger flex-1 px-3 py-2 text-sm"
                                                        >
                                                            Confirm Tolak
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setVerifyingId(
                                                                    null,
                                                                );
                                                                setReasonError(
                                                                    '',
                                                                );
                                                            }}
                                                            className="btn-secondary flex-1 px-3 py-2 text-sm"
                                                        >
                                                            Batal
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    <button
                                                        onClick={() =>
                                                            handleVerify(
                                                                order.id,
                                                                'approved',
                                                            )
                                                        }
                                                        className="btn-primary w-full"
                                                    >
                                                        Setujui Resep
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setVerifyingId(
                                                                order.id,
                                                            )
                                                        }
                                                        className="btn-danger w-full"
                                                    >
                                                        Tolak Resep
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

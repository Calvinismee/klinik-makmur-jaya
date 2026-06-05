import AppLayout from '../../../Layouts/AppLayout';

export default function PrescriptionsHistory({ orders }: { orders: any[] }) {
    return (
        <AppLayout title="Riwayat Verifikasi Resep">
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                <h1 className="mb-6 border-b pb-4 text-2xl font-bold">
                    Riwayat Verifikasi Resep
                </h1>

                {orders.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                        Belum ada riwayat verifikasi resep.
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
                                                Obat dengan Resep:
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
                                        <div className="flex h-full flex-col items-center justify-center rounded border bg-white p-6 shadow-sm">
                                            <h3 className="mb-4 text-center font-bold">
                                                Status Verifikasi
                                            </h3>

                                            {order.prescription_status ===
                                            'approved' ? (
                                                <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 font-bold text-green-800">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Disetujui
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="mb-3 flex items-center justify-center gap-2 rounded-full bg-red-100 px-4 py-2 font-bold text-red-800">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        Ditolak
                                                    </div>
                                                    {order.prescription_rejection_reason && (
                                                        <div className="rounded bg-gray-100 p-2 text-sm text-gray-600">
                                                            <strong>
                                                                Alasan:
                                                            </strong>{' '}
                                                            {
                                                                order.prescription_rejection_reason
                                                            }
                                                        </div>
                                                    )}
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

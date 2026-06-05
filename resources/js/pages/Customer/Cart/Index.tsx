import { router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function CartIndex({
    cart,
    subtotal,
}: {
    cart: any[];
    subtotal: number;
}) {
    const updateQuantity = (medicineId: number, quantity: number) => {
        router.post(
            '/customer/cart/update',
            {
                medicine_id: medicineId,
                quantity: quantity,
            },
            { preserveScroll: true },
        );
    };

    const removeItem = (medicineId: number) => {
        router.post(
            '/customer/cart/remove',
            {
                medicine_id: medicineId,
            },
            { preserveScroll: true },
        );
    };

    const hasPrescriptionItems = cart.some(
        (item) => item.requires_prescription,
    );

    return (
        <AppLayout title="Keranjang Belanja">
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                <h1 className="mb-6 border-b pb-4 text-2xl font-bold">
                    Keranjang Belanja Anda
                </h1>

                {cart.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                        Keranjang Anda kosong. <br />
                        <a
                            href="/customer/catalog"
                            className="mt-2 inline-block text-cyan-600 hover:underline"
                        >
                            Lihat Katalog
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8 lg:flex-row">
                        <div className="flex-1">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col items-center gap-4 border-b py-4 sm:flex-row"
                                >
                                    <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded bg-gray-100">
                                        {item.image ? (
                                            <img
                                                src={`/storage/${item.image}`}
                                                alt={item.name}
                                                className="max-h-full max-w-full rounded object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                Tidak Ada Gambar
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <h3 className="text-lg font-bold">
                                            {item.name}
                                        </h3>
                                        <div className="mb-1 font-semibold text-cyan-600">
                                            Rp{' '}
                                            {Number(item.price).toLocaleString(
                                                'id-ID',
                                            )}
                                        </div>
                                        {Boolean(
                                            item.requires_prescription,
                                        ) && (
                                            <span className="mb-2 inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                                                Butuh Resep
                                            </span>
                                        )}
                                        {!item.in_stock && (
                                            <div className="text-sm font-semibold text-red-500">
                                                Hanya tersedia{' '}
                                                {item.available_stock} stok
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center rounded border">
                                            <button
                                                className="px-3 py-1 hover:bg-gray-100"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.id,
                                                        item.quantity - 1,
                                                    )
                                                }
                                            >
                                                -
                                            </button>
                                            <span className="border-x px-3">
                                                {item.quantity}
                                            </span>
                                            <button
                                                className="px-3 py-1 hover:bg-gray-100"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.id,
                                                        item.quantity + 1,
                                                    )
                                                }
                                                disabled={
                                                    item.quantity >=
                                                    item.available_stock
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="min-w-[100px] text-right font-bold">
                                            Rp{' '}
                                            {Number(
                                                item.price * item.quantity,
                                            ).toLocaleString('id-ID')}
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Hapus item"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-6 w-6"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:w-80">
                            <div className="rounded-lg border bg-gray-50 p-6">
                                <h2 className="mb-4 text-lg font-bold">
                                    Ringkasan Pesanan
                                </h2>
                                <div className="mb-2 flex justify-between">
                                    <span className="text-gray-600">
                                        Subtotal
                                    </span>
                                    <span className="font-bold">
                                        Rp{' '}
                                        {Number(subtotal).toLocaleString(
                                            'id-ID',
                                        )}
                                    </span>
                                </div>
                                <hr className="my-4" />
                                <div className="mb-6 flex justify-between text-lg">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-cyan-600">
                                        Rp{' '}
                                        {Number(subtotal).toLocaleString(
                                            'id-ID',
                                        )}
                                    </span>
                                </div>

                                {hasPrescriptionItems && (
                                    <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                                        <strong>Catatan:</strong> Keranjang Anda
                                        berisi obat yang membutuhkan resep
                                        dokter. Anda akan diminta untuk
                                        mengunggahnya saat proses pembayaran.
                                    </div>
                                )}

                                <button
                                    className="btn-primary w-full py-3"
                                    disabled={cart.some((i) => !i.in_stock)}
                                    onClick={() =>
                                        router.get('/customer/checkout')
                                    }
                                >
                                    Lanjut ke Pembayaran
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function PosIndex({
    medicines,
    cart,
    subtotal,
    filters,
}: {
    medicines: any;
    cart: any[];
    subtotal: number;
    filters: any;
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [notes, setNotes] = useState('');
    const [showClearCartModal, setShowClearCartModal] = useState(false);
    const [isClearingCart, setIsClearingCart] = useState(false);
    const cartQuantityByMedicine = cart.reduce<Record<number, number>>(
        (totals, item) => {
            totals[item.id] = Number(item.quantity || 0);
            return totals;
        },
        {},
    );

    const medicinesWithCartState = medicines.data.map((med: any) => {
        const cartQuantity = cartQuantityByMedicine[med.id] || 0;
        const availableStock = Number(med.available_stock || 0);

        return {
            ...med,
            cartQuantity,
            availableForSale: Math.max(availableStock - cartQuantity, 0),
        };
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/cashier/pos', { search }, { preserveState: true });
    };

    const addToCart = (medicineId: number) => {
        router.post(
            '/cashier/pos/add',
            {
                medicine_id: medicineId,
                quantity: 1,
            },
            { preserveScroll: true },
        );
    };

    const updateQuantity = (medicineId: number, quantity: number) => {
        router.post(
            '/cashier/pos/update',
            {
                medicine_id: medicineId,
                quantity: quantity,
            },
            { preserveScroll: true },
        );
    };

    const handleCheckout = () => {
        if (confirm('Proses transaksi ini?')) {
            router.post(
                '/cashier/pos/checkout',
                { notes },
                {
                    preserveScroll: true,
                    onSuccess: () => setNotes(''),
                },
            );
        }
    };

    const clearCart = () => {
        router.post(
            '/cashier/pos/clear',
            {},
            {
                preserveScroll: true,
                onStart: () => setIsClearingCart(true),
                onSuccess: () => {
                    setNotes('');
                    setShowClearCartModal(false);
                },
                onFinish: () => setIsClearingCart(false),
            },
        );
    };

    return (
        <AppLayout title="Pembayaran Offline">
            <div className="flex flex-col gap-6 lg:flex-row">
                {/* Catalog Section */}
                <div className="flex-1 rounded-lg bg-white p-4 shadow-sm">
                    <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                        <input
                            type="text"
                            placeholder="Cari obat berdasarkan nama atau kode..."
                            className="flex-1 rounded border-gray-300"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn-primary">
                            Search
                        </button>
                    </form>

                    <div className="grid max-h-[calc(100vh-260px)] auto-rows-max grid-cols-2 gap-4 overflow-y-auto pr-2 sm:grid-cols-3 lg:grid-cols-4">
                        {medicinesWithCartState.map((med: any) => (
                            <button
                                key={med.id}
                                type="button"
                                className="flex h-36 flex-col rounded border p-3 text-left transition hover:border-cyan-500 hover:shadow-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:opacity-70"
                                onClick={() => addToCart(med.id)}
                                disabled={med.availableForSale <= 0}
                            >
                                <div className="min-w-0">
                                    <div
                                        className="truncate text-sm font-bold"
                                        title={med.name}
                                    >
                                        {med.name}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500">
                                        {med.code}
                                    </div>
                                </div>
                                <div className="mt-3 text-base font-bold text-cyan-600">
                                    Rp{' '}
                                    {Number(med.price).toLocaleString('id-ID')}
                                </div>
                                <div className="mt-auto flex items-end justify-between gap-2 text-xs font-semibold">
                                    {med.availableForSale > 0 ? (
                                        <span className="text-green-600">
                                            Stok: {med.availableForSale}
                                        </span>
                                    ) : (
                                        <span className="text-red-600">
                                            Stok Habis
                                        </span>
                                    )}
                                    {med.cartQuantity > 0 && (
                                        <span className="rounded bg-cyan-50 px-2 py-1 text-cyan-700">
                                            Di pesanan: {med.cartQuantity}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Keranjang Section */}
                <div className="flex h-[700px] flex-col rounded-lg bg-white p-4 shadow-sm lg:w-96">
                    <div className="mb-4 flex items-center justify-between gap-3 border-b pb-2">
                        <h2 className="text-xl font-bold">Pesanan Saat Ini</h2>
                        {cart.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setShowClearCartModal(true)}
                                className="btn-danger-outline px-3 py-1 text-xs"
                            >
                                Kosongkan
                            </button>
                        )}
                    </div>

                    <div className="mb-4 flex-1 overflow-y-auto border-b">
                        {cart.length === 0 ? (
                            <div className="py-10 text-center text-gray-500">
                                Keranjang kosong
                            </div>
                        ) : (
                            <div className="space-y-4 pr-2">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col border-b pb-3"
                                    >
                                        <div className="mb-2 flex justify-between">
                                            <div className="text-sm font-semibold">
                                                {item.name}
                                            </div>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item.id, 0)
                                                }
                                                className="text-xs text-red-500"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center rounded border">
                                                <button
                                                    className="bg-gray-100 px-2 py-1 text-sm"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                >
                                                    -
                                                </button>
                                                <span className="px-3 text-sm">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    className="bg-gray-100 px-2 py-1 text-sm disabled:opacity-40"
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
                                            <div className="text-sm font-bold text-cyan-600">
                                                Rp{' '}
                                                {Number(
                                                    item.price * item.quantity,
                                                ).toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                        {!item.in_stock && (
                                            <div className="mt-1 text-xs text-red-500">
                                                Stok terbatas!
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="mb-2 flex justify-between text-lg">
                            <span className="font-bold">Total</span>
                            <span className="font-bold text-cyan-600">
                                Rp {Number(subtotal).toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="mb-4">
                            <textarea
                                className="w-full rounded border-gray-300 text-sm"
                                rows={2}
                                placeholder="Catatan pesanan (opsional)"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            ></textarea>
                        </div>
                        <button
                            className="btn-primary w-full py-3 text-lg"
                            onClick={handleCheckout}
                            disabled={
                                cart.length === 0 ||
                                cart.some((i) => !i.in_stock)
                            }
                        >
                            Proses Pembayaran
                        </button>
                    </div>
                </div>
            </div>

            {showClearCartModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900">
                            Kosongkan pesanan?
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Semua item di Pesanan Saat Ini akan dihapus. Stok di
                            katalog akan kembali sesuai jumlah yang tersedia.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowClearCartModal(false)}
                                className="btn-secondary text-sm"
                                disabled={isClearingCart}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={clearCart}
                                className="btn-danger text-sm"
                                disabled={isClearingCart}
                            >
                                {isClearingCart
                                    ? 'Mengosongkan...'
                                    : 'Kosongkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

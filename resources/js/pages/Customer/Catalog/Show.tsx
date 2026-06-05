import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { digitsOnly, preventNonNumericKey } from '../../../utils/numericInput';

export default function CatalogShow({ medicine }: { medicine: any }) {
    const availableStock = Number(medicine.batches_sum_remaining_quantity || 0);
    const [quantity, setQuantity] = useState('1');
    const [adding, setAdding] = useState(false);
    const quantityNumber = Math.max(1, Number(quantity || 1));

    const clampQuantity = (value: number) => {
        const normalized = Math.max(1, Math.floor(value || 1));

        return availableStock > 0
            ? Math.min(normalized, availableStock)
            : normalized;
    };

    const commitQuantity = () => {
        setQuantity(String(clampQuantity(Number(quantity || 1))));
    };

    const stepQuantity = (direction: 1 | -1) => {
        setQuantity(String(clampQuantity(quantityNumber + direction)));
    };

    const addToCart = () => {
        const finalQuantity = clampQuantity(quantityNumber);
        setQuantity(String(finalQuantity));
        setAdding(true);
        router.post(
            '/customer/cart/add',
            {
                medicine_id: medicine.id,
                quantity: finalQuantity,
            },
            {
                preserveScroll: true,
                onFinish: () => setAdding(false),
            },
        );
    };

    return (
        <AppLayout title={medicine.name}>
            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                <div className="md:flex">
                    <div className="flex min-h-[300px] items-center justify-center bg-gray-50 p-8 md:w-1/2">
                        {medicine.image ? (
                            <img
                                src={`/storage/${medicine.image}`}
                                alt={medicine.name}
                                className="max-h-[400px] max-w-full rounded object-contain"
                            />
                        ) : (
                            <div className="text-lg text-gray-400">
                                Tidak Ada Gambar
                            </div>
                        )}
                    </div>
                    <div className="p-8 md:w-1/2">
                        <div className="mb-1 text-sm font-semibold tracking-wide text-cyan-600 uppercase">
                            {medicine.category?.name || 'Uncategorized'}
                        </div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">
                            {medicine.name}
                        </h1>
                        <p className="mb-4 text-gray-500">
                            Kode: {medicine.code}
                        </p>

                        <div className="mb-6 text-3xl font-bold text-cyan-600">
                            Rp {Number(medicine.price).toLocaleString('id-ID')}
                        </div>

                        <div className="mb-4 font-semibold text-gray-700">
                            Sisa Stok: {availableStock}
                        </div>

                        {Boolean(medicine.requires_prescription) && (
                            <div className="mb-6 inline-flex items-center rounded-full border border-yellow-200 bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                                <svg
                                    className="mr-1.5 h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    ></path>
                                </svg>
                                Butuh Resep
                            </div>
                        )}

                        <div className="prose mb-8 max-w-none">
                            {medicine.description && (
                                <>
                                    <h3 className="mb-2 text-lg font-semibold">
                                        Deskripsi
                                    </h3>
                                    <p className="mb-4 text-gray-600">
                                        {medicine.description}
                                    </p>
                                </>
                            )}

                            {medicine.composition && (
                                <>
                                    <h3 className="mb-2 text-lg font-semibold">
                                        Composition
                                    </h3>
                                    <p className="mb-4 text-gray-600">
                                        {medicine.composition}
                                    </p>
                                </>
                            )}

                            {medicine.dosage && (
                                <>
                                    <h3 className="mb-2 text-lg font-semibold">
                                        Dosage
                                    </h3>
                                    <p className="mb-4 text-gray-600">
                                        {medicine.dosage}
                                    </p>
                                </>
                            )}
                        </div>

                        <hr className="my-6" />

                        <div className="flex items-end gap-4">
                            <div className="w-36">
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Quantity
                                </label>
                                <div className="flex h-12 overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={quantity}
                                        onKeyDown={preventNonNumericKey}
                                        onChange={(e) =>
                                            setQuantity(
                                                digitsOnly(e.target.value),
                                            )
                                        }
                                        onBlur={commitQuantity}
                                        disabled={availableStock <= 0}
                                        className="min-w-0 flex-1 border-0 px-4 text-lg font-semibold focus:ring-0"
                                        aria-label="Quantity"
                                    />
                                    <div className="flex w-10 flex-col border-l border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => stepQuantity(1)}
                                            disabled={
                                                availableStock > 0 &&
                                                quantityNumber >= availableStock
                                            }
                                            className="flex flex-1 items-center justify-center text-cyan-700 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:text-gray-300"
                                            aria-label="Tambah quantity"
                                        >
                                            <svg
                                                viewBox="0 0 20 20"
                                                className="h-4 w-4"
                                                fill="currentColor"
                                            >
                                                <path d="M10 5 5.5 11h9L10 5Z" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => stepQuantity(-1)}
                                            disabled={quantityNumber <= 1}
                                            className="flex flex-1 items-center justify-center border-t border-gray-200 text-cyan-700 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:text-gray-300"
                                            aria-label="Kurangi quantity"
                                        >
                                            <svg
                                                viewBox="0 0 20 20"
                                                className="h-4 w-4"
                                                fill="currentColor"
                                            >
                                                <path d="m10 15 4.5-6h-9l4.5 6Z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={addToCart}
                                disabled={adding || availableStock <= 0}
                                className="btn-primary flex-1"
                            >
                                {availableStock <= 0
                                    ? 'Stok Habis'
                                    : adding
                                      ? 'Adding...'
                                      : 'Tambah ke Keranjang'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

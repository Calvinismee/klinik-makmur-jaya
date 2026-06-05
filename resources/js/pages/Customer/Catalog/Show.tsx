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

        return availableStock > 0 ? Math.min(normalized, availableStock) : normalized;
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
        router.post('/customer/cart/add', {
            medicine_id: medicine.id,
            quantity: finalQuantity
        }, {
            preserveScroll: true,
            onFinish: () => setAdding(false)
        });
    };

    return (
        <AppLayout title={medicine.name}>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-8 min-h-[300px]">
                        {medicine.image ? (
                            <img src={`/storage/${medicine.image}`} alt={medicine.name} className="max-w-full max-h-[400px] object-contain rounded" />
                        ) : (
                            <div className="text-gray-400 text-lg">Tidak Ada Gambar</div>
                        )}
                    </div>
                    <div className="md:w-1/2 p-8">
                        <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-cyan-600">
                            {medicine.category?.name || 'Uncategorized'}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{medicine.name}</h1>
                        <p className="text-gray-500 mb-4">Kode: {medicine.code}</p>
                        
                        <div className="text-3xl font-bold text-cyan-600 mb-6">
                            Rp {Number(medicine.price).toLocaleString('id-ID')}
                        </div>

                        <div className="text-gray-700 font-semibold mb-4">
                            Sisa Stok: {availableStock}
                        </div>

                        {Boolean(medicine.requires_prescription) && (
                            <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Butuh Resep
                            </div>
                        )}

                        <div className="prose max-w-none mb-8">
                            {medicine.description && (
                                <>
                                    <h3 className="text-lg font-semibold mb-2">Deskripsi</h3>
                                    <p className="text-gray-600 mb-4">{medicine.description}</p>
                                </>
                            )}
                            
                            {medicine.composition && (
                                <>
                                    <h3 className="text-lg font-semibold mb-2">Composition</h3>
                                    <p className="text-gray-600 mb-4">{medicine.composition}</p>
                                </>
                            )}

                            {medicine.dosage && (
                                <>
                                    <h3 className="text-lg font-semibold mb-2">Dosage</h3>
                                    <p className="text-gray-600 mb-4">{medicine.dosage}</p>
                                </>
                            )}
                        </div>

                        <hr className="my-6" />

                        <div className="flex items-end gap-4">
                            <div className="w-36">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <div className="flex h-12 overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={quantity}
                                        onKeyDown={preventNonNumericKey}
                                        onChange={(e) => setQuantity(digitsOnly(e.target.value))}
                                        onBlur={commitQuantity}
                                        disabled={availableStock <= 0}
                                        className="min-w-0 flex-1 border-0 px-4 text-lg font-semibold focus:ring-0"
                                        aria-label="Quantity"
                                    />
                                    <div className="flex w-10 flex-col border-l border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => stepQuantity(1)}
                                            disabled={availableStock > 0 && quantityNumber >= availableStock}
                                            className="flex flex-1 items-center justify-center text-cyan-700 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:text-gray-300"
                                            aria-label="Tambah quantity"
                                        >
                                            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
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
                                            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
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
                                {availableStock <= 0 ? 'Stok Habis' : adding ? 'Adding...' : 'Tambah ke Keranjang'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function CatalogShow({ medicine }: { medicine: any }) {
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    const addToCart = () => {
        setAdding(true);
        router.post('/customer/cart/add', {
            medicine_id: medicine.id,
            quantity: quantity
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
                            <div className="text-gray-400 text-lg">Tidak Ada Gambar Available</div>
                        )}
                    </div>
                    <div className="md:w-1/2 p-8">
                        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-1">
                            {medicine.category?.name || 'Uncategorized'}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{medicine.name}</h1>
                        <p className="text-gray-500 mb-4">Kode: {medicine.code}</p>
                        
                        <div className="text-3xl font-bold text-blue-600 mb-6">
                            Rp {Number(medicine.price).toLocaleString('id-ID')}
                        </div>

                        <div className="text-gray-700 font-semibold mb-4">
                            Sisa Stok: {medicine.batches_sum_remaining_quantity || 0}
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={quantity} 
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
                                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <button 
                                onClick={addToCart}
                                disabled={adding}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50"
                            >
                                {adding ? 'Adding...' : 'Tambah ke Keranjang'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

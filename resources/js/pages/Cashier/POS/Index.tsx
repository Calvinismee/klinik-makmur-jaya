import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function PosIndex({ medicines, cart, subtotal, filters }: { medicines: any, cart: any[], subtotal: number, filters: any }) {
    const [search, setSearch] = useState(filters.search || '');
    const [notes, setNotes] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/cashier/pos', { search }, { preserveState: true });
    };

    const addToCart = (medicineId: number) => {
        router.post('/cashier/pos/add', {
            medicine_id: medicineId,
            quantity: 1
        }, { preserveScroll: true });
    };

    const updateQuantity = (medicineId: number, quantity: number) => {
        router.post('/cashier/pos/update', {
            medicine_id: medicineId,
            quantity: quantity
        }, { preserveScroll: true });
    };

    const handleCheckout = () => {
        if (confirm('Proses transaksi ini?')) {
            router.post('/cashier/pos/checkout', { notes }, {
                preserveScroll: true,
                onSuccess: () => setNotes('')
            });
        }
    };

    return (
        <AppLayout title="Pembayaran Offline">
            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Catalog Section */}
                <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
                    <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Cari obat berdasarkan nama atau kode..." 
                            className="flex-1 rounded border-gray-300"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
                    </form>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 h-[600px] overflow-y-auto pr-2">
                        {medicines.data.map((med: any) => (
                            <div key={med.id} className="border rounded p-3 flex flex-col hover:border-blue-500 cursor-pointer transition" onClick={() => med.available_stock > 0 && addToCart(med.id)}>
                                <div className="text-sm font-bold mb-1 truncate" title={med.name}>{med.name}</div>
                                <div className="text-xs text-gray-500 mb-2">{med.code}</div>
                                <div className="text-blue-600 font-bold mb-2">Rp {Number(med.price).toLocaleString('id-ID')}</div>
                                <div className="mt-auto text-xs font-semibold">
                                    {med.available_stock > 0 ? (
                                        <span className="text-green-600">Stok: {med.available_stock}</span>
                                    ) : (
                                        <span className="text-red-600">Stok Habis</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Keranjang Section */}
                <div className="lg:w-96 bg-white rounded-lg shadow-sm p-4 flex flex-col h-[700px]">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Pesanan Saat Ini</h2>
                    
                    <div className="flex-1 overflow-y-auto mb-4 border-b">
                        {cart.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">Keranjang kosong</div>
                        ) : (
                            <div className="space-y-4 pr-2">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex flex-col border-b pb-3">
                                        <div className="flex justify-between mb-2">
                                            <div className="font-semibold text-sm">{item.name}</div>
                                            <button onClick={() => updateQuantity(item.id, 0)} className="text-red-500 text-xs">Hapus</button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center border rounded">
                                                <button className="px-2 py-1 text-sm bg-gray-100" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                                <span className="px-3 text-sm">{item.quantity}</span>
                                                <button className="px-2 py-1 text-sm bg-gray-100" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={!item.in_stock}>+</button>
                                            </div>
                                            <div className="font-bold text-sm text-blue-600">Rp {Number(item.price * item.quantity).toLocaleString('id-ID')}</div>
                                        </div>
                                        {!item.in_stock && (
                                            <div className="text-red-500 text-xs mt-1">Stok terbatas!</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between mb-2 text-lg">
                            <span className="font-bold">Total</span>
                            <span className="font-bold text-blue-600">Rp {Number(subtotal).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="mb-4">
                            <textarea 
                                className="w-full text-sm rounded border-gray-300" 
                                rows={2} 
                                placeholder="Catatan pesanan (opsional)"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            ></textarea>
                        </div>
                        <button 
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded text-lg disabled:opacity-50"
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || cart.some(i => !i.in_stock)}
                        >
                            Proses Pembayaran
                        </button>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}

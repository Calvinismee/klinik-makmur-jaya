import { router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function CartIndex({ cart, subtotal }: { cart: any[], subtotal: number }) {

    const updateQuantity = (medicineId: number, quantity: number) => {
        router.post('/customer/cart/update', {
            medicine_id: medicineId,
            quantity: quantity
        }, { preserveScroll: true });
    };

    const removeItem = (medicineId: number) => {
        router.post('/customer/cart/remove', {
            medicine_id: medicineId
        }, { preserveScroll: true });
    };

    const hasPrescriptionItems = cart.some(item => item.requires_prescription);

    return (
        <AppLayout title="Keranjang Belanja">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold mb-6 border-b pb-4">Keranjang Belanja Anda</h1>

                {cart.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Keranjang Anda kosong. <br/>
                        <a href="/customer/catalog" className="text-blue-600 hover:underline mt-2 inline-block">Lihat Katalog</a>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                            {cart.map((item) => (
                                <div key={item.id} className="flex flex-col sm:flex-row items-center border-b py-4 gap-4">
                                    <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                        {item.image ? (
                                            <img src={`/storage/${item.image}`} alt={item.name} className="max-w-full max-h-full object-cover rounded" />
                                        ) : (
                                            <span className="text-gray-400 text-xs">Tidak Ada Gambar</span>
                                        )}
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                        <div className="text-blue-600 font-semibold mb-1">Rp {Number(item.price).toLocaleString('id-ID')}</div>
                                        {Boolean(item.requires_prescription) && (
                                            <span className="inline-block px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800 mb-2">
                                                Butuh Resep
                                            </span>
                                        )}
                                        {!item.in_stock && (
                                            <div className="text-red-500 text-sm font-semibold">
                                                Hanya tersedia {item.available_stock} stok
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border rounded">
                                            <button 
                                                className="px-3 py-1 hover:bg-gray-100"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >-</button>
                                            <span className="px-3 border-x">{item.quantity}</span>
                                            <button 
                                                className="px-3 py-1 hover:bg-gray-100"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={item.quantity >= item.available_stock}
                                            >+</button>
                                        </div>
                                        <div className="font-bold min-w-[100px] text-right">
                                            Rp {Number(item.price * item.quantity).toLocaleString('id-ID')}
                                        </div>
                                        <button 
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Hapus item"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:w-80">
                            <div className="bg-gray-50 p-6 rounded-lg border">
                                <h2 className="text-lg font-bold mb-4">Ringkasan Pesanan</h2>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-bold">Rp {Number(subtotal).toLocaleString('id-ID')}</span>
                                </div>
                                <hr className="my-4" />
                                <div className="flex justify-between mb-6 text-lg">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-blue-600">Rp {Number(subtotal).toLocaleString('id-ID')}</span>
                                </div>

                                {hasPrescriptionItems && (
                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded mb-4">
                                        <strong>Catatan:</strong> Keranjang Anda berisi obat yang membutuhkan resep dokter. Anda akan diminta untuk mengunggahnya saat proses pembayaran.
                                    </div>
                                )}

                                <button 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50"
                                    disabled={cart.some(i => !i.in_stock)}
                                    onClick={() => router.get('/customer/checkout')}
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

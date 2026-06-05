import { useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function CheckoutIndex({ cart, subtotal, hasPrescriptionItems }: { cart: any[], subtotal: number, hasPrescriptionItems: boolean }) {
    const { data, setData, post, processing, errors } = useForm({
        notes: '',
        prescription_image: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/customer/checkout');
    };

    return (
        <AppLayout title="Pembayaran">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold mb-6 border-b pb-4">Pembayaran</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold mb-4">Detail Pesanan</h2>
                        <div className="bg-gray-50 p-4 rounded border mb-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-gray-500">{item.quantity} x Rp {Number(item.price).toLocaleString('id-ID')}</div>
                                    </div>
                                    <div className="font-bold">
                                        Rp {Number(item.price * item.quantity).toLocaleString('id-ID')}
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-4 mt-2 font-bold text-lg">
                                <div>Total</div>
                                <div className="text-blue-600">Rp {Number(subtotal).toLocaleString('id-ID')}</div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="rounded border border-blue-100 bg-blue-50 p-4">
                                <h3 className="font-bold text-blue-800">Pembayaran</h3>
                                <p className="mt-1 text-sm text-blue-700">
                                    {hasPrescriptionItems
                                        ? 'Setelah resep disetujui apoteker, Anda dapat membayar melalui dari halaman detail pesanan.'
                                        : 'Setelah pesanan dibuat, Anda akan diarahkan ke halaman pembayaran.'}
                                </p>
                            </div>

                            {hasPrescriptionItems && (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                                    <h3 className="font-bold text-yellow-800 mb-2">Resep Dibutuhkan</h3>
                                    <p className="text-sm text-yellow-700 mb-4">
                                        Silakan unggah foto atau pindaian resep Anda yang jelas.
                                    </p>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={e => setData('prescription_image', e.target.files?.[0] || null)}
                                        required
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {errors.prescription_image && <div className="text-red-500 text-sm mt-1">{errors.prescription_image}</div>}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
                                <textarea 
                                    className="w-full p-5 rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                    rows={3}
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    placeholder="Ada instruksi khusus untuk pesanan Anda?"
                                ></textarea>
                                {errors.notes && <div className="text-red-500 text-sm mt-1">{errors.notes}</div>}
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition disabled:opacity-50"
                            >
                                {processing
                                    ? 'Sedang Diproses...'
                                    : hasPrescriptionItems
                                        ? 'Kirim untuk Verifikasi Resep'
                                        : 'Bayar dengan Midtrans'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

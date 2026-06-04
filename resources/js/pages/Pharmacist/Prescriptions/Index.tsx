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
        router.post(`/pharmacist/prescriptions/${orderId}/verify`, {
            status,
            reason: status === 'rejected' ? reason : null
        }, {
            onSuccess: () => {
                setVerifyingId(null);
                setReason('');
                setReasonError('');
            }
        });
    };

    return (
        <AppLayout title="Verifikasi Resep">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold mb-6 border-b pb-4">Resep Tertunda</h1>

                {orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Tidak ada resep yang perlu diverifikasi.
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => (
                            <div key={order.id} className="border rounded-lg p-6 bg-gray-50">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="md:w-1/3">
                                        <h3 className="font-bold text-lg mb-2">Pesanan #{order.order_number}</h3>
                                        <p className="text-sm text-gray-600 mb-1">Pelanggan: {order.user?.name}</p>
                                        <p className="text-sm text-gray-600 mb-4">Tanggal: {new Date(order.created_at).toLocaleString()}</p>
                                        
                                        <div className="bg-white p-3 rounded border">
                                            <h4 className="font-bold text-sm mb-2">Item yang membutuhkan resep:</h4>
                                            <ul className="text-sm space-y-1">
                                                {order.items.filter((i: any) => i.medicine?.requires_prescription).map((item: any) => (
                                                    <li key={item.id} className="text-red-600 flex justify-between">
                                                        <span>{item.medicine?.name}</span>
                                                        <span>x{item.quantity}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="md:w-1/3">
                                        <h3 className="font-bold text-lg mb-2">Gambar Resep</h3>
                                        {order.prescription_image ? (
                                            <a href={`/storage/${order.prescription_image}`} target="_blank" rel="noreferrer" className="block border rounded overflow-hidden">
                                                <img src={`/storage/${order.prescription_image}`} alt="Prescription" className="w-full object-cover max-h-[300px]" />
                                            </a>
                                        ) : (
                                            <div className="text-red-500">Tidak ada gambar resep!</div>
                                        )}
                                    </div>
                                    <div className="md:w-1/3 flex flex-col justify-center">
                                        <div className="bg-white p-4 rounded border shadow-sm">
                                            <h3 className="font-bold mb-4 text-center">Aksi</h3>
                                            
                                            {verifyingId === order.id ? (
                                                <div className="space-y-3">
                                                    <textarea 
                                                        className="w-full rounded border-gray-300 text-sm" 
                                                        rows={3} 
                                                        placeholder="Alasan penolakan (wajib)"
                                                        value={reason}
                                                        onChange={(e) => {
                                                            setReason(e.target.value);
                                                            if (reasonError) {
                                                                setReasonError('');
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
                                                            onClick={() => handleVerify(order.id, 'rejected')}
                                                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                                                        >
                                                            Confirm Tolak
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                setVerifyingId(null);
                                                                setReasonError('');
                                                            }}
                                                            className="flex-1 bg-gray-200 text-gray-800 px-3 py-2 rounded text-sm hover:bg-gray-300"
                                                        >
                                                            Batal
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    <button 
                                                        onClick={() => handleVerify(order.id, 'approved')}
                                                        className="w-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700"
                                                    >
                                                        Setujui Resep
                                                    </button>
                                                    <button 
                                                        onClick={() => setVerifyingId(order.id)}
                                                        className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700"
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

import AppLayout from '../../../Layouts/AppLayout';

export default function PrescriptionsHistory({ orders }: { orders: any[] }) {
    return (
        <AppLayout title="Riwayat Verifikasi Resep">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold mb-6 border-b pb-4">Riwayat Verifikasi Resep</h1>

                {orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Belum ada riwayat verifikasi resep.
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
                                            <h4 className="font-bold text-sm mb-2">Obat dengan Resep:</h4>
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
                                        <div className="bg-white p-6 rounded border shadow-sm flex flex-col items-center justify-center h-full">
                                            <h3 className="font-bold mb-4 text-center">Status Verifikasi</h3>
                                            
                                            {order.prescription_status === 'approved' ? (
                                                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Disetujui
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-bold flex items-center gap-2 mb-3 justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                        Ditolak
                                                    </div>
                                                    {order.prescription_rejection_reason && (
                                                        <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                                                            <strong>Alasan:</strong> {order.prescription_rejection_reason}
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

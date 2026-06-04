import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function CatalogIndex({ medicines, categories, filters }: { medicines: any, categories: any[], filters: any }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/customer/catalog', { search, category_id: categoryId }, { preserveState: true });
    };

    return (
        <AppLayout title="Obat Catalog">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
                    <input 
                        type="text" 
                        placeholder="Cari obat..." 
                        className="flex-1 min-w-[200px] rounded-md border p-2"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select 
                        className="rounded-md border p-2"
                        value={categoryId}
                        onChange={e => {
                            setCategoryId(e.target.value);
                            router.get('/customer/catalog', { search, category_id: e.target.value }, { preserveState: true });
                        }}
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Search</button>
                </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {medicines.data.map((med: any) => (
                    <div key={med.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                        <div className="h-48 bg-gray-100 flex items-center justify-center">
                            {med.image ? (
                                <img src={`/storage/${med.image}`} alt={med.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-gray-400">Tidak Ada Gambar</span>
                            )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-bold text-lg mb-1">{med.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{med.category?.name}</p>
                            <div className="font-bold text-blue-600 mb-4">Rp {Number(med.price).toLocaleString('id-ID')}</div>
                            
                            <div className="text-sm font-semibold text-gray-700 mb-2">
                                Stok: {med.batches_sum_remaining_quantity || 0}
                            </div>
                            
                            {Boolean(med.requires_prescription) && (
                                <div className="mb-4 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 self-start">
                                    Butuh Resep
                                </div>
                            )}

                            <div className="mt-auto">
                                <Link href={`/customer/catalog/${med.id}`} className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md transition">
                                    Lihat Detail
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {medicines.data.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
                    Tidak ada obat yang ditemukan.
                </div>
            )}
        </AppLayout>
    );
}

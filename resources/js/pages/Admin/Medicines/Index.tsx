import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function MedicinesIndex({ medicines, categories, suppliers }: { medicines: any[], categories: any[], suppliers: any[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const { data, setData, post, delete: destroy, processing, reset, errors } = useForm({
        category_id: '',
        supplier_id: '',
        code: '',
        name: '',
        description: '',
        composition: '',
        dosage: '',
        side_effects: '',
        price: '',
        minimum_stock: '0',
        requires_prescription: false,
        is_active: true,
        image: null as File | null,
        _method: 'post',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            setData('_method', 'put');
            post(`/admin/medicines/${editingId}`, {
                onSuccess: () => {
                    setEditingId(null);
                    reset();
                }
            });
        } else {
            setData('_method', 'post');
            post('/admin/medicines', {
                onSuccess: () => reset()
            });
        }
    };

    const edit = (medicine: any) => {
        setEditingId(medicine.id);
        setData({
            category_id: medicine.category_id || '',
            supplier_id: medicine.supplier_id || '',
            code: medicine.code,
            name: medicine.name,
            description: medicine.description || '',
            composition: medicine.composition || '',
            dosage: medicine.dosage || '',
            side_effects: medicine.side_effects || '',
            price: medicine.price,
            minimum_stock: medicine.minimum_stock,
            requires_prescription: medicine.requires_prescription,
            is_active: medicine.is_active,
            image: null,
            _method: 'put'
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this medicine?')) {
            destroy(`/admin/medicines/${id}`);
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if (confirm('Are you sure you want to import this file?')) {
                const formData = new FormData();
                formData.append('file', e.target.files[0]);
                
                router.post('/admin/medicines/import', formData, {
                    preserveScroll: true,
                });
            }
        }
    };

    return (
        <AppLayout title="Kelola Obat">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex justify-between items-center">
                <h2 className="text-lg font-bold">Medicines Catalog</h2>
                <div className="flex gap-4 items-center">
                    <div>
                        <label htmlFor="import-excel" className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-700 font-bold transition">
                            Import Excel/CSV
                        </label>
                        <input id="import-excel" type="file" accept=".csv, .xls, .xlsx" className="hidden" onChange={handleImport} />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Obat' : 'Add New Obat'}</h2>
                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kode</label>
                        <input type="text" className="mt-1 block w-full rounded-md border p-2" value={data.code} onChange={e => setData('code', e.target.value)} required />
                        {errors.code && <div className="text-red-500 text-sm">{errors.code}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama</label>
                        <input type="text" className="mt-1 block w-full rounded-md border p-2" value={data.name} onChange={e => setData('name', e.target.value)} required />
                        {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kategori</label>
                        <select className="mt-1 block w-full rounded-md border p-2" value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                            <option value="">Select Kategori</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Supplier</label>
                        <select className="mt-1 block w-full rounded-md border p-2" value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)}>
                            <option value="">Pilih Supplier</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Harga</label>
                        <input type="number" step="0.01" className="mt-1 block w-full rounded-md border p-2" value={data.price} onChange={e => setData('price', e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Min. Stok</label>
                        <input type="number" className="mt-1 block w-full rounded-md border p-2" value={data.minimum_stock} onChange={e => setData('minimum_stock', e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gambar</label>
                        <input type="file" className="mt-1 block w-full text-sm text-gray-500" onChange={e => setData('image', e.target.files?.[0] || null)} />
                    </div>
                    <div className="flex items-center gap-4 mt-6">
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded" checked={data.requires_prescription} onChange={e => setData('requires_prescription', e.target.checked)} />
                            <span className="ml-2 text-sm text-gray-700">Butuh Resep</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                            <span className="ml-2 text-sm text-gray-700">Aktif</span>
                        </label>
                    </div>
                    <div className="lg:col-span-3 flex gap-2">
                        <button type="submit" disabled={processing} className="bg-blue-600 text-white px-4 py-2 rounded">
                            {editingId ? 'Update' : 'Simpan'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); reset(); }} className="bg-gray-400 text-white px-4 py-2 rounded">
                                Batal
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gambar</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode/Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori/Supplier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {medicines.map((med) => (
                            <tr key={med.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {med.image && <img src={`/storage/${med.image}`} alt={med.name} className="h-10 w-10 object-cover rounded" />}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium">{med.name}</div>
                                    <div className="text-sm text-gray-500">{med.code}</div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div>{med.category?.name || '-'}</div>
                                    <div className="text-gray-500">{med.supplier?.name || '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">Rp {Number(med.price).toLocaleString('id-ID')}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">{med.batches_sum_remaining_quantity || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${med.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {med.is_active ? 'Aktif' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => edit(med)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    <button onClick={() => handleDelete(med.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}

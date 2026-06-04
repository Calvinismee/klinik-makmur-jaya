import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function SuppliersIndex({ suppliers }: { suppliers: any[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(`/admin/suppliers/${editingId}`, {
                onSuccess: () => {
                    setEditingId(null);
                    reset();
                }
            });
        } else {
            post('/admin/suppliers', {
                onSuccess: () => reset()
            });
        }
    };

    const edit = (supplier: any) => {
        setEditingId(supplier.id);
        setData({
            name: supplier.name,
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this supplier?')) {
            destroy(`/admin/suppliers/${id}`);
        }
    };

    return (
        <AppLayout title="Kelola Supplier">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama</label>
                        <input type="text" className="mt-1 block w-full rounded-md border p-2" value={data.name} onChange={e => setData('name', e.target.value)} required />
                        {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" className="mt-1 block w-full rounded-md border p-2" value={data.email} onChange={e => setData('email', e.target.value)} />
                        {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Telepon</label>
                        <input type="text" className="mt-1 block w-full rounded-md border p-2" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Alamat</label>
                        <textarea className="mt-1 block w-full rounded-md border p-2" value={data.address} onChange={e => setData('address', e.target.value)} />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {suppliers.map((supplier) => (
                            <tr key={supplier.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{supplier.name}</td>
                                <td className="px-6 py-4">
                                    <div>{supplier.email}</div>
                                    <div className="text-sm text-gray-500">{supplier.phone}</div>
                                </td>
                                <td className="px-6 py-4">{supplier.address}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => edit(supplier)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    <button onClick={() => handleDelete(supplier.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}

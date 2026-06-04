import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function CategoriesIndex({ categories }: { categories: any[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(`/admin/categories/${editingId}`, {
                onSuccess: () => {
                    setEditingId(null);
                    reset();
                }
            });
        } else {
            post('/admin/categories', {
                onSuccess: () => reset()
            });
        }
    };

    const edit = (category: any) => {
        setEditingId(category.id);
        setData({
            name: category.name,
            description: category.description || '',
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            destroy(`/admin/categories/${id}`);
        }
    };

    return (
        <AppLayout title="Kelola Kategori">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Kategori' : 'Add New Kategori'}</h2>
                <form onSubmit={submit} className="flex flex-col gap-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama</label>
                        <input type="text" className="mt-1 block w-full rounded-md border p-2" value={data.name} onChange={e => setData('name', e.target.value)} required />
                        {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                        <textarea className="mt-1 block w-full rounded-md border p-2" value={data.description} onChange={e => setData('description', e.target.value)} />
                    </div>
                    <div className="flex gap-2">
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

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((cat) => (
                            <tr key={cat.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{cat.name}</td>
                                <td className="px-6 py-4">{cat.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => edit(cat)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}

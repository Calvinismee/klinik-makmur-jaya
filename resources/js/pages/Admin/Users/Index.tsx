import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function UsersIndex({
    users,
    roles,
}: {
    users: any[];
    roles: any[];
}) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        name: '',
        email: '',
        password: '',
        role: '',
    });
    const passwordRules = [
        {
            label: 'Minimal 8 karakter',
            passed: data.password.length >= 8,
        },
        {
            label: 'Mengandung huruf besar dan kecil',
            passed: /[a-z]/.test(data.password) && /[A-Z]/.test(data.password),
        },
        {
            label: 'Mengandung angka',
            passed: /\d/.test(data.password),
        },
        {
            label: 'Mengandung simbol',
            passed: /[^A-Za-z0-9]/.test(data.password),
        },
    ];
    const passwordStarted = data.password.length > 0;
    const passwordIsStrong = passwordRules.every((rule) => rule.passed);
    const passwordInputClass = passwordStarted
        ? passwordIsStrong
            ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
            : 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-cyan-500 focus:ring-cyan-500';
    const canSubmit =
        !processing &&
        (editingId ? !passwordStarted || passwordIsStrong : passwordIsStrong);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(`/admin/users/${editingId}`, {
                onSuccess: () => {
                    setEditingId(null);
                    reset();
                },
            });
        } else {
            post('/admin/users', {
                onSuccess: () => reset(),
            });
        }
    };

    const edit = (user: any) => {
        setEditingId(user.id);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles?.[0]?.name || '',
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            destroy(`/admin/users/${id}`);
        }
    };

    return (
        <AppLayout title="Kelola Pengguna">
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold">
                    {editingId ? 'Edit Pengguna' : 'Tambah Pengguna'}
                </h2>
                <form
                    onSubmit={submit}
                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Nama
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border p-2"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && (
                            <div className="text-sm text-red-500">
                                {errors.name}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            className="mt-1 block w-full rounded-md border p-2"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        {errors.email && (
                            <div className="text-sm text-red-500">
                                {errors.email}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Password{' '}
                            {editingId && '(Biarkan kosong jika tidak diubah)'}
                        </label>
                        <input
                            type="password"
                            className={`mt-1 block w-full rounded-md border p-2 ${passwordInputClass}`}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            required={!editingId}
                        />
                        {errors.password && (
                            <div className="text-sm text-red-500">
                                {errors.password}
                            </div>
                        )}
                        {passwordStarted && (
                            <div className="mt-2 space-y-1">
                                {passwordRules.map((rule) => (
                                    <div
                                        key={rule.label}
                                        className={`flex items-center gap-2 text-xs ${rule.passed ? 'text-green-600' : 'text-red-500'}`}
                                    >
                                        <span
                                            className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${rule.passed ? 'bg-green-100' : 'bg-red-100'}`}
                                        >
                                            {rule.passed ? 'OK' : '!'}
                                        </span>
                                        <span>{rule.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Peran
                        </label>
                        <select
                            className="mt-1 block w-full rounded-md border p-2"
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            required
                        >
                            <option value="">Pilih Peran</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.name}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                        {errors.role && (
                            <div className="text-sm text-red-500">
                                {errors.role}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 md:col-span-2">
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="btn-primary"
                        >
                            {editingId ? 'Update' : 'Simpan'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    reset();
                                }}
                                className="btn-secondary"
                            >
                                Batal
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Nama
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Peran
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 font-medium whitespace-nowrap">
                                    {user.name}
                                </td>
                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                    <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs leading-5 font-semibold text-blue-800">
                                        {user.roles?.[0]?.name || 'Tidak Peran'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                    <button
                                        onClick={() => edit(user)}
                                        className="mr-4 text-cyan-600 hover:text-cyan-800"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}

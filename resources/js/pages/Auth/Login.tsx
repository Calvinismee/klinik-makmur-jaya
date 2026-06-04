import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface ToastState {
    id: number;
    message: string;
}

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [toast, setToast] = useState<ToastState | null>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    useEffect(() => {
        const message = errors.email || errors.password;

        if (!message) {
            return;
        }

        const nextToast = {
            id: Date.now(),
            message,
        };

        setToast(nextToast);

        const timer = window.setTimeout(() => {
            setToast((current) => (current?.id === nextToast.id ? null : current));
        }, 4200);

        return () => window.clearTimeout(timer);
    }, [errors.email, errors.password]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Head title="Login" />
            {toast && (
                <div className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] sm:right-6 sm:top-6 sm:w-96">
                    <div role="status" aria-live="polite" className="toast-enter flex items-start gap-3 rounded-lg border border-red-200 bg-white p-4 shadow-xl shadow-slate-900/10 ring-1 ring-black/5">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">Gagal</p>
                            <p className="mt-1 break-words text-sm text-slate-600">{toast.message}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Tutup notifikasi"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            <div className="w-full max-w-md px-6">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg transition-transform duration-200 hover:scale-105">
                        K
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Klinik Makmur Jaya</h1>
                    <p className="text-sm text-slate-400 mt-1">Sistem E-Commerce Penjualan Obat</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Masuk ke akun Anda</h2>
                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
                            <input 
                                type="email" 
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 px-3.5 py-2.5 border text-sm" 
                                placeholder="nama@email.com"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                            />
                            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">Password</label>
                            <input 
                                type="password" 
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 px-3.5 py-2.5 border text-sm" 
                                placeholder="••••••••"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                            />
                            {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-cyan-600 shadow-sm focus:border-cyan-300 focus:ring focus:ring-cyan-200 focus:ring-opacity-50"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                />
                                <span className="ml-2 text-sm text-slate-500">Ingat saya</span>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2.5 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all shadow-sm text-sm active:scale-[0.98]"
                        >
                            {processing ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Belum punya akun?{' '}
                        <Link href="/register" className="font-semibold text-cyan-600 hover:text-cyan-700">
                            Daftar pelanggan
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

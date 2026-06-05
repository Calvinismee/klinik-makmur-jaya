import { Head, Link, useForm } from '@inertiajs/react';
import { digitsOnly, preventNonNumericKey } from '../../utils/numericInput';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        identity_number: '',
        date_of_birth: '',
        gender: '',
        address: '',
        password: '',
        password_confirmation: '',
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
    const confirmationStarted = data.password_confirmation.length > 0;
    const confirmationMatches = data.password === data.password_confirmation;
    const nikStarted = data.identity_number.length > 0;
    const nikIs16 = data.identity_number.length === 16;
    
    const passwordInputClass = passwordStarted
        ? passwordIsStrong
            ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
            : 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-cyan-500 focus:ring-cyan-500';
    const confirmationInputClass = confirmationStarted
        ? confirmationMatches
            ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
            : 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-cyan-500 focus:ring-cyan-500';
    const nikInputClass = nikStarted
        ? nikIs16
            ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
            : 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-cyan-500 focus:ring-cyan-500';
    const canSubmit = !processing && passwordIsStrong && confirmationStarted && confirmationMatches && nikIs16;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <Head title="Registrasi Pasien" />
            <div className="mx-auto w-full max-w-2xl px-6">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-2xl font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105">
                        K
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Registrasi Pasien</h1>
                    <p className="mt-1 text-sm text-slate-400">Klinik Makmur Jaya</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-600">Nama Lengkap</label>
                                <input
                                    type="text"
                                    className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <div className="mt-1 text-xs text-red-500">{errors.name}</div>}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-600">Email</label>
                                <input
                                    type="email"
                                    className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <div className="mt-1 text-xs text-red-500">{errors.email}</div>}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-600">Nomor HP</label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                                    value={data.phone}
                                    onKeyDown={preventNonNumericKey}
                                    onChange={(e) => setData('phone', digitsOnly(e.target.value))}
                                />
                                {errors.phone && <div className="mt-1 text-xs text-red-500">{errors.phone}</div>}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-600">NIK</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={16}
                                    className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm ${nikInputClass}`}
                                    value={data.identity_number}
                                    onKeyDown={preventNonNumericKey}
                                    onChange={(e) => setData('identity_number', digitsOnly(e.target.value).slice(0, 16))}
                                />
                                {nikStarted && (
                                    <div className={`mt-1 text-xs ${nikIs16 ? 'text-green-600' : 'text-red-500'}`}>
                                        {nikIs16 ? 'NIK sudah 16 digit.' : `NIK harus 16 digit (kurang ${16 - data.identity_number.length} digit).`}
                                    </div>
                                )}
                                {errors.identity_number && <div className="mt-1 text-xs text-red-500">{errors.identity_number}</div>}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-600">Tanggal Lahir</label>
                                <input
                                    type="date"
                                    className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                />
                                {errors.date_of_birth && <div className="mt-1 text-xs text-red-500">{errors.date_of_birth}</div>}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-600">Jenis Kelamin</label>
                                <select
                                    className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                >
                                    <option value="">Pilih</option>
                                    <option value="male">Laki-laki</option>
                                    <option value="female">Perempuan</option>
                                </select>
                                {errors.gender && <div className="mt-1 text-xs text-red-500">{errors.gender}</div>}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-600">Alamat</label>
                            <textarea
                                rows={3}
                                className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                            />
                            {errors.address && <div className="mt-1 text-xs text-red-500">{errors.address}</div>}
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-600">Password</label>
                                <input
                                    type="password"
                                    className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm ${passwordInputClass}`}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <div className="mt-1 text-xs text-red-500">{errors.password}</div>}
                                {passwordStarted && (
                                    <div className="mt-2 space-y-1">
                                        {passwordRules.map((rule) => (
                                            <div key={rule.label} className={`flex items-center gap-2 text-xs ${rule.passed ? 'text-green-600' : 'text-red-500'}`}>
                                                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${rule.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                                                    {rule.passed ? 'OK' : '!'}
                                                </span>
                                                <span>{rule.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-600">Konfirmasi Password</label>
                                <input
                                    type="password"
                                    className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm ${confirmationInputClass}`}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                                {confirmationStarted && (
                                    <div className={`mt-1 text-xs ${confirmationMatches ? 'text-green-600' : 'text-red-500'}`}>
                                        {confirmationMatches ? 'Konfirmasi password cocok.' : 'Konfirmasi password belum cocok.'}
                                    </div>
                                )}
                                {errors.password_confirmation && <div className="mt-1 text-xs text-red-500">{errors.password_confirmation}</div>}
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                            Password wajib memakai minimal 8 karakter, huruf besar-kecil, angka, dan simbol.
                        </div>

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-cyan-600 hover:to-blue-700 active:scale-[0.98] disabled:opacity-50"
                        >
                            {processing ? 'Memproses...' : 'Daftar'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="font-semibold text-cyan-600 hover:text-cyan-700">
                            Masuk
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

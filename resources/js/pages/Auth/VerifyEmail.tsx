import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

type VerifyEmailPageProps = {
    auth: {
        user: {
            email: string;
        };
    };
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
};

export default function VerifyEmail() {
    const { props } = usePage<VerifyEmailPageProps>();
    const { post, processing } = useForm({});

    const resend = () => {
        post('/email/verification-notification');
    };

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ preserveState: true });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <Head title="Verifikasi Email" />
            <div className="w-full max-w-md px-6">
                <div className="mb-8 text-center">
                    <img
                        src="/Logo.webp"
                        alt="Logo Klinik Makmur Jaya"
                        className="mx-auto mb-4 h-20 w-20 object-contain drop-shadow-lg"
                    />
                    <h1 className="text-2xl font-bold text-slate-800">
                        Verifikasi Email
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Klinik Makmur Jaya
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                    <div className="mb-5 rounded-lg border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
                        Kami sudah mengirim link verifikasi ke{' '}
                        <span className="font-semibold">
                            {props.auth.user.email}
                        </span>
                        .
                    </div>

                    {props.flash?.success && (
                        <div className="mb-5 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
                            {props.flash.success}
                        </div>
                    )}

                    {props.flash?.error && (
                        <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
                            {props.flash.error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={resend}
                            disabled={processing}
                            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-cyan-600 hover:to-blue-700 active:scale-[0.98] disabled:opacity-50"
                        >
                            {processing ? 'Mengirim...' : 'Kirim Ulang Link'}
                        </button>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="w-full rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
                        >
                            Keluar
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

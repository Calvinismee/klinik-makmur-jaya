import { ReactNode, useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

interface Props {
    title: string;
    children: ReactNode;
}

interface ToastState {
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
}

interface BroadcastNotificationPayload {
    notification?: {
        title?: string;
        message?: string;
        severity?: string;
    };
}

// SVG Icon components
const Icons = {
    dashboard: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
        </svg>
    ),
    category: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
        </svg>
    ),
    supplier: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
            />
        </svg>
    ),
    medicine: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
        </svg>
    ),
    users: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
        </svg>
    ),
    orders: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
        </svg>
    ),
    audit: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
        </svg>
    ),
    error: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
        </svg>
    ),
    batch: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
        </svg>
    ),
    history: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    ),
    prescription: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
        </svg>
    ),
    pos: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
        </svg>
    ),
    payment: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
        </svg>
    ),
    catalog: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
        </svg>
    ),
    cart: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
        </svg>
    ),
    menu: (
        <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
            />
        </svg>
    ),
    close: (
        <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
            />
        </svg>
    ),
    bell: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
        </svg>
    ),
    chevronRight: (
        <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
            />
        </svg>
    ),
    home: (
        <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
        </svg>
    ),
    logout: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
        </svg>
    ),
    check: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M5 13l4 4L19 7"
            />
        </svg>
    ),
    xCircle: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
            />
        </svg>
    ),
    infoCircle: (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11v5m0-8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    ),
};

function getNavSections(role: string): NavSection[] {
    switch (role) {
        case 'admin':
            return [
                {
                    title: 'UTAMA',
                    items: [
                        {
                            label: 'Dashboard',
                            href: '/admin/dashboard',
                            icon: Icons.dashboard,
                        },
                    ],
                },
                {
                    title: 'MASTER DATA',
                    items: [
                        {
                            label: 'Kategori',
                            href: '/admin/categories',
                            icon: Icons.category,
                        },
                        {
                            label: 'Supplier',
                            href: '/admin/suppliers',
                            icon: Icons.supplier,
                        },
                        {
                            label: 'Obat',
                            href: '/admin/medicines',
                            icon: Icons.medicine,
                        },
                        {
                            label: 'Pengguna',
                            href: '/admin/users',
                            icon: Icons.users,
                        },
                    ],
                },
                {
                    title: 'TRANSAKSI',
                    items: [
                        {
                            label: 'Semua Pesanan',
                            href: '/admin/orders',
                            icon: Icons.orders,
                        },
                    ],
                },
                {
                    title: 'SISTEM',
                    items: [
                        {
                            label: 'Audit Logs',
                            href: '/admin/audit-logs',
                            icon: Icons.audit,
                        },
                        {
                            label: 'Error Logs',
                            href: '/admin/error-logs',
                            icon: Icons.error,
                        },
                    ],
                },
            ];
        case 'apoteker':
            return [
                {
                    title: 'UTAMA',
                    items: [
                        {
                            label: 'Dashboard',
                            href: '/pharmacist/dashboard',
                            icon: Icons.dashboard,
                        },
                    ],
                },
                {
                    title: 'INVENTORI',
                    items: [
                        {
                            label: 'Stok & Batch',
                            href: '/pharmacist/batches',
                            icon: Icons.batch,
                        },
                        {
                            label: 'Riwayat Stok',
                            href: '/pharmacist/movements',
                            icon: Icons.history,
                        },
                    ],
                },
                {
                    title: 'PESANAN',
                    items: [
                        {
                            label: 'Verifikasi Resep',
                            href: '/pharmacist/prescriptions',
                            icon: Icons.prescription,
                        },
                        {
                            label: 'Siapkan Pesanan',
                            href: '/pharmacist/orders',
                            icon: Icons.orders,
                        },
                        {
                            label: 'Riwayat Verifikasi',
                            href: '/pharmacist/prescription-history',
                            icon: Icons.history,
                        },
                    ],
                },
            ];
        case 'kasir':
            return [
                {
                    title: 'UTAMA',
                    items: [
                        {
                            label: 'Dashboard',
                            href: '/cashier/dashboard',
                            icon: Icons.dashboard,
                        },
                    ],
                },
                {
                    title: 'TRANSAKSI',
                    items: [
                        {
                            label: 'Pembayaran Offline',
                            href: '/cashier/pos',
                            icon: Icons.pos,
                        },
                        {
                            label: 'Pembayaran Online',
                            href: '/cashier/payments',
                            icon: Icons.payment,
                        },
                    ],
                },
            ];
        case 'pasien':
            return [
                {
                    title: 'UTAMA',
                    items: [
                        {
                            label: 'Dashboard',
                            href: '/customer/dashboard',
                            icon: Icons.dashboard,
                        },
                    ],
                },
                {
                    title: 'BELANJA',
                    items: [
                        {
                            label: 'Katalog Obat',
                            href: '/customer/catalog',
                            icon: Icons.catalog,
                        },
                        {
                            label: 'Keranjang',
                            href: '/customer/cart',
                            icon: Icons.cart,
                        },
                    ],
                },
                {
                    title: 'PESANAN',
                    items: [
                        {
                            label: 'Riwayat Pesanan',
                            href: '/customer/orders',
                            icon: Icons.orders,
                        },
                    ],
                },
            ];
        default:
            return [];
    }
}

function getBreadcrumbs(
    pathname: string,
    role: string,
): { label: string; href?: string }[] {
    const map: Record<string, string> = {
        categories: 'Kategori',
        suppliers: 'Supplier',
        medicines: 'Obat',
        users: 'Pengguna',
        orders: 'Pesanan',
        'audit-logs': 'Audit Logs',
        'error-logs': 'Error Logs',
        batches: 'Stok & Batch',
        movements: 'Riwayat Stok',
        prescriptions: 'Verifikasi Resep',
        'prescription-history': 'Riwayat Verifikasi',
        pos: 'Pembayaran Offline',
        payments: 'Pembayaran',
        catalog: 'Katalog Obat',
        cart: 'Keranjang',
        checkout: 'Checkout',
    };

    const segments = pathname.split('/').filter(Boolean);
    // segments[0] = role prefix (admin/pharmacist/cashier/customer)
    // segments[1] = page
    // segments[2+] = sub-pages / IDs

    // If it's dashboard or only 1 segment, just show home icon
    if (segments.length <= 1 || segments[1] === 'dashboard') {
        return [];
    }

    if (segments[0] === 'customer' && segments[1] === 'orders') {
        return [{ label: 'Pesanan' }];
    }

    const crumbs: { label: string; href?: string }[] = [];

    // Only show the page name (skip role prefix)
    for (let i = 1; i < segments.length; i++) {
        const label = map[segments[i]] || segments[i];
        if (i < segments.length - 1) {
            const href = '/' + segments.slice(0, i + 1).join('/');
            crumbs.push({ label, href });
        } else {
            crumbs.push({ label });
        }
    }

    return crumbs;
}

export default function AppLayout({ title, children }: Props) {
    const {
        auth,
        flash,
        errors,
        navNotifications,
        notifications: appNotifications,
        security,
    } = usePage().props as any;
    const currentPath = usePage().url;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [toast, setToast] = useState<ToastState | null>(null);
    const [sessionWarning, setSessionWarning] = useState(false);

    const role = auth?.user?.roles?.[0]?.name || '';
    const navSections = getNavSections(role);
    const breadcrumbs = getBreadcrumbs(currentPath, role);
    const errorMessage =
        errors?.message ||
        Object.values(errors || {}).find(
            (message) => typeof message === 'string',
        );
    const noticeMessage = flash?.success || flash?.info || errorMessage;
    const noticeType: ToastState['type'] = flash?.success
        ? 'success'
        : flash?.info
          ? 'info'
          : 'error';
    const toastStyle =
        toast?.type === 'success'
            ? {
                  border: 'border-emerald-200',
                  icon: 'bg-emerald-50 text-emerald-600',
                  title: 'Berhasil',
                  iconElement: Icons.check,
              }
            : toast?.type === 'info'
              ? {
                    border: 'border-cyan-200',
                    icon: 'bg-cyan-50 text-cyan-600',
                    title: 'Info',
                    iconElement: Icons.infoCircle,
                }
              : {
                    border: 'border-red-200',
                    icon: 'bg-red-50 text-red-600',
                    title: 'Gagal',
                    iconElement: Icons.xCircle,
                };

    const isActive = (href: string) => currentPath.startsWith(href);

    const roleLabel: Record<string, string> = {
        admin: 'Administrator',
        apoteker: 'Apoteker',
        kasir: 'Kasir',
        pasien: 'Pelanggan',
    };

    const unreadNotificationCount = Number(appNotifications?.unreadCount || 0);
    const notificationItems = appNotifications?.items || [];

    const getNotificationAccent = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-500';
            case 'warning':
                return 'bg-yellow-500';
            default:
                return 'bg-cyan-500';
        }
    };

    const getNavBadgeCount = (href: string) => {
        if (href === '/pharmacist/prescriptions') {
            return Number(navNotifications?.pendingPrescriptions || 0);
        }

        if (href === '/pharmacist/orders') {
            return Number(navNotifications?.pharmacistProcessingOrders || 0);
        }

        return 0;
    };

    useEffect(() => {
        if (!noticeMessage) {
            return;
        }

        const nextToast: ToastState = {
            id: Date.now(),
            type: noticeType,
            message: String(noticeMessage),
        };

        setToast(nextToast);

        const timer = window.setTimeout(() => {
            setToast((current) =>
                current?.id === nextToast.id ? null : current,
            );
        }, 4200);

        return () => window.clearTimeout(timer);
    }, [noticeMessage, noticeType]);

    useEffect(() => {
        if (!auth?.user) {
            return;
        }

        if (!window.Echo) {
            return;
        }

        const channelName = `user-notifications.${auth.user.id}`;
        const channel = window.Echo.private(channelName);

        channel.listen(
            '.notification.created',
            (event: BroadcastNotificationPayload) => {
                const notification = event.notification ?? {};
                const severity =
                    notification.severity === 'critical'
                        ? 'error'
                        : notification.severity === 'warning'
                          ? 'info'
                          : 'success';

                setToast({
                    id: Date.now(),
                    type: severity,
                    message:
                        notification.message ||
                        notification.title ||
                        'Notifikasi baru diterima.',
                });

                router.reload({
                    only: ['notifications', 'navNotifications'],
                    preserveScroll: true,
                    preserveState: true,
                });
            },
        );

        return () => {
            window.Echo.leave(channelName);
        };
    }, [auth?.user?.id]);

    useEffect(() => {
        if (!auth?.user) {
            return;
        }

        const pollSeconds = Number(security?.notificationPollSeconds || 15);
        const poll = window.setInterval(() => {
            router.reload({
                only: ['notifications', 'navNotifications'],
                preserveScroll: true,
                preserveState: true,
            });
        }, pollSeconds * 1000);

        return () => window.clearInterval(poll);
    }, [auth?.user?.id, security?.notificationPollSeconds]);

    useEffect(() => {
        if (!auth?.user) {
            return;
        }

        const lifetimeMs =
            Number(security?.sessionLifetimeMinutes || 120) * 60 * 1000;
        const warningMs = Number(security?.sessionWarningSeconds || 60) * 1000;
        let lastActivity = Date.now();

        const resetActivity = () => {
            lastActivity = Date.now();
            setSessionWarning(false);
        };

        const events: Array<keyof WindowEventMap> = [
            'click',
            'keydown',
            'mousemove',
            'scroll',
            'touchstart',
        ];
        events.forEach((event) =>
            window.addEventListener(event, resetActivity, { passive: true }),
        );

        const timer = window.setInterval(() => {
            const remaining = lifetimeMs - (Date.now() - lastActivity);

            if (remaining <= 0) {
                router.post('/logout', {}, { preserveScroll: true });
                return;
            }

            setSessionWarning(remaining <= warningMs);
        }, 5000);

        return () => {
            window.clearInterval(timer);
            events.forEach((event) =>
                window.removeEventListener(event, resetActivity),
            );
        };
    }, [
        auth?.user?.id,
        security?.sessionLifetimeMinutes,
        security?.sessionWarningSeconds,
    ]);

    const SidebarContent = () => (
        <>
            {/* Brand */}
            <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-700/50 px-5">
                <img
                    src="/Logo.webp"
                    alt="Logo Klinik Makmur Jaya"
                    className="h-8 w-8 object-contain"
                />
                <div>
                    <div className="text-sm leading-tight font-bold text-white">
                        Klinik Makmur Jaya
                    </div>
                    <div className="text-[10px] leading-tight text-slate-400">
                        Sistem E-Commerce Obat
                    </div>
                </div>
            </div>

            {/* Nav Sections */}
            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
                {navSections.map((section) => (
                    <div key={section.title}>
                        <div className="mb-2 px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            {section.title}
                        </div>
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const active = isActive(item.href);
                                const badgeCount = getNavBadgeCount(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out hover:translate-x-0.5 active:scale-[0.98] ${
                                            active
                                                ? '-ml-px border-l-[3px] border-cyan-400 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400'
                                                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                        }`}
                                    >
                                        <span
                                            className={`transition-transform duration-200 group-hover:scale-110 ${active ? 'text-cyan-400' : 'text-slate-400'}`}
                                        >
                                            {item.icon}
                                        </span>
                                        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                                            <span className="truncate">
                                                {item.label}
                                            </span>
                                            {badgeCount > 0 && (
                                                <span
                                                    className={`notification-badge inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] leading-none font-bold ${
                                                        active
                                                            ? 'bg-cyan-400 text-slate-900'
                                                            : 'bg-red-500 text-white'
                                                    }`}
                                                >
                                                    {badgeCount > 99
                                                        ? '99+'
                                                        : badgeCount}
                                                </span>
                                            )}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Logout at bottom */}
            <div className="shrink-0 border-t border-slate-700/50 p-3">
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 active:scale-[0.98]"
                >
                    {Icons.logout}
                    Logout
                </Link>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={title} />

            {toast && (
                <div className="fixed top-4 right-4 z-[80] w-[calc(100%-2rem)] sm:top-6 sm:right-6 sm:w-96">
                    <div
                        role="status"
                        aria-live="polite"
                        className={`toast-enter flex items-start gap-3 rounded-lg border bg-white p-4 shadow-xl ring-1 shadow-slate-900/10 ring-black/5 ${toastStyle.border}`}
                    >
                        <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${toastStyle.icon}`}
                        >
                            {toastStyle.iconElement}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">
                                {toastStyle.title}
                            </p>
                            <p className="mt-1 text-sm break-words text-slate-600">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Tutup notifikasi"
                        >
                            {Icons.close}
                        </button>
                    </div>
                </div>
            )}

            {sessionWarning && (
                <div className="fixed right-4 bottom-4 z-[80] w-[calc(100%-2rem)] rounded-lg border border-yellow-200 bg-white p-4 shadow-xl ring-1 ring-black/5 sm:w-96">
                    <p className="text-sm font-bold text-slate-900">
                        Session hampir berakhir
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                        Aktivitas Anda akan logout otomatis jika tidak ada
                        interaksi.
                    </p>
                    <button
                        type="button"
                        onClick={() =>
                            router.post(
                                '/session/keep-alive',
                                {},
                                {
                                    preserveScroll: true,
                                    onSuccess: () => setSessionWarning(false),
                                },
                            )
                        }
                        className="btn-primary mt-3 px-3 py-1.5 text-sm"
                    >
                        Tetap aktif
                    </button>
                </div>
            )}

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fade-enter fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - mobile (drawer) */}
            <aside
                className={`fixed top-0 left-0 z-50 flex h-full w-64 transform flex-col bg-slate-800 transition-transform duration-200 ease-in-out lg:hidden ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    {Icons.close}
                </button>
                <SidebarContent />
            </aside>

            {/* Sidebar - desktop (fixed) */}
            <aside className="hidden bg-slate-800 lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <SidebarContent />
            </aside>

            {/* Main content area */}
            <div className="flex min-h-screen flex-col lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-gray-500 transition hover:text-gray-700 active:scale-95 lg:hidden"
                        >
                            {Icons.menu}
                        </button>
                        <h1 className="truncate text-lg font-bold text-slate-800">
                            {title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setShowNotifications(!showNotifications)
                                }
                                className="relative rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 active:scale-95"
                            >
                                {Icons.bell}
                                {unreadNotificationCount > 0 && (
                                    <span className="notification-badge absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] leading-none font-bold text-white ring-2 ring-white">
                                        {unreadNotificationCount > 99
                                            ? '99+'
                                            : unreadNotificationCount}
                                    </span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="popover-enter absolute right-0 z-50 mt-2 w-80 rounded-lg border bg-white py-1 shadow-lg ring-1 ring-black/5">
                                    <div className="flex items-center justify-between border-b px-4 py-2.5">
                                        <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                                            Notifikasi
                                        </span>
                                        {unreadNotificationCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.post(
                                                        '/notifications/read-all',
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                                className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600 hover:bg-red-100"
                                            >
                                                Tandai dibaca
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notificationItems.length > 0 ? (
                                            notificationItems.map(
                                                (notification: any) => {
                                                    const content = (
                                                        <div className="flex gap-3 px-4 py-3 text-sm text-gray-600 transition hover:bg-gray-50">
                                                            <span
                                                                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getNotificationAccent(notification.severity)}`}
                                                            />
                                                            <span className="min-w-0">
                                                                <span className="block font-semibold text-gray-800">
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </span>
                                                                <span className="mt-0.5 line-clamp-2 block text-xs text-gray-500">
                                                                    {
                                                                        notification.message
                                                                    }
                                                                </span>
                                                                <span className="mt-1 block text-[11px] text-gray-400">
                                                                    {
                                                                        notification.created_at
                                                                    }
                                                                </span>
                                                            </span>
                                                        </div>
                                                    );

                                                    return notification.url ? (
                                                        <Link
                                                            key={
                                                                notification.id
                                                            }
                                                            href={
                                                                notification.url
                                                            }
                                                        >
                                                            {content}
                                                        </Link>
                                                    ) : (
                                                        <div
                                                            key={
                                                                notification.id
                                                            }
                                                        >
                                                            {content}
                                                        </div>
                                                    );
                                                },
                                            )
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-gray-600">
                                                <p className="font-semibold text-gray-800">
                                                    Sistem aktif
                                                </p>
                                                <p className="mt-0.5 text-xs text-gray-400">
                                                    Belum ada notifikasi baru.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User info */}
                        {auth?.user && (
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden text-right sm:block">
                                    <div className="text-sm leading-tight font-semibold text-slate-800">
                                        {auth.user.name}
                                    </div>
                                    <div className="text-[11px] leading-tight text-slate-400">
                                        {roleLabel[role] || role}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Breadcrumb */}
                <div className="border-b border-gray-100 bg-white px-4 py-3 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-1 text-sm">
                        <Link
                            href={navSections[0]?.items[0]?.href || '/'}
                            className="text-gray-400 transition hover:text-cyan-600"
                        >
                            {Icons.home}
                        </Link>
                        {breadcrumbs.length === 0
                            ? /* Dashboard page: just show home icon, no extra text */
                              null
                            : breadcrumbs.map((crumb, i) => (
                                  <span
                                      key={i}
                                      className="flex items-center gap-1"
                                  >
                                      <span className="text-gray-300">
                                          {Icons.chevronRight}
                                      </span>
                                      {crumb.href ? (
                                          <Link
                                              href={crumb.href}
                                              className="text-gray-400 transition hover:text-cyan-600"
                                          >
                                              {crumb.label}
                                          </Link>
                                      ) : (
                                          <span className="font-medium text-slate-700">
                                              {crumb.label}
                                          </span>
                                      )}
                                  </span>
                              ))}
                    </nav>
                </div>

                {/* Page content */}
                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

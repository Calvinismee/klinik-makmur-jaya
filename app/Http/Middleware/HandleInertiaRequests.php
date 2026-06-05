<?php

namespace App\Http\Middleware;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'security' => [
                'sessionLifetimeMinutes' => (int) config('session.lifetime'),
                'sessionWarningSeconds' => 60,
                'notificationPollSeconds' => 15,
            ],
            'navNotifications' => fn () => $this->navNotifications($request),
            'notifications' => fn () => $this->notifications($request),
        ];
    }

    private function navNotifications(Request $request): array
    {
        $user = $request->user();

        if (! $user) {
            return [];
        }

        if ($user->hasRole('kasir')) {
            return [];
        }

        if ($user->hasRole('apoteker')) {
            return [
                'pendingPrescriptions' => Order::where('prescription_status', 'pending')->count(),
                'pharmacistProcessingOrders' => Order::where('order_number', 'like', 'ORD-%')
                    ->where('order_status', 'processing')
                    ->count(),
            ];
        }

        return [];
    }

    private function notifications(Request $request): array
    {
        $user = $request->user();

        if (! $user) {
            return [
                'unreadCount' => 0,
                'items' => [],
            ];
        }

        return [
            'unreadCount' => $user->unreadNotifications()->count(),
            'items' => $user->unreadNotifications()
                ->latest()
                ->take(8)
                ->get()
                ->map(fn ($notification) => [
                    'id' => $notification->id,
                    'type' => $notification->data['type'] ?? $notification->type,
                    'title' => $notification->data['title'] ?? 'Notifikasi',
                    'message' => $notification->data['message'] ?? '',
                    'severity' => $notification->data['severity'] ?? 'info',
                    'url' => $notification->data['url'] ?? null,
                    'created_at' => $notification->created_at?->diffForHumans(),
                ])
                ->values(),
        ];
    }
}

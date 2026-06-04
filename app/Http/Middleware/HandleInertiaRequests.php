<?php

namespace App\Http\Middleware;

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
            ],
            'navNotifications' => fn () => $this->navNotifications($request),
            'notifications' => fn () => $this->notifications($request),
        ];
    }

    private function navNotifications(Request $request): array
    {
        $user = $request->user();

        if (!$user) {
            return [];
        }

        if ($user->hasRole('kasir')) {
            return [
                'cashierOnlinePayments' => \App\Models\Order::where('order_number', 'like', 'ORD-%')
                    ->where(function ($query) {
                        $query->where(function ($manualPayment) {
                            $manualPayment->where('order_status', 'waiting_payment')
                                ->whereNull('payment_provider');
                        })->orWhereIn('order_status', ['processing', 'ready_to_pickup']);
                    })
                    ->count(),
            ];
        }

        if ($user->hasRole('apoteker')) {
            return [
                'pendingPrescriptions' => \App\Models\Order::where('prescription_status', 'pending')->count(),
            ];
        }

        return [];
    }

    private function notifications(Request $request): array
    {
        $user = $request->user();

        if (!$user) {
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

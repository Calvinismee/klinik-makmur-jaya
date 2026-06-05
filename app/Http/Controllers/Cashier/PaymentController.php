<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        $onlinePayments = Order::with('user')
            ->where('order_number', 'like', 'ORD-%')
            ->where(function ($query) {
                $query->where('payment_provider', 'midtrans')
                    ->orWhereNotNull('midtrans_snap_token')
                    ->orWhereNotNull('midtrans_transaction_id');
            })
            ->latest()
            ->take(100)
            ->get();

        return Inertia::render('Cashier/Payments/Index', [
            'payments' => $onlinePayments,
            'summary' => [
                'total' => $onlinePayments->count(),
                'paid' => $onlinePayments->where('payment_status', 'paid')->count(),
                'pending' => $onlinePayments->whereIn('payment_status', ['unpaid', 'pending'])->count(),
                'failed' => $onlinePayments->where('payment_status', 'failed')->count(),
                'revenue' => $onlinePayments->where('payment_status', 'paid')->sum('total_amount'),
            ],
        ]);
    }
}

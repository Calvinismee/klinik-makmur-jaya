<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\MidtransPaymentService;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::where('user_id', auth()->id())->latest()->get();

        return Inertia::render('Customer/Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, Order $order, MidtransPaymentService $midtransPaymentService, OrderService $orderService)
    {
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        if ($request->has('sync_payment') || $request->has('transaction_status') || $request->has('status_code') || $request->has('order_id')) {
            try {
                $payload = $midtransPaymentService->getTransactionStatus($order);
                $orderService->applyMidtransNotification($order->order_number, $payload);

                return redirect()
                    ->route('customer.orders.show', $order)
                    ->with('success', 'Status pembayaran berhasil diperbarui.');
            } catch (\Exception $e) {
                return redirect()
                    ->route('customer.orders.show', $order)
                    ->withErrors(['message' => $e->getMessage()]);
            }
        }

        $order->load('items.medicine');

        return Inertia::render('Customer/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function pay(Order $order, MidtransPaymentService $midtransPaymentService)
    {
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        try {
            $midtransPaymentService->createSnapTransaction($order);

            return redirect()
                ->route('customer.orders.show', ['order' => $order->id, 'pay' => 1])
                ->with('success', 'Silakan lanjutkan pembayaran.');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }
}

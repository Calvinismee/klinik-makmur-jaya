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
                $syncedOrder = $orderService->applyMidtransNotification($order->order_number, $payload);

                if ($syncedOrder->payment_status === 'paid') {
                    return redirect()
                        ->route('customer.orders.show', ['order' => $order->order_number])
                        ->with('success', 'Pembayaran berhasil diverifikasi Midtrans.');
                }

                if ($syncedOrder->payment_status === 'failed') {
                    return redirect()
                        ->route('customer.orders.show', ['order' => $order->order_number])
                        ->withErrors(['message' => 'Pembayaran gagal, dibatalkan, atau kedaluwarsa. Silakan ulangi pembayaran jika masih ingin melanjutkan pesanan.']);
                }

                return redirect()
                    ->route('customer.orders.show', ['order' => $order->order_number])
                    ->with('success', 'Midtrans masih memproses pembayaran. Silakan cek kembali beberapa saat lagi.');
            } catch (\Exception $e) {
                return redirect()
                    ->route('customer.orders.show', ['order' => $order->order_number])
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
                ->route('customer.orders.show', ['order' => $order->order_number, 'pay' => 1])
                ->with('success', 'Silakan lanjutkan pembayaran.');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }
}

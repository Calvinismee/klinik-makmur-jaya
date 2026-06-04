<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function index()
    {
        $orders = Order::where('order_number', 'like', 'ORD-%')
                       ->where(function ($query) {
                           $query->where(function ($manualPayment) {
                               $manualPayment->where('order_status', 'waiting_payment')
                                             ->whereNull('payment_provider');
                           })->orWhereIn('order_status', ['processing', 'ready_to_pickup']);
                       })
                       ->with('user')
                       ->latest()
                       ->get();

        return Inertia::render('Cashier/Payments/Index', [
            'orders' => $orders,
        ]);
    }

    public function process(Request $request, Order $order)
    {
        if ($order->payment_status === 'paid') {
            return back()->withErrors(['message' => 'Order is already paid.']);
        }

        if ($order->payment_provider === 'midtrans') {
            return back()->withErrors(['message' => 'Pesanan ini harus dibayar pasien melalui Midtrans.']);
        }

        try {
            $this->orderService->completeOnlinePayment($order->id);

            return back()->with('success', 'Pembayaran berhasil diproses. Pesanan masuk status diproses.');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }

    public function ready(Request $request, Order $order)
    {
        try {
            $this->orderService->markReadyToPickup($order->id);

            return back()->with('success', 'Pesanan ditandai siap diambil/dikirim.');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }

    public function complete(Request $request, Order $order)
    {
        try {
            $this->orderService->completeOrder($order->id);

            return back()->with('success', 'Pesanan diselesaikan.');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }

    public function cancel(Request $request, Order $order)
    {
        if ($order->order_status === 'completed' || $order->order_status === 'cancelled') {
            return back()->withErrors(['message' => 'Cannot cancel this order.']);
        }

        try {
            $this->orderService->cancelOrder($order->id);
            return back()->with('success', 'Order cancelled successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }
}

<?php

namespace App\Http\Controllers\Apoteker;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::where('order_number', 'like', 'ORD-%')
            ->whereIn('order_status', ['processing', 'ready_to_pickup'])
            ->with(['user', 'items.medicine'])
            ->latest()
            ->get();

        return Inertia::render('Pharmacist/Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function ready(Order $order, OrderService $orderService)
    {
        try {
            $orderService->markReadyToPickup($order->id);

            return back()->with('success', 'Pesanan ditandai siap diambil/dikirim.');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }

    public function bulkReady(Request $request, OrderService $orderService)
    {
        $validated = $request->validate([
            'order_ids' => ['required', 'array', 'min:1'],
            'order_ids.*' => ['integer', 'exists:orders,id'],
        ]);

        $orders = Order::whereIn('id', $validated['order_ids'])
            ->where('order_number', 'like', 'ORD-%')
            ->where('order_status', 'processing')
            ->get();

        if ($orders->isEmpty()) {
            return back()->withErrors(['message' => 'Tidak ada pesanan yang bisa diproses.']);
        }

        try {
            foreach ($orders as $order) {
                $orderService->markReadyToPickup($order->id);
            }

            return back()->with('success', "{$orders->count()} pesanan ditandai siap diambil/dikirim.");
        } catch (\Exception $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }
}

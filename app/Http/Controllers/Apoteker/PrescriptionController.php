<?php

namespace App\Http\Controllers\Apoteker;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PrescriptionController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function index()
    {
        $orders = Order::where('prescription_status', 'pending')
                       ->with(['user', 'items.medicine'])
                       ->latest()
                       ->get();

        return Inertia::render('Pharmacist/Prescriptions/Index', [
            'orders' => $orders,
        ]);
    }

    public function verify(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'reason' => 'required_if:status,rejected|nullable|string',
        ]);

        try {
            $this->orderService->verifyPrescription($order->id, $validated['status'], $validated['reason'] ?? null);
            return back()->with('success', 'Prescription verified successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }

    public function history()
    {
        $orders = Order::whereIn('prescription_status', ['approved', 'rejected'])
                       ->with(['user', 'items.medicine'])
                       ->latest()
                       ->get();

        return Inertia::render('Pharmacist/Prescriptions/History', [
            'orders' => $orders,
        ]);
    }
}

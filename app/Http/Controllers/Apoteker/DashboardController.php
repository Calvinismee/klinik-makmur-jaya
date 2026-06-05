<?php

namespace App\Http\Controllers\Apoteker;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Pending Prescriptions
        $pendingPrescriptions = Order::where('prescription_status', 'pending')->count();

        // 2. Orders to Process
        $ordersToProcess = Order::where('order_number', 'like', 'ORD-%')
            ->where('order_status', 'processing')
            ->count();

        // 3. Low Stock Medicines
        $lowStockMedicines = Medicine::select('medicines.id', 'medicines.name', 'medicines.code')
            ->selectRaw('COALESCE(SUM(medicine_batches.remaining_quantity), 0) as total_stock')
            ->leftJoin('medicine_batches', 'medicines.id', '=', 'medicine_batches.medicine_id')
            ->groupBy('medicines.id', 'medicines.name', 'medicines.code')
            ->having('total_stock', '<', 20)
            ->get();

        // 4. Expiring Batches
        $expiringBatches = MedicineBatch::with('medicine')
            ->where('remaining_quantity', '>', 0)
            ->where('expired_at', '<=', Carbon::now()->addDays(30))
            ->orderBy('expired_at', 'asc')
            ->get();

        return Inertia::render('Pharmacist/Dashboard', [
            'stats' => [
                'pendingPrescriptions' => $pendingPrescriptions,
                'ordersToProcess' => $ordersToProcess,
            ],
            'lowStockMedicines' => $lowStockMedicines,
            'expiringBatches' => $expiringBatches,
        ]);
    }
}

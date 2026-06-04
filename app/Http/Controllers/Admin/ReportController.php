<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function dashboard()
    {
        // 1. Total Sales Today & This Month
        $todaySales = Order::where('payment_status', 'paid')
            ->whereDate('created_at', Carbon::today())
            ->sum('total_amount');
            
        $monthSales = Order::where('payment_status', 'paid')
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('total_amount');

        // 2. Orders count
        $pendingOrders = Order::where('order_status', 'waiting_payment')->count();
        $completedOrders = Order::where('order_status', 'completed')->count();

        // 3. Top 5 Medicines
        $topMedicines = DB::table('order_items')
            ->join('medicines', 'order_items.medicine_id', '=', 'medicines.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid')
            ->select('medicines.name', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->groupBy('medicines.id', 'medicines.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // 4. Low Stock Medicines (Total stock < 20)
        // This query requires calculating total stock. A simpler way is to get all medicines and filter, 
        // or join with medicine_batches and group by medicine_id
        $lowStockMedicines = Medicine::select('medicines.id', 'medicines.name')
            ->selectRaw('COALESCE(SUM(medicine_batches.remaining_quantity), 0) as total_stock')
            ->leftJoin('medicine_batches', 'medicines.id', '=', 'medicine_batches.medicine_id')
            ->groupBy('medicines.id', 'medicines.name')
            ->having('total_stock', '<', 20)
            ->get();

        // 5. Expiring Batches (Expires within 30 days)
        $expiringBatches = MedicineBatch::with('medicine')
            ->where('remaining_quantity', '>', 0)
            ->where('expired_at', '<=', Carbon::now()->addDays(30))
            ->orderBy('expired_at', 'asc')
            ->get();

        // 6. Sales Data for Chart (Last 7 days)
        $salesChartData = [];
        $labels = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $labels[] = $date->format('M d');
            $salesChartData[] = Order::where('payment_status', 'paid')
                ->whereDate('created_at', $date)
                ->sum('total_amount');
        }

        $allMedicinesStock = Medicine::select('medicines.id', 'medicines.name', 'medicines.code')
            ->selectRaw('COALESCE(SUM(medicine_batches.remaining_quantity), 0) as total_stock')
            ->leftJoin('medicine_batches', 'medicines.id', '=', 'medicine_batches.medicine_id')
            ->groupBy('medicines.id', 'medicines.name', 'medicines.code')
            ->orderByDesc('total_stock')
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'todaySales' => $todaySales,
                'monthSales' => $monthSales,
                'pendingOrders' => $pendingOrders,
                'completedOrders' => $completedOrders,
            ],
            'topMedicines' => $topMedicines,
            'lowStockMedicines' => $lowStockMedicines,
            'expiringBatches' => $expiringBatches,
            'allMedicinesStock' => $allMedicinesStock,
            'chart' => [
                'labels' => $labels,
                'data' => $salesChartData,
            ]
        ]);
    }
}
